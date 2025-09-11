-- Fix security issues by tightening RLS policies

-- 1. Fix contact_messages to only allow admin access for reading
DROP POLICY IF EXISTS "contact select authed" ON public.contact_messages;
CREATE POLICY "Admin can read contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (is_authenticated_admin());

-- 2. Remove overly permissive policies on admin_files that allow all operations
DROP POLICY IF EXISTS "Allow all operations" ON public.admin_files;
DROP POLICY IF EXISTS "Public read access" ON public.admin_files;

-- Keep only the secure admin access policy
DROP POLICY IF EXISTS "Admin write access" ON public.admin_files;
CREATE POLICY "Admin full access to files" 
ON public.admin_files 
FOR ALL 
USING (is_authenticated_admin());

-- 3. Remove overly permissive policies on other tables
-- Fix blogs table
DROP POLICY IF EXISTS "Allow all operations" ON public.blogs;
DROP POLICY IF EXISTS "Admin write access" ON public.blogs;
CREATE POLICY "Admin full access to blogs" 
ON public.blogs 
FOR ALL 
USING (is_authenticated_admin());

-- Fix certifications table  
DROP POLICY IF EXISTS "Allow all operations" ON public.certifications;
DROP POLICY IF EXISTS "Admin write access" ON public.certifications;
CREATE POLICY "Admin full access to certifications" 
ON public.certifications 
FOR ALL 
USING (is_authenticated_admin());

-- Fix experiences table
DROP POLICY IF EXISTS "Allow all operations" ON public.experiences;
DROP POLICY IF EXISTS "Admin write access" ON public.experiences;
CREATE POLICY "Admin full access to experiences" 
ON public.experiences 
FOR ALL 
USING (is_authenticated_admin());

-- Fix formations table
DROP POLICY IF EXISTS "Allow all operations" ON public.formations;
DROP POLICY IF EXISTS "Admin write access" ON public.formations;
CREATE POLICY "Admin full access to formations" 
ON public.formations 
FOR ALL 
USING (is_authenticated_admin());

-- Fix projects table
DROP POLICY IF EXISTS "Allow all operations" ON public.projects;
DROP POLICY IF EXISTS "Admin write access" ON public.projects;
CREATE POLICY "Admin full access to projects" 
ON public.projects 
FOR ALL 
USING (is_authenticated_admin());

-- Fix skills table
DROP POLICY IF EXISTS "Allow all operations" ON public.skills;
DROP POLICY IF EXISTS "Admin write access" ON public.skills;
CREATE POLICY "Admin full access to skills" 
ON public.skills 
FOR ALL 
USING (is_authenticated_admin());

-- Fix tools table
DROP POLICY IF EXISTS "Allow all operations" ON public.tools;
DROP POLICY IF EXISTS "Admin write access" ON public.tools;
CREATE POLICY "Admin full access to tools" 
ON public.tools 
FOR ALL 
USING (is_authenticated_admin());