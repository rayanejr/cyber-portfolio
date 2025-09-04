import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();
    
    // Validation des données
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format email invalide' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validation longueur
    if (name.length > 100 || email.length > 255 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Données trop longues' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Obtenir l'IP du client
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1';

    // Vérifier le rate limiting (5 par heure par IP)
    const { data: recentMessages, error: rateLimitError } = await supabase
      .from('contact_messages')
      .select('id')
      .filter('created_at', 'gte', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(5);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (recentMessages && recentMessages.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Trop de messages envoyés. Veuillez patienter avant de renvoyer.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Insérer le message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject?.trim() || null,
        message: message.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'envoi du message' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Logger l'événement de sécurité
    await supabase
      .from('security_logs')
      .insert({
        event_type: 'CONTACT_FORM_SUBMISSION',
        severity: 'INFO',
        source: 'CONTACT_FORM',
        ip_address: clientIP,
        metadata: {
          message_id: data.id,
          has_subject: !!subject,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message envoyé avec succès',
        id: data.id 
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Contact form error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: corsHeaders }
    );
  }
};

serve(handler);