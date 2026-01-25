import { Scissors, Sparkles, Palette, Users } from 'lucide-react'
import { salonData } from '../data/salonData'

const icons = [Sparkles, Scissors, Palette, Users]

export default function Services() {
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
          {salonData.services.map((service, index) => {
            const Icon = icons[index]
            return (
              <div 
                key={index}
                className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition group"
              >
                <div className="bg-slate-800 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
