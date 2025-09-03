-- Créer un admin simple avec des identifiants faciles
DO $$
BEGIN
  -- Supprimer tous les admins existants pour repartir à zéro
  DELETE FROM admin_users;
  
  -- Créer un admin simple
  INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
  VALUES (
    'admin@test.com',
    'Administrateur',
    extensions.crypt('admin123', extensions.gen_salt('bf', 12)),
    true,
    true
  );
  
  RAISE NOTICE 'Admin créé: admin@test.com / admin123';
END
$$;