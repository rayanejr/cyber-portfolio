-- Créer la table veille_techno pour remplacer/compléter les blogs
CREATE TABLE public.veille_techno (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  source TEXT NOT NULL, -- NVD, CISA, CERT-FR, etc.
  category TEXT NOT NULL, -- Vulnérabilités, Exploits/PoC, Advisories, etc.
  keywords TEXT[], -- Mots-clés détectés
  severity TEXT, -- Critical, High, Medium, Low
  cve_id TEXT, -- Si c'est une CVE
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX idx_veille_techno_source ON public.veille_techno(source);
CREATE INDEX idx_veille_techno_category ON public.veille_techno(category);
CREATE INDEX idx_veille_techno_published_at ON public.veille_techno(published_at DESC);
CREATE INDEX idx_veille_techno_keywords ON public.veille_techno USING GIN(keywords);
CREATE INDEX idx_veille_techno_cve_id ON public.veille_techno(cve_id) WHERE cve_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.veille_techno ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to active veille"
ON public.veille_techno
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow authenticated admin to manage veille"
ON public.veille_techno
FOR ALL
USING (is_authenticated_admin());

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_veille_techno_updated_at
BEFORE UPDATE ON public.veille_techno
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table pour les sources de veille
CREATE TABLE public.veille_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- rss, api, web
  config JSONB, -- Configuration spécifique (endpoints, params, etc.)
  keywords TEXT[], -- Mots-clés à rechercher
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS pour les sources
ALTER TABLE public.veille_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active sources"
ON public.veille_sources
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow authenticated admin to manage sources"
ON public.veille_sources
FOR ALL
USING (is_authenticated_admin());

-- Trigger pour updated_at
CREATE TRIGGER update_veille_sources_updated_at
BEFORE UPDATE ON public.veille_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les sources prioritaires
INSERT INTO public.veille_sources (name, url, type, config, keywords) VALUES
('NVD CVE', 'https://services.nvd.nist.gov/rest/json/cves/2.0', 'api', '{"endpoint": "/cves/2.0", "params": {"resultsPerPage": 20}}', ARRAY['RCE', '0-day', 'Fortinet', 'Exchange', 'Cisco', 'VMware', 'AWS', 'Azure', 'Kubernetes', 'Active Directory', 'Ransomware', 'PoC']),
('CISA KEV', 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', 'api', '{"format": "json"}', ARRAY['RCE', '0-day', 'Fortinet', 'Exchange', 'Cisco', 'VMware', 'AWS', 'Azure', 'Kubernetes', 'Active Directory', 'Ransomware', 'PoC']),
('CERT-FR', 'https://www.cert.ssi.gouv.fr/', 'rss', '{"feed_url": "https://www.cert.ssi.gouv.fr/feed/"}', ARRAY['RCE', '0-day', 'Fortinet', 'Exchange', 'Cisco', 'VMware', 'AWS', 'Azure', 'Kubernetes', 'Active Directory', 'Ransomware', 'PoC']),
('Microsoft MSRC', 'https://msrc.microsoft.com/update-guide/rss', 'rss', '{"feed_url": "https://msrc.microsoft.com/update-guide/rss"}', ARRAY['Exchange', 'Active Directory', 'Azure', 'RCE', '0-day']),
('BleepingComputer', 'https://www.bleepingcomputer.com/feed/', 'rss', '{"feed_url": "https://www.bleepingcomputer.com/feed/"}', ARRAY['RCE', '0-day', 'Ransomware', 'PoC', 'Fortinet', 'Cisco', 'VMware']),
('Krebs Security', 'https://krebsonsecurity.com/feed/', 'rss', '{"feed_url": "https://krebsonsecurity.com/feed/"}', ARRAY['Ransomware', 'PoC', 'AWS', 'Azure']),
('Google Project Zero', 'https://googleprojectzero.blogspot.com/feeds/posts/default', 'rss', '{"feed_url": "https://googleprojectzero.blogspot.com/feeds/posts/default"}', ARRAY['0-day', 'PoC', 'RCE']);