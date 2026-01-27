import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PricingItem {
  category: string;
  service: string;
  price: string;
  description: string | null;
}

interface PricingCategory {
  name: string;
  description: string;
  items: PricingItem[];
}

interface PricingProps {
  instanceId?: number;
}

export default function Pricing({ instanceId = 1 }: PricingProps) {
  const [categories, setCategories] = useState<PricingCategory[]>([]);

  useEffect(() => {
    loadPricing();
  }, [instanceId]);

  const loadPricing = async () => {
    const { data } = await supabase
      .from('pricing')
      .select('category, service, price, description')
      .eq('instance_id', instanceId)
      .order('display_order');

    if (data) {
      // Group by category
      const grouped = data.reduce((acc, item) => {
        const existing = acc.find(c => c.name === item.category);
        if (existing) {
          existing.items.push(item);
        } else {
          acc.push({
            name: item.category,
            description: item.description || '',
            items: [item]
          });
        }
        return acc;
      }, [] as PricingCategory[]);

      setCategories(grouped);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Professional services at competitive prices
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-slate-600 mb-6">{category.description}</p>
              )}
              
              <ul className="space-y-4">
                {category.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div>
                      <span className="text-slate-800 font-medium">{item.service}</span>
                      {item.description && (
                        <p className="text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                    <span className="text-slate-800 font-semibold ml-4">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
