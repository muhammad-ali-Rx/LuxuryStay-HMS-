"use client"

import { useState, useEffect } from "react"

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({ years: 0, guests: 0, suites: 0 })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const section = document.getElementById("about-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const animateCount = (target, key, duration = 2000) => {
      const start = 0
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const value = Math.floor(start + (target - start) * progress)

        setCounts((prev) => ({ ...prev, [key]: value }))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }

    animateCount(28, "years", 2000)
    animateCount(50000, "guests", 2500)
    animateCount(6, "suites", 1800)
  }, [isVisible])

  return (
    <section
      id="about-section"
      className="py-24 px-4 bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div
            className={`inline-block mb-4 px-4 py-2 bg-accent/10 rounded-full transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            <span className="text-accent font-semibold text-sm">OUR STORY</span>
          </div>
          <h2
            className={`heading-lg mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Welcome to LuxuryStay
          </h2>
          <p
            className={`text-xl text-muted max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            Where timeless elegance meets modern comfort in the heart of paradise
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div
            className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <div className="relative rounded-2xl overflow-hidden luxury-shadow group">
              <img
                src="/luxury-hotel-lobby.jpg"
                alt="LuxuryStay Hotel Lobby"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 luxury-shadow max-w-xs">
              <p className="text-sm text-muted mb-2">Established</p>
              <p className="text-3xl font-bold text-primary">1995</p>
            </div>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            <h3 className="text-3xl font-bold text-primary mb-6">A Legacy of Excellence</h3>

            <p className="text-lg text-muted mb-6 leading-relaxed">
              For nearly three decades, LuxuryStay has been the epitome of sophistication and hospitality. Our journey
              began with a simple vision: to create a sanctuary where every guest feels like royalty.
            </p>

            <p className="text-lg text-muted mb-8 leading-relaxed">
              From our meticulously curated suites to our award-winning dining experiences, every element is designed to
              exceed expectations. We don't just provide accommodation—we create memories.
            </p>

            <div className="space-y-4">
              {[
                { icon: "✨", title: "World-Class Service", desc: "Personalized attention to every detail" },
                { icon: "🏆", title: "Award-Winning Design", desc: "Recognized for architectural excellence" },
                { icon: "🌍", title: "Global Recognition", desc: "Trusted by travelers worldwide" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 rounded-lg bg-white/50 hover:bg-white transition-colors duration-300 group cursor-pointer"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="font-semibold text-primary group-hover:text-accent transition-colors">
                      {feature.title}
                    </p>
                    <p className="text-sm text-muted">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`grid md:grid-cols-3 gap-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {[
            { value: counts.years, label: "Years of Excellence", suffix: "+" },
            { value: counts.guests, label: "Happy Guests", suffix: "+" },
            { value: counts.suites, label: "Luxury Suites", suffix: "" },
          ].map((stat, idx) => (
            <div key={idx} className="group">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl font-bold text-accent mb-3">
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <p className="text-muted font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`mt-16 text-center transition-all duration-700 delay-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <p className="text-muted mb-6">Ready to experience luxury like never before?</p>
          <a
            href="/rooms"
            className="inline-block px-8 py-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Explore Our Suites
          </a>
        </div>
      </div>
    </section>
  )
}
