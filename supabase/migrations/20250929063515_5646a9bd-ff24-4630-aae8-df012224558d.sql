-- Rendre le bucket admin-files public pour les logos
UPDATE storage.buckets 
SET public = true 
WHERE id = 'admin-files';

-- Créer des policies pour permettre l'accès aux fichiers de logos
CREATE POLICY "Public access to logo files" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-files' AND (storage.foldername(name))[1] = 'logos');

CREATE POLICY "Public access to certification files" ON storage.objects  
FOR SELECT USING (bucket_id = 'admin-files' AND (storage.foldername(name))[1] = 'certifications');

CREATE POLICY "Allow admins to upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'admin-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow admins to update files" ON storage.objects
FOR UPDATE USING (bucket_id = 'admin-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow admins to delete files" ON storage.objects
FOR DELETE USING (bucket_id = 'admin-files' AND auth.uid() IS NOT NULL);