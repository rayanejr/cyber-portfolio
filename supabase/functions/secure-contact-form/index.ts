import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Rate limiting check and update (atomic operation)
    const windowStart = new Date();
    windowStart.setMinutes(Math.floor(windowStart.getMinutes() / 15) * 15, 0, 0); // 15-minute windows

    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin
      .from('rate_limit_contact')
      .upsert({
        ip_address: clientIP,
        window_start: windowStart.toISOString(),
        attempts: 1
      }, {
        onConflict: 'ip_address,window_start',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (rateLimitError) {
      // If upsert failed, try to increment existing record
      const { data: existingLimit } = await supabaseAdmin
        .from('rate_limit_contact')
        .select('attempts, is_blocked')
        .eq('ip_address', clientIP)
        .eq('window_start', windowStart.toISOString())
        .single();

      if (existingLimit) {
        const newAttempts = existingLimit.attempts + 1;
        
        if (newAttempts > 5 || existingLimit.is_blocked) {
          await supabaseAdmin
            .from('rate_limit_contact')
            .update({ 
              attempts: newAttempts, 
              is_blocked: true 
            })
            .eq('ip_address', clientIP)
            .eq('window_start', windowStart.toISOString());

          return new Response(
            JSON.stringify({ error: 'Trop de tentatives. Veuillez réessayer plus tard.' }),
            { 
              status: 429, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        await supabaseAdmin
          .from('rate_limit_contact')
          .update({ attempts: newAttempts })
          .eq('ip_address', clientIP)
          .eq('window_start', windowStart.toISOString());
      }
    } else if (rateLimitData?.attempts && rateLimitData.attempts > 5) {
      await supabaseAdmin
        .from('rate_limit_contact')
        .update({ is_blocked: true })
        .eq('ip_address', clientIP)
        .eq('window_start', windowStart.toISOString());

      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Veuillez réessayer plus tard.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert contact message (using service role to bypass RLS)
    const { error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim()
      });

    if (insertError) {
      console.error('Error inserting contact message:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'envoi du message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful contact form submission (minimal metadata)
    await supabaseAdmin
      .from('security_logs')
      .insert({
        event_type: 'CONTACT_FORM_SUBMISSION',
        severity: 'INFO',
        source: 'secure-contact-form',
        ip_address: clientIP,
        metadata: {
          has_subject: !!subject,
          message_length: message.length
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
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