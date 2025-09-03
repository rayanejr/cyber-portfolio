-- Correction des problèmes de sécurité détectés par le linter

-- 1. Corriger les fonctions sans search_path défini
CREATE OR REPLACE FUNCTION public.check_admin_password(p_email text, p_plain text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions  -- Correction: ajout du search_path
AS $$
  select exists (
    select 1
    from public.admin_accounts a
    join public.admin_secrets s on s.user_id = a.user_id
    where a.email = lower(p_email)
      and a.is_active = true
      and s.password_hash = crypt(p_plain, s.password_hash)
  );
$$;

CREATE OR REPLACE FUNCTION public.set_admin_password(p_user_id uuid, p_plain text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions  -- Correction: ajout du search_path
AS $$
begin
  insert into public.admin_secrets (user_id, password_hash)
  values (p_user_id, crypt(p_plain, gen_salt('bf', 12)))
  on conflict (user_id) do update
    set password_hash = excluded.password_hash,
        last_password_change = now();

  update public.admin_accounts
     set updated_at = now()
   where user_id = p_user_id;
end;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public  -- Correction: ajout du search_path
AS $$
  select exists(
    select 1 from public.admin_accounts a
    where a.user_id = uid
      and a.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Correction: ajout du search_path
AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Correction: ajout du search_path
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Corriger les fonctions récemment ajoutées
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip inet, p_email citext DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private  -- Correction: ajout du search_path
AS $$
DECLARE
  recent_attempts integer;
BEGIN
  -- Nettoyer les anciennes tentatives (plus de 1 heure)
  DELETE FROM private.login_attempts 
  WHERE attempt_time < now() - interval '1 hour';
  
  -- Compter les tentatives récentes (dernières 15 minutes)
  SELECT count(*) INTO recent_attempts
  FROM private.login_attempts
  WHERE ip_address = p_ip
    AND attempt_time > now() - interval '15 minutes'
    AND (p_email IS NULL OR email = p_email);
  
  -- Limiter à 5 tentatives par IP/email par 15 minutes
  RETURN recent_attempts < 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private  -- Correction: ajout du search_path
AS $$
  WITH deleted AS (
    DELETE FROM private.session_data 
    WHERE expires_at < now()
    RETURNING 1
  )
  SELECT count(*) FROM deleted;
$$;