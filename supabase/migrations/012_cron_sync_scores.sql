-- ============================================================
-- pg_cron: llama a sync-scores cada minuto
-- Requisito: reemplazar YOUR_SERVICE_ROLE_KEY con el valor real
--   (Supabase Dashboard → Settings → API → service_role secret)
-- ============================================================

-- Extensiones necesarias (disponibles en todos los proyectos Supabase)
create extension if not exists pg_net  schema extensions;
create extension if not exists pg_cron schema pg_catalog;

-- Eliminar job previo si existe (idempotente)
select cron.unschedule('sync-live-scores') where exists (
  select 1 from cron.job where jobname = 'sync-live-scores'
);

-- Programar sync cada minuto
select cron.schedule(
  'sync-live-scores',
  '* * * * *',
  $$
  select extensions.http_post(
    url     := 'https://ueecbkteyzgjilaindwj.supabase.co/functions/v1/sync-scores',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-sync-secret', 'prode-sync-2026'
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);
