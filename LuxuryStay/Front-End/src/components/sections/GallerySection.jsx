"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

const galleryImages = [
  { id: 1, title: "Luxury Suite", image: "/luxury-suite-interior.jpg" },
  { id: 2, title: "Ocean View", image: "/ocean-view-balcony.jpg" },
  { id: 3, title: "Fine Dining", image: "/fine-dining-restaurant.jpg" },
  { id: 4, title: "Spa Center", image: "/luxury-spa-center.jpg" },
  { id: 5, title: "Swimming Pool", image: "/resort-swimming-pool.jpg" },
  { id: 6, title: "Lobby", image: "/luxury-hotel-lobby.jpg" },
]

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length)
    setSelectedImage(galleryImages[(currentIndex + 1) % galleryImages.length])
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    setSelectedImage(galleryImages[(currentIndex - 1 + galleryImages.length) % galleryImages.length])
  }

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">Gallery</h2>
          <p className="text-lg text-muted">Explore the beauty of our property</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => {
                setSelectedImage(image)
                setCurrentIndex(index)
              }}
              className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
            >
              <img
                src={image.image || "/placeholder.svg"}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <p className="text-white font-semibold text-lg">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <img
              src={selectedImage.image || "/placeholder.svg"}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg"
            />

            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mt-4">
              <p className="text-white text-lg font-semibold">{selectedImage.title}</p>
              <p className="text-white/60 text-sm">
                {currentIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
