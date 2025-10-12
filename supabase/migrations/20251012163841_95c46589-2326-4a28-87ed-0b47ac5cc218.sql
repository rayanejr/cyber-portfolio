-- Correction finale des politiques RLS pour sécuriser les données sensibles

-- 1. VEILLE_SOURCES: Ajouter politique explicite de restriction publique
DROP POLICY IF EXISTS "veille_sources_no_public_read" ON veille_sources;
CREATE POLICY "veille_sources_no_public_read"
ON veille_sources
FOR SELECT
TO anon
USING (false);

-- 2. ADMIN_AUDIT_LOG: Ajouter politique explicite de restriction publique
DROP POLICY IF EXISTS "admin_audit_log_no_public_read" ON admin_audit_log;
CREATE POLICY "admin_audit_log_no_public_read"
ON admin_audit_log
FOR SELECT
TO anon
USING (false);

-- 3. SECURITY_EVENTS: Ajouter politique explicite de restriction publique
DROP POLICY IF EXISTS "security_events_no_public_read" ON security_events;
CREATE POLICY "security_events_no_public_read"
ON security_events
FOR SELECT
TO anon
USING (false);