import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAYANE_PROFILE = `
PROFIL PROFESSIONNEL DE RAYANE JERBI - ÉTUDIANT CYBERSÉCURITÉ

🎯 PROFIL ACTUEL :
Étudiant en 2ᵉ année de Master IRS (Informatique, Réseaux et Systèmes) spécialité Cybersécurité à l'Université Paris-Saclay (2024-2026). Recherche activement une alternance (3 semaines entreprise / 1 semaine école) pour développer ses compétences en cybersécurité et DevSecOps.

📚 FORMATION & CERTIFICATIONS :
- Master 2 IRS Cybersécurité (Université Paris-Saclay, 2024-2026)
- Sécurité du Cloud (DataScientest, 03/2024)
- Bash & Linux (DataScientest, 01/2024)
- Introduction à Python (DataScientest, 01/2024)
- Prévention Sup' (INRS, 02/2024)

💼 DOMAINES D'EXPERTISE EN DÉVELOPPEMENT :
• CYBERSÉCURITÉ : Pentesting, audit de sécurité, analyse de vulnérabilités
• DEVSECOPS : CI/CD sécurisé, intégration de la sécurité dans le pipeline
• SYSTÈMES & RÉSEAUX : Administration, configuration sécurisée
• CLOUD : AWS, Terraform, infrastructure as code
• AUTOMATISATION : Python, Bash, PowerShell

🛠️ TECHNOLOGIES MAÎTRISÉES :
• Langages : Python, C, Java, Bash, PowerShell
• Outils DevOps : Jenkins, GitLab CI, Docker, Kubernetes, Terraform
• Sécurité : Kali Linux, Metasploit, Nessus, pfSense, Fortinet
• Systèmes : Linux (Ubuntu, CentOS), Windows Server, VMware
• Réseaux : TCP/IP, VLAN, Firewall, VPN, Cisco Packet Tracer

🚀 PROJETS RÉCENTS :
1. Système de Sécurité Cyber - Solution complète avec détection d'intrusions
2. Plateforme E-commerce Sécurisée - Architecture microservices avec sécurité renforcée
3. Blue Team DFIR Cheats - Kit DFIR avec scripts de collecte et analyse
4. Infrastructure cloud sécurisée avec Terraform
5. Projets d'automatisation DevSecOps

📞 CONTACT :
Email : rayane.jerbi@yahoo.com
Téléphone : +33 6 20 28 41 14
Localisation : Paris 15ème, France

🎯 RECHERCHE D'ALTERNANCE :
• Rythme : 3 semaines entreprise / 1 semaine école
• Domaines d'intérêt : Cybersécurité, DevSecOps, Cloud Security, SOC/SIEM
• Objectif : Acquérir une expérience professionnelle en cybersécurité
• Disponibilité : Immédiate

💡 MOTIVATION :
"Passionné par la cybersécurité et l'automatisation, je cherche à allier sécurité et efficacité opérationnelle dans un environnement professionnel stimulant."
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

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    console.log('Groq API Key exists:', !!groqApiKey);
    
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
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

    console.log('Making Groq API call...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error details:', errorData);
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Groq API response received successfully');
    
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      response: "Désolé, je rencontre un problème technique en ce moment. Vous pouvez contacter directement Rayane à rayane.jerbi@yahoo.com ou au +33 6 20 28 41 14 pour toute question urgente.",
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});