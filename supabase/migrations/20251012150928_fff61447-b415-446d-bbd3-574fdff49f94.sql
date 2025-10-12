-- Renforcement de la sécurité RLS pour toutes les tables

-- Admin Audit Log : Accès limité aux admins uniquement
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_audit_log' AND policyname = 'admin_read_audit_log'
  ) THEN
    CREATE POLICY admin_read_audit_log ON admin_audit_log FOR SELECT USING (is_admin());
  END IF;
END $$;

-- Contact Messages : Sécurisation renforcée
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' AND policyname = 'contact_insert_rate_limited'
  ) THEN
    CREATE POLICY contact_insert_rate_limited ON contact_messages 
    FOR INSERT 
    WITH CHECK (
      NOT EXISTS (
        SELECT 1 FROM contact_messages 
        WHERE created_at > now() - interval '1 hour' 
        LIMIT 5
      )
    );
  END IF;
END $$;

-- Security Events : Table pour monitoring sécurité
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'security_events' AND policyname = 'security_events_admin_all'
  ) THEN
    CREATE POLICY security_events_admin_all ON security_events 
    FOR ALL 
    USING (is_admin()) 
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Rate Limit : Protection contre abus
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rate_limit_contact' AND policyname = 'rate_limit_admin_only'
  ) THEN
    CREATE POLICY rate_limit_admin_only ON rate_limit_contact 
    FOR ALL 
    USING (is_admin()) 
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Fonction pour logger les événements de sécurité
CREATE OR REPLACE FUNCTION log_security_event_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_events (
    kind,
    action,
    table_name,
    record_id,
    details,
    severity,
    message
  ) VALUES (
    'DATA_MODIFICATION',
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
    format('Opération %s sur %s', TG_OP, TG_TABLE_NAME)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Appliquer le trigger de logging sur tables sensibles
DROP TRIGGER IF EXISTS security_log_projects ON projects;
CREATE TRIGGER security_log_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event_trigger();

DROP TRIGGER IF EXISTS security_log_certifications ON certifications;
CREATE TRIGGER security_log_certifications
  AFTER INSERT OR UPDATE OR DELETE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event_trigger();

DROP TRIGGER IF EXISTS security_log_experiences ON experiences;
CREATE TRIGGER security_log_experiences
  AFTER INSERT OR UPDATE OR DELETE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event_trigger();

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_kind ON security_events(kind);
CREATE INDEX IF NOT EXISTS idx_rate_limit_contact_window ON rate_limit_contact(window_start);

-- Nettoyage automatique des anciennes données de sécurité
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Supprimer les événements de plus de 90 jours
  DELETE FROM security_events 
  WHERE created_at < now() - interval '90 days' 
  AND kind != 'CRITICAL_ALERT';
  
  -- Supprimer les entrées de rate limit expirées
  DELETE FROM rate_limit_contact 
  WHERE window_start < now() - interval '24 hours';
END;
$$;