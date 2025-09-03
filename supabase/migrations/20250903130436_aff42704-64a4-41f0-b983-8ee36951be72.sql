-- Corriger les URLs problématiques et supprimer les sources en double
DELETE FROM veille_sources WHERE name IN (
  'Network Computing Europe', 
  'IT Pro Portal - Networks',
  'Telecom Ramblings',
  'Journal du Net - Systèmes et Réseaux'
);

-- Corriger les URLs des sources existantes
UPDATE veille_sources 
SET url = 'https://www.networkworld.com/category/networking/index.rss'
WHERE name = 'Networkworld France';

UPDATE veille_sources 
SET url = 'https://www.linux-magazine.com/rss/feed/lmi_latest'
WHERE name = 'Linux Magazine Europe';

-- Supprimer les doublons
DELETE FROM veille_sources 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM veille_sources 
  GROUP BY name
);

-- Mettre à jour les URLs des nouvelles sources avec des URLs valides
UPDATE veille_sources 
SET url = 'https://www.zataz.com/feed/'
WHERE name = 'Zataz - Sécurité informatique';

UPDATE veille_sources 
SET url = 'https://www.lemondeinformatique.fr/rss/rss.xml'
WHERE name = 'LeMondeInformatique - Sécurité';

UPDATE veille_sources 
SET url = 'https://www.enisa.europa.eu/news/rss'
WHERE name = 'ENISA - European Union Agency for Cybersecurity';

UPDATE veille_sources 
SET url = 'https://cert.europa.eu/static/ThreatReports/rss.xml'
WHERE name = 'CERT-EU';

UPDATE veille_sources 
SET url = 'https://www.euractiv.com/sections/digital/feed/'
WHERE name = 'Euractiv - Digital';

UPDATE veille_sources 
SET url = 'https://techcrunch.com/category/startups/feed/'
WHERE name = 'TechCrunch Europe';

UPDATE veille_sources 
SET url = 'https://securityaffairs.com/feed'
WHERE name = 'Security Affairs';

UPDATE veille_sources 
SET url = 'https://devops.com/feed/'
WHERE name = 'DevOps.com Europe';