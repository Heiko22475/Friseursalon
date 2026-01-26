import { useState, useEffect } from 'react';
import { Award, Heart, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AboutData {
  title: string;
  description: string;
  highlight: string;
}

export default function About() {
  const [data, setData] = useState<AboutData>({
    title: 'Friseursalon Sarah Soriano',
    description: '',
    highlight: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: result } = await supabase
      .from('about')
      .select('title, description, highlight')
      .limit(1)
      .single();

    if (result) setData(result);
  };

  return (
    <section id="about" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                {data.title}
              </h2>
              <p className="text-lg text-slate-600 mb-6">{data.description}</p>
              <p className="text-lg text-slate-600 mb-8 italic">{data.highlight}</p>

              <div className="space-y-4">
                {[
                  { Icon: Award, title: 'Award-Winning Team', description: 'Recognized for excellence in styling and customer service' },
                  { Icon: Heart, title: 'Top bewertet', description: '4,9 Sterne bei 42 Google-Rezensionen' },
                  { Icon: Star, title: 'Premium Products', description: 'Using only the finest professional-grade products' },
                ].map(({ Icon, title, description }, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl mb-1">{title}</h3>
                      <p className="text-slate-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-bold text-slate-800 mb-2">15+</p>
                  <p className="text-xl text-slate-600">Years Experience</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-slate-800 text-white p-6 rounded-xl shadow-xl">
                <p className="text-4xl font-bold mb-1">4.9★</p>
                <p className="text-slate-200">Google Bewertung</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
