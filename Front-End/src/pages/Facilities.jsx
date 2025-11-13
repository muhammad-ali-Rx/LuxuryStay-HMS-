import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Dumbbell, Waves, Leaf, Wifi, Utensils, Zap, CheckCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              World-Class <span className="text-amber-600">Facilities</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover our premium amenities designed to make your stay extraordinary and memorable
            </p>
          </motion.div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {facilities.map((facility, idx) => {
              const Icon = facility.icon
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-500 h-full flex flex-col">
                    
                    {/* Icon Container */}
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Icon size={28} className="text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-800 mb-4 leading-tight group-hover:text-slate-900 transition-colors">
                      {facility.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed flex-grow">
                      {facility.description}
                    </p>
                    
                    {/* Features List */}
                    <ul className="space-y-3">
                      {facility.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700">
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={14} className="text-amber-600" />
                          </div>
                          <span className="font-medium text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Premium <span className="text-amber-600">Amenities</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Additional services and features to enhance your luxury experience
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
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
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group"
              >
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle size={20} className="text-amber-600" />
                    </div>
                    <span className="text-slate-800 font-medium group-hover:text-slate-900 transition-colors">
                      {amenity}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Luxury?
            </h2>
            <p className="text-slate-300 mb-8 text-lg">
              Book your stay now and immerse yourself in our world-class facilities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center">
                Book Your Stay
                <ArrowRight size={20} />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300">
                View Gallery
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}