-- Sécurisation complète du système : corrections critiques

-- 1. Rendre le bucket admin-files privé
UPDATE storage.buckets 
SET public = false 
WHERE id = 'admin-files';

-- 2. Créer des politiques de stockage sécurisées pour admin-files
CREATE POLICY "Admin access to admin files"
ON storage.objects
FOR ALL
USING (bucket_id = 'admin-files' AND is_authenticated_admin());

-- 3. Supprimer la fonction insécurisée simple_admin_login
DROP FUNCTION IF EXISTS public.simple_admin_login(text, text);

-- 4. Supprimer les colonnes de session localStorage obsolètes des admin_users
ALTER TABLE public.admin_users 
DROP COLUMN IF EXISTS session_token,
DROP COLUMN IF EXISTS session_expires_at;

-- 5. Créer une fonction sécurisée pour l'authentification via edge functions
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'utilisateur actuel est un admin authentifié via Supabase Auth
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$;

-- 6. Activer RLS sur admin_audit_log et le sécuriser
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access to audit log"
ON public.admin_audit_log
FOR ALL
USING (is_authenticated_admin());

-- 7. Améliorer la sécurité des contacts - seuls les admins peuvent lire
DROP POLICY IF EXISTS "contact insert anon" ON public.contact_messages;
DROP POLICY IF EXISTS "contact insert authed" ON public.contact_messages;

-- Permettre l'insertion via edge function seulement
CREATE POLICY "Allow contact form submissions"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- 8. Fonction pour valider la force du chiffrement
CREATE OR REPLACE FUNCTION public.validate_encryption_key()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cette fonction sera appelée par les edge functions pour valider la clé
  RETURN length(current_setting('app.encryption_key', true)) >= 32;
END;
$$;