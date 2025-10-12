-- Mise à jour des noms d'entreprises dans la table experiences
UPDATE experiences 
SET company = 'Sagemcom Tunisie' 
WHERE company = '3S Group';

UPDATE experiences 
SET company = 'Telnet Group' 
WHERE company = 'Next Step IT';

UPDATE experiences 
SET company = 'UIB – BNP Paribas Tunisie' 
WHERE company = 'Banque Tuniso-Libyenne';

-- Mise à jour des titres de projets
UPDATE projects 
SET title = 'Stage Sagemcom Tunisie',
    content = REPLACE(REPLACE(content, '3S Group', 'Sagemcom Tunisie'), '3S Group', 'Sagemcom Tunisie')
WHERE title = 'Stage 3S Group';

UPDATE projects 
SET title = 'Stage Telnet Group',
    content = REPLACE(REPLACE(content, 'Next Step IT', 'Telnet Group'), 'Next Step IT', 'Telnet Group')
WHERE title = 'Stage Next Step IT';

UPDATE projects 
SET title = 'Stage UIB – BNP Paribas Tunisie',
    content = REPLACE(REPLACE(content, 'Banque Tuniso-Libyenne', 'UIB – BNP Paribas Tunisie'), 'BTL', 'UIB')
WHERE title = 'Stage Banque Tuniso-Libyenne (BTL)';