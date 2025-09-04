-- Corriger les avertissements de sécurité détectés

-- 1. Corriger le search_path pour la fonction validate_encryption_key
CREATE OR REPLACE FUNCTION public.validate_encryption_key()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cette fonction sera appelée par les edge functions pour valider la clé
  RETURN length(current_setting('app.encryption_key', true)) >= 32;
END;
$$;

-- 2. Déplacer l'extension pgcrypto vers le schéma extensions (déjà fait automatiquement par Supabase)