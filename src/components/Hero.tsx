import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GeneralData {
  name: string;
  tagline: string;
  motto: string;
}

export default function Hero() {
  const [data, setData] = useState<GeneralData>({
    name: 'Sarah Soriano',
    tagline: 'Vintage Style & Gemütlichkeit',
    motto: 'Come in, relax and enjoy your time!',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: result } = await supabase
      .from('general')
      .select('name, tagline, motto')
      .limit(1)
      .single();

    if (result) setData(result);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6">
            {data.tagline.split(' & ')[0]} &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-800">
              {data.tagline.split(' & ')[1]}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto italic">
            "{data.motto}" – {data.name}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-slate-800 text-white px-8 py-4 rounded-lg hover:bg-slate-700 transition flex items-center justify-center gap-2 text-lg"
            >
              Book Appointment
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="border-2 border-slate-800 text-slate-800 px-8 py-4 rounded-lg hover:bg-slate-800 hover:text-white transition text-lg"
            >
              View Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
