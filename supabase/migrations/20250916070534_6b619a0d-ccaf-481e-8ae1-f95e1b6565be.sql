-- Créer un utilisateur admin par défaut pour permettre la première connexion
INSERT INTO admin_users (id, email, full_name, password_hash, is_super_admin, is_active)
VALUES (
  gen_random_uuid(),
  'admin@cybersecpro.com',
  'Super Administrateur',
  crypt('AdminCyberSec2024!@#', gen_salt('bf', 12)),
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Créer une fonction pour bootstrap un admin si aucun n'existe
CREATE OR REPLACE FUNCTION public.bootstrap_admin_if_none_exists()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
  new_admin_id uuid;
BEGIN
  -- Compter les admins existants
  SELECT count(*) INTO admin_count FROM admin_users WHERE is_active = true;
  
  -- Si aucun admin actif, créer le premier
  IF admin_count = 0 THEN
    INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
    VALUES (
      'admin@cybersecpro.com',
      'Super Administrateur',
      crypt('AdminCyberSec2024!@#', gen_salt('bf', 12)),
      true,
      true
    )
    RETURNING id INTO new_admin_id;
    
    RETURN 'Admin créé: admin@cybersecpro.com / AdminCyberSec2024!@#';
  ELSE
    RETURN 'Des admins existent déjà';
  END IF;
END;
$$;