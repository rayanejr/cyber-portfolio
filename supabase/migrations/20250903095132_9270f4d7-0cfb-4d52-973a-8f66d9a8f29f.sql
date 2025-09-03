-- Corriger la fonction d'authentification pour qu'elle fonctionne avec le type text
CREATE OR REPLACE FUNCTION public.safe_authenticate_admin(p_email text, p_password text, p_ip inet DEFAULT '127.0.0.1'::inet)
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
  IF NOT public.check_rate_limit(p_ip, p_email::text) THEN
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

-- Corriger aussi la fonction check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip inet, p_email text DEFAULT NULL::text)
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

-- Vérifier et recréer l'admin si nécessaire
DO $$
DECLARE
  admin_count integer;
BEGIN
  -- Vérifier s'il y a des admins
  SELECT count(*) INTO admin_count FROM admin_users WHERE email = 'admin@test.com';
  
  -- Si pas d'admin avec cet email, le créer
  IF admin_count = 0 THEN
    INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
    VALUES (
      'admin@test.com',
      'Administrateur',
      extensions.crypt('admin123', extensions.gen_salt('bf', 12)),
      true,
      true
    );
    RAISE NOTICE 'Admin créé: admin@test.com / admin123';
  ELSE
    -- Mettre à jour le mot de passe pour être sûr
    UPDATE admin_users 
    SET password_hash = extensions.crypt('admin123', extensions.gen_salt('bf', 12))
    WHERE email = 'admin@test.com';
    RAISE NOTICE 'Mot de passe admin mis à jour';
  END IF;
END
$$;