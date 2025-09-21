-- Fix admin authentication by ensuring admin_users.id matches auth.users.id
-- Update the admin user to use the correct UUID from auth.users

DO $$
DECLARE
    auth_uuid uuid;
    admin_exists boolean;
BEGIN
    -- Get the auth user ID for rayane.jerbi@yahoo.com
    SELECT id INTO auth_uuid 
    FROM auth.users 
    WHERE email = 'rayane.jerbi@yahoo.com'
    LIMIT 1;
    
    -- Check if admin record exists
    SELECT EXISTS(
        SELECT 1 FROM public.admin_users 
        WHERE email = 'rayane.jerbi@yahoo.com'
    ) INTO admin_exists;
    
    IF auth_uuid IS NOT NULL THEN
        IF admin_exists THEN
            -- Update existing admin record to use auth UUID
            UPDATE public.admin_users 
            SET id = auth_uuid, 
                is_active = true, 
                updated_at = now()
            WHERE email = 'rayane.jerbi@yahoo.com';
            
            RAISE NOTICE 'Updated admin user with auth UUID: %', auth_uuid;
        ELSE
            -- Create new admin record with auth UUID
            INSERT INTO public.admin_users (id, email, full_name, is_active)
            VALUES (auth_uuid, 'rayane.jerbi@yahoo.com', 'Rayane JERBI', true)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                is_active = true,
                updated_at = now();
                
            RAISE NOTICE 'Created admin user with auth UUID: %', auth_uuid;
        END IF;
    ELSE
        RAISE NOTICE 'No auth user found for rayane.jerbi@yahoo.com';
    END IF;
END $$;