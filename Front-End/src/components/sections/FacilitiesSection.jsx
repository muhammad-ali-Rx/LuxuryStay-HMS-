import { Wifi, Utensils, Dumbbell, Waves, Space as Spa, Bell } from "lucide-react"

const facilities = [
  { icon: Wifi, name: "High-Speed WiFi", description: "Complimentary throughout the property" },
  { icon: Utensils, name: "Fine Dining", description: "Award-winning restaurant and bar" },
  { icon: Dumbbell, name: "Fitness Center", description: "State-of-the-art gym equipment" },
  { icon: Waves, name: "Swimming Pool", description: "Olympic-sized heated pool" },
  { icon: Spa, name: "Spa & Wellness", description: "Full-service spa and wellness center" },
  { icon: Bell, name: "Concierge Service", description: "24/7 personalized assistance" },
]

export default function FacilitiesSection() {
  return (
    <section className="py-20 px-4 bg-secondary">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">World-Class Facilities</h2>
          <p className="text-lg text-muted">Experience luxury amenities designed for your comfort</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {facilities.map((facility) => {
            const Icon = facility.icon
            return (
              <div key={facility.name} className="bg-card rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                    <Icon size={32} className="text-accent" />
                  </div>
                </div>
                <h3 className="heading-sm text-lg mb-2">{facility.name}</h3>
                <p className="text-muted text-sm">{facility.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
