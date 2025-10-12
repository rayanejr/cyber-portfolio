-- Suite de la simplification des descriptions

-- 7. VMware ESXi
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nIntégration de nouveaux hôtes de virtualisation pour renforcer l\'infrastructure et améliorer les performances.\n\n## 🎯 Objectifs\n\n- Ajouter des hôtes ESXi à l\'infrastructure\n- Créer des datastores partagés\n- Tester les fonctionnalités de migration\n- Documenter la topologie\n\n## 🔧 Technologies utilisées\n\nVMware ESXi, vCenter, iSCSI, stockage partagé\n\n## 💡 Travaux réalisés\n\n- Installation et configuration d\'hôtes ESXi\n- Configuration du stockage partagé\n- Tests de migration à chaud (vMotion)\n- Documentation de l\'architecture\n\n## 📊 Résultats\n\n✅ Infrastructure virtualisée renforcée\n✅ Performances améliorées\n✅ Haute disponibilité mise en place\n\n## 🎓 Compétences développées\n\nVirtualisation VMware, administration ESXi, gestion du stockage, haute disponibilité'
WHERE title = 'Intégration VMware ESXi – LNE';

-- 8. Gestion Restaurations
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nMise en place de solutions de sauvegarde et restauration de fichiers pour sécuriser les données.\n\n## 🎯 Objectifs\n\n- Déployer un package de désinstallation\n- Mettre en place des restaurations de fichiers\n- Uniformiser le parc logiciel\n- Assurer la fiabilité des sauvegardes\n\n## 🔧 Technologies utilisées\n\nPDQ Deploy, Solutions de backup, Shadow Copy, NTFS\n\n## 💡 Solutions implémentées\n\n- Package de déploiement automatisé\n- Configuration de restauration de fichiers\n- Tests de restauration\n- Documentation des procédures\n\n## 📊 Résultats\n\n✅ Système de sauvegarde fiable\n✅ Parc logiciel uniformisé\n✅ Procédures documentées\n\n## 🎓 Compétences développées\n\nGestion de sauvegardes, déploiement logiciel, administration système'
WHERE title = 'Désinstallation Ivanti & Gestion Restaurations NTFS – LNE';

-- 9. Support AD & Exchange
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nGestion quotidienne des comptes utilisateurs, messagerie et support technique.\n\n## 🎯 Objectifs\n\n- Gérer les comptes Active Directory\n- Administrer les boîtes aux lettres partagées\n- Assurer le support utilisateurs\n- Suivre les tickets d\'incidents\n\n## 🔧 Technologies utilisées\n\nActive Directory, Exchange, Système de ticketing\n\n## 💡 Activités réalisées\n\n- Création et modification de comptes\n- Gestion des permissions messagerie\n- Résolution d\'incidents\n- Suivi et documentation\n\n## 📊 Résultats\n\n✅ Support utilisateurs efficace\n✅ Traçabilité des interventions\n✅ Amélioration de la réactivité\n\n## 🎓 Compétences développées\n\nAdministration Active Directory, gestion Exchange, support utilisateurs, ticketing'
WHERE title = 'Gestion Comptes AD & Support Exchange / GLPI – LNE';

-- 10. Stages
UPDATE projects 
SET content = E'## 📋 Contexte du stage\n\nPremière expérience professionnelle en administration système et réseau.\n\n## 🎯 Missions\n\n- Installation et maintenance de serveurs\n- Configuration réseau\n- Support aux utilisateurs\n- Découverte du métier d\'administrateur système\n\n## 🔧 Technologies\n\nWindows Server, Cisco, Configuration réseau, Support IT\n\n## 📊 Compétences acquises\n\n✅ Administration Windows Server\n✅ Configuration d\'équipements réseau\n✅ Support technique\n✅ Découverte de l\'environnement professionnel'
WHERE title = 'Stage Next Step IT';

UPDATE projects 
SET content = E'## 📋 Contexte du stage\n\nStage en environnement bancaire pour la gestion du parc informatique.\n\n## 🎯 Missions\n\n- Gestion du parc informatique\n- Assistance technique aux collaborateurs\n- Maintenance des postes clients\n- Administration messagerie\n\n## 🔧 Technologies\n\nExchange, Windows Server, Gestion de parc\n\n## 📊 Compétences acquises\n\n✅ Gestion de parc en environnement bancaire\n✅ Support utilisateurs\n✅ Administration messagerie\n✅ Respect des procédures de sécurité'
WHERE title = 'Stage Banque Tuniso-Libyenne (BTL)';

UPDATE projects 
SET content = E'## 📋 Contexte du stage\n\nStage axé sur la configuration réseau et la simulation d\'infrastructures.\n\n## 🎯 Missions\n\n- Configuration d\'équipements Cisco\n- Simulation de réseaux sous GNS3\n- Mise en place de VLANs et ACL\n- Tests et validation\n\n## 🔧 Technologies\n\nCisco, GNS3, VLANs, ACL, Routage\n\n## 📊 Compétences acquises\n\n✅ Configuration d\'équipements Cisco\n✅ Simulation réseau GNS3\n✅ Segmentation réseau\n✅ Sécurisation par ACL'
WHERE title = 'Stage 3S Group';

-- 11. Active Directory
UPDATE projects 
SET content = E'## 📋 Contexte du projet\n\nDéploiement complet d\'une infrastructure Active Directory pour environnement d\'entreprise.\n\n## 🎯 Objectifs\n\n- Déployer un domaine Active Directory\n- Configurer DNS et DHCP\n- Mettre en place des stratégies de groupe\n- Tester l\'intégration cloud\n\n## 🔧 Technologies\n\nWindows Server, DNS, DHCP, GPO, Azure, VirtualBox\n\n## 💡 Infrastructure déployée\n\n- Contrôleur de domaine\n- Services réseau (DNS, DHCP)\n- Stratégies de groupe\n- Intégration cloud Azure\n\n## 📊 Résultats\n\n✅ Infrastructure complète fonctionnelle\n✅ Services réseau configurés\n✅ GPO déployées\n✅ Tests d\'intégration cloud réussis\n\n## 🎓 Compétences développées\n\nAdministration Active Directory, services réseau, stratégies de groupe, cloud hybride'
WHERE title = 'Active Directory Complet (VirtualBox / Azure)';