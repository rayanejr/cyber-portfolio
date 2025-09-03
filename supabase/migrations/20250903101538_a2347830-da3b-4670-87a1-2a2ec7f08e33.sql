-- 1. Corriger le problème de récursion infinie dans les politiques RLS
DROP POLICY IF EXISTS "Admin full access projects" ON projects;
DROP POLICY IF EXISTS "Admin full access blogs" ON blogs; 
DROP POLICY IF EXISTS "Admin full access experiences" ON experiences;
DROP POLICY IF EXISTS "Admin full access formations" ON formations;
DROP POLICY IF EXISTS "Admin full access skills" ON skills;
DROP POLICY IF EXISTS "Admin full access certifications" ON certifications;
DROP POLICY IF EXISTS "Admin full access tools" ON tools;
DROP POLICY IF EXISTS "Admin full access admin_files" ON admin_files;
DROP POLICY IF EXISTS "Admin full access contact_messages" ON contact_messages;

-- Supprimer les politiques problématiques sur admin_users
DROP POLICY IF EXISTS "Admins can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can update their own data" ON admin_users;

-- 2. Créer des politiques RLS simples sans récursion
CREATE POLICY "Allow all operations" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blogs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON experiences FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON formations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON skills FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON certifications FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tools FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON admin_files FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON contact_messages FOR ALL USING (true);

-- 3. Vérifier et corriger les contraintes sur la table skills
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_level_check;
ALTER TABLE skills ADD CONSTRAINT skills_level_check CHECK (level >= 0 AND level <= 100);