-- Supprimer toutes les versions de la fonction safe_authenticate_admin
DROP FUNCTION IF EXISTS public.safe_authenticate_admin(extensions.citext, text, inet);
DROP FUNCTION IF EXISTS public.safe_authenticate_admin(citext, text, inet);
DROP FUNCTION IF EXISTS public.safe_authenticate_admin(text, text, inet);

-- Recréer UNE SEULE fonction qui fonctionne avec text
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
  -- Tenter l'authentification directement
  SELECT a.id, a.full_name, a.is_super_admin
  INTO auth_result
  FROM admin_users a
  WHERE a.email = lower(p_email)
    AND a.is_active = true
    AND a.password_hash = extensions.crypt(p_password, a.password_hash);

  IF auth_result.id IS NULL THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;

  -- Mettre à jour la dernière connexion
  UPDATE admin_users 
  SET last_login_at = now()
  WHERE id = auth_result.id;

  -- Créer une session simple
  session_token := encode(extensions.gen_random_bytes(32), 'hex');

  RETURN QUERY SELECT auth_result.id, auth_result.full_name, auth_result.is_super_admin, session_token;
END;
$function$;

-- S'assurer que l'admin existe avec le bon mot de passe
DELETE FROM admin_users WHERE email = 'admin@test.com';

INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
VALUES (
  'admin@test.com',
  'Administrateur',
  extensions.crypt('admin123', extensions.gen_salt('bf', 12)),
  true,
  true
);