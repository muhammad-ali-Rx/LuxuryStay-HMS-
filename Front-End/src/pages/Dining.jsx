import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Star, Clock, Users } from "lucide-react"

export default function Dining() {
  const restaurants = [
    {
      id: 1,
      name: "Le Prestige",
      cuisine: "French Fine Dining",
      description: "Experience exquisite French cuisine prepared by our Michelin-trained chefs in an elegant setting.",
      image: "/placeholder.svg?key=dining1",
      rating: 4.9,
      hours: "6:00 PM - 11:00 PM",
      capacity: "80 guests",
    },
    {
      id: 2,
      name: "Sakura",
      cuisine: "Japanese Kaiseki",
      description: "Authentic Japanese dining experience with fresh seafood and traditional preparation methods.",
      image: "/placeholder.svg?key=dining2",
      rating: 4.8,
      hours: "5:30 PM - 10:30 PM",
      capacity: "60 guests",
    },
    {
      id: 3,
      name: "Bella Italia",
      cuisine: "Italian Contemporary",
      description: "Modern Italian cuisine featuring handmade pasta and premium imported ingredients.",
      image: "/placeholder.svg?key=dining3",
      rating: 4.7,
      hours: "6:00 PM - 11:00 PM",
      capacity: "100 guests",
    },
    {
      id: 4,
      name: "The Terrace Lounge",
      cuisine: "International Casual",
      description: "Relaxed dining with panoramic views, perfect for lunch, dinner, or cocktails.",
      image: "/placeholder.svg?key=dining4",
      rating: 4.6,
      hours: "11:00 AM - 11:00 PM",
      capacity: "120 guests",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">Culinary Excellence</h1>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto">
            Discover world-class dining experiences crafted by our award-winning chefs
          </p>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={restaurant.image || "/placeholder.svg"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-1">{restaurant.name}</h3>
                      <p className="text-accent font-medium">{restaurant.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
                      <Star size={16} className="text-accent fill-accent" />
                      <span className="text-primary font-semibold">{restaurant.rating}</span>
                    </div>
                  </div>
                  <p className="text-primary/70 mb-4">{restaurant.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-primary/60 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {restaurant.hours}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      {restaurant.capacity}
                    </div>
                  </div>
                  <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Reserve Table
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Special Dining Packages</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Romantic Dinner",
                price: "$150",
                items: ["3-course meal", "Wine pairing", "Dessert & champagne"],
              },
              {
                title: "Business Lunch",
                price: "$85",
                items: ["2-course meal", "Coffee & tea", "Private dining room"],
              },
              {
                title: "Celebration Menu",
                price: "$200",
                items: ["5-course tasting", "Premium wine", "Personalized service"],
              },
            ].map((pkg, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-lg text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">{pkg.title}</h3>
                <p className="text-3xl font-bold text-accent mb-6">{pkg.price}</p>
                <ul className="space-y-3 mb-6">
                  {pkg.items.map((item, i) => (
                    <li key={i} className="text-primary/70">
                      ✓ {item}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-colors">
                  Book Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
