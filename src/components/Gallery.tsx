const images = [
  { alt: 'Hairstyle 1', color: 'from-purple-200 to-purple-300' },
  { alt: 'Hairstyle 2', color: 'from-pink-200 to-pink-300' },
  { alt: 'Hairstyle 3', color: 'from-blue-200 to-blue-300' },
  { alt: 'Hairstyle 4', color: 'from-green-200 to-green-300' },
  { alt: 'Hairstyle 5', color: 'from-yellow-200 to-yellow-300' },
  { alt: 'Hairstyle 6', color: 'from-red-200 to-red-300' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Our Work
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Browse through our portfolio of stunning transformations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index}
              className={`aspect-square bg-gradient-to-br ${image.color} rounded-xl hover:scale-105 transition cursor-pointer flex items-center justify-center`}
            >
              <p className="text-slate-700 font-semibold">{image.alt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
