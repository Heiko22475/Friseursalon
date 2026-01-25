import { Award, Heart, Star } from 'lucide-react'
import { salonData } from '../data/salonData'

export default function About() {
  return (
    <section id="about" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                {salonData.about.headline}
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                {salonData.about.text1}
              </p>
              <p className="text-lg text-slate-600 mb-8">
                {salonData.about.text2}
              </p>

              <div className="space-y-4">
                {[Award, Heart, Star].map((Icon, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl mb-1">{salonData.about.highlights[index].title}</h3>
                      <p className="text-slate-600">{salonData.about.highlights[index].description}</p>
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
                <p className="text-4xl font-bold mb-1">{salonData.reviews.rating}★</p>
                <p className="text-slate-200">Google Bewertung</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
