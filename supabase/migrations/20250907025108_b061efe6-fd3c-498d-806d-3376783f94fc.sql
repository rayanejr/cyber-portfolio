-- Supprimer la table blogs et toutes les références
DROP TABLE IF EXISTS blogs CASCADE;

-- Supprimer la table rate_limit_tracking qui n'existe pas
-- (correction pour AdminSecurity.tsx)

-- Modifier la table admin_users pour supprimer is_super_admin et clarifier is_active
ALTER TABLE admin_users DROP COLUMN IF EXISTS is_super_admin;

-- Ajouter des commentaires pour clarifier le rôle des colonnes
COMMENT ON COLUMN admin_users.is_active IS 'Détermine si le compte administrateur est actif et peut se connecter';