-- SQL Export der vorhandenen Daten
-- Führe dieses SQL in Supabase SQL Editor aus, um die Daten zu importieren

-- ===========================================
-- 1. Allgemeine Informationen (general)
-- ===========================================

INSERT INTO general (name, full_name, tagline, motto, description) VALUES
('Sarah Soriano', 'Friseursalon Sarah Soriano', 'Vintage Style & Gemütlichkeit', 'Come in, relax and enjoy your tnew Frisuren!', 'Friseursalon mit Vintage-Charme in Linden. Come in, relax and enjoy your time!');

-- ===========================================
-- 2. Kontaktdaten (contact)
-- ===========================================

INSERT INTO contact (street, city, phone, email, instagram, instagram_url) VALUES
('Am Heimatmuseum 5', '35440 Linden', '06403 9143550', 'info@sarah-soriano.de', '@sarahsoriano_salon', 'https://instagram.com/sarahsoriano_salon');

-- ===========================================
-- 3. Öffnungszeiten (hours)
-- ===========================================

INSERT INTO hours (tuesday, wednesday, thursday, friday, saturday) VALUES
('08:30–13:00, 14:30–18:00', '08:30–13:00, 14:30–19:00', '08:30–13:00, 14:30–18:00', '08:30–13:00, 14:30–18:00', '08:30–13:00');

-- ===========================================
-- 4. Dienstleistungen (services)
-- ===========================================

INSERT INTO services (title, description, icon, display_order) VALUES
('Balayage & Coloration', 'Professionelle Färbetechniken für natürliche und moderne Looks.', 'Palette', 1),
('Haarstyling', 'Individuelles Styling für jeden Anlass und persönlichen Stil.', 'Sparkles', 2),
('Brautfrisuren', 'Traumhafte Frisuren für den schönsten Tag im Leben.', 'Heart', 3),
('Weitere Leistungen', 'Vielfältige Dienstleistungen für die ganze Familie.', 'Scissors', 4);

-- ===========================================
-- 5. Bewertungen (reviews)
-- ===========================================

INSERT INTO reviews (name, rating, text, date, display_order) VALUES
('Kunde aus Linden', 5, 'Sarah ist eine tolle Friseurin! Sehr professionell und freundlich.', '2025', 1),
('Braut 2025', 5, 'Wunderschöne Brautfrisur und sehr entspannte Atmosphäre!', '2025', 2),
('Stammkundin', 5, 'Kompetente Beratung und tolles Ergebnis. Immer wieder gerne!', '2025', 3);

-- ===========================================
-- 6. Über uns (about)
-- ===========================================

INSERT INTO about (title, description, highlight) VALUES
('Friseursalon Sarah Soriano', 'Hübscher Salon mit Vintage-Charme und einer gemütlichen Atmosphäre. Wir legen Wert auf persönliche Beratung und nehmen uns Zeit für jeden Kunden.', '"Come in, relax and enjoy your time!" ist nicht nur unser Motto, sondern wird in jedem Detail unseres Salons gelebt. Von der herzlichen Begrüßung bis zum perfekten Ergebnis – bei uns fühlen Sie sich wohl.');

-- ===========================================
-- 7. Preise (pricing)
-- ===========================================

INSERT INTO pricing (category, service, price, description, display_order) VALUES
('Basic', 'Haircut & Styling, Hair Wash, Blow Dry, Basic Products', '€45', 'Perfect for a quick refresh', 1),
('Premium', 'Haircut & Styling, Hair Wash & Treatment, Professional Blow Dry, Premium Products, Scalp Massage, Style Consultation', '€85', 'Our most popular package', 2),
('Luxury', 'Everything in Premium, Color or Highlights, Deep Conditioning, Head & Shoulder Massage, Refreshments, Complimentary Product Sample', '€150', 'The complete experience', 3);

-- ===========================================
-- Fertig!
-- ===========================================

-- Alle Daten wurden erfolgreich importiert.
-- Du kannst die Daten nun über das CMS bearbeiten.
