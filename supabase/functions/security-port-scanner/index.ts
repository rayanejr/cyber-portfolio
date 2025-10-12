import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target, scanType } = await req.json();
    
    console.log(`🔍 Starting port scan on ${target}`);
    
    // Ports communs à scanner
    const commonPorts = [
      { port: 80, service: 'HTTP', category: 'Web' },
      { port: 443, service: 'HTTPS', category: 'Web' },
      { port: 22, service: 'SSH', category: 'Remote Access' },
      { port: 21, service: 'FTP', category: 'File Transfer' },
      { port: 25, service: 'SMTP', category: 'Email' },
      { port: 53, service: 'DNS', category: 'Network' },
      { port: 3306, service: 'MySQL', category: 'Database' },
      { port: 5432, service: 'PostgreSQL', category: 'Database' },
      { port: 8080, service: 'HTTP-Alt', category: 'Web' },
      { port: 3389, service: 'RDP', category: 'Remote Access' },
    ];

    const openPorts = [];
    const closedPorts = [];

    // Scanner les ports (simulation réaliste basée sur des requêtes HTTP réelles)
    for (const portInfo of commonPorts) {
      try {
        // Tenter une connexion HTTP/HTTPS selon le port
        const protocol = portInfo.port === 443 ? 'https' : 'http';
        const url = `${protocol}://${target}:${portInfo.port}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        try {
          await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          openPorts.push({
            ...portInfo,
            status: 'OPEN',
            detected: new Date().toISOString()
          });
        } catch (fetchError) {
          clearTimeout(timeoutId);
          // Port probablement fermé ou filtré
          closedPorts.push({
            ...portInfo,
            status: 'CLOSED/FILTERED'
          });
        }
      } catch (error) {
        closedPorts.push({
          ...portInfo,
          status: 'CLOSED'
        });
      }
    }

    // Analyse de sécurité
    const securityIssues = [];
    
    // Ports dangereux ouverts
    const dangerousPorts = openPorts.filter(p => 
      [21, 23, 3389].includes(p.port)
    );
    
    if (dangerousPorts.length > 0) {
      securityIssues.push({
        severity: 'HIGH',
        issue: 'Dangerous Ports Open',
        description: `Ports dangereux exposés: ${dangerousPorts.map(p => p.port).join(', ')}`
      });
    }

    // Bases de données exposées
    const dbPorts = openPorts.filter(p => p.category === 'Database');
    if (dbPorts.length > 0) {
      securityIssues.push({
        severity: 'CRITICAL',
        issue: 'Database Ports Exposed',
        description: `Ports de base de données accessibles: ${dbPorts.map(p => p.service).join(', ')}`
      });
    }

    const result = {
      target,
      scanType: scanType || 'Common Ports Scan',
      scanTimestamp: new Date().toISOString(),
      statistics: {
        totalScanned: commonPorts.length,
        openPorts: openPorts.length,
        closedPorts: closedPorts.length,
      },
      openPorts,
      securityIssues,
      riskLevel: securityIssues.some(i => i.severity === 'CRITICAL') ? 'CRITICAL' :
                 securityIssues.some(i => i.severity === 'HIGH') ? 'HIGH' :
                 openPorts.length > 5 ? 'MEDIUM' : 'LOW',
      recommendations: [
        'Fermer les ports non nécessaires',
        'Utiliser un pare-feu pour filtrer le trafic',
        'Ne jamais exposer les bases de données directement',
        'Utiliser des VPN pour l\'accès à distance'
      ]
    };

    console.log(`✅ Port scan completed: ${openPorts.length}/${commonPorts.length} ports open`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in port scanner:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        openPorts: [],
        statistics: { totalScanned: 0, openPorts: 0, closedPorts: 0 }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
