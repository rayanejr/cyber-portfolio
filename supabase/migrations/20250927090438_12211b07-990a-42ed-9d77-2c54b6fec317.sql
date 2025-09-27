-- Corriger l'enum security_event_kind pour inclure ADMIN_ACTION
ALTER TYPE security_event_kind ADD VALUE IF NOT EXISTS 'ADMIN_ACTION';

-- Supprimer la fonction d'audit défectueuse
DROP FUNCTION IF EXISTS public.audit_admin_action() CASCADE;

-- Créer une nouvelle fonction d'audit sans enum problématique
CREATE OR REPLACE FUNCTION public.audit_admin_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_admin_id uuid;
BEGIN
  -- Récupérer l'admin connecté
  current_admin_id := auth.uid();

  -- Enregistrer l'action dans security_events avec le bon format
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
    'LOGIN'::security_event_kind,  -- Utiliser une valeur existante de l'enum
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    current_admin_id,
    jsonb_build_object(
      'admin_action', TG_OP,
      'table', TG_TABLE_NAME,
      'old_values', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    ),
    'INFO',
    format('Admin %s operation on %s table', TG_OP, TG_TABLE_NAME)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recréer les triggers d'audit
CREATE TRIGGER audit_admin_files
  AFTER INSERT OR UPDATE OR DELETE ON admin_files
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_certifications
  AFTER INSERT OR UPDATE OR DELETE ON certifications
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_experiences
  AFTER INSERT OR UPDATE OR DELETE ON experiences
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_formations
  AFTER INSERT OR UPDATE OR DELETE ON formations
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();