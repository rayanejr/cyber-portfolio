-- Let's completely lock down contact_messages to ensure no public access

-- First, revoke all default permissions
REVOKE ALL ON contact_messages FROM anon;
REVOKE ALL ON contact_messages FROM authenticated;
REVOKE ALL ON contact_messages FROM public;

-- Grant only specific permissions we need
GRANT INSERT ON contact_messages TO anon;
GRANT INSERT ON contact_messages TO authenticated;
GRANT SELECT, UPDATE, DELETE ON contact_messages TO authenticated;

-- Verify current policies and their effectiveness
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY cmd;