-- Inverser les noms d'entreprises dans la table experiences
UPDATE experiences 
SET company = '3S Groupe' 
WHERE company = 'Sagemcom Tunisie';

UPDATE experiences 
SET company = 'Next Step IT' 
WHERE company = 'Telnet Group';

UPDATE experiences 
SET company = 'Banque Tuniso-Libyenne' 
WHERE company = 'UIB – BNP Paribas Tunisie';

-- Inverser les titres de projets
UPDATE projects 
SET title = 'Stage 3S Groupe',
    content = REPLACE(REPLACE(content, 'Sagemcom Tunisie', '3S Groupe'), 'Sagemcom', '3S Groupe')
WHERE title = 'Stage Sagemcom Tunisie';

UPDATE projects 
SET title = 'Stage Next Step IT',
    content = REPLACE(REPLACE(content, 'Telnet Group', 'Next Step IT'), 'Telnet', 'Next Step IT')
WHERE title = 'Stage Telnet Group';

UPDATE projects 
SET title = 'Stage Banque Tuniso-Libyenne (BTL)',
    content = REPLACE(REPLACE(content, 'UIB – BNP Paribas Tunisie', 'Banque Tuniso-Libyenne'), 'UIB', 'BTL')
WHERE title = 'Stage UIB – BNP Paribas Tunisie';

-- Mise à jour des images des projets
UPDATE projects 
SET image_url = '/src/assets/projects/stage-3s-group.png'
WHERE title = 'Stage 3S Groupe';

UPDATE projects 
SET image_url = '/src/assets/projects/stage-next-step.png'
WHERE title = 'Stage Next Step IT';