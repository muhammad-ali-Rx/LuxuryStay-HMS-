"use client"

import { useState, useEffect } from "react"
import { Wifi, Utensils, Dumbbell, Waves, Sparkles, ConciergeBell, ArrowRight } from "lucide-react"

const facilities = [
  { 
    icon: Wifi, 
    name: "High-Speed WiFi", 
    description: "Complimentary high-speed internet throughout the property",
    features: ["4K Streaming", "Multiple Devices", "24/7 Support"]
  },
  { 
    icon: Utensils, 
    name: "Fine Dining", 
    description: "Award-winning restaurant and bar with world-class cuisine",
    features: ["Master Chefs", "Local Ingredients", "Wine Pairing"]
  },
  { 
    icon: Dumbbell, 
    name: "Fitness Center", 
    description: "State-of-the-art gym with professional equipment",
    features: ["Personal Training", "Yoga Classes", "Modern Equipment"]
  },
  { 
    icon: Waves, 
    name: "Swimming Pool", 
    description: "Olympic-sized heated pool with panoramic views",
    features: ["Heated Pool", "Poolside Service", "Infinity Edge"]
  },
  { 
    icon: Sparkles, 
    name: "Spa & Wellness", 
    description: "Full-service spa and wellness center for complete relaxation",
    features: ["Massage Therapy", "Beauty Treatments", "Wellness Programs"]
  },
  { 
    icon: ConciergeBell, 
    name: "Concierge Service", 
    description: "24/7 personalized assistance for all your needs",
    features: ["Travel Planning", "Event Booking", "Personal Assistant"]
  },
]

export default function FacilitiesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    const section = document.getElementById("facilities-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="facilities-section" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-full shadow-sm transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span className="text-gray-600 font-medium text-sm tracking-widest uppercase">
              Our Amenities
            </span>
          </div>
          
          <h2
            className={`text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            World-Class Facilities
          </h2>
          
          <p
            className={`text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Experience luxury amenities meticulously designed for your ultimate comfort and convenience
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => {
            const Icon = facility.icon
            return (
              <div
                key={facility.name}
                className={`group transform-gpu transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`relative h-full bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-500 ${
                    hoveredCard === index
                      ? "shadow-xl border-amber-200 -translate-y-2"
                      : "shadow-sm hover:shadow-lg hover:border-gray-300"
                  }`}
                >
                  {/* Icon Section */}
                  <div className="relative mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 transition-all duration-500 ${
                        hoveredCard === index
                          ? "scale-110 rotate-3 shadow-lg"
                          : "shadow-md group-hover:shadow-lg"
                      }`}
                    >
                      <Icon
                        className={`w-10 h-10 text-amber-600 transition-all duration-500 ${
                          hoveredCard === index ? "scale-110" : ""
                        }`}
                      />
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 transform scale-0 group-hover:scale-100"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 transform scale-0 group-hover:scale-100"></div>
                  </div>

                  {/* Content Section */}
                  <div className="relative">
                    <h3
                      className={`text-xl font-serif font-bold text-gray-900 mb-3 transition-colors duration-300 ${
                        hoveredCard === index ? "text-amber-700" : ""
                      }`}
                    >
                      {facility.name}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {facility.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {facility.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-500 transition-all duration-300 group-hover:text-gray-700"
                        >
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      className={`flex items-center gap-2 text-sm font-medium text-amber-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 ${
                        hoveredCard === index ? "opacity-100 translate-y-0" : ""
                      }`}
                    >
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Hover Border Effect */}
                  <div
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 ${
                      hoveredCard === index ? "w-3/4" : "group-hover:w-1/2"
                    }`}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-gray-600 mb-8 text-lg">
            Discover all our premium amenities and services
          </p>
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <span>View All Facilities</span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}