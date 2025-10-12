-- Supprimer toutes les formations existantes
DELETE FROM formations;

-- Insérer les nouvelles formations
INSERT INTO formations (title, institution, level, description, start_date, end_date, is_current, skills) VALUES
(
  'Master Ingénierie des Réseaux et des Systèmes – Voie Cybersécurité',
  'Université Paris-Saclay / AFORP',
  'Master',
  'Formation en alternance (3 semaines entreprise / 1 semaine école).
Spécialisation en cybersécurité des infrastructures réseau et système, avec mise en pratique sur Active Directory, PfSense, MPLS, VPN, Cloud AWS et audit SSI.
Projets réalisés : supervision, durcissement systèmes et automatisation réseau (Python, Ansible).',
  '2024-09-01',
  '2026-06-30',
  true,
  ARRAY['Cybersécurité', 'Sécurité réseau', 'Active Directory', 'GPO', 'PfSense', 'VPN', 'Cloud AWS', 'Virtualisation', 'Audit SSI', 'SIEM', 'Automatisation (Python, Ansible)', 'Supervision réseau']
),
(
  'Bachelor Administrateur d''Infrastructures Sécurisées',
  'École Centrale d''Électronique (ECE Paris)',
  'Bac +3',
  'Formation axée sur le développement web sécurisé et l''administration réseau.
Réalisation de projets concrets : ECEbook, Cinema-App, API Football, Portfolio React et projet Santé-App (React, Laravel, React Native).
Découverte de la sécurité applicative (DVWA, OWASP, Burp Suite).',
  '2021-09-01',
  '2024-06-30',
  false,
  ARRAY['Développement web (React, Symfony, Laravel, Node.js)', 'Sécurité applicative (OWASP)', 'Réseaux Cisco', 'Linux', 'Python', 'MySQL', 'API REST', 'POO', 'Tests d''intrusion']
),
(
  'Baccalauréat Scientifique – Mention Bien (Option Musique Orientale – Oud)',
  'Lycée Carnot – Cannes',
  'Baccalauréat Général (Scientifique)',
  'Formation scientifique axée sur les mathématiques, la physique et les sciences, complétée par une option musique orientale (oud).
Cette double approche m''a permis de développer à la fois rigueur analytique et sens artistique.',
  '2018-09-01',
  '2021-06-30',
  false,
  ARRAY['Raisonnement logique', 'Mathématiques appliquées', 'Méthodologie scientifique', 'Culture technologique', 'Sens artistique', 'Discipline et créativité']
);