-- Créer un utilisateur admin par défaut avec Supabase Auth
-- Cette migration crée un compte admin dans la table auth.users ET admin_users

DO $$ 
DECLARE
    new_user_id uuid;
BEGIN
    -- Créer l'utilisateur dans auth.users si il n'existe pas
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token,
        email_change_token_current,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        last_sign_in_at
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'admin@cybersecpro.com',
        crypt('AdminCyberSec2024!@#', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '{"provider":"email","providers":["email"]}',
        '{}',
        false,
        now()
    ) 
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO new_user_id;

    -- Si l'utilisateur existait déjà, récupérer son ID
    IF new_user_id IS NULL THEN
        SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@cybersecpro.com';
    END IF;

    -- Créer l'entrée admin correspondante
    INSERT INTO public.admin_users (
        id,
        email,
        full_name,
        password_hash,
        is_super_admin,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'admin@cybersecpro.com',
        'Super Administrateur',
        crypt('AdminCyberSec2024!@#', gen_salt('bf')),
        true,
        true,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        is_active = true,
        is_super_admin = true,
        updated_at = now();

END $$;