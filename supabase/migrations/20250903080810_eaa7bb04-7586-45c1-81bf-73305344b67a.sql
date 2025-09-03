-- Correction finale des problèmes de sécurité

-- Corriger les 2 dernières fonctions sans search_path
CREATE OR REPLACE FUNCTION public.create_admin_session(
  p_admin_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private  -- Correction: ajout du search_path
AS $$
DECLARE
  session_token text;
BEGIN
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Nettoyer les anciennes sessions
  DELETE FROM private.session_data WHERE expires_at < now();
  
  -- Créer la nouvelle session
  INSERT INTO private.session_data (key, value, expires_at)
  VALUES ('admin_session_' || session_token, p_admin_id::text, now() + interval '24 hours');
  
  -- Stocker l'ID admin dans la session courante
  INSERT INTO private.session_data (key, value)
  VALUES ('admin_id', p_admin_id::text)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, created_at = now();
  
  RETURN session_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_admin_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private  -- Correction: ajout du search_path
AS $$
BEGIN
  -- Log des changements sensibles
  IF TG_OP = 'UPDATE' AND (OLD.is_active != NEW.is_active OR OLD.is_super_admin != NEW.is_super_admin) THEN
    INSERT INTO private.session_data (key, value)
    VALUES (
      'audit_' || gen_random_uuid(),
      json_build_object(
        'action', TG_OP,
        'table', TG_TABLE_NAME,
        'user_id', NEW.id,
        'changed_by', (SELECT value::uuid FROM private.session_data WHERE key = 'admin_id'),
        'timestamp', now(),
        'changes', json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      )::text
    );
  END IF;
  
  -- Mettre à jour updated_at
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$;