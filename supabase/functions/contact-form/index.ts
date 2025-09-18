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

    // Obtenir l'IP du client - extraire la première IP si plusieurs
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    
    let clientIP = '127.0.0.1';
    if (forwardedFor) {
      // Prendre la première IP de la liste (client original)
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      clientIP = realIP.trim();
    }
    
    // Validation IP format basique
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipRegex.test(clientIP)) {
      clientIP = '127.0.0.1';
    }

    // Vérifier le rate limiting amélioré (par IP)
    const now = new Date();
    const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes
    
    // Nettoyer les anciennes tentatives
    await supabase
      .from('rate_limit_contact')
      .delete()
      .lt('window_start', new Date(now.getTime() - 60 * 60 * 1000)); // Supprimer les > 1 heure

    // Vérifier les tentatives récentes
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('rate_limit_contact')
      .select('attempts, is_blocked')
      .eq('ip_address', clientIP)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Si déjà bloqué ou trop de tentatives
    if (rateLimitData?.is_blocked || (rateLimitData?.attempts && rateLimitData.attempts >= 5)) {
      // Marquer comme bloqué si pas déjà fait
      if (!rateLimitData.is_blocked) {
        await supabase
          .from('rate_limit_contact')
          .update({ is_blocked: true })
          .eq('ip_address', clientIP)
          .gte('window_start', windowStart.toISOString());
      }

      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Veuillez patienter 15 minutes avant de renvoyer.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Incrémenter ou créer l'entrée de rate limiting
    if (rateLimitData) {
      await supabase
        .from('rate_limit_contact')
        .update({ attempts: rateLimitData.attempts + 1 })
        .eq('ip_address', clientIP)
        .gte('window_start', windowStart.toISOString());
    } else {
      await supabase
        .from('rate_limit_contact')
        .insert({
          ip_address: clientIP,
          attempts: 1,
          window_start: windowStart.toISOString()
        });
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