-- =====================================================
-- WEBSITE CONTENT HISTORY
-- Versionierung der Website-Inhalte
-- =====================================================

-- Separate Tabelle für Content-History
CREATE TABLE IF NOT EXISTS website_content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  customer_id VARCHAR(6) NOT NULL,
  content JSONB NOT NULL,
  version_label TEXT,                              -- z.B. "Vor AI-Import", "Manuelles Backup"
  source TEXT NOT NULL DEFAULT 'manual',           -- 'manual', 'ai-import', 'auto-save', 'visual-editor'
  created_by TEXT,                                 -- wer hat die Version erstellt
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnelle Abfragen nach customer_id
CREATE INDEX IF NOT EXISTS idx_content_history_customer 
  ON website_content_history(customer_id);

-- Index für schnelle Abfragen nach website_id (chronologisch)
CREATE INDEX IF NOT EXISTS idx_content_history_website_date 
  ON website_content_history(website_id, created_at DESC);

-- Maximal 20 Versionen pro Website behalten (optional, per Cron oder Trigger)
-- Für den Anfang: kein automatisches Löschen, manuell verwalten.

-- RLS: Nur authentifizierte User
ALTER TABLE website_content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read history"
  ON website_content_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert history"
  ON website_content_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete history"
  ON website_content_history FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- HILFSFUNKTION: Automatisches Backup vor Update
-- Erstellt eine History-Version bevor content überschrieben wird
-- =====================================================
CREATE OR REPLACE FUNCTION save_content_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Nur wenn sich der content tatsächlich geändert hat
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO website_content_history (website_id, customer_id, content, source, version_label)
    VALUES (OLD.id, OLD.customer_id, OLD.content, 'auto-save', 'Automatisches Backup');
  END IF;
  
  -- updated_at aktualisieren
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Vor jedem Content-Update automatisch ein Backup erstellen
DROP TRIGGER IF EXISTS trigger_content_history ON websites;
CREATE TRIGGER trigger_content_history
  BEFORE UPDATE OF content ON websites
  FOR EACH ROW
  EXECUTE FUNCTION save_content_history();
