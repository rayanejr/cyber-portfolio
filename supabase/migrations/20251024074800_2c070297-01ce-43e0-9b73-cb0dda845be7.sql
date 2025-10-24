-- Désactiver le trigger qui cause l'erreur ON CONFLICT
DROP TRIGGER IF EXISTS check_contact_rate_limit_trigger ON contact_messages;

-- Nettoyer les anciens triggers de sécurité si présents
DROP TRIGGER IF EXISTS log_spam_attempt_trigger ON rate_limit_contact;