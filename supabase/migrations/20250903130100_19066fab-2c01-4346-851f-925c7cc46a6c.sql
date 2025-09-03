-- Ajouter des sources spécialisées réseaux et systèmes informatiques
INSERT INTO veille_sources (name, url, type, keywords, config, is_active) VALUES
-- Sources françaises réseaux et systèmes
('IT-Connect - Réseaux et Systèmes', 'https://www.it-connect.fr/feed/', 'rss', ARRAY['Windows Server', 'Active Directory', 'réseaux', 'systèmes', 'administration', 'PowerShell', 'France', 'infrastructure'], '{"category_mapping": {"réseau": "Cloud/Infra", "système": "Cloud/Infra", "sécurité": "Blue Team"}}', true),

('Networkworld France', 'https://www.networkworld.fr/feed/', 'rss', ARRAY['réseaux', 'télécoms', 'infrastructure', 'France', 'Wi-Fi', 'switching', 'routing', 'SDN'], '{"category_mapping": {"réseau": "Cloud/Infra", "infrastructure": "Cloud/Infra", "télécoms": "Cloud/Infra"}}', true),

('Journal du Net - Systèmes et Réseaux', 'https://www.journaldunet.com/rss/solutions/systemes-reseaux.xml', 'rss', ARRAY['systèmes', 'réseaux', 'infrastructure', 'serveurs', 'stockage', 'virtualisation', 'France'], '{"category_mapping": {"système": "Cloud/Infra", "virtualisation": "Cloud/Infra", "stockage": "Cloud/Infra"}}', true),

-- Sources européennes spécialisées
('Network Computing Europe', 'https://www.networkcomputing.com/rss-feeds', 'rss', ARRAY['networking', 'infrastructure', 'data center', 'Europe', 'SDN', 'network security', 'switching'], '{"category_mapping": {"network": "Cloud/Infra", "security": "Blue Team", "datacenter": "Cloud/Infra"}}', true),

('IT Pro Portal - Networks', 'https://www.itproportal.com/rss/networks/', 'rss', ARRAY['networking', 'systems', 'infrastructure', 'Europe', 'enterprise', 'network management'], '{"category_mapping": {"network": "Cloud/Infra", "infrastructure": "Cloud/Infra", "management": "Outils"}}', true),

('Linux Magazine Europe', 'https://www.linux-magazine.com/rss/feed/lmi_full', 'rss', ARRAY['Linux', 'systèmes', 'administration', 'Europe', 'open source', 'serveurs', 'virtualisation'], '{"category_mapping": {"linux": "Cloud/Infra", "admin": "Outils", "virtualisation": "Cloud/Infra"}}', true),

-- Sources techniques spécialisées
('Cisco Blogs Europe', 'https://blogs.cisco.com/feed', 'rss', ARRAY['Cisco', 'réseaux', 'switching', 'routing', 'sécurité réseau', 'SD-WAN', 'infrastructure'], '{"category_mapping": {"cisco": "Cloud/Infra", "network": "Cloud/Infra", "security": "Blue Team"}}', true),

('VMware Europe Blog', 'https://blogs.vmware.com/feed/', 'rss', ARRAY['VMware', 'virtualisation', 'vSphere', 'systèmes', 'infrastructure', 'cloud privé', 'Europe'], '{"category_mapping": {"vmware": "Cloud/Infra", "virtualisation": "Cloud/Infra", "cloud": "Cloud/Infra"}}', true),

('Red Hat Blog Europe', 'https://www.redhat.com/en/rss/blog', 'rss', ARRAY['Red Hat', 'Linux', 'OpenShift', 'systèmes', 'automation', 'Ansible', 'infrastructure'], '{"category_mapping": {"linux": "Cloud/Infra", "automation": "Outils", "ansible": "Outils"}}', true),

-- Sources télécoms et infrastructure
('Telecom Ramblings', 'https://www.telecomramblings.com/feed/', 'rss', ARRAY['télécoms', 'fibre', 'réseaux', 'infrastructure', 'Europe', 'providers', 'backbone'], '{"category_mapping": {"telecom": "Cloud/Infra", "infrastructure": "Cloud/Infra", "network": "Cloud/Infra"}}', true);

-- Mettre à jour les mots-clés des sources existantes pour inclure réseaux et systèmes
UPDATE veille_sources 
SET keywords = array_cat(keywords, ARRAY['réseaux', 'systèmes', 'infrastructure', 'serveurs'])
WHERE name IN ('Microsoft MSRC', 'BleepingComputer');

-- Ajouter des mots-clés réseaux/systèmes aux mots-clés de filtrage globaux
UPDATE veille_sources 
SET keywords = array_cat(keywords, ARRAY['Windows Server', 'Linux', 'VMware', 'Cisco', 'networking', 'virtualisation'])
WHERE name = 'NVD CVE';