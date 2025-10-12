-- Supprimer les triggers défectueux
DROP TRIGGER IF EXISTS security_log_projects ON projects;
DROP TRIGGER IF EXISTS security_log_certifications ON certifications;
DROP TRIGGER IF EXISTS security_log_experiences ON experiences;
DROP TRIGGER IF EXISTS log_security_event_trigger ON projects;
DROP TRIGGER IF EXISTS log_security_event_trigger ON experiences;
DROP TRIGGER IF EXISTS log_security_event_trigger ON certifications;
DROP FUNCTION IF EXISTS log_security_event() CASCADE;

-- Créer une fonction correcte utilisant l'enum valide
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_admin_id uuid;
BEGIN
  current_admin_id := auth.uid();
  
  INSERT INTO security_events (
    kind,
    action,
    table_name,
    record_id,
    details,
    severity,
    message,
    actor_admin
  ) VALUES (
    'ADMIN_ACTION'::security_event_kind,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'user', current_user
    ),
    'info',
    format('Admin action: %s on %s', TG_OP, TG_TABLE_NAME),
    current_admin_id
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recréer les triggers avec la fonction corrigée
CREATE TRIGGER log_security_event_trigger
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW
EXECUTE FUNCTION log_security_event();

CREATE TRIGGER log_security_event_trigger
AFTER INSERT OR UPDATE OR DELETE ON experiences
FOR EACH ROW
EXECUTE FUNCTION log_security_event();

CREATE TRIGGER log_security_event_trigger
AFTER INSERT OR UPDATE OR DELETE ON certifications
FOR EACH ROW
EXECUTE FUNCTION log_security_event();