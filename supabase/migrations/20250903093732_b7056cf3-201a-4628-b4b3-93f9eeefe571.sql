-- Correction: Recréer la colonne email avec le type citext correct

-- 1. Ajouter la colonne email avec le bon type citext depuis extensions
ALTER TABLE admin_users ADD COLUMN email_new extensions.citext;

-- 2. Copier les données de l'ancienne colonne vers la nouvelle
UPDATE admin_users SET email_new = email::text::extensions.citext;

-- 3. Supprimer l'ancienne colonne et renommer la nouvelle
ALTER TABLE admin_users DROP COLUMN email;
ALTER TABLE admin_users RENAME COLUMN email_new TO email;

-- 4. Ajouter les contraintes sur la nouvelle colonne
ALTER TABLE admin_users ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);

-- 5. Maintenant corriger toutes les fonctions pour qu'elles utilisent le bon schéma
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email extensions.citext, p_full_name text, p_password text, p_is_super_admin boolean DEFAULT false)
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
    lower(p_email::text)::extensions.citext,
    p_full_name,
    extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
    p_is_super_admin,
    (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id')
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_first_super_admin(p_email extensions.citext, p_full_name text, p_password text)
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
    lower(p_email::text)::extensions.citext,
    p_full_name,
    extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
    true,
    true
  )
  RETURNING id INTO new_admin_id;

  RETURN new_admin_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.authenticate_admin(p_email extensions.citext, p_password text)
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
  WHERE a.email = lower(p_email::text)::extensions.citext
    AND a.is_active = true
    AND a.password_hash = extensions.crypt(p_password, a.password_hash);
$function$;

CREATE OR REPLACE FUNCTION public.safe_authenticate_admin(p_email extensions.citext, p_password text, p_ip inet DEFAULT '127.0.0.1'::inet)
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
    VALUES (p_ip, p_email::text::extensions.citext, false);
    
    RAISE EXCEPTION 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
  END IF;

  -- Tenter l'authentification
  SELECT a.id, a.full_name, a.is_super_admin
  INTO auth_result
  FROM admin_users a
  WHERE a.email = lower(p_email::text)::extensions.citext
    AND a.is_active = true
    AND a.password_hash = extensions.crypt(p_password, a.password_hash);

  -- Enregistrer la tentative
  INSERT INTO private.login_attempts (ip_address, email, success)
  VALUES (p_ip, p_email::text::extensions.citext, auth_result.id IS NOT NULL);

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

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip inet, p_email extensions.citext DEFAULT NULL::extensions.citext)
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
      'admin@cybersec.local'::extensions.citext,
      'Super Administrateur',
      'CyberSec2025!'
    );
  END IF;
END
$$;