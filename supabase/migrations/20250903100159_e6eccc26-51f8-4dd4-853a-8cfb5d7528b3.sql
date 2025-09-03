-- Corriger la sécurité rapidement
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all admin operations" ON admin_users
FOR ALL USING (true);