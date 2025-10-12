import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL requise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérification de l'URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'URL invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch des headers
    const response = await fetch(targetUrl.toString(), { method: 'HEAD' });
    const headers = Object.fromEntries(response.headers.entries());

    // Analyse des headers de sécurité critiques
    const securityHeaders = {
      'Strict-Transport-Security': {
        present: !!headers['strict-transport-security'],
        value: headers['strict-transport-security'] || null,
        description: 'Force HTTPS pour toutes les connexions',
        severity: 'high'
      },
      'Content-Security-Policy': {
        present: !!headers['content-security-policy'],
        value: headers['content-security-policy'] || null,
        description: 'Prévient les attaques XSS',
        severity: 'high'
      },
      'X-Frame-Options': {
        present: !!headers['x-frame-options'],
        value: headers['x-frame-options'] || null,
        description: 'Protection contre le clickjacking',
        severity: 'medium'
      },
      'X-Content-Type-Options': {
        present: !!headers['x-content-type-options'],
        value: headers['x-content-type-options'] || null,
        description: 'Empêche le MIME sniffing',
        severity: 'medium'
      },
      'X-XSS-Protection': {
        present: !!headers['x-xss-protection'],
        value: headers['x-xss-protection'] || null,
        description: 'Protection XSS du navigateur',
        severity: 'low'
      },
      'Referrer-Policy': {
        present: !!headers['referrer-policy'],
        value: headers['referrer-policy'] || null,
        description: 'Contrôle les informations de référence',
        severity: 'low'
      },
      'Permissions-Policy': {
        present: !!headers['permissions-policy'] || !!headers['feature-policy'],
        value: headers['permissions-policy'] || headers['feature-policy'] || null,
        description: 'Contrôle les fonctionnalités du navigateur',
        severity: 'medium'
      }
    };

    // Calcul du score
    const presentCount = Object.values(securityHeaders).filter(h => h.present).length;
    const totalCount = Object.keys(securityHeaders).length;
    const score = Math.round((presentCount / totalCount) * 100);

    // Grade
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    else if (score >= 40) grade = 'E';

    // Recommandations
    const recommendations = Object.entries(securityHeaders)
      .filter(([_, header]) => !header.present)
      .map(([name, header]) => ({
        header: name,
        description: header.description,
        severity: header.severity
      }));

    return new Response(
      JSON.stringify({ 
        url: targetUrl.toString(),
        score,
        grade,
        securityHeaders,
        recommendations,
        scannedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
