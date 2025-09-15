-- Créer une politique RLS pour permettre l'accès public aux CVs dans admin_files
CREATE POLICY "public_read_cv_files" 
ON admin_files 
FOR SELECT 
USING (file_category = 'cv' AND is_active = true);