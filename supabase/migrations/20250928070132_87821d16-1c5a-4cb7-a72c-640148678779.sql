-- Corriger toutes les contraintes de vérification problématiques

-- 1. Supprimer les contraintes défectueuses
ALTER TABLE admin_files DROP CONSTRAINT IF EXISTS admin_files_category_check;
ALTER TABLE admin_files DROP CONSTRAINT IF EXISTS admin_files_type_check;
ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_severity_check;

-- 2. Recréer les contraintes avec les bonnes valeurs
ALTER TABLE admin_files ADD CONSTRAINT admin_files_category_check 
CHECK (file_category IN ('cv', 'logos', 'images', 'documents', 'certifications'));

ALTER TABLE admin_files ADD CONSTRAINT admin_files_type_check 
CHECK (file_type IN ('pdf', 'image', 'document', 'png', 'jpg', 'jpeg', 'gif', 'webp'));

ALTER TABLE security_events ADD CONSTRAINT security_events_severity_check 
CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'INFO'));

-- 3. Corriger la fonction d'audit pour utiliser la bonne sévérité
CREATE OR REPLACE FUNCTION public.simple_audit_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_admin_id uuid;
BEGIN
  current_admin_id := auth.uid();

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
    'INFO',  -- Utiliser INFO au lieu de LOG
    format('Admin %s sur table %s', TG_OP, TG_TABLE_NAME)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;