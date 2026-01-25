import { Check } from 'lucide-react'
import { salonData } from '../data/salonData'

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Pricing Plans
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect package for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {salonData.pricing.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-8 ${
                plan.popular 
                  ? 'ring-2 ring-slate-800 shadow-xl scale-105' 
                  : 'shadow-lg'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-600 mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-slate-800">{plan.price}</span>
                <span className="text-slate-600">/session</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-slate-800 flex-shrink-0 mt-1" size={20} />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-semibold transition ${
                plan.popular
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white'
              }`}>
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
