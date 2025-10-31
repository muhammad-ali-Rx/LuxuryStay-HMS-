import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Dumbbell, Waves, Leaf, Wifi, Utensils, Zap } from "lucide-react"

export default function Facilities() {
  const facilities = [
    {
      icon: Dumbbell,
      title: "State-of-the-Art Fitness Center",
      description: "Fully equipped gym with personal trainers, yoga studio, and modern equipment.",
      features: ["24/7 Access", "Personal Training", "Group Classes", "Sauna & Steam Room"],
    },
    {
      icon: Waves,
      title: "Olympic-Size Swimming Pool",
      description: "Heated indoor and outdoor pools with professional lifeguards and aqua therapy.",
      features: ["Indoor Pool", "Outdoor Pool", "Jacuzzi", "Aqua Aerobics"],
    },
    {
      icon: Leaf,
      title: "Luxury Spa & Wellness",
      description: "Rejuvenate with our world-class spa treatments and wellness programs.",
      features: ["Massage Therapy", "Facials", "Body Treatments", "Meditation Room"],
    },
    {
      icon: Wifi,
      title: "Business Center",
      description: "Fully equipped with high-speed internet, meeting rooms, and conference facilities.",
      features: ["High-Speed WiFi", "Meeting Rooms", "Printing Services", "Video Conferencing"],
    },
    {
      icon: Utensils,
      title: "Multiple Dining Venues",
      description: "From casual to fine dining, experience culinary excellence across our restaurants.",
      features: ["4 Restaurants", "Room Service", "Bar & Lounge", "Café"],
    },
    {
      icon: Zap,
      title: "Entertainment & Recreation",
      description: "Enjoy live performances, gaming lounge, and recreational activities.",
      features: ["Live Music", "Gaming Lounge", "Movie Theater", "Kids Club"],
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">World-Class Facilities</h1>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto">Everything you need for an unforgettable stay</p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, idx) => {
              const Icon = facility.icon
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all">
                    <Icon size={32} className="text-accent group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">{facility.title}</h3>
                  <p className="text-primary/70 mb-4">{facility.description}</p>
                  <ul className="space-y-2">
                    {facility.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-primary/60">
                        <span className="w-2 h-2 bg-accent rounded-full" />
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

      {/* Amenities Highlight */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Premium Amenities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "24/7 Concierge Service",
              "Free High-Speed WiFi",
              "Airport Transfers",
              "Valet Parking",
              "Room Service",
              "Housekeeping",
              "Laundry Service",
              "Pet-Friendly Rooms",
            ].map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white/10 rounded-lg">
                <span className="text-accent text-xl">✓</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
