-- Corriger la contrainte de vérification pour admin_files pour permettre 'logo'
ALTER TABLE admin_files DROP CONSTRAINT IF EXISTS admin_files_category_check;

-- Ajouter une nouvelle contrainte incluant 'logo'
ALTER TABLE admin_files ADD CONSTRAINT admin_files_category_check 
CHECK (file_category IN ('cv', 'document', 'image', 'certificate', 'logo', 'certifications'));

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_files_category_active ON admin_files(file_category, is_active);