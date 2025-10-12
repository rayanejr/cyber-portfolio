-- CORRECTION FINALE : Sécurité RLS + Contraintes fichiers

-- 1. Corriger la contrainte de catégorie pour admin_files
ALTER TABLE admin_files DROP CONSTRAINT IF EXISTS admin_files_category_check;
ALTER TABLE admin_files ADD CONSTRAINT admin_files_category_check 
  CHECK (file_category IN ('cv', 'profile_photo', 'logos', 'certificates', 'documents', 'images', 'other'));

-- 2. SÉCURITÉ: Restreindre l'accès à contact_messages (emails/noms des visiteurs)
DROP POLICY IF EXISTS "contact_public_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_insert_rate_limited" ON contact_messages;
DROP POLICY IF EXISTS "contact_admin_all" ON contact_messages;

-- Seuls les admins peuvent lire les messages
CREATE POLICY "contact_admin_read"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (is_admin());

-- Le public peut uniquement insérer (avec validation)
CREATE POLICY "contact_public_insert_validated"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(COALESCE(name, '')) >= 1 AND length(COALESCE(name, '')) <= 100
    AND length(COALESCE(email, '')) >= 3 AND length(COALESCE(email, '')) <= 255
    AND length(COALESCE(message, '')) >= 1 AND length(COALESCE(message, '')) <= 5000
  );

-- Les admins ont tous les droits
CREATE POLICY "contact_admin_all"
  ON contact_messages FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. SÉCURITÉ: Restreindre l'accès à rate_limit_contact (IPs RGPD)
DROP POLICY IF EXISTS "rate_limit_admin_only" ON rate_limit_contact;
DROP POLICY IF EXISTS "admin_all_rate_limit_contact" ON rate_limit_contact;

CREATE POLICY "rate_limit_admin_only"
  ON rate_limit_contact FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 4. SÉCURITÉ: Renforcer admin_audit_log
DROP POLICY IF EXISTS "admin_all_audit_log" ON admin_audit_log;
DROP POLICY IF EXISTS "admin_read_audit_log" ON admin_audit_log;

CREATE POLICY "admin_only_audit_log"
  ON admin_audit_log FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5. SÉCURITÉ: Renforcer security_events
DROP POLICY IF EXISTS "security_events_admin_all" ON security_events;
DROP POLICY IF EXISTS "admin_all_security_events" ON security_events;

CREATE POLICY "security_events_admin_only"
  ON security_events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());