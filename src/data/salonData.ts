// Zentrale Datenverwaltung für die Webseite
// Die Daten werden aus JSON-Dateien geladen, die über das CMS bearbeitet werden können

import generalData from '../content/general.json'
import contactData from '../content/contact.json'
import hoursData from '../content/hours.json'
import servicesData from '../content/services.json'
import reviewsData from '../content/reviews.json'
import aboutData from '../content/about.json'
import pricingData from '../content/pricing.json'

export const salonData = {
  // Allgemeine Informationen
  name: generalData.name,
  fullName: generalData.fullName,
  tagline: generalData.tagline,
  motto: generalData.motto,
  description: generalData.description,
  
  // Kontaktdaten
  contact: contactData,

  // Öffnungszeiten
  openingHours: hoursData,

  // Dienstleistungen
  services: servicesData.services,

  // Bewertungen
  reviews: reviewsData,

  // Über uns
  about: aboutData,

  // Preise
  pricing: pricingData.pricing,

  // Navigation
  navigation: [
    { label: "Home", id: "home" },
    { label: "Services", id: "services" },
    { label: "About", id: "about" },
    { label: "Gallery", id: "gallery" },
    { label: "Pricing", id: "pricing" },
    { label: "Contact", id: "contact" }
  ]
}
