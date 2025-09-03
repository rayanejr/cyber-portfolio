-- Corriger le problème et nettoyer les sources problématiques
-- Supprimer toutes les sources récemment ajoutées qui peuvent poser problème
DELETE FROM veille_sources 
WHERE name IN (
  'ANSSI - Agence nationale de la sécurité des systèmes d''information',
  'Cyberveille ANSSI',
  'Zataz - Sécurité informatique', 
  'LeMondeInformatique - Sécurité',
  'ENISA - European Union Agency for Cybersecurity',
  'CERT-EU',
  'Euractiv - Digital',
  'TechCrunch Europe',
  'Security Affairs',
  'DevOps.com Europe',
  'IT-Connect - Réseaux et Systèmes',
  'Networkworld France',
  'Linux Magazine Europe',
  'Cisco Blogs Europe',
  'VMware Europe Blog',
  'Red Hat Blog Europe',
  'Network Computing Europe',
  'IT Pro Portal - Networks',
  'Telecom Ramblings',
  'Journal du Net - Systèmes et Réseaux'
);

-- Ajouter seulement quelques sources françaises fiables
INSERT INTO veille_sources (name, url, type, keywords, config, is_active) VALUES
('ANSSI Actualités', 'https://www.ssi.gouv.fr/actualite/feed/', 'rss', ARRAY['cybersécurité', 'ANSSI', 'France', 'sécurité', 'incident'], '{"category": "Blue Team"}', true),
('Zataz', 'https://www.zataz.com/feed/', 'rss', ARRAY['cybersécurité', 'piratage', 'France', 'Europe', 'hacking'], '{"category": "Malware/Threat"}', true),
('IT-Connect', 'https://www.it-connect.fr/feed/', 'rss', ARRAY['Windows Server', 'Active Directory', 'réseaux', 'systèmes', 'France'], '{"category": "Cloud/Infra"}', true);

-- Réactiver les sources US stables
UPDATE veille_sources 
SET is_active = true
WHERE name IN ('Krebs Security', 'Google Project Zero');