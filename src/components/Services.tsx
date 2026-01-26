import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  title: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_enabled: boolean;
  icon_size: number;
  icon_bg_enabled: boolean;
  icon_bg_color: string;
  icon_bg_shape: 'rounded' | 'circle';
  icon_bg_padding: number;
  text_align: 'left' | 'center' | 'right';
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [sectionContent, setSectionContent] = useState({ title: 'Our Services', subtitle: 'Premium hair care services delivered by experienced professionals' });

  useEffect(() => {
    loadServices();
    loadSectionContent();
  }, []);

  const loadSectionContent = async () => {
    const { data } = await supabase
      .from('services_section')
      .select('title, subtitle')
      .limit(1)
      .single();

    if (data) {
      setSectionContent(data);
    }
  };

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('title, description, icon, icon_color, icon_enabled, icon_size, icon_bg_enabled, icon_bg_color, icon_bg_shape, icon_bg_padding, text_align')
      .order('display_order');

    if (data) {
      console.log('Services loaded:', data); // Debug log
      setServices(data);
    }
  };

  const getIconBackgroundStyle = (service: Service) => {
    if (!service.icon_bg_enabled) return {};

    return {
      backgroundColor: service.icon_bg_color,
      padding: `${service.icon_bg_padding}px`,
      borderRadius: service.icon_bg_shape === 'circle' ? '50%' : '8px',
    };
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            {sectionContent.title}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {sectionContent.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const IconComponent = (LucideIcons[service.icon as keyof typeof LucideIcons] || Scissors) as React.FC<{ 
              size?: number; 
              color?: string;
              className?: string;
            }>;
            
            console.log(`Service ${service.title}: icon=${service.icon}, color=${service.icon_color}`); // Debug
            
            return (
              <div
                key={index}
                className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition group"
                style={{ textAlign: service.text_align }}
              >
                {service.icon_enabled && (
                  <div className="mb-6 group-hover:scale-110 transition">
                    <div 
                      style={getIconBackgroundStyle(service)}
                      className={`inline-flex items-center justify-center ${
                        service.text_align === 'center' ? 'mx-auto' : ''
                      }`}
                    >
                      <IconComponent 
                        size={service.icon_size}
                        color={service.icon_color}
                      />
                    </div>
                  </div>
                )}
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
