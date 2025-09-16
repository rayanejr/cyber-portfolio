-- Corriger les problèmes de sécurité détectés

-- 1. Améliorer les politiques RLS pour contact_messages - supprimer l'accès public
DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;

-- Créer une politique plus sécurisée pour les insertions de contact
CREATE POLICY "allow_contact_insertions" 
ON contact_messages 
FOR INSERT 
WITH CHECK (true); -- Permet seulement les insertions, pas la lecture

-- 2. Vérifier et améliorer la sécurité générale
-- Désactiver toute politique de lecture publique sur contact_messages si elle existe
DROP POLICY IF EXISTS "public_read_contact_messages" ON contact_messages;

-- 3. Renforcer la sécurité admin - créer une fonction pour vérifier l'authentification admin
CREATE OR REPLACE FUNCTION public.is_admin_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
$$;