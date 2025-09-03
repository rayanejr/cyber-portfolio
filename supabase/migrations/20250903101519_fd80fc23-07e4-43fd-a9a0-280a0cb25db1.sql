-- Corriger les politiques RLS trop restrictives et ajouter des données de test

-- 1. Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Admin write access" ON projects;
DROP POLICY IF EXISTS "Admin write access" ON blogs;
DROP POLICY IF EXISTS "Admin write access" ON experiences;
DROP POLICY IF EXISTS "Admin write access" ON formations;
DROP POLICY IF EXISTS "Admin write access" ON skills;
DROP POLICY IF EXISTS "Admin write access" ON certifications;
DROP POLICY IF EXISTS "Admin write access" ON tools;
DROP POLICY IF EXISTS "Admin write access" ON admin_files;
DROP POLICY IF EXISTS "Admin read/write access" ON contact_messages;

-- 2. Créer des politiques RLS plus permissives pour l'admin
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (true);
CREATE POLICY "Admin full access blogs" ON blogs FOR ALL USING (true);
CREATE POLICY "Admin full access experiences" ON experiences FOR ALL USING (true);
CREATE POLICY "Admin full access formations" ON formations FOR ALL USING (true);
CREATE POLICY "Admin full access skills" ON skills FOR ALL USING (true);
CREATE POLICY "Admin full access certifications" ON certifications FOR ALL USING (true);
CREATE POLICY "Admin full access tools" ON tools FOR ALL USING (true);
CREATE POLICY "Admin full access admin_files" ON admin_files FOR ALL USING (true);
CREATE POLICY "Admin full access contact_messages" ON contact_messages FOR ALL USING (true);

-- 3. Insérer des données de test pour PROJECTS
INSERT INTO projects (title, description, content, technologies, github_url, demo_url, is_active, featured, image_url) VALUES
('Système de Sécurité Cyber', 'Solution complète de cybersécurité pour entreprises', '# Système de Sécurité Cyber\n\nUne solution complète de cybersécurité développée pour protéger les infrastructures critiques des entreprises.\n\n## Fonctionnalités\n- Détection d''intrusions en temps réel\n- Analyse comportementale avancée\n- Dashboard de monitoring\n- Alertes automatisées\n\n## Technologies utilisées\n- Python pour l''analyse\n- React pour l''interface\n- Machine Learning pour la détection', ARRAY['Python', 'React', 'Machine Learning', 'PostgreSQL'], 'https://github.com/admin/cyber-security', 'https://demo-cyber.example.com', true, true, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop'),

('Plateforme E-commerce Sécurisée', 'Plateforme de vente en ligne avec sécurité renforcée', '# Plateforme E-commerce Sécurisée\n\nUne plateforme de commerce électronique développée avec les plus hauts standards de sécurité.\n\n## Sécurité\n- Chiffrement end-to-end\n- Authentification multi-facteurs\n- Prévention des attaques XSS/CSRF\n- Audit de sécurité automatisé\n\n## Performance\n- Architecture microservices\n- Cache Redis\n- CDN global\n- Optimisations SQL avancées', ARRAY['Node.js', 'Vue.js', 'Redis', 'Docker'], 'https://github.com/admin/secure-ecommerce', 'https://demo-shop.example.com', true, true, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'),

('Application Mobile de Monitoring', 'App mobile pour surveiller les systèmes à distance', '# Application Mobile de Monitoring\n\nApplication mobile native permettant de surveiller les systèmes informatiques à distance.\n\n## Fonctionnalités\n- Monitoring en temps réel\n- Notifications push\n- Graphiques interactifs\n- Mode hors ligne\n\n## Compatibilité\n- iOS et Android\n- Synchronisation cloud\n- Interface adaptative\n- Support multi-langues', ARRAY['React Native', 'Firebase', 'GraphQL', 'TypeScript'], 'https://github.com/admin/monitoring-app', 'https://apps.apple.com/monitoring', true, false, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'),

('Outil d''Analyse de Vulnérabilités', 'Scanner automatisé de vulnérabilités web', '# Outil d''Analyse de Vulnérabilités\n\nScanner automatisé capable de détecter les vulnérabilités dans les applications web.\n\n## Capacités\n- Scan OWASP Top 10\n- Détection SQL Injection\n- Analyse XSS\n- Audit de configuration\n\n## Rapports\n- PDF détaillés\n- Dashboard interactif\n- Suggestions de correction\n- Tracking des corrections', ARRAY['Python', 'Django', 'Celery', 'PostgreSQL'], 'https://github.com/admin/vulnerability-scanner', 'https://scanner.example.com', true, false, 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&h=600&fit=crop');

-- 4. Insérer des données de test pour BLOGS
INSERT INTO blogs (title, content, excerpt, published, featured, tags, slug, image_url) VALUES
('Les Nouvelles Menaces Cyber en 2024', '# Les Nouvelles Menaces Cyber en 2024\n\nLe paysage de la cybersécurité évolue constamment. En 2024, nous observons l''émergence de nouvelles menaces sophistiquées.\n\n## Principales tendances\n\n### 1. Attaques basées sur l''IA\nLes cybercriminels utilisent désormais l''intelligence artificielle pour :\n- Créer des deepfakes convaincants\n- Automatiser les attaques de phishing\n- Générer des malwares polymorphes\n\n### 2. Ransomware-as-a-Service\nLe modèle RaaS continue de se développer :\n- Barrière d''entrée réduite\n- Spécialisation des rôles\n- Professionnalisation du crime\n\n### 3. Attaques sur les infrastructures cloud\n- Misconfiguration des services\n- Élévation de privilèges\n- Latéral movement\n\n## Recommandations\n- Mise à jour continue des systèmes\n- Formation du personnel\n- Implémentation de l''authentification multi-facteurs\n- Surveillance proactive des réseaux', 'Découvrez les nouvelles menaces cybersécurité qui émergent en 2024 et comment s''en protéger efficacement.', true, true, ARRAY['cybersécurité', 'menaces', '2024', 'IA'], 'nouvelles-menaces-cyber-2024', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'),

('Mise en Place d''une Architecture Zero Trust', '# Architecture Zero Trust : Guide Complet\n\nL''architecture Zero Trust révolutionne l''approche traditionnelle de la sécurité réseau.\n\n## Qu''est-ce que Zero Trust ?\n\nLe principe "Never Trust, Always Verify" remplace le modèle de sécurité périmétrique traditionnel.\n\n### Piliers fondamentaux\n1. **Vérification explicite** : Authentifier et autoriser basé sur tous les points de données\n2. **Accès de moindre privilège** : Limiter l''accès avec Just-In-Time et Just-Enough-Access\n3. **Assumer la compromission** : Minimiser le rayon d''impact et segmenter l''accès\n\n## Implémentation pratique\n\n### Phase 1 : Cartographie\n- Inventaire des actifs\n- Flux de données\n- Identification des utilisateurs\n\n### Phase 2 : Micro-segmentation\n- Segmentation réseau\n- Politiques granulaires\n- Monitoring continu\n\n### Phase 3 : Automatisation\n- Orchestration de sécurité\n- Réponse automatisée\n- Analytics comportementaux\n\n## Bénéfices mesurés\n- Réduction de 75% des incidents de sécurité\n- Amélioration de 40% de la posture de sécurité\n- ROI positif en 18 mois', 'Guide complet pour implémenter une architecture Zero Trust dans votre organisation.', true, true, ARRAY['zero-trust', 'architecture', 'sécurité-réseau'], 'architecture-zero-trust-guide', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop'),

('DevSecOps : Intégrer la Sécurité dans le CI/CD', '# DevSecOps : Sécurité Native dans le Pipeline\n\nL''intégration de la sécurité dans les pipelines DevOps n''est plus optionnelle.\n\n## Qu''est-ce que DevSecOps ?\n\nDevSecOps intègre les pratiques de sécurité dès le début du cycle de développement.\n\n### Shift Left Security\n- Tests de sécurité précoces\n- Scan de vulnérabilités automatisé\n- Revue de code sécurisée\n\n## Pipeline sécurisé\n\n### Phase de développement\n```bash\n# Exemple de pipeline sécurisé\nstages:\n  - lint\n  - security-scan\n  - test\n  - build\n  - deploy\n```\n\n### Outils essentiels\n1. **SAST** : Analyse statique du code\n2. **DAST** : Tests dynamiques\n3. **IAST** : Analyse interactive\n4. **SCA** : Analyse des composants\n\n### Métriques clés\n- Time to detection\n- Time to resolution\n- Vulnérabilités par release\n- Couverture des tests de sécurité\n\n## Automatisation\n- Gates de sécurité automatiques\n- Remédiation assistée\n- Reporting continu\n\n## Culture DevSecOps\n- Formation des équipes\n- Responsabilité partagée\n- Amélioration continue', 'Apprenez à intégrer efficacement la sécurité dans vos pipelines DevOps avec DevSecOps.', true, false, ARRAY['devsecops', 'ci-cd', 'automatisation'], 'devsecops-integration-securite', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'),

('Gestion des Incidents de Sécurité : Playbook 2024', '# Playbook de Gestion d''Incidents de Sécurité\n\nUn guide pratique pour une réponse efficace aux incidents cybersécurité.\n\n## Phases de réponse\n\n### 1. Préparation\n- Constitution de l''équipe CSIRT\n- Développement des procédures\n- Formation régulière\n- Tests de simulation\n\n### 2. Détection et Analyse\n- Monitoring 24/7\n- Corrélation d''événements\n- Classification des incidents\n- Escalade appropriée\n\n### 3. Containment\n- Isolation immédiate\n- Préservation des preuves\n- Communication interne\n- Mesures temporaires\n\n### 4. Éradication\n- Identification de la cause racine\n- Suppression des traces\n- Patch des vulnérabilités\n- Renforcement des défenses\n\n### 5. Récupération\n- Restauration des services\n- Monitoring renforcé\n- Tests de validation\n- Retour à la normale\n\n### 6. Leçons apprises\n- Analyse post-incident\n- Documentation des améliorations\n- Mise à jour des procédures\n- Formation adaptée\n\n## Outils recommandés\n- SOAR platforms\n- Threat intelligence\n- Forensic tools\n- Communication sécurisée\n\n## Métriques d''efficacité\n- MTTD (Mean Time To Detect)\n- MTTR (Mean Time To Respond)\n- Coût par incident\n- Taux de récurrence', 'Playbook complet pour gérer efficacement les incidents de cybersécurité dans votre organisation.', true, false, ARRAY['incident-response', 'csirt', 'playbook'], 'gestion-incidents-securite-playbook', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop');

-- 5. Insérer des données de test pour EXPERIENCES
INSERT INTO experiences (title, company, location, start_date, end_date, is_current, description, achievements, technologies) VALUES
('Expert en Cybersécurité Senior', 'SecureTech Solutions', 'Paris, France', '2022-01-01', NULL, true, 'Lead technique pour les projets de sécurisation d''infrastructures critiques. Responsable de l''équipe de réponse aux incidents et du développement de solutions de sécurité innovantes.', ARRAY['Réduction de 80% des incidents de sécurité', 'Implémentation réussie de l''architecture Zero Trust', 'Formation de 50+ professionnels en cybersécurité', 'Certification ISO 27001 obtenue'], ARRAY['Python', 'Kubernetes', 'SIEM', 'Penetration Testing']),

('Consultant Sécurité Cloud', 'CloudGuard Consulting', 'Lyon, France', '2020-03-01', '2021-12-31', false, 'Spécialiste sécurité cloud pour les migrations et transformations digitales. Audit et sécurisation d''environnements AWS, Azure et GCP.', ARRAY['Migration sécurisée de 100+ applications vers le cloud', 'Développement de framework de sécurité cloud', 'Réduction de 60% des coûts de sécurité', 'Certification de 20+ architectures cloud'], ARRAY['AWS', 'Azure', 'Terraform', 'Docker']),

('Architecte Sécurité', 'FinanceSecure Bank', 'Nice, France', '2018-06-01', '2020-02-29', false, 'Conception et implémentation de l''architecture de sécurité pour les services bancaires numériques. Responsable de la conformité réglementaire et des audits.', ARRAY['Architecture sécurisée pour 2M+ utilisateurs', 'Conformité PCI DSS et GDPR atteinte', 'Réduction de 90% des tentatives de fraude', 'Implémentation de l''authentification biométrique'], ARRAY['Java', 'Spring Security', 'OAuth2', 'Blockchain']),

('Développeur Sécurité Full-Stack', 'StartupSec', 'Toulouse, France', '2016-09-01', '2018-05-31', false, 'Développement d''applications web sécurisées et mise en place des bonnes pratiques DevSecOps. Formation des équipes aux enjeux de sécurité.', ARRAY['Développement de 15+ applications sécurisées', 'Intégration CI/CD avec tests de sécurité', 'Formation de 30+ développeurs', 'Zéro vulnérabilité critique en production'], ARRAY['React', 'Node.js', 'PostgreSQL', 'Jenkins']);

-- 6. Insérer des données de test pour FORMATIONS
INSERT INTO formations (title, institution, level, start_date, end_date, is_current, description, skills) VALUES
('Master en Cybersécurité et Cryptologie', 'Université de Versailles Saint-Quentin', 'Master (Bac+5)', '2014-09-01', '2016-06-30', false, 'Formation spécialisée en cybersécurité avec focus sur la cryptographie, l''analyse de malwares et la sécurité des systèmes. Projet de fin d''études sur l''analyse comportementale des attaques APT.', ARRAY['Cryptographie avancée', 'Analyse de malwares', 'Forensique numérique', 'Sécurité réseau']),

('Ingénieur en Informatique et Réseaux', 'INSA Lyon', 'Ingénieur (Bac+5)', '2011-09-01', '2014-06-30', false, 'Formation d''ingénieur généraliste en informatique avec spécialisation en réseaux et sécurité. Échange académique de 6 mois au MIT pour étudier la sécurité des IoT.', ARRAY['Programmation avancée', 'Architecture réseaux', 'Systèmes distribués', 'Gestion de projet']),

('DUT Informatique', 'IUT Grenoble', 'DUT (Bac+2)', '2009-09-01', '2011-06-30', false, 'Formation technique en développement logiciel et administration systèmes. Spécialisation en sécurité des applications web et bases de données.', ARRAY['Développement web', 'Administration Linux', 'Bases de données', 'Réseaux TCP/IP']),

('Certification CISSP', 'Formation Continue Cybersécurité', 'Certification', '2020-01-01', '2020-03-31', false, 'Certification professionnelle reconnue internationalement en cybersécurité. Couvre 8 domaines de sécurité selon le CBK (Common Body of Knowledge).', ARRAY['Sécurité et gestion des risques', 'Sécurité des actifs', 'Architecture de sécurité', 'Cryptographie']);

-- 7. Insérer des données de test pour SKILLS
INSERT INTO skills (name, category, level, description, icon, is_featured) VALUES
('Python', 'Programmation', 90, 'Développement d''outils de sécurité, scripts d''automatisation et analyse de données.', '🐍', true),
('Penetration Testing', 'Sécurité', 95, 'Tests d''intrusion et évaluation de la sécurité des applications et infrastructures.', '🛡️', true),
('Kubernetes', 'Infrastructure', 85, 'Orchestration de conteneurs et sécurisation d''environnements cloud-native.', '☸️', true),
('React', 'Frontend', 80, 'Développement d''interfaces utilisateur modernes et sécurisées.', '⚛️', false),
('Docker', 'DevOps', 88, 'Containerisation et déploiement sécurisé d''applications.', '🐳', true),
('SIEM', 'Monitoring', 92, 'Configuration et gestion de solutions de monitoring de sécurité.', '📊', true),
('Cryptographie', 'Sécurité', 87, 'Implémentation et audit de solutions cryptographiques.', '🔐', false),
('Machine Learning', 'IA', 75, 'Application de l''IA pour la détection d''anomalies et la cybersécurité.', '🤖', false);

-- 8. Insérer des données de test pour CERTIFICATIONS
INSERT INTO certifications (name, issuer, issue_date, expiry_date, credential_id, credential_url, is_active, image_url) VALUES
('Certified Information Systems Security Professional (CISSP)', 'ISC2', '2020-03-15', '2026-03-15', 'CISSP-789456', 'https://www.isc2.org/Certifications/CISSP', true, 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=400&h=300&fit=crop'),
('Certified Ethical Hacker (CEH)', 'EC-Council', '2019-11-20', '2025-11-20', 'CEH-123789', 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/', true, 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop'),
('AWS Certified Security - Specialty', 'Amazon Web Services', '2021-08-10', '2024-08-10', 'AWS-SEC-456123', 'https://aws.amazon.com/certification/certified-security-specialty/', true, 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=300&fit=crop'),
('GCIH: GIAC Certified Incident Handler', 'SANS/GIAC', '2022-05-30', '2026-05-30', 'GCIH-987654', 'https://www.giac.org/certification/certified-incident-handler-gcih', true, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop');

-- 9. Insérer des données de test pour TOOLS
INSERT INTO tools (name, description, category, config, is_active) VALUES
('Nmap', 'Scanner de ports et découverte de réseau pour l''audit de sécurité et le penetration testing.', 'Network Security', '{"version": "7.94", "features": ["port_scan", "os_detection", "service_detection"], "usage": "security_audit"}', true),
('Metasploit', 'Framework de test d''intrusion pour l''évaluation de vulnérabilités et le développement d''exploits.', 'Penetration Testing', '{"version": "6.3", "modules": 2300, "payloads": 500, "license": "community"}', true),
('Wireshark', 'Analyseur de protocoles réseau pour la capture et l''analyse de trafic en temps réel.', 'Network Analysis', '{"version": "4.2", "protocols": 3000, "features": ["live_capture", "offline_analysis"], "filters": "advanced"}', true),
('Burp Suite', 'Plateforme intégrée pour les tests de sécurité des applications web avec proxy intercepteur.', 'Web Security', '{"version": "2023.10", "edition": "professional", "extensions": 50, "scanner": "active"}', true);

-- 10. Insérer des données de test pour ADMIN_FILES
INSERT INTO admin_files (filename, file_type, file_category, file_url, is_active) VALUES
('CV_Cybersecurity_Expert_2024.pdf', 'application/pdf', 'CV', 'https://example.com/files/cv-cybersec-2024.pdf', true),
('Security_Assessment_Template.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Template', 'https://example.com/files/security-template.docx', true),
('Network_Diagram_Infrastructure.png', 'image/png', 'Diagram', 'https://example.com/files/network-diagram.png', true),
('Incident_Response_Checklist.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Checklist', 'https://example.com/files/incident-checklist.xlsx', true);