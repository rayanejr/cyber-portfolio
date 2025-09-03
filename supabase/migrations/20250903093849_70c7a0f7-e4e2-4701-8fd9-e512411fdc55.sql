-- Créer l'extension citext dans le bon schéma et corriger la colonne email
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

-- Corriger le type de la colonne email en utilisant text pour éviter les problèmes
ALTER TABLE admin_users ALTER COLUMN email TYPE text;

-- Créer l'utilisateur admin par défaut seulement s'il n'existe pas
DO $$
DECLARE
  admin_count integer;
  new_admin_id uuid;
BEGIN
  -- Vérifier s'il y a déjà des admins
  SELECT count(*) INTO admin_count FROM admin_users;
  
  -- Créer l'admin par défaut seulement s'il n'y en a pas
  IF admin_count = 0 THEN
    INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
    VALUES (
      'admin@cybersec.local',
      'Super Administrateur',
      extensions.crypt('CyberSec2025!', extensions.gen_salt('bf', 12)),
      true,
      true
    )
    RETURNING id INTO new_admin_id;
    
    RAISE NOTICE 'Admin créé avec l''ID: %', new_admin_id;
  END IF;
END
$$;

-- Nettoyer et sécuriser les politiques RLS

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

-- Renforcer la sécurité sur toutes les tables
DROP POLICY IF EXISTS "Allow authenticated users to manage certifications" ON certifications;
CREATE POLICY "Allow authenticated admin to manage certifications" 
ON certifications 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Allow authenticated users to manage experiences" ON experiences;
CREATE POLICY "Allow authenticated admin to manage experiences" 
ON experiences 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Allow authenticated users to manage formations" ON formations;
CREATE POLICY "Allow authenticated admin to manage formations" 
ON formations 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Allow authenticated users to manage skills" ON skills;
CREATE POLICY "Allow authenticated admin to manage skills" 
ON skills 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

DROP POLICY IF EXISTS "Allow authenticated users to manage tools" ON tools;
CREATE POLICY "Allow authenticated admin to manage tools" 
ON tools 
FOR ALL 
TO authenticated
USING (public.is_authenticated_admin());

-- Ajouter une table d'audit pour tracer toutes les actions sensibles
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

-- Créer un trigger d'audit pour tracer les modifications importantes
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

-- Nettoyer les données anciennes
DELETE FROM private.login_attempts WHERE attempt_time < now() - interval '24 hours';
DELETE FROM private.session_data WHERE expires_at IS NOT NULL AND expires_at < now();