-- Correction finale des politiques RLS pour une sécurité maximale

-- 1. Politique explicite de refus de lecture publique pour contact_messages
DROP POLICY IF EXISTS "contact_messages_no_public_read" ON public.contact_messages;
CREATE POLICY "contact_messages_no_public_read" 
ON public.contact_messages 
FOR SELECT 
USING (false);

-- 2. Politique explicite de refus de lecture publique pour rate_limit_contact  
DROP POLICY IF EXISTS "rate_limit_no_public_read" ON public.rate_limit_contact;
CREATE POLICY "rate_limit_no_public_read" 
ON public.rate_limit_contact 
FOR SELECT 
USING (false);