-- Créer l'utilisateur admin@cybersecpro.com dans auth.users avec le bon UUID
-- Puisque nous ne pouvons pas insérer directement dans auth.users,
-- nous devons utiliser l'edge function create-admin pour créer cet utilisateur

-- D'abord, mettons à jour le mot de passe de rayane.jerbi@yahoo.com pour être sûr qu'il soit correct
-- et vérifier que admin@cybersecpro.com a le bon mot de passe dans admin_users

-- Mettre à jour le hash du mot de passe pour rayane.jerbi@yahoo.com
UPDATE admin_users 
SET password_hash = extensions.crypt('AdminCyber2024!', extensions.gen_salt('bf', 12))
WHERE email = 'rayane.jerbi@yahoo.com';

-- Mettre à jour le hash du mot de passe pour admin@cybersecpro.com 
UPDATE admin_users 
SET password_hash = extensions.crypt('AdminCyberSec2024!@#', extensions.gen_salt('bf', 12))
WHERE email = 'admin@cybersecpro.com';