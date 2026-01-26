import { useState, useEffect } from 'react';
import { Scissors, Sparkles, Palette, Users, Heart, LucideIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  title: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  Scissors,
  Sparkles,
  Palette,
  Users,
  Heart,
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('title, description, icon')
      .order('display_order');

    if (data) setServices(data);
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Premium hair care services delivered by experienced professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Scissors;
            return (
              <div
                key={index}
                className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition group"
              >
                <div className="bg-slate-800 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-4">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
