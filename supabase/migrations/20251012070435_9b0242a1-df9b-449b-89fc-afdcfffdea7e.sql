-- Finalisation de la simplification et ajout image jeux

-- 12. MPLS L3VPN
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nSimulation d\'un backbone MPLS pour comprendre le fonctionnement des réseaux d\'opérateurs.\n\n## 🎯 Objectifs\n\n- Créer un backbone MPLS\n- Connecter plusieurs sites distants\n- Implémenter le routage dynamique\n- Tester la connectivité inter-sites\n\n## 🔧 Technologies\n\nCisco IOS, MPLS, BGP, OSPF, VRF, GNS3\n\n## 💡 Architecture simulée\n\n- Réseau coeur MPLS\n- Sites clients multiples\n- Routage BGP et OSPF\n- Séparation par VRF\n\n## 📊 Résultats\n\n✅ Backbone MPLS fonctionnel\n✅ Connectivité inter-sites validée\n✅ Isolation des clients par VRF\n\n## 🎓 Compétences développées\n\nMPLS, BGP, OSPF, VRF, routage avancé, réseaux opérateurs'
WHERE title = 'MPLS L3VPN sur GNS3';

-- 13. PfSense DMZ
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nCréation d\'une architecture réseau sécurisée avec zone démilitarisée (DMZ).\n\n## 🎯 Objectifs\n\n- Créer une architecture à deux pare-feux\n- Segmenter le réseau (INT/DMZ/EXT)\n- Mettre en place des règles de filtrage\n- Configurer des tunnels VPN\n\n## 🔧 Technologies\n\nPfSense, VPN, NAT, filtrage, SSL/TLS\n\n## 💡 Architecture déployée\n\n- Pare-feu externe (Internet)\n- Zone DMZ pour les serveurs publics\n- Pare-feu interne (LAN)\n- Règles de filtrage strictes\n- Tunnels VPN sécurisés\n\n## 📊 Résultats\n\n✅ Segmentation réseau complète\n✅ Sécurité renforcée\n✅ VPN opérationnel\n\n## 🎓 Compétences développées\n\nPare-feu PfSense, segmentation réseau, VPN, règles de filtrage, sécurité périmétrique'
WHERE title = 'PfSense – DMZ INT/EXT';

-- 14. AWS iptables
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nConfiguration de pare-feu et de QoS sur des instances cloud AWS.\n\n## 🎯 Objectifs\n\n- Configurer iptables sur EC2\n- Mettre en place la QoS\n- Sécuriser les instances\n- Optimiser les flux réseau\n\n## 🔧 Technologies\n\nAWS EC2, iptables, QoS, Linux, SSH\n\n## 💡 Configuration réalisée\n\n- Règles de pare-feu iptables\n- Priorisation du trafic (QoS)\n- Sécurisation SSH\n- Tests de performance\n\n## 📊 Résultats\n\n✅ Instances sécurisées\n✅ QoS fonctionnelle\n✅ Performance optimisée\n\n## 🎓 Compétences développées\n\nCloud AWS, iptables, QoS, sécurité Linux, administration cloud'
WHERE title = 'AWS – iptables & QoS';

-- 15. Audit ISO 19011
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nAudit de sécurité d\'une infrastructure de paiement selon la norme ISO 19011.\n\n## 🎯 Objectifs\n\n- Réaliser un audit de sécurité complet\n- Évaluer les risques\n- Proposer des recommandations\n- Documenter les résultats\n\n## 🔧 Méthodologie\n\nISO 19011, CVSS, Risk Assessment, Analyse de vulnérabilités\n\n## 💡 Audit réalisé\n\n- Analyse de l\'infrastructure\n- Identification des vulnérabilités\n- Évaluation des risques (CVSS)\n- Rapport d\'audit détaillé\n- Recommandations de sécurisation\n\n## 📊 Résultats\n\n✅ Audit complet réalisé\n✅ Vulnérabilités identifiées\n✅ Plan de remédiation proposé\n\n## 🎓 Compétences développées\n\nAudit de sécurité, ISO 19011, évaluation des risques, CVSS, méthodologie d\'audit'
WHERE title = 'Audit SSI – ISO 19011';

-- 16. CyberLab Pentest
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nSimulation d\'attaques web en environnement isolé pour apprendre les techniques d\'intrusion.\n\n## 🎯 Objectifs\n\n- Configurer un lab de pentest\n- Simuler des attaques web\n- Apprendre les techniques d\'exploitation\n- Documenter les vulnérabilités\n\n## 🔧 Technologies\n\nKali Linux, DVWA, Burp Suite, outils de pentest\n\n## 💡 Attaques simulées\n\n- Exploitation de failles web\n- Injection de code\n- Contournement d\'authentification\n- Élévation de privilèges\n\n## 📊 Résultats\n\n✅ Environnement de test opérationnel\n✅ Techniques d\'exploitation maîtrisées\n✅ Méthodologie de pentest acquise\n\n## 🎓 Compétences développées\n\nPentest, exploitation de vulnérabilités, Kali Linux, méthodologie d\'intrusion'
WHERE title = 'CyberLab – Tests d''Intrusion';

-- 17. Durcissement Systèmes
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nSécurisation avancée de systèmes Windows et Linux selon les bonnes pratiques.\n\n## 🎯 Objectifs\n\n- Durcir les configurations système\n- Appliquer les recommandations de sécurité\n- Tester la résistance aux attaques\n- Documenter les procédures\n\n## 🔧 Technologies\n\nWindows (GPO, PowerShell), Linux (LUKS, AppArmor)\n\n## 💡 Mesures de sécurisation\n\n**Windows** : Stratégies de groupe, restriction des droits, chiffrement\n**Linux** : Chiffrement disque LUKS, AppArmor, durcissement kernel\n\n## 📊 Résultats\n\n✅ Systèmes durcis selon les standards\n✅ Surface d\'attaque réduite\n✅ Procédures documentées\n\n## 🎓 Compétences développées\n\nDurcissement système, sécurité Windows/Linux, chiffrement, contrôle d\'accès'
WHERE title = 'Durcissement Systèmes Windows & Linux';

-- 18. Analyse Malware
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nDéveloppement d\'un outil d\'analyse de fichiers suspects via l\'API VirusTotal.\n\n## 🎯 Objectifs\n\n- Créer un script d\'analyse de fichiers\n- Intégrer l\'API VirusTotal\n- Analyser le trafic réseau\n- Générer des rapports\n\n## 🔧 Technologies\n\nPython, API VirusTotal, Wireshark, analyse réseau\n\n## 💡 Fonctionnalités développées\n\n- Soumission de fichiers à VirusTotal\n- Récupération des résultats d\'analyse\n- Analyse du trafic réseau\n- Génération de rapports\n\n## 📊 Résultats\n\n✅ Outil d\'analyse fonctionnel\n✅ Détection automatisée\n✅ Rapports détaillés\n\n## 🎓 Compétences développées\n\nAnalyse de malware, API VirusTotal, Python, analyse réseau'
WHERE title = 'Analyse de Fichiers Suspects';

-- 19. Projets Réseaux
UPDATE projects 
SET content = E'## 📋 Contexte des projets\n\nSérie de projets réseaux réalisés durant la formation pour maîtriser les concepts fondamentaux.\n\n## 🎯 Objectifs\n\n- Maîtriser la configuration réseau\n- Comprendre les protocoles\n- Simuler des infrastructures\n- Valider les acquis\n\n## 🔧 Technologies\n\nCisco Packet Tracer, VLANs, ACL, routage, switching\n\n## 💡 Projets réalisés\n\n- Configuration de VLANs\n- Mise en place d\'ACL\n- Routage inter-VLAN\n- Protocoles de routage\n- Sécurisation du réseau\n\n## 📊 Résultats\n\n✅ Fondamentaux réseau maîtrisés\n✅ Certifications Cisco obtenues\n✅ Compétences pratiques acquises\n\n## 🎓 Compétences développées\n\nRéseaux Cisco, VLANs, routage, ACL, Packet Tracer, protocoles réseau'
WHERE title = 'Projets Réseaux ECE';

-- 20. Applications Web
UPDATE projects 
SET content = E'## 📋 Contexte des projets\n\nDéveloppement de diverses applications web et API pour acquérir des compétences en développement full-stack.\n\n## 🎯 Objectifs\n\n- Maîtriser le développement web moderne\n- Créer des API REST\n- Développer des interfaces réactives\n- Gérer des bases de données\n\n## 🔧 Technologies\n\nReact, Node.js, PHP, MySQL, API REST, HTML/CSS/JavaScript\n\n## 💡 Projets développés\n\n- Applications de gestion (QCM, notes)\n- API REST complètes\n- Interfaces utilisateur modernes\n- Systèmes d\'authentification\n- Intégration de bases de données\n\n## 📊 Résultats\n\n✅ Applications fonctionnelles\n✅ Code propre et maintenable\n✅ Bonnes pratiques appliquées\n\n## 🎓 Compétences développées\n\nDéveloppement web, React, API REST, bases de données, architecture logicielle'
WHERE title = 'Applications Web / API / QCM';

-- 21. Projets Jeux
UPDATE projects 
SET content = E'## 📋 Contexte des projets\n\nDéveloppement de jeux et applications créatives pour explorer la programmation ludique.\n\n## 🎯 Objectifs\n\n- Apprendre la programmation en C\n- Créer des interfaces interactives\n- Développer la logique de jeu\n- Explorer la créativité en programmation\n\n## 🔧 Technologies\n\nLangage C, algorithmes, structures de données\n\n## 💡 Projets réalisés\n\n- Jeu d\'énigmes en C\n- Logique de jeu et algorithmes\n- Gestion des entrées utilisateur\n- Interfaces en mode texte\n\n## 📊 Résultats\n\n✅ Jeux fonctionnels et ludiques\n✅ Maîtrise du langage C\n✅ Algorithmes optimisés\n\n## 🎓 Compétences développées\n\nProgrammation C, algorithmique, structures de données, logique de jeu'
WHERE title = 'Projets Jeux & Créativité';

-- Mise à jour image
UPDATE projects SET image_url = '/src/assets/projects/jeux-creativite.png' 
WHERE title = 'Projets Jeux & Créativité';