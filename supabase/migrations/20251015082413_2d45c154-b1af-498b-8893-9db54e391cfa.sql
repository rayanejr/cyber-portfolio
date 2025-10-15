-- Ajouter une politique RLS pour permettre la lecture publique des logos actifs
CREATE POLICY "admin_files_public_read_logos"
ON public.admin_files
FOR SELECT
USING (is_active = true AND file_category = 'logos');