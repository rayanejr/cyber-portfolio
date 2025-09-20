-- Fix RLS policies and authentication issues

-- First, ensure contact_messages table allows public inserts through edge functions
DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages" 
ON contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Fix admin authentication by updating the login function to work with Supabase Auth
-- Update admin_users to link with Supabase auth users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id);

-- Create or replace the admin check function to work with Supabase Auth
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_user_id = auth.uid() 
    AND is_active = true
  );
$$;

-- Update the existing admin user to link with the actual auth user
-- We'll need to create a Supabase Auth user first
UPDATE admin_users 
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@cybersecpro.com' LIMIT 1
)
WHERE email = 'admin@cybersecpro.com' AND auth_user_id IS NULL;

-- Create a secure admin registration function for edge functions
CREATE OR REPLACE FUNCTION public.create_admin_auth_user(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  admin_record record;
BEGIN
  -- This function should only be called by authorized edge functions
  -- Get or create the admin user record
  SELECT * INTO admin_record FROM admin_users WHERE email = lower(p_email);
  
  IF admin_record.id IS NULL THEN
    INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
    VALUES (
      lower(p_email),
      p_full_name,
      extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
      true,
      true
    )
    RETURNING * INTO admin_record;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'admin_id', admin_record.id,
    'message', 'Admin user ready'
  );
END;
$$;

-- Ensure the contact form edge function can insert messages
GRANT INSERT ON contact_messages TO anon;
GRANT INSERT ON contact_messages TO authenticated;