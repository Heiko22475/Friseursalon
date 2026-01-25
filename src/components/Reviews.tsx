import { Star } from 'lucide-react'
import { salonData } from '../data/salonData'

export default function Reviews() {
  return (
    <section className="bg-slate-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className="fill-amber-500 text-amber-500" 
                size={32}
              />
            ))}
          </div>
          
          <blockquote className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed">
            "{salonData.reviews.mainQuote}"
          </blockquote>
          
          <div className="text-amber-500 uppercase tracking-widest text-sm font-semibold">
            {salonData.reviews.rating} Sterne bei {salonData.reviews.count} Google-Rezensionen
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            {salonData.reviews.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-lg">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="fill-amber-500 text-amber-500" size={16}/>
                  ))}
                </div>
                <p className="text-slate-300 italic mb-3">
                  "{testimonial.text}"
                </p>
                <p className="text-slate-400 text-sm">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
