import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const projects = [
  {
    title: "Gestionnaire de Tâches Personnelles - Sécurité Web",
    description: "Application web de gestion de tâches avec focus sur la sécurité",
    content: "Projet explorant les vulnérabilités web et les bonnes pratiques de sécurité dans une application de gestion de tâches.",
    technologies: ["JavaScript", "HTML", "CSS", "Sécurité Web"],
    category: "security",
    featured: false
  },
  {
    title: "Exploration des Attaques d'Injection avec DVWA",
    description: "Étude pratique des attaques par injection SQL et XSS",
    content: "Analyse des vulnérabilités d'injection sur DVWA (Damn Vulnerable Web Application) pour comprendre les mécanismes d'attaque et les défenses.",
    technologies: ["DVWA", "SQL Injection", "XSS", "Sécurité"],
    category: "security",
    featured: true
  },
  {
    title: "Santé-App",
    description: "Application de suivi de santé personnelle",
    content: "Application mobile de gestion des données de santé avec tableaux de bord et suivi personnalisé.",
    technologies: ["Mobile", "React", "Base de données"],
    category: "mobile",
    featured: false
  },
  {
    title: "Audit de Sécurité Informatique",
    description: "Audit complet de sécurité d'un système d'information",
    content: "Réalisation d'un audit de sécurité complet incluant analyse de risques, tests de pénétration et recommandations.",
    technologies: ["Audit", "ISO 27001", "Sécurité", "Pentest"],
    category: "security",
    featured: true
  },
  {
    title: "ClimaSphere",
    description: "Application de visualisation de données climatiques",
    content: "Plateforme de visualisation et analyse de données météorologiques et climatiques en temps réel.",
    technologies: ["React", "API", "Data Visualization", "TypeScript"],
    category: "web",
    featured: false
  },
  {
    title: "Gamebox-android",
    description: "Jeu Tic-Tac-Toe pour Android",
    content: "Application Android de jeu Tic-Tac-Toe avec interface intuitive et mode multi-joueurs.",
    technologies: ["Android", "Java", "Mobile"],
    category: "mobile",
    featured: false
  },
  {
    title: "Sotum - Projet Symfony",
    description: "Application web Sotum développée avec Symfony",
    content: "Projet web complet utilisant le framework Symfony avec architecture MVC et base de données MySQL.",
    technologies: ["Symfony", "PHP", "MySQL", "MVC"],
    category: "web",
    featured: false
  },
  {
    title: "Gestionnaire de Dictionnaire et Traduction",
    description: "Services web pour gestion de dictionnaire multilingue",
    content: "API REST pour la gestion d'un dictionnaire et services de traduction automatique.",
    technologies: ["REST API", "Services Web", "Python", "NLP"],
    category: "web",
    featured: false
  },
  {
    title: "Stage Next Step IT",
    description: "Stage en infrastructure IT et support",
    content: "Expérience professionnelle en support technique, gestion d'infrastructure et assistance utilisateurs.",
    technologies: ["Support IT", "Infrastructure", "Windows Server"],
    category: "professional",
    featured: false
  },
  {
    title: "Projets Réseaux - Bachelor 2ème année",
    description: "Ensemble de projets réseau avancés",
    content: "Projets de configuration réseau incluant VLAN, routage, sécurité et architecture réseau.",
    technologies: ["Cisco", "Réseaux", "VLAN", "Routage"],
    category: "network",
    featured: false
  },
  {
    title: "Memory Game",
    description: "Jeu de mémoire interactif",
    content: "Jeu web de mémoire avec différents niveaux de difficulté et système de scores.",
    technologies: ["JavaScript", "HTML", "CSS", "Game Dev"],
    category: "web",
    featured: false
  },
  {
    title: "ECEbook",
    description: "Réseau social pour étudiants ECE",
    content: "Plateforme de réseau social permettant aux étudiants de partager et communiquer.",
    technologies: ["PHP", "MySQL", "JavaScript", "Social Network"],
    category: "web",
    featured: false
  },
  {
    title: "API Football",
    description: "API de données football en temps réel",
    content: "API REST fournissant des données en temps réel sur les matchs et statistiques de football.",
    technologies: ["REST API", "Node.js", "Database", "Sports Data"],
    category: "web",
    featured: false
  },
  {
    title: "Cinema-Application",
    description: "Application de gestion de cinéma",
    content: "Système de réservation et gestion de séances de cinéma avec interface utilisateur moderne.",
    technologies: ["Java", "Database", "UI/UX"],
    category: "web",
    featured: false
  },
  {
    title: "ECE_WEB",
    description: "Projet web ECE complet",
    content: "Projet web complet incluant frontend moderne et backend robuste.",
    technologies: ["HTML", "CSS", "JavaScript", "PHP"],
    category: "web",
    featured: false
  },
  {
    title: "Stage BTL",
    description: "Stage en entreprise BTL",
    content: "Expérience professionnelle en développement et support technique.",
    technologies: ["Support", "Développement", "Infrastructure"],
    category: "professional",
    featured: false
  },
  {
    title: "Farmer Heroes",
    description: "Jeu de gestion de ferme",
    content: "Jeu de stratégie et gestion de ressources agricoles.",
    technologies: ["Game Dev", "JavaScript", "Canvas"],
    category: "web",
    featured: false
  },
  {
    title: "Museom-Cars",
    description: "Site vitrine musée automobile",
    content: "Site web présentant une collection de voitures avec galerie interactive.",
    technologies: ["HTML", "CSS", "JavaScript", "Responsive"],
    category: "web",
    featured: false
  },
  {
    title: "Site SAV Informatique",
    description: "Plateforme de service après-vente IT",
    content: "Système de gestion des demandes SAV avec suivi des tickets et base de connaissances.",
    technologies: ["PHP", "MySQL", "Ticketing", "Support"],
    category: "web",
    featured: false
  },
  {
    title: "Projets Réseaux - Bachelor 1ère année",
    description: "Fondamentaux des réseaux informatiques",
    content: "Projets d'apprentissage des bases réseau : câblage, protocoles TCP/IP, configuration switches.",
    technologies: ["Réseaux", "TCP/IP", "Cisco", "Fondamentaux"],
    category: "network",
    featured: false
  },
  {
    title: "QCM Application",
    description: "Plateforme de questionnaires en ligne",
    content: "Application web de création et passage de QCM avec correction automatique.",
    technologies: ["JavaScript", "Database", "Quiz", "Education"],
    category: "web",
    featured: false
  },
  {
    title: "Automatisation Inventaire GLPI - LNE",
    description: "Script Python d'inventaire automatique via API GLPI",
    content: "Automatisation de la récupération d'informations matérielles sur switches Cisco (SN, modèles, IOS) et intégration dans GLPI.",
    technologies: ["Python", "Paramiko", "REST API", "GLPI", "Cisco"],
    category: "automation",
    featured: true
  },
  {
    title: "GPO Proxy OFF - LNE",
    description: "Stratégie de groupe pour désactivation proxy",
    content: "Création et déploiement d'une GPO pour désactiver la configuration automatique du proxy sur postes spécifiques.",
    technologies: ["Active Directory", "GPO", "Windows Server"],
    category: "infrastructure",
    featured: false
  },
  {
    title: "Blocage Paramètres LAN via GPO - LNE",
    description: "Sécurisation des paramètres réseau utilisateurs",
    content: "Empêcher les utilisateurs de modifier les paramètres proxy et réseau via stratégies de groupe.",
    technologies: ["GPO", "Registry", "Security", "Windows"],
    category: "security",
    featured: false
  },
  {
    title: "Migration Dossiers Publics Exchange - LNE",
    description: "Migration vers boîtes aux lettres partagées",
    content: "Remplacement des dossiers publics Exchange par des BAL partagées modernes avec PowerShell.",
    technologies: ["Exchange 2019", "PowerShell", "Outlook 365"],
    category: "infrastructure",
    featured: true
  },
  {
    title: "Optimisation PDQ Deploy/Inventory - LNE",
    description: "Correction et optimisation des outils de déploiement",
    content: "Résolution des blocages proxy et amélioration de la stabilité des scans PDQ.",
    technologies: ["PDQ Deploy", "PowerShell", "Deployment"],
    category: "automation",
    featured: false
  },
  {
    title: "Intégration VMware ESXi - LNE",
    description: "Extension infrastructure de virtualisation",
    content: "Installation et intégration de nouveaux hôtes VMware ESXi avec vCenter et stockage iSCSI.",
    technologies: ["VMware ESXi", "vCenter", "iSCSI", "Virtualisation"],
    category: "infrastructure",
    featured: true
  },
  {
    title: "Projet Active Directory Complet",
    description: "Infrastructure AD complète avec tolérance de panne",
    content: "Mise en place d'un domaine AD avec DC1/DC2, DHCP, DNS, GPO et RSAT sur VirtualBox/Azure.",
    technologies: ["Active Directory", "Windows Server 2022", "Azure", "DHCP", "DNS"],
    category: "infrastructure",
    featured: true
  },
  {
    title: "Configuration MPLS L3VPN - GNS3",
    description: "Interconnexion multi-sites via MPLS",
    content: "Configuration d'un réseau MPLS L3 VPN avec BGP, OSPF, VRF et automatisation Ansible.",
    technologies: ["MPLS", "BGP", "OSPF", "GNS3", "Ansible"],
    category: "network",
    featured: true
  },
  {
    title: "Réseau Multi-Sites PUMP AND CO",
    description: "Architecture réseau internationale haute disponibilité",
    content: "Conception réseau international (Cachan, Shanghai, Madrid, Marseille) avec QoS, VoIP, SD-WAN/MPLS.",
    technologies: ["Cisco", "Fortinet", "SD-WAN", "MPLS", "VoIP"],
    category: "network",
    featured: true
  },
  {
    title: "Configuration PfSense DMZ",
    description: "Firewall PfSense avec architecture DMZ",
    content: "Déploiement de deux firewalls PfSense (LAN/DMZ-INT, DMZ-EXT/WAN) avec NAT, VPN et filtrage.",
    technologies: ["PfSense", "Firewall", "VPN", "DMZ", "Security"],
    category: "security",
    featured: true
  },
  {
    title: "Chiffrement /home Linux LUKS",
    description: "Automatisation du chiffrement disque Linux",
    content: "Configuration d'un répertoire /home chiffré avec LUKS et déverrouillage automatique via clé USB.",
    technologies: ["Linux", "LUKS", "Encryption", "Ubuntu"],
    category: "security",
    featured: false
  },
  {
    title: "Configuration iptables & QoS AWS",
    description: "Pare-feu et gestion du trafic sur AWS",
    content: "Configuration de règles iptables et QoS sur instances EC2 AWS avec tests de performances.",
    technologies: ["iptables", "QoS", "AWS", "EC2", "Linux"],
    category: "security",
    featured: false
  },
  {
    title: "Audit SSI ISO 19011",
    description: "Audit de sécurité selon norme ISO 19011",
    content: "Application de la méthodologie d'audit SSI sur chaîne de paiement (ERP → SWIFT) avec CVSS.",
    technologies: ["ISO 19011", "Audit", "CVSS", "Security"],
    category: "security",
    featured: true
  },
  {
    title: "Jeu Énigmes en C",
    description: "Jeu textuel avec ncurses et sauvegarde scores",
    content: "Développement d'un jeu d'énigmes en C avec interface ncurses et persistance SQLite.",
    technologies: ["C", "ncurses", "SQLite", "Game Dev"],
    category: "development",
    featured: false
  },
  {
    title: "Portfolio Professionnel React",
    description: "Site portfolio avec Supabase et téléchargement CV",
    content: "Site portfolio moderne avec React, Next.js, Tailwind, Supabase et fonctionnalités avancées.",
    technologies: ["React", "Next.js", "Tailwind", "Supabase", "TypeScript"],
    category: "web",
    featured: true
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const insertedProjects = [];
    let successCount = 0;
    let errorCount = 0;

    for (const project of projects) {
      try {
        console.log(`Generating image for: ${project.title}`);
        
        // Generate image with Lovable AI Gateway
        const imagePrompt = `Create a professional cybersecurity-themed image for a tech portfolio project titled "${project.title}". 
Theme: Dark cyber aesthetic with neon blue/purple accents, digital elements, and technological feel. 
Style: Modern, sleek, professional. 16:9 aspect ratio. High quality.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              {
                role: "user",
                content: imagePrompt
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!imageBase64) {
          throw new Error("No image generated");
        }

        // Extract base64 data
        const base64Data = imageBase64.split(',')[1];
        const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload to Supabase Storage
        const fileName = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('projects')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('projects')
          .getPublicUrl(fileName);

        // Insert project into database
        const { data: insertData, error: insertError } = await supabase
          .from('projects')
          .insert({
            title: project.title,
            description: project.description,
            content: project.content,
            image_url: publicUrl,
            technologies: project.technologies,
            featured: project.featured,
            is_active: true
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        insertedProjects.push(insertData);
        successCount++;
        console.log(`✓ Successfully inserted: ${project.title}`);

      } catch (error) {
        console.error(`✗ Error with project "${project.title}":`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Inserted ${successCount} projects successfully, ${errorCount} errors`,
        total: projects.length,
        successCount,
        errorCount,
        projects: insertedProjects
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
