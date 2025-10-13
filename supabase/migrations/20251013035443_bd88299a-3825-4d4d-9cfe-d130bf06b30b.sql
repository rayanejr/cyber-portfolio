-- Ajouter une politique RLS pour permettre la lecture publique des photos de profil actives
CREATE POLICY "admin_files_public_read_profile_photo" 
ON public.admin_files 
FOR SELECT 
USING (is_active = true AND file_category = 'profile_photo');