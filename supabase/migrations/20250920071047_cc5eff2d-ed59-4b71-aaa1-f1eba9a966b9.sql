-- Fix pgcrypto extension access
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Update admin password using the extensions schema
UPDATE admin_users 
SET password_hash = extensions.crypt('AdminCyberSec2024!@#', extensions.gen_salt('bf', 12))
WHERE email = 'admin@cybersecpro.com';

-- Test if the password works
DO $$
DECLARE
  test_result boolean;
BEGIN
  SELECT (password_hash = extensions.crypt('AdminCyberSec2024!@#', password_hash)) INTO test_result
  FROM admin_users 
  WHERE email = 'admin@cybersecpro.com';
  
  IF test_result THEN
    RAISE NOTICE 'Admin password correctly updated';
  ELSE
    RAISE NOTICE 'Admin password update failed';
  END IF;
END $$;