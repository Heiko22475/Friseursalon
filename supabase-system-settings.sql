-- =====================================================
-- SYSTEM SETTINGS TABLE
-- Key-value store for global system configuration.
-- Used by: SuperAdmin Settings UI + prerender script.
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL DEFAULT '',
  description text,
  updated_at  timestamptz DEFAULT now()
);

-- Default prerender / deployament settings
INSERT INTO system_settings (key, value, description) VALUES
  ('prerender_wait_ms',              '1000',    'Millisekunden warten nach dem Laden der Seite, bevor HTML gespeichert wird'),
  ('prerender_selector_timeout_ms',  '10000',   'Maximale Zeit (ms) bis .dynamic-page Container erscheint'),
  ('sitemap_changefreq',             'weekly',  'Wie oft Suchmaschinen die Seite neu crawlen sollen (hourly/daily/weekly/monthly)'),
  ('vercel_deploy_hook',             '',        'Vercel Deploy Hook URL – ein POST an diese URL l\u00f6st ein neues Deployment aus')
ON CONFLICT (key) DO NOTHING;

-- RLS: nur Superadmin darf lesen/schreiben (anpassen nach eurem Auth-Setup)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_all" ON system_settings
  FOR ALL
  USING (true)   -- anpassen: z.B. auth.jwt() ->> 'role' = 'superadmin'
  WITH CHECK (true);
