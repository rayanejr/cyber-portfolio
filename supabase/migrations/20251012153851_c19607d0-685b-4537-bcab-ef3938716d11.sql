-- Corriger les triggers qui utilisent des valeurs invalides pour security_event_kind
-- L'enum accepte: ADMIN_ACTION, AUTH_ATTEMPT, CRITICAL_ALERT, DATA_ACCESS, RATE_LIMIT_HIT

-- Supprimer tous les triggers dépendants d'abord
DROP TRIGGER IF EXISTS security_log_projects ON projects;
DROP TRIGGER IF EXISTS security_log_certifications ON certifications;
DROP TRIGGER IF EXISTS security_log_experiences ON experiences;
DROP TRIGGER IF EXISTS log_security_event_trigger ON projects;
DROP TRIGGER IF EXISTS log_security_event_trigger ON experiences;
DROP TRIGGER IF EXISTS log_security_event_trigger ON certifications;

-- Supprimer la fonction avec CASCADE
DROP FUNCTION IF EXISTS public.log_security_event_trigger() CASCADE;

-- Créer une nouvelle fonction avec les bonnes valeurs d'enum
CREATE OR REPLACE FUNCTION public.log_security_event_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
    'DATA_ACCESS'::security_event_kind,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'user', current_user
    ),
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'MEDIUM'
      WHEN TG_OP = 'UPDATE' THEN 'INFO'
      ELSE 'INFO'
    END,
    format('Opération %s sur %s', TG_OP, TG_TABLE_NAME),
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recréer les triggers sur les tables nécessaires
CREATE TRIGGER log_security_event_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event_trigger();

CREATE TRIGGER log_security_event_trigger
  AFTER INSERT OR UPDATE OR DELETE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event_trigger();

CREATE TRIGGER log_security_event_trigger
  AFTER INSERT OR UPDATE OR DELETE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event_trigger();