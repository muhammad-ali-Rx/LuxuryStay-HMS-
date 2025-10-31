"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { X } from "lucide-react"

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)

  const galleryImages = [
    { id: 1, title: "Luxury Suite", category: "Rooms", image: "/placeholder.svg?key=suite1" },
    { id: 2, title: "Spa & Wellness", category: "Facilities", image: "/placeholder.svg?key=spa1" },
    { id: 3, title: "Fine Dining", category: "Dining", image: "/placeholder.svg?key=dining1" },
    { id: 4, title: "Ocean View", category: "Views", image: "/placeholder.svg?key=ocean1" },
    { id: 5, title: "Hotel Lobby", category: "Facilities", image: "/placeholder.svg?key=lobby1" },
    { id: 6, title: "Suite Interior", category: "Rooms", image: "/placeholder.svg?key=interior1" },
    { id: 7, title: "Balcony View", category: "Views", image: "/placeholder.svg?key=balcony1" },
    { id: 8, title: "Presidential Suite", category: "Rooms", image: "/placeholder.svg?key=pres1" },
  ]

  const categories = ["All", "Rooms", "Facilities", "Dining", "Views"]
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredImages =
    activeCategory === "All" ? galleryImages : galleryImages.filter((img) => img.category === activeCategory)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">Gallery</h1>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto">Explore the beauty and elegance of LuxuryStay</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 border-b border-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category ? "bg-accent text-white" : "bg-primary/5 text-primary hover:bg-primary/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image.image)}
                className="group relative h-64 rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={image.image || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-4">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-lg font-bold">{image.title}</p>
                    <p className="text-sm text-white/70">{image.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-accent transition-colors"
            >
              <X size={32} />
            </button>
            <img src={selectedImage || "/placeholder.svg"} alt="Gallery" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
