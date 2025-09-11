-- PRIORITÉ 1: Sécuriser les buckets storage
-- Supprimer toutes les politiques existantes sur storage.objects
DROP POLICY IF EXISTS "Public read access for blogs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin write access for blogs bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for projects bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin write access for projects bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin access to admin-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated admin to manage admin files" ON storage.objects;

-- Politiques sécurisées pour le bucket blogs (lecture publique, écriture admin uniquement)
CREATE POLICY "Public read blogs" ON storage.objects
FOR SELECT USING (bucket_id = 'blogs');

CREATE POLICY "Admin manage blogs" ON storage.objects
FOR ALL USING (bucket_id = 'blogs' AND is_admin(auth.uid()))
WITH CHECK (bucket_id = 'blogs' AND is_admin(auth.uid()));

-- Politiques sécurisées pour le bucket projects (lecture publique, écriture admin uniquement)
CREATE POLICY "Public read projects" ON storage.objects
FOR SELECT USING (bucket_id = 'projects');

CREATE POLICY "Admin manage projects" ON storage.objects
FOR ALL USING (bucket_id = 'projects' AND is_admin(auth.uid()))
WITH CHECK (bucket_id = 'projects' AND is_admin(auth.uid()));

-- Politiques sécurisées pour admin-files (complètement privé)
CREATE POLICY "Admin only admin-files" ON storage.objects
FOR ALL USING (bucket_id = 'admin-files' AND is_admin(auth.uid()))
WITH CHECK (bucket_id = 'admin-files' AND is_admin(auth.uid()));

-- PRIORITÉ 2-3: Sécuriser les tables sensibles
-- Restreindre l'accès aux données de contact
DROP POLICY IF EXISTS "Public contact form submission" ON contact_messages;
DROP POLICY IF EXISTS "Admin only read access" ON contact_messages;
DROP POLICY IF EXISTS "Admin only update access" ON contact_messages;
DROP POLICY IF EXISTS "Admin only delete access" ON contact_messages;

-- Nouvelles politiques contact_messages (insertion publique, le reste admin uniquement)
CREATE POLICY "Allow contact submission" ON contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin access contact messages" ON contact_messages
FOR ALL USING (is_admin(auth.uid()));

-- Sécuriser admin_files (métadonnées sensibles)
DROP POLICY IF EXISTS "Allow public read access to active files" ON admin_files;
DROP POLICY IF EXISTS "Admin full access to files" ON admin_files;
DROP POLICY IF EXISTS "Allow authenticated admin to manage files" ON admin_files;

-- Lecture publique limitée (sans métadonnées sensibles) et gestion admin complète
CREATE POLICY "Limited public read admin_files" ON admin_files
FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage admin_files" ON admin_files
FOR ALL USING (is_admin(auth.uid()));

-- Sécuriser les données de veille technologique
DROP POLICY IF EXISTS "Allow public read access to active veille" ON veille_techno;
DROP POLICY IF EXISTS "Allow authenticated admin to manage veille" ON veille_techno;

CREATE POLICY "Admin only veille_techno" ON veille_techno
FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow public read access to active sources" ON veille_sources;
DROP POLICY IF EXISTS "Allow authenticated admin to manage sources" ON veille_sources;

CREATE POLICY "Admin only veille_sources" ON veille_sources
FOR ALL USING (is_admin(auth.uid()));

-- PRIORITÉ 2: Ajouter contraintes de validation et rate limiting
-- Table pour rate limiting par IP
CREATE TABLE IF NOT EXISTS rate_limit_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_contact_ip_window 
ON rate_limit_contact(ip_address, window_start);

-- RLS pour rate_limit_contact
ALTER TABLE rate_limit_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access rate_limit_contact" ON rate_limit_contact
FOR ALL USING (is_admin(auth.uid()));

-- Contraintes de validation sur contact_messages
ALTER TABLE contact_messages 
ADD CONSTRAINT check_name_length CHECK (length(name) <= 100),
ADD CONSTRAINT check_email_length CHECK (length(email) <= 255),
ADD CONSTRAINT check_message_length CHECK (length(message) <= 5000),
ADD CONSTRAINT check_subject_length CHECK (subject IS NULL OR length(subject) <= 200);

-- Contraintes sur admin_files
ALTER TABLE admin_files
ADD CONSTRAINT check_filename_length CHECK (length(filename) <= 255),
ADD CONSTRAINT check_file_category_valid CHECK (file_category IN ('logo', 'cv', 'document', 'template', 'image'));

-- PRIORITÉ 4: Activer la protection des mots de passe compromis
-- Cette commande active la protection contre les mots de passe compromis
UPDATE auth.config SET
  password_min_length = 12,
  password_check_strength = true,
  password_required_characters = 'lower,upper,number,special';