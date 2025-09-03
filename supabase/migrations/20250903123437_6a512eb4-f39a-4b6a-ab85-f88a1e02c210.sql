-- Créer le cron job pour l'import automatique toutes les 2 heures
-- D'abord, s'assurer que l'extension pg_cron est activée
SELECT cron.schedule(
  'veille-auto-import',
  '0 */2 * * *', -- Toutes les 2 heures à la minute 0
  $$
  SELECT
    net.http_post(
        url:='https://pcpjqxuuuawwqxrecexm.supabase.co/functions/v1/veille-import',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcGpxeHV1dWF3d3F4cmVjZXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjkwOTMsImV4cCI6MjA3MTM0NTA5M30.8foPf8AqHmaux2vTEYM_g8E2EAtIUzFhGE_Uf7Sv4yk"}'::jsonb,
        body:=concat('{"auto": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);