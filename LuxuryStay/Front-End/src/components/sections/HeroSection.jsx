"use client"

import { Link } from "react-router-dom"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "/luxury-hotel-suite.jpg",
      title: "Experience the Art of Timeless Luxury",
      subtitle: "Discover unparalleled elegance and world-class hospitality at LuxuryStay",
    },
    {
      image: "/luxury-spa-resort.jpg",
      title: "Indulge in World-Class Wellness",
      subtitle: "Rejuvenate your mind and body with our premium spa and wellness facilities",
    },
    {
      image: "/luxury-dining-restaurant.jpg",
      title: "Culinary Excellence Awaits",
      subtitle: "Savor exquisite cuisine crafted by our award-winning chefs",
    },
    {
      image: "/luxury-ocean-view.jpg",
      title: "Breathtaking Views & Serenity",
      subtitle: "Wake up to stunning vistas and unparalleled tranquility",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative w-full h-screen bg-gradient-to-br from-primary via-primary to-blue-900 overflow-hidden pt-20">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-40" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h1 className="heading-xl text-white">{slides[currentSlide].title}</h1>
          <p className="text-xl text-white/80 font-light">{slides[currentSlide].subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/booking" className="btn-accent inline-flex items-center justify-center gap-2">
              Book Your Stay Now
              <ChevronRight size={20} />
            </Link>
            <Link
              to="/rooms"
              className="px-8 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-primary transition-all duration-300"
            >
              Explore Rooms
            </Link>
          </div>
        </div>
      </div>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-accent w-8" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-accent rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-accent rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
