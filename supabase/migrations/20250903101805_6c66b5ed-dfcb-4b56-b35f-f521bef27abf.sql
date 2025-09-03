-- Continuer l'ajout des données de test pour les autres sections

-- 3. Insérer des données de test pour EXPERIENCES
INSERT INTO experiences (title, company, location, start_date, end_date, is_current, description, achievements, technologies) VALUES
('Expert en Cybersécurité Senior', 'SecureTech Solutions', 'Paris, France', '2022-01-01', NULL, true, 'Lead technique pour les projets de sécurisation d''infrastructures critiques. Responsable de l''équipe de réponse aux incidents et du développement de solutions de sécurité innovantes.', ARRAY['Réduction de 80% des incidents de sécurité', 'Implémentation réussie de l''architecture Zero Trust', 'Formation de 50+ professionnels en cybersécurité', 'Certification ISO 27001 obtenue'], ARRAY['Python', 'Kubernetes', 'SIEM', 'Penetration Testing']),

('Consultant Sécurité Cloud', 'CloudGuard Consulting', 'Lyon, France', '2020-03-01', '2021-12-31', false, 'Spécialiste sécurité cloud pour les migrations et transformations digitales. Audit et sécurisation d''environnements AWS, Azure et GCP.', ARRAY['Migration sécurisée de 100+ applications vers le cloud', 'Développement de framework de sécurité cloud', 'Réduction de 60% des coûts de sécurité', 'Certification de 20+ architectures cloud'], ARRAY['AWS', 'Azure', 'Terraform', 'Docker']),

('Architecte Sécurité', 'FinanceSecure Bank', 'Nice, France', '2018-06-01', '2020-02-29', false, 'Conception et implémentation de l''architecture de sécurité pour les services bancaires numériques. Responsable de la conformité réglementaire et des audits.', ARRAY['Architecture sécurisée pour 2M+ utilisateurs', 'Conformité PCI DSS et GDPR atteinte', 'Réduction de 90% des tentatives de fraude', 'Implémentation de l''authentification biométrique'], ARRAY['Java', 'Spring Security', 'OAuth2', 'Blockchain']),

('Développeur Sécurité Full-Stack', 'StartupSec', 'Toulouse, France', '2016-09-01', '2018-05-31', false, 'Développement d''applications web sécurisées et mise en place des bonnes pratiques DevSecOps. Formation des équipes aux enjeux de sécurité.', ARRAY['Développement de 15+ applications sécurisées', 'Intégration CI/CD avec tests de sécurité', 'Formation de 30+ développeurs', 'Zéro vulnérabilité critique en production'], ARRAY['React', 'Node.js', 'PostgreSQL', 'Jenkins']);

-- 4. Insérer des données de test pour FORMATIONS  
INSERT INTO formations (title, institution, level, start_date, end_date, is_current, description, skills) VALUES
('Master en Cybersécurité et Cryptologie', 'Université de Versailles Saint-Quentin', 'Master (Bac+5)', '2014-09-01', '2016-06-30', false, 'Formation spécialisée en cybersécurité avec focus sur la cryptographie, l''analyse de malwares et la sécurité des systèmes. Projet de fin d''études sur l''analyse comportementale des attaques APT.', ARRAY['Cryptographie avancée', 'Analyse de malwares', 'Forensique numérique', 'Sécurité réseau']),

('Ingénieur en Informatique et Réseaux', 'INSA Lyon', 'Ingénieur (Bac+5)', '2011-09-01', '2014-06-30', false, 'Formation d''ingénieur généraliste en informatique avec spécialisation en réseaux et sécurité. Échange académique de 6 mois au MIT pour étudier la sécurité des IoT.', ARRAY['Programmation avancée', 'Architecture réseaux', 'Systèmes distribués', 'Gestion de projet']),

('DUT Informatique', 'IUT Grenoble', 'DUT (Bac+2)', '2009-09-01', '2011-06-30', false, 'Formation technique en développement logiciel et administration systèmes. Spécialisation en sécurité des applications web et bases de données.', ARRAY['Développement web', 'Administration Linux', 'Bases de données', 'Réseaux TCP/IP']),

('Certification CISSP', 'Formation Continue Cybersécurité', 'Certification', '2020-01-01', '2020-03-31', false, 'Certification professionnelle reconnue internationalement en cybersécurité. Couvre 8 domaines de sécurité selon le CBK (Common Body of Knowledge).', ARRAY['Sécurité et gestion des risques', 'Sécurité des actifs', 'Architecture de sécurité', 'Cryptographie']);

-- 5. Insérer des données de test pour SKILLS (avec contrainte level <= 100)
INSERT INTO skills (name, category, level, description, icon, is_featured) VALUES
('Python', 'Programmation', 90, 'Développement d''outils de sécurité, scripts d''automatisation et analyse de données.', '🐍', true),
('Penetration Testing', 'Sécurité', 95, 'Tests d''intrusion et évaluation de la sécurité des applications et infrastructures.', '🛡️', true),
('Kubernetes', 'Infrastructure', 85, 'Orchestration de conteneurs et sécurisation d''environnements cloud-native.', '☸️', true),
('React', 'Frontend', 80, 'Développement d''interfaces utilisateur modernes et sécurisées.', '⚛️', false);

-- 6. Insérer des données de test pour CERTIFICATIONS
INSERT INTO certifications (name, issuer, issue_date, expiry_date, credential_id, credential_url, is_active, image_url) VALUES
('Certified Information Systems Security Professional (CISSP)', 'ISC2', '2020-03-15', '2026-03-15', 'CISSP-789456', 'https://www.isc2.org/Certifications/CISSP', true, 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=400&h=300&fit=crop'),
('Certified Ethical Hacker (CEH)', 'EC-Council', '2019-11-20', '2025-11-20', 'CEH-123789', 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/', true, 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400&h=300&fit=crop'),
('AWS Certified Security - Specialty', 'Amazon Web Services', '2021-08-10', '2024-08-10', 'AWS-SEC-456123', 'https://aws.amazon.com/certification/certified-security-specialty/', true, 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=300&fit=crop'),
('GCIH: GIAC Certified Incident Handler', 'SANS/GIAC', '2022-05-30', '2026-05-30', 'GCIH-987654', 'https://www.giac.org/certification/certified-incident-handler-gcih', true, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop');

-- 7. Insérer des données de test pour TOOLS
INSERT INTO tools (name, description, category, config, is_active) VALUES
('Nmap', 'Scanner de ports et découverte de réseau pour l''audit de sécurité et le penetration testing.', 'Network Security', '{"version": "7.94", "features": ["port_scan", "os_detection", "service_detection"], "usage": "security_audit"}', true),
('Metasploit', 'Framework de test d''intrusion pour l''évaluation de vulnérabilités et le développement d''exploits.', 'Penetration Testing', '{"version": "6.3", "modules": 2300, "payloads": 500, "license": "community"}', true),
('Wireshark', 'Analyseur de protocoles réseau pour la capture et l''analyse de trafic en temps réel.', 'Network Analysis', '{"version": "4.2", "protocols": 3000, "features": ["live_capture", "offline_analysis"], "filters": "advanced"}', true),
('Burp Suite', 'Plateforme intégrée pour les tests de sécurité des applications web avec proxy intercepteur.', 'Web Security', '{"version": "2023.10", "edition": "professional", "extensions": 50, "scanner": "active"}', true);

-- 8. Insérer des données de test pour ADMIN_FILES
INSERT INTO admin_files (filename, file_type, file_category, file_url, is_active) VALUES
('CV_Cybersecurity_Expert_2024.pdf', 'application/pdf', 'CV', 'https://example.com/files/cv-cybersec-2024.pdf', true),
('Security_Assessment_Template.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Template', 'https://example.com/files/security-template.docx', true),
('Network_Diagram_Infrastructure.png', 'image/png', 'Diagram', 'https://example.com/files/network-diagram.png', true),
('Incident_Response_Checklist.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Checklist', 'https://example.com/files/incident-checklist.xlsx', true);