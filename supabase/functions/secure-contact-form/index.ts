import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Updated: 2025-10-23 16:00 - Force redeploy to fix IP and ON CONFLICT issues

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  captchaToken?: string;
  honeypot?: string; // Bot trap field
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase client with service role for bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { name, email, subject, message, honeypot }: ContactFormData = await req.json();

    // Bot detection: honeypot field should be empty
    if (honeypot && honeypot.trim() !== '') {
      console.log('Bot detected via honeypot field');
      return new Response(
        JSON.stringify({ error: 'Requête invalide' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get client IP (fallback to localhost for testing)
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Input validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Length validation
    if (name.length > 100 || email.length > 150 || message.length > 2000 || (subject && subject.length > 200)) {
      return new Response(
        JSON.stringify({ error: 'Un ou plusieurs champs dépassent la longueur maximale' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format d\'email invalide' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Simple rate limiting: count messages in last 15 minutes
    const windowStart = new Date(Date.now() - 15 * 60 * 1000);
    const firstIP = clientIP.split(',')[0].trim();

    const { count: recentCount } = await supabaseAdmin
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', firstIP)
      .gte('created_at', windowStart.toISOString());

    if (recentCount && recentCount >= 5) {
      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Veuillez réessayer plus tard.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert contact message
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim(),
        ip_address: firstIP
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting contact message:', insertError);
      // Log error to security_events
      await supabaseAdmin
        .from('security_events')
        .insert({
          kind: 'security_log',
          severity: 'ERROR',
          action: 'CONTACT_INSERT_ERROR',
          ip_address: clientIP,
          message: `Contact insert failed: ${insertError.message}`,
          details: { error: insertError, email }
        });
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'envoi du message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful contact form submission
    await supabaseAdmin
      .from('security_events')
      .insert({
        kind: 'audit',
        severity: 'INFO',
        action: 'CONTACT_SUBMIT',
        ip_address: clientIP,
        message: `Contact message ${insertData.id} submitted`,
        details: {
          contact_id: insertData.id,
          has_subject: !!subject,
          message_length: message.length,
          email
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: insertData.id,
        message: 'Message envoyé avec succès' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in secure-contact-form function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});