import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Vérifier l'authentification - fonction maintenant protégée
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'generate-all';

    let results = {};

    if (action === 'generate-all' || action === 'security-logs') {
      results = { ...results, ...(await generateSecurityLogs()) };
    }

    if (action === 'generate-all' || action === 'rate-limiting') {
      results = { ...results, ...(await generateRateLimitingData()) };
    }

    if (action === 'generate-all' || action === 'anomalies') {
      results = { ...results, ...(await generateAnomalies()) };
    }

    if (action === 'generate-all' || action === 'vulnerabilities') {
      results = { ...results, ...(await generateVulnerabilities()) };
    }

    if (action === 'generate-all' || action === 'modification-history') {
      results = { ...results, ...(await generateModificationHistory()) };
    }

    if (action === 'generate-all' || action === 'test-alerts') {
      results = { ...results, ...(await testEmailAlerts()) };
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in security-test-data function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function generateSecurityLogs() {
  const logs = [
    {
      event_type: 'LOGIN_SUCCESS',
      severity: 'INFO',
      source: 'ADMIN_PORTAL',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: { user_email: 'rayane.jerbi@yahoo.com', session_duration: '2h' }
    },
    {
      event_type: 'FAILED_LOGIN',
      severity: 'MEDIUM',
      source: 'ADMIN_PORTAL',
      ip_address: '185.220.101.42',
      user_agent: 'curl/7.68.0',
      metadata: { attempted_email: 'admin@test.com', attempts: 3 }
    },
    {
      event_type: 'RATE_LIMIT_EXCEEDED',
      severity: 'HIGH',
      source: 'API',
      ip_address: '203.0.113.45',
      metadata: { endpoint: '/api/admin/login', requests_per_minute: 15 }
    },
    {
      event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'CRITICAL',
      source: 'DATABASE',
      ip_address: '198.51.100.23',
      metadata: { table: 'admin_users', action: 'SELECT', blocked: true }
    },
    {
      event_type: 'DATA_EXPORT',
      severity: 'MEDIUM',
      source: 'ADMIN_PORTAL',
      ip_address: '192.168.1.100',
      metadata: { table: 'security_logs', admin_id: 'rayane.jerbi@yahoo.com' }
    },
    {
      event_type: 'VULNERABILITY_SCAN',
      severity: 'INFO',
      source: 'SECURITY_MONITOR',
      metadata: { vulnerabilities_found: 0, scan_duration: '45s' }
    },
    {
      event_type: 'SESSION_HIJACK_ATTEMPT',
      severity: 'CRITICAL',
      source: 'SESSION_MANAGER',
      ip_address: '94.102.49.190',
      metadata: { session_token: 'xxx...', user_agent_mismatch: true }
    }
  ];

  const insertedLogs = [];
  for (const log of logs) {
    const { data, error } = await supabase
      .from('security_logs')
      .insert(log)
      .select('id');
    
    if (!error && data) {
      insertedLogs.push(data[0].id);
    }
  }

  return { security_logs_generated: insertedLogs.length };
}

async function generateRateLimitingData() {
  const rateLimitData = [
    {
      ip_address: '203.0.113.45',
      endpoint: '/api/admin/login',
      request_count: 12,
      is_blocked: true,
      window_start: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      ip_address: '198.51.100.23',
      endpoint: '/api/projects',
      request_count: 8,
      is_blocked: false,
      window_start: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      ip_address: '185.220.101.42',
      endpoint: '/api/admin/users',
      request_count: 15,
      is_blocked: true,
      window_start: new Date(Date.now() - 3 * 60 * 1000).toISOString()
    },
    {
      ip_address: '192.168.1.100',
      endpoint: '/api/dashboard',
      request_count: 4,
      is_blocked: false,
      window_start: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    }
  ];

  const { data, error } = await supabase
    .from('rate_limit_tracking')
    .insert(rateLimitData)
    .select('id');

  return { rate_limit_records_generated: data?.length || 0 };
}

async function generateAnomalies() {
  const anomalies = [
    {
      detection_type: 'RAPID_LOGIN_ATTEMPTS',
      severity: 'HIGH',
      description: 'Tentatives de connexion trop fréquentes détectées',
      metadata: { login_count: 8, time_window: '10 minutes', threshold: 5 },
      ip_address: '185.220.101.42',
      is_resolved: false
    },
    {
      detection_type: 'MULTIPLE_IP_ACCESS',
      severity: 'MEDIUM',
      description: 'Connexions depuis plusieurs adresses IP différentes',
      metadata: { unique_ips: 12, time_window: '1 hour', threshold: 10 },
      ip_address: '203.0.113.45',
      is_resolved: false
    },
    {
      detection_type: 'UNUSUAL_TIME_ACCESS',
      severity: 'MEDIUM',
      description: 'Accès détecté en dehors des heures normales',
      metadata: { access_time: '03:45 AM', normal_hours: '08:00-18:00' },
      ip_address: '94.102.49.190',
      is_resolved: true
    },
    {
      detection_type: 'GEOLOCATION_ANOMALY',
      severity: 'HIGH',
      description: 'Connexion depuis une géolocalisation inhabituelle',
      metadata: { country: 'Russia', previous_country: 'France', distance_km: 2500 },
      ip_address: '185.220.101.42',
      is_resolved: false
    },
    {
      detection_type: 'HIGH_ACTIVITY_SPIKE',
      severity: 'MEDIUM',
      description: 'Pic d\'activité détecté: 75 événements/heure',
      metadata: { events_per_hour: 75, threshold: 50, duration: '2 hours' },
      ip_address: '203.0.113.45',
      is_resolved: false
    }
  ];

  const { data, error } = await supabase
    .from('anomaly_detections')
    .insert(anomalies)
    .select('id');

  return { anomalies_generated: data?.length || 0 };
}

async function generateVulnerabilities() {
  // Simuler un scan de vulnérabilités avec des découvertes
  const vulnerabilities = [
    {
      event_type: 'VULNERABILITY_DETECTED',
      severity: 'HIGH',
      source: 'VULNERABILITY_SCANNER',
      metadata: {
        cve_id: 'CVE-2023-12345',
        description: 'Possible SQL injection in legacy endpoint',
        affected_component: '/api/legacy/search',
        cvss_score: 7.5,
        remediation: 'Update to latest version or apply patch'
      }
    },
    {
      event_type: 'WEAK_PASSWORD_DETECTED',
      severity: 'MEDIUM',
      source: 'PASSWORD_POLICY',
      metadata: {
        policy_violated: 'Password complexity requirements',
        account_type: 'admin_user',
        recommendation: 'Enforce stronger password policy'
      }
    },
    {
      event_type: 'OUTDATED_DEPENDENCY',
      severity: 'MEDIUM',
      source: 'DEPENDENCY_SCANNER',
      metadata: {
        package: 'lodash',
        current_version: '4.17.20',
        latest_version: '4.17.21',
        security_patch: true
      }
    }
  ];

  const insertedVulns = [];
  for (const vuln of vulnerabilities) {
    const { data, error } = await supabase
      .from('security_logs')
      .insert(vuln)
      .select('id');
    
    if (!error && data) {
      insertedVulns.push(data[0].id);
    }
  }

  return { vulnerabilities_generated: insertedVulns.length };
}

async function generateModificationHistory() {
  // Récupérer quelques IDs existants pour les tests
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .limit(2);

  const { data: blogs } = await supabase
    .from('blogs')
    .select('id')
    .limit(2);

  const modifications = [
    {
      table_name: 'projects',
      record_id: projects?.[0]?.id || crypto.randomUUID(),
      action: 'UPDATE',
      old_values: { title: 'Ancien titre', description: 'Ancienne description' },
      new_values: { title: 'Nouveau titre', description: 'Nouvelle description' },
      changes_summary: 'Mise à jour du titre et de la description du projet',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      table_name: 'blogs',
      record_id: blogs?.[0]?.id || crypto.randomUUID(),
      action: 'INSERT',
      new_values: { title: 'Nouvel article', content: 'Contenu de l\'article', published: true },
      changes_summary: 'Création d\'un nouvel article de blog',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      table_name: 'admin_users',
      record_id: crypto.randomUUID(),
      action: 'UPDATE',
      old_values: { last_login_at: '2024-01-15T10:00:00Z', is_active: true },
      new_values: { last_login_at: '2024-01-16T14:30:00Z', is_active: true },
      changes_summary: 'Mise à jour de la dernière connexion admin',
      ip_address: '192.168.1.100'
    }
  ];

  const { data, error } = await supabase
    .from('modification_history')
    .insert(modifications)
    .select('id');

  return { modification_history_generated: data?.length || 0 };
}

async function testEmailAlerts() {
  // Test des alertes email avec différents niveaux de gravité
  const alerts = [
    {
      severity: 'CRITICAL',
      event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      description: 'Tentative d\'accès non autorisé à la base de données admin',
      ip_address: '185.220.101.42',
      timestamp: new Date().toISOString(),
      metadata: {
        target_table: 'admin_users',
        attempted_action: 'SELECT * FROM admin_users',
        blocked: true,
        detection_method: 'SQL_INJECTION_PATTERN'
      }
    },
    {
      severity: 'HIGH',
      event_type: 'RAPID_LOGIN_ATTEMPTS',
      description: 'Tentatives de connexion répétées depuis une IP suspecte',
      ip_address: '203.0.113.45',
      timestamp: new Date().toISOString(),
      metadata: {
        attempts_count: 10,
        time_window: '5 minutes',
        target_email: 'rayane.jerbi@yahoo.com',
        geolocation: 'Unknown/Tor'
      }
    },
    {
      severity: 'MEDIUM',
      event_type: 'UNUSUAL_DATA_ACCESS',
      description: 'Accès à des données sensibles en dehors des heures normales',
      ip_address: '192.168.1.100',
      timestamp: new Date().toISOString(),
      metadata: {
        access_time: '02:30 AM',
        data_accessed: 'security_logs',
        normal_hours: '08:00-18:00'
      }
    }
  ];

  // Envoyer les alertes à la fonction email-security-alerts
  const alertResults = [];
  
  for (const alert of alerts) {
    try {
      const response = await supabase.functions.invoke('email-security-alerts', {
        body: { alert }
      });
      
      alertResults.push({
        alert_type: alert.event_type,
        severity: alert.severity,
        processed: response.error ? false : true,
        error: response.error?.message || null
      });
    } catch (error) {
      alertResults.push({
        alert_type: alert.event_type,
        severity: alert.severity,
        processed: false,
        error: error.message
      });
    }
  }

  return { email_alerts_tested: alertResults.length, results: alertResults };
}

serve(handler);