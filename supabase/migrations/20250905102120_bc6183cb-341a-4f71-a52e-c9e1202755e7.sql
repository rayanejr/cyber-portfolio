-- Fix contact_messages RLS policy to use proper Supabase Auth
-- The current SELECT policy uses is_authenticated_admin() which relies on custom session system
-- We need to switch to is_admin(auth.uid()) which uses Supabase Auth

-- Drop the old policy that uses the outdated authentication system
DROP POLICY IF EXISTS "Admin can read contact messages" ON contact_messages;

-- Create new policy using proper Supabase Auth
CREATE POLICY "Admin can read contact messages"
ON contact_messages
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Ensure INSERT policy is correct for public contact form submissions
-- (This should already exist but let's make sure it's explicit)
DROP POLICY IF EXISTS "Allow contact form submissions" ON contact_messages;
CREATE POLICY "Allow contact form submissions"
ON contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure UPDATE and DELETE are admin-only (these should already be correct)
DROP POLICY IF EXISTS "contact update anon" ON contact_messages;
DROP POLICY IF EXISTS "contact update authed" ON contact_messages;
CREATE POLICY "Admin can update contact messages"
ON contact_messages
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "contact delete anon" ON contact_messages;
DROP POLICY IF EXISTS "contact delete authed" ON contact_messages;
CREATE POLICY "Admin can delete contact messages"
ON contact_messages
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));