-- Créer le cron job pour le nettoyage automatique quotidien de la veille
-- Nettoyage tous les jours à 2h du matin
SELECT cron.schedule(
  'veille-daily-cleanup',
  '0 2 * * *', -- Tous les jours à 2h00
  $$
  SELECT
    net.http_post(
        url:='https://pcpjqxuuuawwqxrecexm.supabase.co/functions/v1/veille-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcGpxeHV1dWF3d3F4cmVjZXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjkwOTMsImV4cCI6MjA3MTM0NTA5M30.8foPf8AqHmaux2vTEYM_g8E2EAtIUzFhGE_Uf7Sv4yk"}'::jsonb,
        body:=concat('{"cleanup": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);