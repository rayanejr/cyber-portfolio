-- Test and fix contact_messages security by ensuring no public access

-- First, let's check the current state of the table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE tablename = 'contact_messages') as policy_count
FROM pg_tables 
WHERE tablename = 'contact_messages';

-- Ensure RLS is enabled (should already be)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow contact form submissions" ON contact_messages;
DROP POLICY IF EXISTS "Admin can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can delete contact messages" ON contact_messages;

-- Create secure policies

-- 1. Only authenticated admin users can read contact messages
CREATE POLICY "Admin only read access"
ON contact_messages
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 2. Anyone can submit contact forms (but not read them)
CREATE POLICY "Public contact form submission"
ON contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. Only admin users can update contact messages (mark as read, etc.)
CREATE POLICY "Admin only update access"
ON contact_messages
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 4. Only admin users can delete contact messages
CREATE POLICY "Admin only delete access"
ON contact_messages
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Verify the policies were created
SELECT policyname, cmd, roles::text, qual, with_check
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY cmd, policyname;