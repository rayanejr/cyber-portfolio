-- Enable leaked password protection and cleanup
-- Note: The leaked password protection needs to be enabled in Supabase Auth settings manually

-- Clean up unused blogs storage bucket if it exists
DELETE FROM storage.objects WHERE bucket_id = 'blogs';
DELETE FROM storage.buckets WHERE id = 'blogs';

-- Ensure rate_limit_contact table is properly configured for atomic operations
-- Add unique constraint if not exists to prevent race conditions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rate_limit_contact_ip_window_unique'
    ) THEN
        ALTER TABLE rate_limit_contact 
        ADD CONSTRAINT rate_limit_contact_ip_window_unique 
        UNIQUE (ip_address, window_start);
    END IF;
END $$;

-- Create a secure function for CV access that can be called by edge functions
CREATE OR REPLACE FUNCTION public.get_active_cv_for_download()
RETURNS TABLE (
  id uuid,
  filename text,
  file_url text,
  file_type text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT af.id, af.filename, af.file_url, af.file_type
  FROM admin_files af
  WHERE af.file_category = 'cv'
    AND af.is_active = true
  ORDER BY af.created_at DESC
  LIMIT 1;
END;
$$;

-- Create RLS policy for the new function (allow service role access)
GRANT EXECUTE ON FUNCTION public.get_active_cv_for_download() TO service_role;