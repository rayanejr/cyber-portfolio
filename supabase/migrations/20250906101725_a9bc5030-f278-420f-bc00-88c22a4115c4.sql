-- Fix veille techno data and clean unused tables (without storage policies)
-- 1. Clean up unused/duplicate tables
DROP TABLE IF EXISTS rate_limit_tracking CASCADE;
DROP TABLE IF EXISTS modification_history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- 2. Update buckets configuration
UPDATE storage.buckets SET public = true WHERE id IN ('projects', 'blogs');
UPDATE storage.buckets SET public = false WHERE id = 'admin-files';

-- 3. Fix admin_files table constraints
-- First update any invalid categories
UPDATE admin_files SET file_category = 'cv' WHERE file_category NOT IN ('cv', 'icons', 'documents', 'certificates');

-- Add proper constraints
ALTER TABLE admin_files 
DROP CONSTRAINT IF EXISTS admin_files_category_check;

ALTER TABLE admin_files 
ADD CONSTRAINT admin_files_category_check 
CHECK (file_category IN ('cv', 'icons', 'documents', 'certificates'));

-- 4. Add is_super_admin column to admin_users if not exists
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 5. Remove public INSERT policy from contact_messages if it exists
DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;

-- 6. Fix veille_techno data issues
-- Ensure all veille_techno entries have proper dates
UPDATE veille_techno 
SET published_at = imported_at 
WHERE published_at IS NULL;

-- Clean up inactive veille older than 30 days
DELETE FROM veille_techno 
WHERE is_active = false 
AND imported_at < NOW() - INTERVAL '30 days';

-- 7. Optimize veille_sources for better performance
UPDATE veille_sources 
SET is_active = true 
WHERE is_active IS NULL;

-- Add index for better veille performance
CREATE INDEX IF NOT EXISTS idx_veille_techno_active_published 
ON veille_techno(is_active, published_at DESC) 
WHERE is_active = true;

-- 8. Clean up security logs older than 6 months
DELETE FROM security_logs 
WHERE created_at < NOW() - INTERVAL '6 months';

-- 9. Update admin_files to use proper file paths for signed URLs
UPDATE admin_files 
SET file_url = REPLACE(file_url, 'https://pcpjqxuuuawwqxrecexm.supabase.co/storage/v1/object/public/admin-files/', '')
WHERE file_url LIKE 'https://pcpjqxuuuawwqxrecexm.supabase.co/storage/v1/object/public/admin-files/%';

-- 10. Fix certifications table for PDF/image uploads
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS credential_url TEXT;