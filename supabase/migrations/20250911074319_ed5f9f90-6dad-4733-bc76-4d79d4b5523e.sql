-- Fix security policies with proper admin-only access

-- Add strict admin validation function
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
  );
$$;

-- Create emergency admin access revocation function
CREATE OR REPLACE FUNCTION public.revoke_admin_access(target_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only active admins can revoke access
  IF NOT public.strict_admin_check() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can revoke access';
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
  
  RETURN true;
END;
$$;