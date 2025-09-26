-- Fix admin_files table constraints and create missing audit table
-- Remove conflicting check constraints
ALTER TABLE public.admin_files DROP CONSTRAINT IF EXISTS admin_files_category_check;
ALTER TABLE public.admin_files DROP CONSTRAINT IF EXISTS check_file_category_valid;

-- Add unified constraint allowing all needed categories
ALTER TABLE public.admin_files ADD CONSTRAINT admin_files_category_check 
CHECK (file_category = ANY (ARRAY['cv', 'document', 'image', 'certificate', 'logo', 'certifications', 'template', 'pdf']));

-- Create admin_audit_log table for compatibility
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL, 
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "admin_all_audit_log" ON public.admin_audit_log
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Update triggers to use security_events instead of old tables
CREATE OR REPLACE FUNCTION public.audit_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Log to security_events table
  INSERT INTO public.security_events (
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
    (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id' LIMIT 1),
    jsonb_build_object(
      'old_values', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    ),
    'INFO',
    format('Admin %s operation on %s table', TG_OP, TG_TABLE_NAME)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;