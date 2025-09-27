-- Supprimer tous les triggers d'audit existants avec CASCADE
DROP FUNCTION IF EXISTS public.audit_trigger() CASCADE;

-- Créer une nouvelle fonction d'audit qui utilise security_events
CREATE OR REPLACE FUNCTION public.audit_admin_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_admin_id uuid;
BEGIN
  -- Récupérer l'admin connecté (on utilise auth.uid() car les admins sont authentifiés)
  current_admin_id := auth.uid();

  -- Enregistrer l'action dans security_events
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
    'ADMIN_ACTION',
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    current_admin_id,
    jsonb_build_object(
      'old_values', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    ),
    'INFO',
    format('Admin %s operation on %s table', TG_OP, TG_TABLE_NAME)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer les nouveaux triggers d'audit pour toutes les tables sensibles
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

CREATE TRIGGER audit_skills
  AFTER INSERT OR UPDATE OR DELETE ON skills
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_tools
  AFTER INSERT OR UPDATE OR DELETE ON tools
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_veille_sources
  AFTER INSERT OR UPDATE OR DELETE ON veille_sources
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();

CREATE TRIGGER audit_veille_techno
  AFTER INSERT OR UPDATE OR DELETE ON veille_techno
  FOR EACH ROW EXECUTE FUNCTION audit_admin_action();