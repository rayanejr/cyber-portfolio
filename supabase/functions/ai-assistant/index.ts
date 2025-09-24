import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAYANE_PROFILE = `
PROFIL PROFESSIONNEL DE RAYANE JERBI - EXPERT CYBERSÉCURITÉ

🎯 EXPERTISE PRINCIPALE :
Expert en cybersécurité avec plus de 5 ans d'expérience, spécialisé dans l'audit de sécurité, la protection d'infrastructures critiques et la mise en conformité réglementaire.

📚 FORMATION & CERTIFICATIONS :
- Master 2 en Cybersécurité et Cryptologie
- CISSP (Certified Information Systems Security Professional)
- CEH (Certified Ethical Hacker)
- Security+ CompTIA
- OSCP (Offensive Security Certified Professional)

💼 DOMAINES D'EXPERTISE :
• SÉCURITÉ OFFENSIVE : Pentesting, audit de sécurité, analyse de vulnérabilités
• SÉCURITÉ DÉFENSIVE : SOC, SIEM, détection d'intrusion, réponse aux incidents
• CONFORMITÉ : RGPD, ISO 27001, ANSSI, audit de conformité
• CLOUD SECURITY : AWS Security, Azure Security, GCP, architecture sécurisée
• DEVOPS/DEVSECOPS : CI/CD sécurisé, container security, infrastructure as code
• RÉSEAUX : Configuration sécurisée, pare-feu, VPN, monitoring réseau

🛠️ TECHNOLOGIES MAÎTRISÉES :
• Langages : Python, JavaScript, Bash, PowerShell, Go
• Outils Sécurité : Nessus, Metasploit, Burp Suite, OWASP ZAP, Nmap
• SIEM/SOC : Splunk, ELK Stack, QRadar, Sentinel
• Cloud : AWS, Azure, GCP, Terraform, Docker, Kubernetes
• OS : Linux (Ubuntu, CentOS, Kali), Windows Server

🚀 PROJETS RÉCENTS :
1. Plateforme SOC automatisée avec IA pour détection d'anomalies
2. Infrastructure cloud sécurisée multi-région avec chiffrement bout en bout
3. Solution de backup sécurisé avec récupération disaster recovery
4. Audit de sécurité complet pour entreprise du CAC 40
5. Système de détection d'intrusion basé sur machine learning

📞 CONTACT :
Email : rayane.jerbi@yahoo.com
Téléphone : +33 6 20 28 41 14
Localisation : Paris 15ème, France
LinkedIn : [Profil LinkedIn disponible]

🎯 SERVICES PROPOSÉS :
• Audit et tests d'intrusion
• Conception d'architectures sécurisées
• Formation et sensibilisation cybersécurité
• Consulting en conformité réglementaire
• Mise en place de SOC/SIEM
• Support technique et maintenance sécurité

💡 PHILOSOPHIE :
"La cybersécurité n'est pas qu'une question technique, c'est une culture d'entreprise à développer."
`;

serve(async (req) => {
  console.log('AI Assistant function called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    if (!message) {
      throw new Error('Message is required');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('Anthropic API Key exists:', !!anthropicApiKey);
    
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemPrompt = `Tu es l'assistant IA personnel de Rayane Jerbi, expert en cybersécurité.

INFORMATIONS SUR RAYANE :
${RAYANE_PROFILE}

INSTRUCTIONS IMPORTANTES :
- Réponds TOUJOURS en français
- Utilise un ton professionnel mais accessible
- Tu peux répondre à TOUTES les questions sur Rayane (compétences, expérience, projets, tarifs, disponibilité)
- Tu peux aussi répondre à des questions générales sur la cybersécurité, les technologies, les bonnes pratiques
- Si quelqu'un demande des services, explique ce que Rayane peut offrir et encourage à le contacter
- Pour les questions techniques, donne des conseils précis et détaillés
- Si tu n'as pas d'information spécifique sur Rayane, dis-le clairement mais propose de le contacter
- Encourage les collaborations et projets

EXEMPLES DE RÉPONSES :
- Questions sur l'expérience : Utilise les informations du profil
- Questions techniques : Donne des conseils d'expert
- Demandes de services : Explique l'expertise de Rayane et ses services
- Questions générales : Réponds avec l'expertise cybersécurité de Rayane
`;

    console.log('Making Anthropic API call...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 800,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nQuestion de l'utilisateur: ${message}` }
        ]
      }),
    });

    console.log('Anthropic API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error details:', errorData);
      throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Anthropic API response received successfully');
    
    const aiResponse = data.content[0].text;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error.message);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Désolé, je rencontre un problème technique en ce moment. Vous pouvez contacter directement Rayane à rayane.jerbi@yahoo.com ou au +33 6 20 28 41 14 pour toute question urgente.",
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});