-- Create formations table
CREATE TABLE public.formations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  level TEXT, -- "Bac+3", "Master", "Certification", etc.
  skills TEXT[], -- Array of skills acquired
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiences table
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  location TEXT,
  technologies TEXT[], -- Array of technologies used
  achievements TEXT[], -- Array of key achievements
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- "password", "risk", "phishing", "leak", etc.
  is_active BOOLEAN DEFAULT true,
  config JSONB, -- Configuration parameters for the tool
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  image_url TEXT,
  pdf_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- "offensive", "defensive", "tools", "programming", etc.
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5), -- 1-5 skill level
  description TEXT,
  icon TEXT, -- Icon name or class
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (portfolio data)
CREATE POLICY "Allow public read access to formations" ON public.formations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Allow public read access to active tools" ON public.tools FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to certifications" ON public.certifications FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to skills" ON public.skills FOR SELECT USING (true);

-- Create policies for contact messages (anyone can insert)
CREATE POLICY "Allow anyone to insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON public.formations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for formations
INSERT INTO public.formations (title, institution, description, start_date, end_date, level, skills) VALUES
('Master en Cybersécurité', 'École Supérieure d''Informatique', 'Formation approfondie en sécurité des systèmes d''information, cryptographie et ethical hacking.', '2020-09-01', '2022-06-30', 'Master', ARRAY['Cryptographie', 'Penetration Testing', 'Forensics', 'Risk Management']),
('Licence Informatique', 'Université de Technologie', 'Formation en développement logiciel et systèmes informatiques.', '2017-09-01', '2020-06-30', 'Licence', ARRAY['Programmation', 'Réseaux', 'Bases de données', 'Systèmes']),
('Certification CISSP', 'ISC2', 'Certification professionnelle en sécurité des systèmes d''information.', '2022-03-15', '2025-03-15', 'Certification', ARRAY['Security Architecture', 'Risk Management', 'Compliance']);

-- Insert sample data for experiences
INSERT INTO public.experiences (title, company, description, start_date, end_date, is_current, location, technologies, achievements) VALUES
('Expert en Cybersécurité', 'CyberDefense Corp', 'Responsable de la sécurité des infrastructures critiques et de la réponse aux incidents.', '2022-07-01', NULL, true, 'Paris, France', ARRAY['SIEM', 'Splunk', 'Nessus', 'Metasploit', 'Python'], ARRAY['Réduction de 60% des incidents de sécurité', 'Mise en place d''un SOC 24/7', 'Formation de 15 analystes cybersécurité']),
('Analyste Sécurité', 'SecureIT Solutions', 'Analyse des vulnérabilités et tests d''intrusion pour des clients entreprises.', '2020-09-01', '2022-06-30', false, 'Lyon, France', ARRAY['Burp Suite', 'OWASP ZAP', 'Kali Linux', 'Wireshark'], ARRAY['Plus de 50 audits de sécurité réalisés', 'Découverte de vulnérabilités critiques', 'Certification ISO 27001 obtenue']),
('Stagiaire Cybersécurité', 'TechGuard', 'Stage de fin d''études en analyse de malwares et forensics.', '2020-02-01', '2020-08-31', false, 'Toulouse, France', ARRAY['IDA Pro', 'Volatility', 'YARA', 'Autopsy'], ARRAY['Analyse de 100+ échantillons de malwares', 'Développement d''outils d''analyse automatisée']);

-- Insert sample data for tools
INSERT INTO public.tools (name, description, category, config) VALUES
('Générateur de Mots de Passe', 'Outil pour générer des mots de passe sécurisés avec options personnalisables.', 'password', '{"minLength": 12, "maxLength": 64, "includeSpecialChars": true, "includeNumbers": true}'),
('Calculateur de Risques', 'Évalue le niveau de risque cybersécurité basé sur différents facteurs.', 'risk', '{"factors": ["network", "users", "data", "compliance"], "weights": [0.3, 0.2, 0.3, 0.2]}'),
('Simulateur de Phishing', 'Outil éducatif pour sensibiliser aux attaques de phishing.', 'phishing', '{"templates": ["banking", "social", "work"], "difficulty": ["easy", "medium", "hard"]}'),
('Vérificateur de Fuites', 'Vérifie si vos données ont été compromises dans des fuites connues.', 'leak', '{"databases": ["haveibeenpwned"], "checkEmail": true, "checkPhone": false}'),
('Analyseur d''En-têtes', 'Analyse les en-têtes de sécurité HTTP d''un site web.', 'security', '{"headers": ["CSP", "HSTS", "X-Frame-Options", "X-XSS-Protection"], "scoring": true}'),
('Testeur SSL/TLS', 'Vérifie la configuration SSL/TLS d''un serveur.', 'ssl', '{"protocols": ["TLS1.2", "TLS1.3"], "ciphers": true, "certificates": true}');

-- Insert sample data for certifications
INSERT INTO public.certifications (name, issuer, issue_date, expiry_date, credential_id) VALUES
('Certified Ethical Hacker (CEH)', 'EC-Council', '2022-05-15', '2025-05-15', 'ECC-CEH-2022-001234'),
('CISSP', 'ISC2', '2022-03-10', '2025-03-10', 'ISC2-CISSP-2022-567890'),
('OSCP', 'Offensive Security', '2021-11-20', NULL, 'OS-OSCP-2021-112233'),
('CompTIA Security+', 'CompTIA', '2020-08-30', '2023-08-30', 'COMP-SEC-2020-445566'),
('AWS Security Specialty', 'Amazon Web Services', '2023-01-15', '2026-01-15', 'AWS-SEC-2023-778899');

-- Insert sample data for skills
INSERT INTO public.skills (name, category, level, description, icon, is_featured) VALUES
('Penetration Testing', 'offensive', 5, 'Tests d''intrusion et évaluation de la sécurité', 'shield-check', true),
('Incident Response', 'defensive', 4, 'Réponse aux incidents de sécurité', 'alert-triangle', true),
('Malware Analysis', 'offensive', 4, 'Analyse de logiciels malveillants', 'bug', false),
('Network Security', 'defensive', 5, 'Sécurisation des réseaux informatiques', 'network', true),
('Python', 'programming', 5, 'Développement d''outils de sécurité', 'code', false),
('Metasploit', 'tools', 4, 'Framework de test d''intrusion', 'terminal', false),
('Wireshark', 'tools', 5, 'Analyse de trafic réseau', 'activity', false),
('SIEM', 'tools', 4, 'Gestion des événements de sécurité', 'database', true),
('Cryptography', 'defensive', 3, 'Chiffrement et sécurité des données', 'lock', false),
('Risk Assessment', 'defensive', 4, 'Évaluation des risques cybersécurité', 'shield', true);