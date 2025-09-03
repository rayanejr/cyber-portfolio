-- Supprimer toutes les fonctions avec leurs signatures spécifiques
DROP FUNCTION IF EXISTS public.check_rate_limit(inet, text);
DROP FUNCTION IF EXISTS public.check_rate_limit(inet, extensions.citext);
DROP FUNCTION IF EXISTS public.check_rate_limit(inet);

-- Maintenant le reste
DROP FUNCTION IF EXISTS public.safe_authenticate_admin CASCADE;
DROP FUNCTION IF EXISTS public.authenticate_admin CASCADE; 
DROP FUNCTION IF EXISTS public.create_admin_session CASCADE;

-- Recréer la table admin_users proprement
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  password text NOT NULL,
  is_super_admin boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone
);

-- Insérer l'admin
INSERT INTO admin_users (email, full_name, password) 
VALUES ('admin@test.com', 'Administrateur', 'admin123');

-- Fonction simple qui marche
CREATE OR REPLACE FUNCTION public.simple_admin_login(p_email text, p_password text)
RETURNS TABLE(admin_id uuid, full_name text, is_super_admin boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, full_name, is_super_admin
  FROM admin_users 
  WHERE email = p_email 
    AND password = p_password 
    AND is_active = true;
$$;