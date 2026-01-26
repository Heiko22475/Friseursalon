import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactData {
  street: string;
  city: string;
  phone: string;
  email: string;
}

interface Hour {
  day: string;
  hours: string;
}

export default function Contact() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [hours, setHours] = useState<Hour[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [contactRes, hoursRes] = await Promise.all([
      supabase.from('contact').select('street, city, phone, email').single(),
      supabase.from('hours').select('day, hours').order('display_order')
    ]);

    if (contactRes.data) setContact(contactRes.data);
    if (hoursRes.data) setHours(hoursRes.data);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Book your appointment or reach out with any questions
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <form className="space-y-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Name
                </label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Email
                </label>
                <input 
                  type="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Phone
                </label>
                <input 
                  type="tel"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Message
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  placeholder="Tell us about your desired service..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-800 text-white py-4 rounded-lg hover:bg-slate-700 transition font-semibold text-lg"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                Visit Us
              </h3>
              
              <div className="space-y-6">
                {contact && (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg">
                        <MapPin className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">Address</p>
                        <p className="text-slate-600">
                          {contact.street}<br />
                          {contact.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg">
                        <Phone className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">Phone</p>
                        <p className="text-slate-600">{contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-slate-800 p-3 rounded-lg">
                        <Mail className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">Email</p>
                        <p className="text-slate-600">{contact.email}</p>
                      </div>
                    </div>
                  </>
                )}

                {hours.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Opening Hours</p>
                      <p className="text-slate-600">
                        {hours.map((h, i) => (
                          <span key={i}>
                            {h.day}: {h.hours}
                            {i < hours.length - 1 && <><br /></>}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
