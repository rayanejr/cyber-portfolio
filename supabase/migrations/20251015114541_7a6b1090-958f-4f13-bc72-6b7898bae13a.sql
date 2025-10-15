-- Ajouter les politiques RLS pour permettre la lecture publique des images de projets
CREATE POLICY "projects_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'projects');

-- Permettre l'upload des images de projets pour les admins
CREATE POLICY "projects_admin_insert"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'projects' AND (SELECT is_admin()));

-- Permettre la mise à jour des images de projets pour les admins
CREATE POLICY "projects_admin_update"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'projects' AND (SELECT is_admin()));

-- Permettre la suppression des images de projets pour les admins
CREATE POLICY "projects_admin_delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'projects' AND (SELECT is_admin()));