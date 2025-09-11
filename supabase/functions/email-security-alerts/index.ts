import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEmailAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  event_type: string;
  description: string;
  ip_address?: string;
  timestamp: string;
  metadata?: any;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alert }: { alert: SecurityEmailAlert } = await req.json();

    // Vérifier si l'alerte doit déclencher un email
    if (shouldSendEmailAlert(alert)) {
      await sendSecurityEmailAlert(alert);
    }

    // Enregistrer l'alerte dans les logs
    await logSecurityEvent(alert);

    return new Response(JSON.stringify({ 
      success: true,
      alert_processed: true,
      email_sent: shouldSendEmailAlert(alert)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in email-security-alerts function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function shouldSendEmailAlert(alert: SecurityEmailAlert): boolean {
  // Critères pour déclencher une alerte email
  const emailTriggers = [
    'CRITICAL', 
    'HIGH'
  ];

  const criticalEvents = [
    'RAPID_LOGIN_ATTEMPTS',
    'MULTIPLE_IP_ACCESS', 
    'UNAUTHORIZED_ACCESS_ATTEMPT',
    'RATE_LIMIT_EXCEEDED',
    'SECURITY_BREACH',
    'SYSTEM_COMPROMISE'
  ];

  return emailTriggers.includes(alert.severity) || 
         criticalEvents.includes(alert.event_type);
}

async function sendSecurityEmailAlert(alert: SecurityEmailAlert): Promise<void> {
  console.log('🚨 ALERTE DE SÉCURITÉ - Email serait envoyé:', {
    severity: alert.severity,
    event: alert.event_type,
    description: alert.description,
    ip: alert.ip_address,
    timestamp: alert.timestamp
  });

  // Simulation d'envoi d'email - Dans un vrai système, vous utiliseriez Resend ou un autre service
  const emailContent = generateEmailContent(alert);
  
  // Pour les tests, on log le contenu de l'email
  console.log('📧 Contenu de l\'email d\'alerte:', emailContent);

  // Créer une notification dans la base pour l'admin
  const { data: admins } = await supabase
    .from('admin_users')
    .select('id')
    .eq('is_active', true);

  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await supabase
        .from('notifications')
        .insert({
          admin_id: admin.id,
          title: `🚨 Alerte Sécurité ${alert.severity}`,
          message: alert.description,
          type: 'SECURITY',
          metadata: {
            email_sent: true,
            alert_type: alert.event_type,
            ip_address: alert.ip_address,
            ...alert.metadata
          }
        });
    }
  }

  // Dans un vrai déploiement, ajoutez ici le code Resend :
  /*
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  
  await resend.emails.send({
    from: 'security@yourportfolio.com',
    to: ['admin@yourportfolio.com'],
    subject: `🚨 Alerte Sécurité ${alert.severity} - ${alert.event_type}`,
    html: emailContent
  });
  */
}

function generateEmailContent(alert: SecurityEmailAlert): string {
  const severityColors = {
    'CRITICAL': '#dc2626',
    'HIGH': '#ea580c', 
    'MEDIUM': '#ca8a04',
    'LOW': '#16a34a'
  };

  const color = severityColors[alert.severity];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerte de Sécurité</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Alerte de Sécurité</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Niveau: ${alert.severity}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
          <h2 style="color: ${color}; margin-top: 0;">${alert.event_type}</h2>
          <p><strong>Description:</strong> ${alert.description}</p>
          <p><strong>Timestamp:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
          ${alert.ip_address ? `<p><strong>Adresse IP:</strong> ${alert.ip_address}</p>` : ''}
          
          ${alert.metadata ? `
            <div style="margin-top: 20px;">
              <h3>Détails Techniques:</h3>
              <pre style="background: #fff; padding: 10px; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(alert.metadata, null, 2)}
              </pre>
            </div>
          ` : ''}
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <h3>Actions Recommandées:</h3>
          <ul>
            <li>Vérifiez immédiatement l'activité suspecte dans le dashboard admin</li>
            <li>Analysez les logs de sécurité pour identifier d'autres activités liées</li>
            <li>Si nécessaire, bloquez l'adresse IP source</li>
            <li>Changez les mots de passe si une compromission est suspectée</li>
          </ul>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 12px;">
              Cette alerte a été générée automatiquement par le système de surveillance de sécurité.
              <br>Portfolio Cybersécurité - Surveillance Temps Réel
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function logSecurityEvent(alert: SecurityEmailAlert): Promise<void> {
  await supabase
    .from('security_logs')
    .insert({
      event_type: alert.event_type,
      severity: alert.severity,
      source: 'EMAIL_ALERTS',
      ip_address: alert.ip_address || null,
      metadata: {
        ...alert.metadata,
        email_alert_sent: shouldSendEmailAlert(alert),
        processed_at: new Date().toISOString()
      }
    });
}

serve(handler);