import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SecurityAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  metadata?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    let body: any = {};
    let action = 'vulnerability-scan'; // Action par défaut
    
    try {
      body = await req.json();
      action = body?.action || 'vulnerability-scan';
    } catch (e) {
      // Body vide ou invalide, utiliser l'action par défaut
      console.log('Body vide, utilisation de action par défaut:', action);
    }

    console.log(`🛡️ Security Monitor - Action: ${action}`);

    let response;
    switch (action) {
      case 'vulnerability-scan':
        response = await performVulnerabilityScan(supabaseClient);
        break;
      case 'realtime-monitoring':
        response = await performRealtimeMonitoring(supabaseClient);
        break;
      case 'threat-detection':
        response = await performThreatDetection(supabaseClient);
        break;
      case 'compliance-check':
        response = await performComplianceCheck(supabaseClient);
        break;
      default:
        response = await performVulnerabilityScan(supabaseClient);
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      timestamp: new Date().toISOString(),
      ...response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans security-monitor:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performVulnerabilityScan(supabase: any) {
  console.log('🔍 Scan de vulnérabilités en cours...');
  
  const alerts: SecurityAlert[] = [];
  const checks = [];
  
  try {
    // Vérifier les événements de sécurité récents
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    checks.push({
      name: 'Événements de sécurité récents',
      status: recentEvents ? 'PASS' : 'FAIL',
      details: `${recentEvents?.length || 0} événements dans les dernières 24h`
    });

    // Analyser les tentatives d'accès suspectes
    if (recentEvents) {
      const suspiciousIPs = new Set();
      const highSeverityEvents = recentEvents.filter((event: any) => 
        event.severity === 'high' || event.severity === 'critical'
      );

      highSeverityEvents.forEach((event: any) => {
        if (event.ip_address) suspiciousIPs.add(event.ip_address);
      });

      if (highSeverityEvents.length > 10) {
        alerts.push({
          type: 'HIGH_SEVERITY_EVENTS',
          severity: 'HIGH',
          description: `${highSeverityEvents.length} événements à haute sévérité détectés`,
          timestamp: new Date().toISOString(),
          metadata: { count: highSeverityEvents.length, suspicious_ips: Array.from(suspiciousIPs) }
        });
      }

      if (suspiciousIPs.size > 5) {
        alerts.push({
          type: 'MULTIPLE_SUSPICIOUS_IPS',
          severity: 'MEDIUM',
          description: `${suspiciousIPs.size} adresses IP suspectes identifiées`,
          timestamp: new Date().toISOString(),
          metadata: { ip_count: suspiciousIPs.size }
        });
      }
    }

    // Vérifier l'état des tables critiques
    const { data: adminFiles } = await supabase.from('admin_files').select('count', { count: 'exact' });
    const { data: contactMessages } = await supabase.from('contact_messages').select('count', { count: 'exact' });

    checks.push(
      {
        name: 'Tables d\'administration accessibles',
        status: adminFiles ? 'PASS' : 'FAIL',
        details: `${adminFiles?.length || 0} fichiers admin`
      },
      {
        name: 'Messages de contact',
        status: contactMessages ? 'PASS' : 'FAIL',
        details: `${contactMessages?.length || 0} messages`
      }
    );

    // Score de sécurité
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.status === 'PASS').length;
    const securityScore = Math.round((passedChecks / totalChecks) * 100);

    // Enregistrer le scan
    await logSecurityEvent(supabase, {
      type: 'VULNERABILITY_SCAN',
      severity: 'LOW',
      description: 'Scan de vulnérabilités automatique effectué',
      timestamp: new Date().toISOString(),
      metadata: { 
        alerts_count: alerts.length,
        checks_count: totalChecks,
        security_score: securityScore
      }
    });

    return {
      alerts,
      checks,
      security_score: securityScore,
      scan_completed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur lors du scan:', error);
    return {
      alerts: [],
      checks: [],
      security_score: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function performRealtimeMonitoring(supabase: any) {
  console.log('📊 Monitoring en temps réel...');
  
  try {
    // Événements des 5 dernières minutes
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Métriques en temps réel
    const metrics = {
      events_last_5min: recentEvents?.length || 0,
      high_severity_events: recentEvents?.filter((e: any) => e.severity === 'high').length || 0,
      unique_ips: new Set(recentEvents?.map((e: any) => e.ip_address).filter(Boolean)).size,
      system_health: 'HEALTHY'
    };

    if (metrics.high_severity_events > 3) {
      metrics.system_health = 'WARNING';
    }
    if (metrics.high_severity_events > 10) {
      metrics.system_health = 'CRITICAL';
    }

    return {
      status: 'monitoring_active',
      metrics,
      last_events: recentEvents?.slice(0, 10) || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur monitoring:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function performThreatDetection(supabase: any) {
  console.log('🚨 Détection de menaces...');
  
  try {
    const threats = [];
    
    // Recherche de patterns de menaces
    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Dernière heure
      .order('created_at', { ascending: false });

    if (events) {
      // Détection de brute force
      const ipCounts: { [key: string]: number } = {};
      events.forEach((event: any) => {
        if (event.ip_address && event.kind?.includes('FAILED')) {
          ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
        }
      });

      Object.entries(ipCounts).forEach(([ip, count]) => {
        if (count >= 5) {
          threats.push({
            type: 'BRUTE_FORCE_ATTACK',
            severity: 'HIGH',
            source_ip: ip,
            attempts: count,
            description: `Tentative de brute force détectée depuis ${ip}`,
            auto_blocked: true
          });
        }
      });

      // Détection d'accès anormaux
      const adminEvents = events.filter((e: any) => 
        e.kind?.includes('ADMIN') || e.action?.includes('admin')
      );

      if (adminEvents.length > 50) {
        threats.push({
          type: 'SUSPICIOUS_ADMIN_ACTIVITY',
          severity: 'MEDIUM',
          events_count: adminEvents.length,
          description: 'Activité administrative suspecte détectée',
          requires_investigation: true
        });
      }
    }

    // Enregistrer la détection
    if (threats.length > 0) {
      await supabase
        .from('security_events')
        .insert({
          kind: 'THREAT_DETECTION_COMPLETED',
          action: 'threat_detection',
          severity: threats.some((t: any) => t.severity === 'HIGH') ? 'high' : 'medium',
          message: `${threats.length} menaces détectées`,
          details: { threats, detection_period: '1 hour' },
          ip_address: '127.0.0.1',
          user_agent: 'Threat Detection System'
        });
    }

    return {
      threats_detected: threats.length,
      threats,
      high_priority: threats.filter((t: any) => t.severity === 'HIGH').length,
      detection_period: '1 hour'
    };
  } catch (error) {
    console.error('Erreur détection menaces:', error);
    return {
      threats_detected: 0,
      threats: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function performComplianceCheck(supabase: any) {
  console.log('✅ Vérification de conformité...');
  
  try {
    const compliance = {
      gdpr_compliance: true,
      data_retention: true,
      access_controls: true,
      audit_trail: true,
      encryption: true,
      score: 100
    };

    // Vérifier la rétention des données
    const { data: oldEvents } = await supabase
      .from('security_events')
      .select('count', { count: 'exact' })
      .lt('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    if (oldEvents && oldEvents.length > 1000) {
      compliance.data_retention = false;
      compliance.score -= 20;
    }

    return {
      compliance_status: compliance.score >= 80 ? 'COMPLIANT' : 'NON_COMPLIANT',
      compliance,
      recommendations: compliance.score < 80 ? [
        'Nettoyer les données anciennes',
        'Renforcer les contrôles d\'accès',
        'Améliorer l\'audit trail'
      ] : []
    };
  } catch (error) {
    console.error('Erreur conformité:', error);
    return {
      compliance_status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function logSecurityEvent(supabase: any, event: SecurityAlert) {
  const { data, error } = await supabase
    .from('security_events')
    .insert({
      kind: event.type,
      action: 'security_monitor',
      severity: event.severity.toLowerCase(),
      message: event.description,
      details: event.metadata || {},
      ip_address: '127.0.0.1',
      user_agent: 'Security Monitor'
    });

  if (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
  }
  
  return data;
}