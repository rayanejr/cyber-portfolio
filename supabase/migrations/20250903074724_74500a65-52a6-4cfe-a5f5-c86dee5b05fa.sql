-- Sécurisation complète de la base de données et système d'admin

-- 1. Créer une table pour les comptes administrateurs sécurisée
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  is_super_admin boolean DEFAULT false,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.admin_users(id)
);

-- 2. Activer RLS sur la table admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Créer des fonctions sécurisées pour la gestion des admins
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email citext,
  p_full_name text,
  p_password text,
  p_is_super_admin boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_admin_id uuid;
BEGIN
  -- Vérifier que l'utilisateur actuel est un super admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
    AND is_super_admin = true 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Seuls les super administrateurs peuvent créer des comptes admin';
  END IF;

  -- Créer le nouvel admin
  INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, created_by)
  VALUES (
    lower(p_email),
    p_full_name,
    crypt(p_password, gen_salt('bf', 12)),
    p_is_super_admin,
    (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$$;

-- 4. Fonction pour l'authentification admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  p_email citext,
  p_password text
) RETURNS TABLE(admin_id uuid, full_name text, is_super_admin boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT 
    a.id,
    a.full_name,
    a.is_super_admin
  FROM admin_users a
  WHERE a.email = lower(p_email)
    AND a.is_active = true
    AND a.password_hash = crypt(p_password, a.password_hash);
$$;

-- 5. Fonction pour changer son propre mot de passe
CREATE OR REPLACE FUNCTION public.change_own_password(
  p_current_password text,
  p_new_password text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  current_admin_id uuid;
BEGIN
  -- Récupérer l'ID de l'admin connecté depuis la session
  SELECT value::uuid INTO current_admin_id 
  FROM private.session_data 
  WHERE key = 'admin_id';

  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Vérifier le mot de passe actuel
  IF NOT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = current_admin_id 
    AND password_hash = crypt(p_current_password, password_hash)
  ) THEN
    RAISE EXCEPTION 'Mot de passe actuel incorrect';
  END IF;

  -- Mettre à jour le mot de passe
  UPDATE admin_users 
  SET password_hash = crypt(p_new_password, gen_salt('bf', 12)),
      updated_at = now()
  WHERE id = current_admin_id;

  RETURN true;
END;
$$;

-- 6. Table privée pour les sessions admin (plus sécurisée)
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.session_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- 7. Fonctions pour gérer les sessions
CREATE OR REPLACE FUNCTION public.create_admin_session(
  p_admin_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_token text;
BEGIN
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Nettoyer les anciennes sessions
  DELETE FROM private.session_data WHERE expires_at < now();
  
  -- Créer la nouvelle session
  INSERT INTO private.session_data (key, value, expires_at)
  VALUES ('admin_session_' || session_token, p_admin_id::text, now() + interval '24 hours');
  
  -- Stocker l'ID admin dans la session courante
  INSERT INTO private.session_data (key, value)
  VALUES ('admin_id', p_admin_id::text)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, created_at = now();
  
  RETURN session_token;
END;
$$;

-- 8. Politiques RLS strictes pour admin_users
CREATE POLICY "Super admins can view all admins" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users current_admin
      WHERE current_admin.id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
      AND current_admin.is_super_admin = true 
      AND current_admin.is_active = true
    )
  );

CREATE POLICY "Admins can view their own profile" ON public.admin_users
  FOR SELECT USING (
    id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
  );

CREATE POLICY "Only super admins can insert admins" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users current_admin
      WHERE current_admin.id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
      AND current_admin.is_super_admin = true 
      AND current_admin.is_active = true
    )
  );

CREATE POLICY "Super admins can update other admins" ON public.admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users current_admin
      WHERE current_admin.id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
      AND current_admin.is_super_admin = true 
      AND current_admin.is_active = true
    )
  );

CREATE POLICY "Admins can update their own profile (limited)" ON public.admin_users
  FOR UPDATE USING (
    id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
  ) WITH CHECK (
    -- Empêcher la modification des champs sensibles
    is_super_admin = (SELECT is_super_admin FROM admin_users WHERE id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id'))
    AND is_active = (SELECT is_active FROM admin_users WHERE id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id'))
  );

CREATE POLICY "Only super admins can delete admins" ON public.admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users current_admin
      WHERE current_admin.id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
      AND current_admin.is_super_admin = true 
      AND current_admin.is_active = true
    )
    AND id != (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id') -- Empêcher l'auto-suppression
  );

-- 9. Triggers pour la sécurité et l'audit
CREATE OR REPLACE FUNCTION public.audit_admin_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log des changements sensibles
  IF TG_OP = 'UPDATE' AND (OLD.is_active != NEW.is_active OR OLD.is_super_admin != NEW.is_super_admin) THEN
    INSERT INTO private.session_data (key, value)
    VALUES (
      'audit_' || gen_random_uuid(),
      json_build_object(
        'action', TG_OP,
        'table', TG_TABLE_NAME,
        'user_id', NEW.id,
        'changed_by', (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id'),
        'timestamp', now(),
        'changes', json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      )::text
    );
  END IF;
  
  -- Mettre à jour updated_at
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_admin_changes_trigger
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();

-- 10. Renforcer la sécurité des autres tables avec une vérification admin
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
    AND a.is_active = true
  );
$$;

-- 11. Mettre à jour les politiques existantes pour être plus restrictives
DROP POLICY IF EXISTS "Allow admin to manage projects" ON public.projects;
CREATE POLICY "Allow authenticated admin to manage projects" ON public.projects
  FOR ALL USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Allow admin to manage blogs" ON public.blogs;
CREATE POLICY "Allow authenticated admin to manage blogs" ON public.blogs
  FOR ALL USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Allow admin to manage files" ON public.admin_files;
CREATE POLICY "Allow authenticated admin to manage files" ON public.admin_files
  FOR ALL USING (public.is_authenticated_admin());

-- 12. Sécuriser les buckets de stockage
-- Mettre à jour les politiques de stockage pour être plus restrictives
CREATE POLICY "Authenticated admins can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'projects' 
    AND public.is_authenticated_admin()
  );

CREATE POLICY "Authenticated admins can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blogs' 
    AND public.is_authenticated_admin()
  );

CREATE POLICY "Authenticated admins can upload admin files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'admin-files' 
    AND public.is_authenticated_admin()
  );

-- 13. Créer le premier super admin (à faire manuellement)
-- Cette fonction doit être appelée une seule fois pour créer le premier admin
CREATE OR REPLACE FUNCTION public.create_first_super_admin(
  p_email citext,
  p_full_name text,
  p_password text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  admin_count integer;
  new_admin_id uuid;
BEGIN
  -- Vérifier qu'aucun admin n'existe encore
  SELECT count(*) INTO admin_count FROM admin_users;
  
  IF admin_count > 0 THEN
    RAISE EXCEPTION 'Des administrateurs existent déjà. Utilisez create_admin_user() à la place.';
  END IF;

  -- Créer le premier super admin
  INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
  VALUES (
    lower(p_email),
    p_full_name,
    crypt(p_password, gen_salt('bf', 12)),
    true,
    true
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$$;

-- 14. Protection contre les attaques par déni de service et injection
-- Limiter les tentatives de connexion
CREATE TABLE IF NOT EXISTS private.login_attempts (
  ip_address inet NOT NULL,
  email citext,
  attempt_time timestamptz DEFAULT now(),
  success boolean DEFAULT false
);

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip inet, p_email citext DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_attempts integer;
BEGIN
  -- Nettoyer les anciennes tentatives (plus de 1 heure)
  DELETE FROM private.login_attempts 
  WHERE attempt_time < now() - interval '1 hour';
  
  -- Compter les tentatives récentes (dernières 15 minutes)
  SELECT count(*) INTO recent_attempts
  FROM private.login_attempts
  WHERE ip_address = p_ip
    AND attempt_time > now() - interval '15 minutes'
    AND (p_email IS NULL OR email = p_email);
  
  -- Limiter à 5 tentatives par IP/email par 15 minutes
  RETURN recent_attempts < 5;
END;
$$;

-- 15. Fonction d'authentification avec rate limiting
CREATE OR REPLACE FUNCTION public.safe_authenticate_admin(
  p_email citext,
  p_password text,
  p_ip inet DEFAULT '127.0.0.1'::inet
) RETURNS TABLE(admin_id uuid, full_name text, is_super_admin boolean, session_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  auth_result record;
  session_token text;
BEGIN
  -- Vérifier le rate limiting
  IF NOT public.check_rate_limit(p_ip, p_email) THEN
    -- Enregistrer la tentative échouée
    INSERT INTO private.login_attempts (ip_address, email, success)
    VALUES (p_ip, p_email, false);
    
    RAISE EXCEPTION 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
  END IF;

  -- Tenter l'authentification
  SELECT a.id, a.full_name, a.is_super_admin
  INTO auth_result
  FROM admin_users a
  WHERE a.email = lower(p_email)
    AND a.is_active = true
    AND a.password_hash = crypt(p_password, a.password_hash);

  -- Enregistrer la tentative
  INSERT INTO private.login_attempts (ip_address, email, success)
  VALUES (p_ip, p_email, auth_result.id IS NOT NULL);

  IF auth_result.id IS NULL THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;

  -- Mettre à jour la dernière connexion
  UPDATE admin_users 
  SET last_login_at = now()
  WHERE id = auth_result.id;

  -- Créer une session
  session_token := public.create_admin_session(auth_result.id);

  RETURN QUERY SELECT auth_result.id, auth_result.full_name, auth_result.is_super_admin, session_token;
END;
$$;

-- 16. Index pour les performances et la sécurité
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_session_data_key ON private.session_data(key);
CREATE INDEX IF NOT EXISTS idx_session_data_expires ON private.session_data(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON private.login_attempts(ip_address, attempt_time);

-- 17. Fonction de nettoyage des sessions expirées (à appeler régulièrement)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH deleted AS (
    DELETE FROM private.session_data 
    WHERE expires_at < now()
    RETURNING 1
  )
  SELECT count(*) FROM deleted;
$$;