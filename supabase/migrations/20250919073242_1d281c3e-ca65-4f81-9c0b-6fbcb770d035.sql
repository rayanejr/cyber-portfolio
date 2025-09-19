-- Create initial admin user if none exists
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT count(*) INTO admin_users WHERE id = auth.uid();
    
    IF admin_count = 0 THEN
        INSERT INTO admin_users (
            email, 
            full_name, 
            password_hash, 
            is_super_admin, 
            is_active
        ) 
        VALUES (
            'admin@cybersecpro.com',
            'Super Admin',
            crypt('AdminCyberSec2024!@#$', gen_salt('bf', 12)),
            true,
            true
        );
        
        RAISE NOTICE 'Admin créé: admin@cybersecpro.com / AdminCyberSec2024!@#$';
    ELSE
        RAISE NOTICE 'Des admins existent déjà';
    END IF;
END
$$;