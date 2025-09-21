-- Supprimer complètement le système admin_users avec CASCADE

-- 1. Supprimer toutes les policies storage qui dépendent des fonctions admin
DROP POLICY IF EXISTS "admin_writes_blogs" ON storage.objects;
DROP POLICY IF EXISTS "admin_writes_projects" ON storage.objects;
DROP POLICY IF EXISTS "admin_only_adminfiles" ON storage.objects;

-- 2. Supprimer les policies des tables publiques
DROP POLICY IF EXISTS "admin_all_admin_files" ON admin_files;
DROP POLICY IF EXISTS "admin_all_certifications" ON certifications;
DROP POLICY IF EXISTS "contact_admin_all" ON contact_messages;
DROP POLICY IF EXISTS "admin_all_experiences" ON experiences;
DROP POLICY IF EXISTS "admin_all_formations" ON formations;
DROP POLICY IF EXISTS "admin_all_projects" ON projects;
DROP POLICY IF EXISTS "admin_all_rate_limit_contact" ON rate_limit_contact;
DROP POLICY IF EXISTS "admin_all_security_events" ON security_events;
DROP POLICY IF EXISTS "admin_all_skills" ON skills;
DROP POLICY IF EXISTS "admin_all_tools" ON tools;
DROP POLICY IF EXISTS "admin_all_veille_sources" ON veille_sources;
DROP POLICY IF EXISTS "admin_all_veille_techno" ON veille_techno;
DROP POLICY IF EXISTS "admin_users_admin_manage" ON admin_users;

-- 3. Supprimer la table admin_users CASCADE
DROP TABLE IF EXISTS admin_users CASCADE;

-- 4. Supprimer toutes les fonctions admin avec CASCADE
DROP FUNCTION IF EXISTS public.is_admin_authenticated() CASCADE;
DROP FUNCTION IF EXISTS public.verify_admin_access() CASCADE;
DROP FUNCTION IF EXISTS public.bootstrap_admin_if_none_exists() CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_auth_user(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_admin_user(extensions.citext, text, text, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.change_own_password(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_first_super_admin(extensions.citext, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_rate_limit(inet, extensions.citext) CASCADE;
DROP FUNCTION IF EXISTS public.is_authenticated_admin() CASCADE;
DROP FUNCTION IF EXISTS public.secure_admin_login(text, text, inet) CASCADE;
DROP FUNCTION IF EXISTS public.change_admin_password(text, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_uuid(uuid) CASCADE;

-- 5. Créer une fonction simple pour vérifier les admins via auth.users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Tout utilisateur connecté via Supabase Auth est considéré comme admin
  SELECT auth.uid() IS NOT NULL;
$$;

-- 6. Recréer les policies RLS avec la nouvelle fonction simple
CREATE POLICY "admin_all_admin_files" ON admin_files FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_certifications" ON certifications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "contact_admin_all" ON contact_messages FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_experiences" ON experiences FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_formations" ON formations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_projects" ON projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_rate_limit_contact" ON rate_limit_contact FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_security_events" ON security_events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_skills" ON skills FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_tools" ON tools FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_veille_sources" ON veille_sources FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin_all_veille_techno" ON veille_techno FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Recréer les policies storage
CREATE POLICY "admin_all_storage" ON storage.objects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());