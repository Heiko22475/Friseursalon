-- Supabase Schema für Friseursalon CMS
-- Führe dieses SQL in der Supabase SQL Editor aus

-- 1. Allgemeine Informationen
CREATE TABLE general (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  tagline TEXT,
  motto TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Kontaktdaten
CREATE TABLE contact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  street VARCHAR(255),
  city VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  instagram VARCHAR(100),
  instagram_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Öffnungszeiten
CREATE TABLE hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tuesday VARCHAR(100),
  wednesday VARCHAR(100),
  thursday VARCHAR(100),
  friday VARCHAR(100),
  saturday VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Dienstleistungen
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Bewertungen
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  date VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Über uns
CREATE TABLE about (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  highlight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Preise
CREATE TABLE pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  price VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Galerie (optional)
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ========================================
-- Row Level Security (RLS) aktivieren
-- ========================================

ALTER TABLE general ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Policies: Jeder kann lesen, nur authentifizierte Benutzer können schreiben
-- ========================================

-- General
CREATE POLICY "Jeder kann general lesen" ON general FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können general schreiben" ON general FOR ALL USING (auth.role() = 'authenticated');

-- Contact
CREATE POLICY "Jeder kann contact lesen" ON contact FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können contact schreiben" ON contact FOR ALL USING (auth.role() = 'authenticated');

-- Hours
CREATE POLICY "Jeder kann hours lesen" ON hours FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können hours schreiben" ON hours FOR ALL USING (auth.role() = 'authenticated');

-- Services
CREATE POLICY "Jeder kann services lesen" ON services FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können services schreiben" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Reviews
CREATE POLICY "Jeder kann reviews lesen" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können reviews schreiben" ON reviews FOR ALL USING (auth.role() = 'authenticated');

-- About
CREATE POLICY "Jeder kann about lesen" ON about FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können about schreiben" ON about FOR ALL USING (auth.role() = 'authenticated');

-- Pricing
CREATE POLICY "Jeder kann pricing lesen" ON pricing FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können pricing schreiben" ON pricing FOR ALL USING (auth.role() = 'authenticated');

-- Gallery
CREATE POLICY "Jeder kann gallery lesen" ON gallery FOR SELECT USING (true);
CREATE POLICY "Authentifizierte können gallery schreiben" ON gallery FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- Funktion für automatisches updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für alle Tabellen
CREATE TRIGGER update_general_updated_at BEFORE UPDATE ON general FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON contact FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hours_updated_at BEFORE UPDATE ON hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Initiale Daten einfügen (optional)
-- ========================================

-- Hinweis: Diese Daten musst du anpassen oder weglassen
-- Du kannst die Daten später über das Admin-Interface oder direkt hier einfügen

-- Beispiel für general (nur ein Eintrag)
-- INSERT INTO general (name, full_name, tagline, motto, description) VALUES
-- ('Sarah Soriano', 'Friseursalon Sarah Soriano', 'Ihr Friseur in Würzburg', 'Schönheit beginnt mit dem richtigen Schnitt', 'Professionelle Haarpflege und Styling');

-- Beispiel für contact (nur ein Eintrag)
-- INSERT INTO contact (street, city, phone, email, instagram, instagram_url) VALUES
-- ('Musterstraße 123', '97070 Würzburg', '+49 123 456789', 'info@sarah-soriano.de', '@sarahsoriano', 'https://instagram.com/sarahsoriano');

-- Beispiel für hours (nur ein Eintrag)
-- INSERT INTO hours (tuesday, wednesday, thursday, friday, saturday) VALUES
-- ('9:00 - 18:00', '9:00 - 18:00', '9:00 - 20:00', '9:00 - 18:00', '8:00 - 14:00');

-- ========================================
-- Fertig!
-- ========================================

-- Nächste Schritte:
-- 1. Führe dieses SQL in Supabase SQL Editor aus
-- 2. Erstelle einen Benutzer in Supabase Authentication
-- 3. Integriere Supabase Client in deine React-App
-- 4. Baue Admin-Interface zum Bearbeiten der Daten
