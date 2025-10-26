-- Ajouter une contrainte unique sur ip_address pour permettre ON CONFLICT
-- D'abord, supprimer les doublons s'il y en a
DELETE FROM rate_limit_contact a USING rate_limit_contact b
WHERE a.id > b.id AND a.ip_address = b.ip_address;

-- Ajouter la contrainte unique
ALTER TABLE rate_limit_contact 
ADD CONSTRAINT rate_limit_contact_ip_unique UNIQUE (ip_address);