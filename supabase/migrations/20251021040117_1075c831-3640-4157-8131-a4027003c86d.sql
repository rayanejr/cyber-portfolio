-- Fix contact_messages table and trigger

-- 1. Add ip_address column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contact_messages' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN ip_address inet;
  END IF;
END $$;

-- 2. Fix the rate limit trigger to not use ON CONFLICT on contact_messages
DROP TRIGGER IF EXISTS check_contact_rate_limit ON contact_messages;

CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  recent_count INTEGER;
  is_ip_blocked BOOLEAN;
BEGIN
  -- Vérifier si l'IP est bloquée
  SELECT COALESCE(is_blocked, false) INTO is_ip_blocked
  FROM rate_limit_contact
  WHERE ip_address = NEW.ip_address::inet;
  
  IF is_ip_blocked THEN
    RAISE EXCEPTION 'Votre adresse IP a été bloquée temporairement pour spam. Veuillez réessayer plus tard.';
  END IF;
  
  -- Compter les messages des dernières 15 minutes depuis cette IP
  SELECT COUNT(*) INTO recent_count
  FROM contact_messages
  WHERE created_at > now() - interval '15 minutes'
  AND ip_address = NEW.ip_address::inet;
  
  -- Si plus de 3 messages en 15 minutes, bloquer
  IF recent_count >= 3 THEN
    -- Insérer ou mettre à jour le blocage avec la contrainte unique
    INSERT INTO rate_limit_contact (ip_address, attempts, is_blocked, window_start)
    VALUES (NEW.ip_address::inet, recent_count + 1, true, now())
    ON CONFLICT (ip_address) 
    DO UPDATE SET 
      attempts = rate_limit_contact.attempts + 1,
      is_blocked = true,
      window_start = now();
    
    RAISE EXCEPTION 'Trop de messages envoyés. Veuillez patienter 15 minutes avant de réessayer.';
  END IF;
  
  -- Mettre à jour le compteur de tentatives
  INSERT INTO rate_limit_contact (ip_address, attempts, window_start)
  VALUES (NEW.ip_address::inet, 1, now())
  ON CONFLICT (ip_address) 
  DO UPDATE SET 
    attempts = rate_limit_contact.attempts + 1,
    window_start = CASE 
      WHEN rate_limit_contact.window_start < now() - interval '15 minutes' 
      THEN now() 
      ELSE rate_limit_contact.window_start 
    END;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER check_contact_rate_limit
  BEFORE INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION check_contact_rate_limit();