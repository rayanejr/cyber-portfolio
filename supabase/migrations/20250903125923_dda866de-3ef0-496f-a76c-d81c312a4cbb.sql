-- Ajouter des sources européennes et françaises pour la veille techno
INSERT INTO veille_sources (name, url, type, keywords, config, is_active) VALUES
-- Sources françaises
('ANSSI - Agence nationale de la sécurité des systèmes d''information', 'https://www.ssi.gouv.fr/actualite/feed/', 'rss', ARRAY['cybersécurité', 'sécurité', 'ANSSI', 'France', 'réglementation', 'RGPD', 'NIS2', 'cyber-résilience'], '{"category_mapping": {"cyber": "Blue Team", "vulnerabilité": "Vulnérabilités", "menace": "Malware/Threat"}}', true),

('Cyberveille ANSSI', 'https://www.cert.ssi.gouv.fr/alerte/feed/', 'rss', ARRAY['alerte', 'vulnérabilité', 'CERT-FR', 'incident', 'sécurité'], '{"category_mapping": {"alerte": "Advisories", "vulnérabilité": "Vulnérabilités"}}', true),

('Zataz - Sécurité informatique', 'https://www.zataz.com/feed/', 'rss', ARRAY['cybersécurité', 'piratage', 'fuite données', 'ransomware', 'France', 'Europe'], '{"category_mapping": {"piratage": "Malware/Threat", "vulnérabilité": "Vulnérabilités"}}', true),

('LeMondeInformatique - Sécurité', 'https://www.lemondeinformatique.fr/flux-rss/thematique/securite/rss.xml', 'rss', ARRAY['sécurité informatique', 'cybersécurité', 'cloud', 'entreprise', 'RGPD', 'France'], '{"category_mapping": {"cloud": "Cloud/Infra", "sécurité": "Blue Team"}}', true),

-- Sources européennes
('ENISA - European Union Agency for Cybersecurity', 'https://www.enisa.europa.eu/news/feed/latest-news', 'rss', ARRAY['cybersécurité', 'Europe', 'réglementation', 'NIS2', 'cyber-résilience', 'GDPR', 'cloud'], '{"category_mapping": {"regulation": "Advisories", "threat": "Malware/Threat", "cloud": "Cloud/Infra"}}', true),

('CERT-EU', 'https://cert.europa.eu/publications/feed/', 'rss', ARRAY['cybersécurité', 'CERT-EU', 'menaces', 'incidents', 'Europe', 'institutions'], '{"category_mapping": {"threat": "Malware/Threat", "vulnerability": "Vulnérabilités", "incident": "Blue Team"}}', true),

('Euractiv - Digital', 'https://www.euractiv.com/sections/digital/feed/', 'rss', ARRAY['politique numérique', 'RGPD', 'IA', 'cloud', 'Europe', 'réglementation', 'digital services act'], '{"category_mapping": {"ai": "Outils", "cloud": "Cloud/Infra", "regulation": "Advisories"}}', true),

-- Sources tech européennes
('TechCrunch Europe', 'https://techcrunch.com/category/startups/feed/', 'rss', ARRAY['startup', 'cloud', 'IA', 'cybersécurité', 'fintech', 'Europe', 'DevOps'], '{"category_mapping": {"ai": "Outils", "cloud": "Cloud/Infra", "security": "Blue Team"}}', true),

('Security Affairs', 'https://securityaffairs.com/feed', 'rss', ARRAY['cybersécurité', 'vulnérabilités', 'Europe', 'hacking', 'malware', 'data breach'], '{"category_mapping": {"vulnerability": "Vulnérabilités", "malware": "Malware/Threat", "breach": "Blue Team"}}', true),

-- Sources DevSecOps et Cloud européennes
('DevOps.com Europe', 'https://devops.com/feed/', 'rss', ARRAY['DevOps', 'DevSecOps', 'cloud', 'automation', 'Kubernetes', 'sécurité', 'CI/CD'], '{"category_mapping": {"devsecops": "Cloud/Infra", "automation": "Outils", "kubernetes": "Cloud/Infra"}}', true);

-- Mettre à jour les mots-clés pour mieux cibler l'Europe et la France
UPDATE veille_sources 
SET keywords = ARRAY['CVE', 'vulnérabilités', 'Europe', 'France', 'critical', 'high severity', 'exploitation']
WHERE name = 'NVD CVE';

UPDATE veille_sources 
SET keywords = ARRAY['CISA', 'exploitation', 'vulnérabilités critiques', 'Europe', 'infrastructure', 'services essentiels']
WHERE name = 'CISA KEV';

-- Désactiver temporairement les sources très américaines pour équilibrer
UPDATE veille_sources 
SET is_active = false
WHERE name IN ('Krebs Security', 'Google Project Zero');

-- Activer CERT-FR s'il n'était pas actif
UPDATE veille_sources 
SET is_active = true, 
    keywords = ARRAY['CERT-FR', 'vulnérabilités', 'alertes', 'France', 'cybersécurité', 'incidents', 'sécurité']
WHERE name = 'CERT-FR';