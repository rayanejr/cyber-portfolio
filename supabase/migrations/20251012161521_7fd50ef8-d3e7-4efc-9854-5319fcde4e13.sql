-- Corriger les triggers pour utiliser les bonnes valeurs de severity

-- 1. Supprimer les anciens triggers
DROP TRIGGER IF EXISTS log_security_event_trigger ON projects;
DROP TRIGGER IF EXISTS log_security_event_trigger ON experiences;
DROP TRIGGER IF EXISTS log_security_event_trigger ON certifications;

-- 2. Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.log_security_event_trigger();

-- 3. Créer la fonction corrigée avec les bonnes valeurs de severity
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

-- 4. Recréer les triggers sur les bonnes tables
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