"use client"

import { useState, useEffect, useRef } from "react"
import { Star, Award, Globe, Calendar, Users, Home } from "lucide-react"

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({ years: 0, guests: 0, suites: 0 })
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const animateCount = (target, key, duration = 2000) => {
      let startTimestamp = null
      
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const value = Math.floor(target * easeOutQuart)

        setCounts(prev => ({ ...prev, [key]: value }))

        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }

      requestAnimationFrame(step)
    }

    // Start animations with different delays
    setTimeout(() => animateCount(28, "years", 1800), 300)
    setTimeout(() => animateCount(50000, "guests", 2200), 500)
    setTimeout(() => animateCount(120, "suites", 1600), 700)
  }, [isVisible])

  const features = [
    { 
      icon: Star, 
      title: "World-Class Service", 
      desc: "Personalized attention to every detail" 
    },
    { 
      icon: Award, 
      title: "Award-Winning Design", 
      desc: "Recognized for architectural excellence" 
    },
    { 
      icon: Globe, 
      title: "Global Recognition", 
      desc: "Trusted by travelers worldwide" 
    },
  ]

  const stats = [
    { 
      value: counts.years, 
      label: "Years of Excellence", 
      suffix: "+",
      icon: Calendar
    },
    { 
      value: counts.guests.toLocaleString(), 
      label: "Happy Guests", 
      suffix: "+",
      icon: Users
    },
    { 
      value: counts.suites, 
      label: "Luxury Suites", 
      suffix: "",
      icon: Home
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-60 -z-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-60 -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-100 rounded-full transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span className="text-gray-600 font-medium text-sm tracking-widest uppercase">
              OUR STORY
            </span>
          </div>
          
          <h2
            className={`text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Welcome to LuxuryStay
          </h2>
          
          <p
            className={`text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Where timeless elegance meets modern comfort in the heart of paradise
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Section */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/luxury-hotel-lobby.jpg"
                alt="LuxuryStay Hotel Lobby"
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Established Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Established</p>
                  <p className="text-2xl font-bold text-gray-900">1995</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-8">
              A Legacy of Excellence
            </h3>

            <div className="space-y-6 mb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                For nearly three decades, LuxuryStay has been the epitome of sophistication and hospitality. Our journey
                began with a simple vision: to create a sanctuary where every guest feels like royalty.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                From our meticulously curated suites to our award-winning dining experiences, every element is designed to
                exceed expectations. We don't just provide accommodation—we create memories that last a lifetime.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                        {feature.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div 
                key={idx} 
                className="group text-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-600 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <div className="text-4xl font-bold text-gray-900 mb-3">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div
          className={`mt-20 text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <p className="text-gray-600 mb-8 text-lg">
            Ready to experience luxury like never before?
          </p>
          <a
            href="/rooms"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <span>Explore Our Suites</span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
} 