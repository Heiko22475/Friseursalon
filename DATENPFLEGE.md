# Friseursalon Sarah Soriano - Website

## 📝 Datenpflege - So ändern Sie Inhalte

### ✅ Einfache Methode: Eine zentrale Datei

**Alle Inhalte der Website können in einer einzigen Datei bearbeitet werden:**

📁 **`src/data/salonData.ts`**

### Was können Sie ändern?

#### 1. **Allgemeine Informationen**
```typescript
name: "Sarah Soriano",           // Name im Header
fullName: "Friseursalon Sarah Soriano",  // Voller Name
tagline: "Vintage Style & Gemütlichkeit",  // Überschrift
motto: "Come in, relax and enjoy your time!",  // Motto
```

#### 2. **Kontaktdaten**
```typescript
contact: {
  address: {
    street: "Am Heimatmuseum 5",
    city: "35440 Linden"
  },
  phone: "06403 9143550",
  email: "info@sarah-soriano.de",
  instagram: "@sarahsoriano_salon",
  instagramUrl: "https://instagram.com/sarahsoriano_salon"
}
```

#### 3. **Öffnungszeiten**
```typescript
openingHours: {
  tuesday: "08:30–13:00, 14:30–18:00",
  wednesday: "08:30–13:00, 14:30–19:00",
  // ... weitere Tage
}
```

#### 4. **Dienstleistungen**
Fügen Sie neue Services hinzu oder ändern Sie bestehende:
```typescript
services: [
  {
    title: "Balayage & Coloration",
    description: "Professionelle Färbetechniken...",
    features: ["Balayage", "Komplettfärbung", "Highlights"]
  },
  // Weitere Services...
]
```

#### 5. **Bewertungen**
```typescript
reviews: {
  rating: 4.9,
  count: 42,
  mainQuote: "Hübscher Salon, super nette Menschen...",
  testimonials: [
    {
      text: "Sarah ist eine tolle Friseurin!",
      author: "Kunde aus Linden"
    },
    // Weitere Testimonials...
  ]
}
```

#### 6. **Preise**
```typescript
pricing: [
  {
    name: "Basic",
    price: "€45",
    description: "Perfect for a quick refresh",
    features: ["Haircut & Styling", "Hair Wash", ...],
    popular: false
  },
  // Weitere Preispakete...
]
```

### 🚀 Wie Sie Änderungen vornehmen:

1. **Datei öffnen:** `src/data/salonData.ts`
2. **Gewünschte Daten ändern** (Text zwischen den Anführungszeichen)
3. **Datei speichern**
4. **Website neu laden** - Änderungen sind sofort sichtbar!

### ⚠️ Wichtige Hinweise:

- **Anführungszeichen** nicht entfernen: `"Text hier"`
- **Kommata** am Zeilenende behalten: `"Text",`
- Bei **Umlauten** (ä, ö, ü) nichts Besonderes beachten
- **Zahlen** ohne Anführungszeichen: `rating: 4.9`

### 📖 Beispiel - Telefonnummer ändern:

**Vorher:**
```typescript
phone: "06403 9143550",
```

**Nachher:**
```typescript
phone: "06403 9999999",
```

### 🎨 Erweiterte Anpassungen

Wenn Sie mehr ändern möchten (Farben, Layout, Bilder), müssen Sie die einzelnen Komponenten-Dateien in `src/components/` bearbeiten.

## 🛠️ Installation & Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build erstellen
npm run build
```

## 📁 Projektstruktur

```
src/
├── data/
│   └── salonData.ts          # ✅ HIER ALLE INHALTE ÄNDERN
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── About.tsx
│   ├── Reviews.tsx
│   ├── Gallery.tsx
│   ├── Pricing.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## 📞 Support

Bei Fragen zur Datenpflege oder technischen Problemen, kontaktieren Sie Ihren Web-Entwickler.
