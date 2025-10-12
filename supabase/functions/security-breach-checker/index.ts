import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      throw new Error('Email invalide');
    }

    console.log(`🔍 Checking breaches for email domain: ${email.split('@')[1]}`);
    
    // Simuler une vérification de fuites de données réaliste
    // En production, cela appellerait l'API HaveIBeenPwned
    
    const knownBreaches = [
      {
        name: 'LinkedIn',
        date: '2021-06-01',
        records: 700000000,
        dataTypes: ['Email addresses', 'Full names', 'Phone numbers', 'Physical addresses'],
        severity: 'HIGH'
      },
      {
        name: 'Facebook',
        date: '2019-04-01',
        records: 533000000,
        dataTypes: ['Email addresses', 'Phone numbers', 'Names', 'Dates of birth'],
        severity: 'HIGH'
      },
      {
        name: 'Adobe',
        date: '2013-10-01',
        records: 153000000,
        dataTypes: ['Email addresses', 'Passwords', 'Password hints'],
        severity: 'CRITICAL'
      },
      {
        name: 'Dropbox',
        date: '2012-07-01',
        records: 68000000,
        dataTypes: ['Email addresses', 'Passwords'],
        severity: 'HIGH'
      },
      {
        name: 'Yahoo',
        date: '2013-08-01',
        records: 3000000000,
        dataTypes: ['Email addresses', 'Passwords', 'Security questions'],
        severity: 'CRITICAL'
      }
    ];

    // Simulation: certains emails sont compromis de manière aléatoire mais cohérente
    const emailHash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isCompromised = emailHash % 3 === 0; // 33% de chance d'être compromis
    
    const foundBreaches = isCompromised 
      ? knownBreaches.filter((_, index) => (emailHash + index) % 2 === 0).slice(0, 3)
      : [];

    const result = {
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masquer une partie de l'email
      isCompromised: foundBreaches.length > 0,
      breachCount: foundBreaches.length,
      breaches: foundBreaches,
      totalRecordsAffected: foundBreaches.reduce((sum, b) => sum + b.records, 0),
      riskLevel: foundBreaches.some(b => b.severity === 'CRITICAL') ? 'CRITICAL' :
                 foundBreaches.length > 1 ? 'HIGH' :
                 foundBreaches.length === 1 ? 'MEDIUM' : 'LOW',
      recommendations: foundBreaches.length > 0 ? [
        'Changer immédiatement vos mots de passe',
        'Activer l\'authentification à deux facteurs',
        'Surveiller vos comptes pour toute activité suspecte',
        'Ne jamais réutiliser le même mot de passe',
        'Utiliser un gestionnaire de mots de passe'
      ] : [
        'Continuer à utiliser des mots de passe uniques et forts',
        'Activer l\'authentification à deux facteurs partout',
        'Surveiller régulièrement vos comptes'
      ],
      checkedAt: new Date().toISOString(),
      dataTypes: [...new Set(foundBreaches.flatMap(b => b.dataTypes))]
    };

    console.log(`✅ Breach check completed: ${foundBreaches.length} breaches found`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in breach checker:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isCompromised: false,
        breachCount: 0,
        breaches: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
