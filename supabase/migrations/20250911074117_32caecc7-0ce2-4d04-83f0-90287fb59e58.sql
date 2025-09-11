-- Fix all security issues with proper RLS policies

-- 1. Ensure contact_messages table is fully locked down
DROP POLICY IF EXISTS "admin_all_contact_messages" ON public.contact_messages;
CREATE POLICY "admin_only_contact_messages" 
ON public.contact_messages 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 2. Ensure admin_users table is fully secured
DROP POLICY IF EXISTS "admin_all_admin_users" ON public.admin_users;
CREATE POLICY "admin_only_admin_users" 
ON public.admin_users 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 3. Ensure admin_sessions table is admin-only
DROP POLICY IF EXISTS "admin_all_admin_sessions" ON public.admin_sessions;
CREATE POLICY "admin_only_admin_sessions" 
ON public.admin_sessions 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. Secure security_logs table
DROP POLICY IF EXISTS "admin_all_security_logs" ON public.security_logs;
CREATE POLICY "admin_only_security_logs" 
ON public.security_logs 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. Secure admin_audit_log table  
DROP POLICY IF EXISTS "admin_all_admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "admin_only_admin_audit_log" 
ON public.admin_audit_log 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 6. Secure analytics_events table
DROP POLICY IF EXISTS "admin_all_analytics_events" ON public.analytics_events;
CREATE POLICY "admin_only_analytics_events" 
ON public.analytics_events 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 7. Secure anomaly_detections table
DROP POLICY IF EXISTS "admin_all_anomaly_detections" ON public.anomaly_detections;
CREATE POLICY "admin_only_anomaly_detections" 
ON public.anomaly_detections 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8. Secure rate_limit_contact table
DROP POLICY IF EXISTS "admin_all_rate_limit_contact" ON public.rate_limit_contact;
CREATE POLICY "admin_only_rate_limit_contact" 
ON public.rate_limit_contact 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 9. Secure admin_files table
DROP POLICY IF EXISTS "admin_all_admin_files" ON public.admin_files;
CREATE POLICY "admin_only_admin_files" 
ON public.admin_files 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 10. Ensure veille_sources is admin-only (missing from current policies)
DROP POLICY IF EXISTS "admin_all_veille_sources" ON public.veille_sources;
CREATE POLICY "admin_only_veille_sources" 
ON public.veille_sources 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 11. Move extensions from public schema to extensions schema (if any exist)
-- Note: This will be handled separately as it requires specific extension management

-- 12. Add additional security function to validate admin access
CREATE OR REPLACE FUNCTION public.strict_admin_check()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = auth.uid() 
    AND is_active = true 
    AND is_super_admin = true
  );
$$;

-- 13. Create emergency admin access revocation function
CREATE OR REPLACE FUNCTION public.revoke_admin_access(target_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can revoke access
  IF NOT public.strict_admin_check() THEN
    RAISE EXCEPTION 'Unauthorized: Only super admins can revoke access';
  END IF;
  
  -- Deactivate the admin
  UPDATE admin_users 
  SET is_active = false, 
      session_token = NULL,
      session_expires_at = NULL
  WHERE id = target_admin_id;
  
  -- Deactivate all sessions
  UPDATE admin_sessions 
  SET is_active = false 
  WHERE admin_id = target_admin_id;
  
  -- Log the action
  PERFORM log_security_event(
    'ADMIN_ACCESS_REVOKED',
    'HIGH',
    'ADMIN_SECURITY',
    auth.uid(),
    NULL,
    NULL,
    jsonb_build_object('revoked_admin_id', target_admin_id)
  );
  
  RETURN true;
END;
$$;