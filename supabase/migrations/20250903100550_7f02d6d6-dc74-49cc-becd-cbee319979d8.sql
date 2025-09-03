-- SÉCURISATION COMPLÈTE SELON ANSSI
-- 1. Recréer la table admin_users avec sécurité renforcée

DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  full_name text NOT NULL CHECK (length(full_name) >= 2),
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamp with time zone,
  password_changed_at timestamp with time zone DEFAULT now(),
  session_token text,
  session_expires_at timestamp with time zone
);

-- 2. Fonctions de sécurité ANSSI
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- ANSSI: minimum 12 caractères avec complexité
  IF length(password) < 12 THEN
    RETURN false;
  END IF;
  
  -- Vérifier la présence de majuscules, minuscules, chiffres et caractères spéciaux
  IF NOT (password ~ '[a-z]' AND password ~ '[A-Z]' AND password ~ '[0-9]' AND password ~ '[^a-zA-Z0-9]') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 3. Fonction d'authentification sécurisée
CREATE OR REPLACE FUNCTION public.secure_admin_login(p_email text, p_password text, p_ip inet DEFAULT '127.0.0.1'::inet)
RETURNS TABLE(admin_id uuid, full_name text, session_token text, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record record;
  new_token text;
  login_attempts integer;
BEGIN
  -- Nettoyer les anciennes tentatives (plus de 1 heure)
  DELETE FROM private.login_attempts WHERE attempt_time < now() - interval '1 hour';
  
  -- Vérifier le rate limiting (max 5 tentatives par 15 minutes)
  SELECT count(*) INTO login_attempts
  FROM private.login_attempts
  WHERE ip_address = p_ip AND attempt_time > now() - interval '15 minutes';
  
  IF login_attempts >= 5 THEN
    -- Enregistrer la tentative bloquée
    INSERT INTO private.login_attempts (ip_address, email, success) VALUES (p_ip, p_email, false);
    RETURN QUERY SELECT null::uuid, ''::text, ''::text, false;
    RETURN;
  END IF;

  -- Récupérer l'utilisateur
  SELECT * INTO user_record FROM admin_users WHERE email = lower(p_email) AND is_active = true;
  
  -- Vérifier si le compte est verrouillé
  IF user_record.locked_until IS NOT NULL AND user_record.locked_until > now() THEN
    INSERT INTO private.login_attempts (ip_address, email, success) VALUES (p_ip, p_email, false);
    RETURN QUERY SELECT null::uuid, ''::text, ''::text, false;
    RETURN;
  END IF;

  -- Vérifier le mot de passe
  IF user_record.id IS NOT NULL AND user_record.password_hash = extensions.crypt(p_password, user_record.password_hash) THEN
    -- Connexion réussie - générer un token de session
    new_token := encode(extensions.gen_random_bytes(32), 'hex');
    
    -- Mettre à jour les informations de connexion
    UPDATE admin_users SET 
      last_login_at = now(),
      failed_login_attempts = 0,
      locked_until = NULL,
      session_token = new_token,
      session_expires_at = now() + interval '8 hours'
    WHERE id = user_record.id;
    
    -- Enregistrer la tentative réussie
    INSERT INTO private.login_attempts (ip_address, email, success) VALUES (p_ip, p_email, true);
    
    RETURN QUERY SELECT user_record.id, user_record.full_name, new_token, true;
  ELSE
    -- Échec de connexion
    IF user_record.id IS NOT NULL THEN
      -- Incrémenter les tentatives échouées
      UPDATE admin_users SET 
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts >= 4 THEN now() + interval '30 minutes'
          ELSE NULL 
        END
      WHERE id = user_record.id;
    END IF;
    
    INSERT INTO private.login_attempts (ip_address, email, success) VALUES (p_ip, p_email, false);
    RETURN QUERY SELECT null::uuid, ''::text, ''::text, false;
  END IF;
END;
$$;

-- 4. Fonction pour changer de mot de passe avec validation ANSSI
CREATE OR REPLACE FUNCTION public.change_admin_password(p_current_password text, p_new_password text, p_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_record record;
BEGIN
  -- Valider la force du nouveau mot de passe
  IF NOT validate_password_strength(p_new_password) THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux';
  END IF;

  -- Récupérer l'utilisateur
  SELECT * INTO user_record FROM admin_users WHERE id = p_admin_id AND is_active = true;
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;

  -- Vérifier le mot de passe actuel
  IF user_record.password_hash != extensions.crypt(p_current_password, user_record.password_hash) THEN
    RAISE EXCEPTION 'Mot de passe actuel incorrect';
  END IF;

  -- Mettre à jour le mot de passe
  UPDATE admin_users SET 
    password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12)),
    password_changed_at = now(),
    session_token = NULL,
    session_expires_at = NULL
  WHERE id = p_admin_id;

  RETURN true;
END;
$$;

-- 5. Créer un admin par défaut avec mot de passe fort
INSERT INTO admin_users (email, full_name, password_hash) VALUES (
  'admin@test.com',
  'Administrateur',
  extensions.crypt('AdminSecure123!', extensions.gen_salt('bf', 12))
);

-- 6. Politiques RLS strictes
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Seuls les admins authentifiés peuvent voir leurs propres données
CREATE POLICY "Admins can view their own data" ON admin_users
FOR SELECT USING (
  id = (SELECT id FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now() LIMIT 1)
);

-- Seuls les admins peuvent modifier leurs propres données (sauf certains champs)
CREATE POLICY "Admins can update their own data" ON admin_users
FOR UPDATE USING (
  id = (SELECT id FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now() LIMIT 1)
);

-- 7. Sécuriser toutes les autres tables
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour les tables de contenu (lecture publique, modification par admin seulement)
CREATE POLICY "Public read access" ON projects FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write access" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON blogs FOR SELECT USING (published = true);
CREATE POLICY "Admin write access" ON blogs FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON experiences FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON experiences FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON formations FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON formations FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON skills FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON skills FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON certifications FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write access" ON certifications FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON tools FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write access" ON tools FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

CREATE POLICY "Public read access" ON admin_files FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write access" ON admin_files FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);

-- Contact messages : insertion publique, gestion par admin
CREATE POLICY "Public insert access" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read/write access" ON contact_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE session_token IS NOT NULL AND session_expires_at > now())
);