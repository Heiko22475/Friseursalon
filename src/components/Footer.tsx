import { useState, useEffect } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useWebsite } from '../contexts/WebsiteContext';

interface GeneralData {
  name: string;
  tagline: string;
}

interface ContactData {
  instagram: string;
  instagram_url: string;
}

export default function Footer() {
  const { website, websiteRecord } = useWebsite();
  const [general, setGeneral] = useState<GeneralData | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);

  useEffect(() => {
    if (website || websiteRecord) {
        setGeneral({
            name: websiteRecord?.site_name || 'Salon',
            tagline: website?.general?.tagline || ''
        });
        if (website?.contact) {
            setContact({
                instagram: website.contact.instagram || '',
                instagram_url: website.contact.instagram_url || ''
            });
        }
    } else {
        loadData();
    }
  }, [website]);

  const loadData = async () => {
    if (website) return;
    /*
    const [generalRes, contactRes] = await Promise.all([
      supabase.from('general').select('name, tagline').single(),
      supabase.from('contact').select('instagram, instagram_url').single()
    ]);

    if (generalRes.data) setGeneral(generalRes.data);
    if (contactRes.data) setContact(contactRes.data);
    */
  };

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{general?.name || 'Salon'}</h3>
            <p className="text-slate-400">
              {general?.tagline || ''}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#home" className="hover:text-white transition">Home</a></li>
              <li><a href="#services" className="hover:text-white transition">Services</a></li>
              <li><a href="#about" className="hover:text-white transition">About</a></li>
              <li><a href="#gallery" className="hover:text-white transition">Gallery</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#contact" className="hover:text-white transition">Book Appointment</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {contact?.instagram_url && (
                <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700 transition">
                  <Instagram size={20} />
                </a>
              )}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700 transition">
                <Facebook size={20} />
              </a>
            </div>
            {contact?.instagram && (
              <p className="text-slate-400 text-sm mt-4">{contact.instagram}</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} {general?.name || 'Salon'}. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
