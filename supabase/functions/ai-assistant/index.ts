import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAYANE_INFO = `
Je suis Rayane Jerbi, expert en cybersécurité basé à Paris. Voici mes informations professionnelles :

FORMATION :
- Master 2 en Cybersécurité et Cryptologie
- Certifications : CISSP, CEH, Security+, OSCP

COMPÉTENCES TECHNIQUES :
- Cybersécurité : Pentesting, Analyse de vulnérabilités, SOC, SIEM
- Réseaux : Configuration sécurisée, Pare-feu, VPN, Monitoring
- Cloud : AWS Security, Azure Security, GCP, Architecture sécurisée
- DevSecOps : CI/CD sécurisé, Container Security, Infrastructure as Code
- Programmation : Python, JavaScript, Bash, PowerShell
- Outils : Nessus, Metasploit, Wireshark, Splunk, ELK Stack

EXPÉRIENCE :
- Expert en sécurité informatique avec plus de 5 ans d'expérience
- Spécialisé dans l'audit de sécurité et la mise en conformité
- Conception et implémentation d'architectures sécurisées
- Formation et sensibilisation à la cybersécurité

PROJETS RÉCENTS :
- Plateforme de monitoring de sécurité en temps réel
- Système de détection d'intrusion avec IA
- Audit de sécurité pour infrastructures critiques
- Solution de backup sécurisé et chiffré

CONTACT :
- Email : rayane.jerbi@yahoo.com
- Téléphone : +33 6 20 28 41 14
- Localisation : Paris 15ème, France

Je suis passionné par la cybersécurité et toujours à la recherche de nouveaux défis techniques.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `Tu es l'assistant IA personnel de Rayane Jerbi, expert en cybersécurité. 
    
    Voici les informations sur Rayane :
    ${RAYANE_INFO}
    
    Instructions importantes :
    - Réponds TOUJOURS en français
    - Tu peux répondre à toutes les questions sur Rayane, ses compétences, son expérience, ses projets
    - Tu peux aussi répondre à des questions générales sur la cybersécurité, les technologies, etc.
    - Sois professionnel mais amical
    - Si on te demande des informations que tu n'as pas sur Rayane, dis-le clairement
    - Encourage les gens à contacter Rayane pour des projets ou collaborations
    - Utilise les informations fournies de manière naturelle dans tes réponses
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});