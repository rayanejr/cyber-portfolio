-- Fix RLS policies to allow admin operations
-- Allow all operations for authenticated users (admin) on all tables

-- Formations policies
DROP POLICY IF EXISTS "Allow public read access to formations" ON public.formations;
CREATE POLICY "Allow public read access to formations" 
ON public.formations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage formations" 
ON public.formations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Experiences policies  
DROP POLICY IF EXISTS "Allow public read access to experiences" ON public.experiences;
CREATE POLICY "Allow public read access to experiences" 
ON public.experiences 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage experiences" 
ON public.experiences 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Skills policies
DROP POLICY IF EXISTS "Allow public read access to skills" ON public.skills;
CREATE POLICY "Allow public read access to skills" 
ON public.skills 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage skills" 
ON public.skills 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Certifications policies
DROP POLICY IF EXISTS "Allow public read access to certifications" ON public.certifications;
CREATE POLICY "Allow public read access to certifications" 
ON public.certifications 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage certifications" 
ON public.certifications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Tools policies
DROP POLICY IF EXISTS "Allow public read access to active tools" ON public.tools;
CREATE POLICY "Allow public read access to active tools" 
ON public.tools 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage tools" 
ON public.tools 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Contact messages policies
DROP POLICY IF EXISTS "Allow anyone to insert contact messages" ON public.contact_messages;
CREATE POLICY "Allow anyone to insert contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage contact messages" 
ON public.contact_messages 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);