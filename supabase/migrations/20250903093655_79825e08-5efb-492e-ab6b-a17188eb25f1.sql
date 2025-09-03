-- Nettoyage et sécurisation complète de la base de données

-- 1. Supprimer les extensions non sécurisées du schéma public
DROP EXTENSION IF EXISTS citext CASCADE;

-- 2. Recréer l'extension citext dans le bon schéma
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

-- 3. Corriger toutes les fonctions pour qu'elles aient un search_path sécurisé
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email citext, p_full_name text, p_password text, p_is_super_admin boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
    p_is_super_admin,
    (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$function$;

-- 4. Créer un premier utilisateur admin par défaut avec mot de passe sécurisé
CREATE OR REPLACE FUNCTION public.create_first_super_admin(p_email citext, p_full_name text, p_password text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
    true,
    true
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$function$;

-- 5. Corriger toutes les autres fonctions avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_email citext, p_password text)
 RETURNS TABLE(admin_id uuid, full_name text, is_super_admin boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    a.id,
    a.full_name,
    a.is_super_admin
  FROM admin_users a
  WHERE a.email = lower(p_email)
    AND a.is_active = true
    AND a.password_hash = extensions.crypt(p_password, a.password_hash);
$function$;

CREATE OR REPLACE FUNCTION public.change_own_password(p_current_password text, p_new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND password_hash = extensions.crypt(p_current_password, password_hash)
  ) THEN
    RAISE EXCEPTION 'Mot de passe actuel incorrect';
  END IF;

  -- Mettre à jour le mot de passe
  UPDATE admin_users 
  SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12)),
      updated_at = now()
  WHERE id = current_admin_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.safe_authenticate_admin(p_email citext, p_password text, p_ip inet DEFAULT '127.0.0.1'::inet)
 RETURNS TABLE(admin_id uuid, full_name text, is_super_admin boolean, session_token text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND a.password_hash = extensions.crypt(p_password, a.password_hash);

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
$function$;

CREATE OR REPLACE FUNCTION public.create_admin_session(p_admin_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  session_token text;
BEGIN
  session_token := encode(extensions.gen_random_bytes(32), 'hex');
  
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
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip inet, p_email citext DEFAULT NULL::citext)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 6. Créer l'utilisateur admin par défaut seulement s'il n'existe pas
DO $$
DECLARE
  admin_count integer;
BEGIN
  -- Vérifier s'il y a déjà des admins
  SELECT count(*) INTO admin_count FROM admin_users;
  
  -- Créer l'admin par défaut seulement s'il n'y en a pas
  IF admin_count = 0 THEN
    PERFORM public.create_first_super_admin(
      'admin@cybersec.local',
      'Super Administrateur',
      'CyberSec2025!'
    );
  END IF;
END
$$;

-- 7. Nettoyer les données inutiles et sécuriser les politiques RLS

-- Supprimer les anciennes tentatives de connexion (garder seulement les 24 dernières heures)
DELETE FROM private.login_attempts WHERE attempt_time < now() - interval '24 hours';

-- Nettoyer les sessions expirées
DELETE FROM private.session_data WHERE expires_at IS NOT NULL AND expires_at < now();

-- 8. Renforcer les politiques RLS pour tous les tableaux

-- Contact messages : seuls les admins authentifiés peuvent lire/modifier
DROP POLICY IF EXISTS "Allow anyone to insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow authenticated users to manage contact messages" ON contact_messages;

CREATE POLICY "Allow anyone to insert contact messages" 
ON contact_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated admin to manage contact messages" 
ON contact_messages 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- Certifications : durcir la sécurité
DROP POLICY IF EXISTS "Allow authenticated users to manage certifications" ON certifications;
CREATE POLICY "Allow authenticated admin to manage certifications" 
ON certifications 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- Experiences : durcir la sécurité  
DROP POLICY IF EXISTS "Allow authenticated users to manage experiences" ON experiences;
CREATE POLICY "Allow authenticated admin to manage experiences" 
ON experiences 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- Formations : durcir la sécurité
DROP POLICY IF EXISTS "Allow authenticated users to manage formations" ON formations;
CREATE POLICY "Allow authenticated admin to manage formations" 
ON formations 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- Skills : durcir la sécurité
DROP POLICY IF EXISTS "Allow authenticated users to manage skills" ON skills;
CREATE POLICY "Allow authenticated admin to manage skills" 
ON skills 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- Tools : durcir la sécurité
DROP POLICY IF EXISTS "Allow authenticated users to manage tools" ON tools;
CREATE POLICY "Allow authenticated admin to manage tools" 
ON tools 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- 9. Ajouter une table d'audit pour tracer toutes les actions sensibles
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Sécuriser la table d'audit
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view audit logs" 
ON admin_audit_log 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
    AND is_super_admin = true 
    AND is_active = true
  )
);

-- 10. Créer un trigger d'audit pour tracer les modifications importantes
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_admin_id uuid;
BEGIN
  -- Récupérer l'admin connecté
  SELECT value::uuid INTO current_admin_id 
  FROM private.session_data 
  WHERE key = 'admin_id';

  -- Enregistrer l'action dans l'audit log
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    current_admin_id,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Ajouter les triggers d'audit sur les tables importantes
DROP TRIGGER IF EXISTS audit_admin_users ON admin_users;
CREATE TRIGGER audit_admin_users
  AFTER INSERT OR UPDATE OR DELETE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_blogs ON blogs;
CREATE TRIGGER audit_blogs
  AFTER INSERT OR UPDATE OR DELETE ON blogs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();