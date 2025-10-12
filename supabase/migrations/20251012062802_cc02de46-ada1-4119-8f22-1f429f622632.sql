-- Supprimer tous les projets existants
DELETE FROM projects;

-- Insérer les nouveaux projets

-- 1. Projets Professionnels — LNE
INSERT INTO projects (title, description, content, technologies, featured, is_active) VALUES
(
  'Automatisation Inventaire GLPI – LNE',
  'Script Python automatisant la collecte d''informations sur les switches Cisco et envoi vers GLPI',
  'Développement d''un script Python automatisant la collecte d''informations sur les switches Cisco (modèle, numéro de série, version IOS). Connexion SSH via Paramiko, parsing des sorties et envoi automatique vers l''API REST de GLPI. Résultat : inventaire complet du parc réseau généré en quelques minutes au lieu de plusieurs heures manuelles.',
  ARRAY['Python', 'Paramiko', 'REST API', 'GLPI', 'CSV'],
  true,
  true
),
(
  'Migration Dossiers Publics Exchange – LNE',
  'Remplacement des anciens dossiers publics Exchange par des boîtes aux lettres partagées modernes',
  'Remplacement des anciens dossiers publics Exchange par des boîtes aux lettres partagées modernes. Analyse des droits, migration des données et tests de synchronisation. Résultat : simplification de la gestion et fiabilisation de la messagerie interne.',
  ARRAY['Exchange 2019', 'PowerShell', 'Outlook 365'],
  true,
  true
),
(
  'Optimisation PDQ Deploy / Inventory – LNE',
  'Résolution des blocages de téléchargement liés au proxy',
  'Résolution des blocages de téléchargement liés au proxy. Configuration du proxy système avec PowerShell et ajout des exceptions *.pdq.com. Résultat : déploiements rétablis et scans automatisés sur l''ensemble du parc.',
  ARRAY['PDQ Deploy', 'PowerShell', 'Proxy', 'WinHTTP'],
  true,
  true
),
(
  'Sécurisation Réseau via GPO – LNE',
  'Création de stratégies de groupe pour sécuriser l''environnement réseau',
  'Création de plusieurs stratégies de groupe pour désactiver le proxy automatique, bloquer Internet sur certains postes et masquer les paramètres réseau. Résultat : environnement plus sécurisé et homogène sur l''ensemble du domaine.',
  ARRAY['Active Directory', 'Windows Server', 'GPO', 'Regedit'],
  true,
  true
),
(
  'Intégration VMware ESXi – LNE',
  'Ajout et configuration de nouveaux hôtes ESXi pour renforcer la virtualisation',
  'Ajout et configuration de nouveaux hôtes ESXi pour renforcer la virtualisation. Création de datastores partagés, tests de vMotion et documentation de la topologie. Résultat : infrastructure virtualisée plus performante et résiliente.',
  ARRAY['VMware ESXi', 'vCenter', 'iSCSI', 'RAID'],
  true,
  true
),
(
  'Désinstallation Ivanti & Gestion Restaurations NTFS – LNE',
  'Package PDQ pour désinstaller Ivanti et mise en place de restaurations de fichiers',
  'Création d''un package PDQ pour désinstaller l''ancien client VPN Ivanti sur tout le parc. Mise en place de restaurations de fichiers via Shadow Copy et Veeam. Résultat : système de sauvegarde fiable et parc logiciel uniformisé.',
  ARRAY['PDQ Deploy', 'MSIExec', 'PowerShell', 'Veeam', 'NTFS'],
  true,
  true
),
(
  'Gestion Comptes AD & Support Exchange / GLPI – LNE',
  'Gestion des comptes AD, BAL partagées et suivi des tickets GLPI',
  'Création, modification et suppression de comptes AD, gestion de BAL partagées et suivi des tickets GLPI. Résultat : amélioration de la réactivité du support et de la traçabilité des interventions.',
  ARRAY['Active Directory', 'Exchange', 'GLPI', 'Rainbow'],
  true,
  true
);

-- 2. Projets de Stage
INSERT INTO projects (title, description, content, technologies, featured, is_active) VALUES
(
  'Stage Next Step IT',
  'Installation et maintenance de serveurs Windows, configuration réseau et support IT',
  'Installation et maintenance de serveurs Windows, configuration réseau et support aux utilisateurs. Découverte du métier d''administrateur système en TPE.',
  ARRAY['Windows Server', 'Cisco', 'DHCP', 'Support IT'],
  false,
  true
),
(
  'Stage Banque Tuniso-Libyenne (BTL)',
  'Gestion du parc informatique et assistance technique',
  'Gestion du parc informatique et assistance technique auprès des collaborateurs. Maintenance des postes clients et des boîtes Exchange.',
  ARRAY['Exchange', 'Windows Server', 'Réseaux'],
  false,
  true
),
(
  'Stage 3S Group',
  'Configuration d''équipements Cisco en environnement simulé sous GNS3',
  'Configuration d''équipements Cisco en environnement simulé sous GNS3 (VLAN, routage, ACL). Résultat : apprentissage des fondamentaux réseau et de la sécurité Cisco.',
  ARRAY['Cisco', 'GNS3', 'Sécurité Réseau'],
  false,
  true
);

-- 3. Projets Université Paris-Saclay / AFORP (M1-M2 IRS)
INSERT INTO projects (title, description, content, technologies, featured, is_active) VALUES
(
  'Active Directory Complet (VirtualBox / Azure)',
  'Déploiement d''un domaine complet avec DNS, DHCP et GPO',
  'Déploiement d''un domaine rayane.local complet avec deux DC, DNS/DHCP intégrés et GPO personnalisées. Réplication et test de tolérance de panne réalisés avec succès.',
  ARRAY['Windows Server', 'DNS', 'DHCP', 'GPO', 'PowerShell'],
  true,
  true
),
(
  'MPLS L3VPN sur GNS3',
  'Configuration d''un backbone MPLS simulant un opérateur reliant plusieurs sites',
  'Configuration d''un backbone MPLS simulant un opérateur reliant plusieurs sites. Redistribution IGP-BGP, VRF clients et automatisation avec Ansible.',
  ARRAY['Cisco IOS', 'BGP', 'OSPF', 'VRF', 'Ansible'],
  true,
  true
),
(
  'PfSense – DMZ INT/EXT',
  'Création d''une architecture réseau à deux pare-feux',
  'Création d''une architecture réseau à deux pare-feux (interne et externe). Mise en place de règles inter-zones et tests d''accès sécurisés.',
  ARRAY['PfSense', 'VPN', 'NAT', 'SSL/TLS'],
  true,
  true
),
(
  'AWS – iptables & QoS',
  'Configuration de pare-feu et QoS sur instances AWS EC2',
  'Création de deux instances EC2 et configuration des règles de pare-feu. Test des priorités de trafic et des performances réseau.',
  ARRAY['AWS EC2', 'iptables', 'QoS', 'SSH'],
  true,
  true
),
(
  'Audit SSI – ISO 19011',
  'Audit de sécurité d''une chaîne de paiement',
  'Réalisation d''un audit de sécurité d''une chaîne de paiement (ERP–SWIFT). Identification des vulnérabilités et recommandations selon les normes ISO.',
  ARRAY['ISO 19011', 'CVSS', 'Risk Assessment'],
  true,
  true
),
(
  'CyberLab – Tests d''Intrusion',
  'Simulation d''attaques web sur environnement isolé',
  'Simulation d''attaques web (SQL Injection, XSS, brute-force) sur un environnement isolé. Rédaction d''un rapport de test et mise en place de contre-mesures simples.',
  ARRAY['Kali Linux', 'DVWA', 'Burp Suite'],
  true,
  true
),
(
  'Durcissement Systèmes Windows & Linux',
  'Sécurisation des postes Windows et Linux',
  'Sécurisation des postes Windows via stratégies GPO (blocage USB, pare-feu). Chiffrement automatique de /home sur Linux via LUKS. Résultat : systèmes plus sûrs et conformes aux bonnes pratiques.',
  ARRAY['GPO', 'PowerShell', 'LUKS', 'AppArmor'],
  true,
  true
),
(
  'Analyse de Fichiers Suspects',
  'Script Python pour vérifier la réputation de fichiers via VirusTotal',
  'Création d''un script Python pour vérifier la réputation d''un fichier via VirusTotal. Observation du comportement réseau avec Wireshark. Résultat : découverte des bases de l''analyse de malware et des indicateurs de compromission.',
  ARRAY['Windows', 'Python', 'VirusTotal', 'Wireshark'],
  false,
  true
);

-- 4. Projets ECE (Bachelor – Développement, Réseaux et Cybersécurité)
INSERT INTO projects (title, description, content, technologies, featured, is_active) VALUES
(
  'Projets Réseaux ECE',
  'Mise en œuvre de réseaux d''entreprise simulés',
  'Mise en œuvre de réseaux d''entreprise simulés : routage inter-VLAN, DHCP, ACL et supervision. Résultat : consolidation des connaissances CCNA et administration Cisco.',
  ARRAY['Cisco', 'Packet Tracer', 'VLAN', 'ACL'],
  false,
  true
),
(
  'Projets Web & Applications',
  'Développement de plusieurs applications web et API',
  'Développement de plusieurs applications web et API : ECEbook (réseau social étudiant PHP/MySQL), Sotum (gestion utilisateurs Symfony MVC), Cinema-App (gestion de films Java), ClimaSphere (visualisation météo React + API), Portfolio React/Supabase, API Football, Site SAV Informatique.',
  ARRAY['PHP', 'React', 'Node.js', 'Symfony', 'Laravel'],
  true,
  true
),
(
  'PFE – Santé-App (React / Laravel / React-Native)',
  'Projet de fin d''études complet sur la e-santé',
  'Projet de fin d''études complet sur la e-santé : Frontend React (suivi médical et graphiques d''évolution), Backend Laravel (API REST sécurisée avec JWT), Mobile React Native (application mobile connectée et notifications santé). Résultat : un écosystème complet, multi-plateforme et sécurisé.',
  ARRAY['React', 'React Native', 'Laravel', 'MySQL', 'JWT'],
  true,
  true
),
(
  'CyberDéfense & Sécurité Web',
  'Laboratoire d''apprentissage des vulnérabilités web',
  'Mise en place d''un laboratoire d''apprentissage des vulnérabilités web (SQLi, XSS, CSRF). Identification des failles et mise en œuvre de correctifs (validation d''entrée, politiques CSP). Résultat : meilleure compréhension de la sécurité applicative.',
  ARRAY['Kali Linux', 'OWASP ZAP', 'DVWA', 'OWASP Top 10'],
  true,
  true
),
(
  'Projets Jeux & Créativité',
  'Mini-jeux développés en C, JavaScript et Android',
  'Memory Game (jeu de mémoire HTML/JS), Gamebox Android (Tic Tac Toe Java), Farmer Heroes (mini-jeu de gestion JS), Jeu en C – Énigmes et Scores (interface texte avec ncurses et sauvegarde SQLite).',
  ARRAY['C', 'JavaScript', 'Android', 'SQLite'],
  false,
  true
);