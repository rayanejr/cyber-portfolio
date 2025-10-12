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
    const { domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domaine requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Nettoyage du domaine
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    try {
      // Test de connexion HTTPS
      const url = `https://${cleanDomain}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Extraction des informations TLS/SSL via les headers
      const securityHeaders = {
        'strict-transport-security': response.headers.get('strict-transport-security'),
        'content-security-policy': response.headers.get('content-security-policy'),
      };

      // Vérification du protocole
      const protocol = response.headers.get('alt-svc')?.includes('h3') ? 'HTTP/3' : 
                      response.headers.get('alt-svc')?.includes('h2') ? 'HTTP/2' : 'HTTP/1.1';

      // Analyse de sécurité
      const hasHSTS = !!securityHeaders['strict-transport-security'];
      const hstsMaxAge = hasHSTS ? 
        parseInt(securityHeaders['strict-transport-security']?.match(/max-age=(\d+)/)?.[1] || '0') : 0;
      
      // Calcul du grade
      let grade = 'C';
      let score = 50;

      if (response.status === 200) score += 20;
      if (hasHSTS) score += 15;
      if (hstsMaxAge >= 31536000) score += 10; // 1 an
      if (protocol === 'HTTP/2' || protocol === 'HTTP/3') score += 5;

      if (score >= 95) grade = 'A+';
      else if (score >= 85) grade = 'A';
      else if (score >= 75) grade = 'B';
      else if (score >= 65) grade = 'C';
      else if (score >= 50) grade = 'D';
      else grade = 'F';

      // Détection des problèmes
      const issues = [];
      if (!hasHSTS) {
        issues.push({
          severity: 'high',
          description: 'HSTS non configuré',
          recommendation: 'Ajouter le header Strict-Transport-Security'
        });
      } else if (hstsMaxAge < 31536000) {
        issues.push({
          severity: 'medium',
          description: 'HSTS max-age insuffisant',
          recommendation: 'Configurer max-age à au moins 31536000 (1 an)'
        });
      }

      if (protocol === 'HTTP/1.1') {
        issues.push({
          severity: 'low',
          description: 'HTTP/2 ou HTTP/3 non supporté',
          recommendation: 'Activer HTTP/2 pour de meilleures performances'
        });
      }

      return new Response(
        JSON.stringify({ 
          domain: cleanDomain,
          grade,
          score,
          ssl: {
            enabled: true,
            protocol,
            hsts: {
              enabled: hasHSTS,
              maxAge: hstsMaxAge,
              includeSubDomains: securityHeaders['strict-transport-security']?.includes('includeSubDomains') || false
            }
          },
          issues,
          scannedAt: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // Si la connexion HTTPS échoue
      return new Response(
        JSON.stringify({ 
          domain: cleanDomain,
          grade: 'F',
          score: 0,
          ssl: {
            enabled: false,
            error: 'Impossible d\'établir une connexion HTTPS sécurisée'
          },
          issues: [{
            severity: 'critical',
            description: 'SSL/TLS non disponible',
            recommendation: 'Configurer un certificat SSL/TLS valide'
          }],
          scannedAt: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
