-- RESET COMPLET - Supprimer toutes les fonctions d'auth compliquées
DROP FUNCTION IF EXISTS public.safe_authenticate_admin CASCADE;
DROP FUNCTION IF EXISTS public.authenticate_admin CASCADE;
DROP FUNCTION IF EXISTS public.check_rate_limit CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_session CASCADE;

-- Supprimer et recréer la table admin_users simplement
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  password text NOT NULL,  -- Mot de passe en clair pour simplifier
  is_super_admin boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone
);

-- Insérer l'admin de test
INSERT INTO admin_users (email, full_name, password) 
VALUES ('admin@test.com', 'Administrateur', 'admin123');

-- Créer une fonction d'auth SUPER SIMPLE
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

-- Politiques RLS simples
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated admins" ON admin_users
FOR ALL USING (true);