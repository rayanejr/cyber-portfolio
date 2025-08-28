-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  technologies TEXT[],
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_files table for CV and other uploads
CREATE TABLE public.admin_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_category TEXT NOT NULL, -- 'cv', 'avatar', 'project', 'blog'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Allow public read access to active projects" 
ON public.projects 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin to manage projects" 
ON public.projects 
FOR ALL 
USING (true);

-- RLS Policies for blogs
CREATE POLICY "Allow public read access to published blogs" 
ON public.blogs 
FOR SELECT 
USING (published = true);

CREATE POLICY "Allow admin to manage blogs" 
ON public.blogs 
FOR ALL 
USING (true);

-- RLS Policies for admin_files
CREATE POLICY "Allow public read access to active files" 
ON public.admin_files 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin to manage files" 
ON public.admin_files 
FOR ALL 
USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('projects', 'projects', true),
  ('blogs', 'blogs', true),
  ('admin-files', 'admin-files', true)
ON CONFLICT DO NOTHING;

-- Storage policies for projects bucket
CREATE POLICY "Anyone can view project images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'projects');

CREATE POLICY "Admin can upload project images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Admin can update project images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'projects');

CREATE POLICY "Admin can delete project images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'projects');

-- Storage policies for blogs bucket
CREATE POLICY "Anyone can view blog images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'blogs');

CREATE POLICY "Admin can upload blog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'blogs');

CREATE POLICY "Admin can update blog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'blogs');

CREATE POLICY "Admin can delete blog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'blogs');

-- Storage policies for admin-files bucket
CREATE POLICY "Anyone can view admin files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admin-files');

CREATE POLICY "Admin can upload admin files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'admin-files');

CREATE POLICY "Admin can update admin files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'admin-files');

CREATE POLICY "Admin can delete admin files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'admin-files');

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_files_updated_at
BEFORE UPDATE ON public.admin_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();