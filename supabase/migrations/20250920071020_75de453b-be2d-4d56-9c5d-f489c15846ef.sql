-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the missing private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Update admin user password to use proper encryption
UPDATE admin_users 
SET password_hash = crypt('AdminCyberSec2024!@#', gen_salt('bf', 12))
WHERE email = 'admin@cybersecpro.com';