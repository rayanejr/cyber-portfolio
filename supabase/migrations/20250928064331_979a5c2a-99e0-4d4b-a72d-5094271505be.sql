-- 1. Supprimer complètement toutes les fonctions et triggers d'audit défectueux
DROP FUNCTION IF EXISTS public.audit_admin_action() CASCADE;
DROP FUNCTION IF EXISTS public.audit_admin_changes() CASCADE;

-- 2. Nettoyer les données admin_files qui causent des problèmes de contrainte
UPDATE admin_files 
SET file_type = 'pdf' 
WHERE file_type = 'application/pdf' OR file_type NOT IN ('pdf', 'image', 'document', 'video', 'audio', 'other');

-- 3. Supprimer les contraintes existantes si elles existent
ALTER TABLE admin_files DROP CONSTRAINT IF EXISTS admin_files_type_check;
ALTER TABLE admin_files DROP CONSTRAINT IF EXISTS admin_files_category_check;

-- 4. Ajouter les bonnes contraintes
ALTER TABLE admin_files 
ADD CONSTRAINT admin_files_type_check 
CHECK (file_type IN ('pdf', 'image', 'document', 'video', 'audio', 'other'));

ALTER TABLE admin_files 
ADD CONSTRAINT admin_files_category_check 
CHECK (file_category IN ('cv', 'logos', 'certificates', 'documents', 'images', 'other'));

-- 5. Créer une nouvelle fonction d'audit propre qui utilise le bon enum
CREATE OR REPLACE FUNCTION public.simple_audit_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_admin_id uuid;
BEGIN
  current_admin_id := auth.uid();

  -- Utiliser uniquement l'enum ADMIN_ACTION qui existe maintenant
  INSERT INTO security_events (
    kind, 
    action,
    table_name,
    record_id,
    actor_admin,
    details,
    severity,
    message
  ) VALUES (
    'ADMIN_ACTION'::security_event_kind,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    current_admin_id,
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now()
    ),
    'INFO',
    format('Admin %s sur table %s', TG_OP, TG_TABLE_NAME)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Créer les triggers pour toutes les tables importantes
CREATE TRIGGER audit_admin_files_trigger
  AFTER INSERT OR UPDATE OR DELETE ON admin_files
  FOR EACH ROW EXECUTE FUNCTION simple_audit_function();

CREATE TRIGGER audit_certifications_trigger
  AFTER INSERT OR UPDATE OR DELETE ON certifications
  FOR EACH ROW EXECUTE FUNCTION simple_audit_function();

CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION simple_audit_function();

CREATE TRIGGER audit_experiences_trigger
  AFTER INSERT OR UPDATE OR DELETE ON experiences
  FOR EACH ROW EXECUTE FUNCTION simple_audit_function();

CREATE TRIGGER audit_formations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON formations
  FOR EACH ROW EXECUTE FUNCTION simple_audit_function();