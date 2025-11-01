"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react"

const guestsData = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 (555) 123-4567", country: "USA", visits: 3 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+44 (20) 1234-5678", country: "UK", visits: 1 },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1 (555) 987-6543", country: "Canada", visits: 2 },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+33 (1) 2345-6789",
    country: "France",
    visits: 5,
  },
]

export default function GuestsManagement() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-[#0A1F44]">Guests Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guestsData.map((guest, idx) => (
          <motion.div
            key={guest.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0A1F44]">{guest.name}</h3>
                <p className="text-sm text-gray-600">Guest ID: #{guest.id}</p>
              </div>
              <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <span className="text-[#0A1F44] font-bold text-lg">{guest.name.charAt(0)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail size={18} className="text-[#D4AF37]" />
                <span className="text-sm">{guest.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={18} className="text-[#D4AF37]" />
                <span className="text-sm">{guest.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={18} className="text-[#D4AF37]" />
                <span className="text-sm">{guest.country}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">
                Total Visits: <span className="font-bold text-[#0A1F44]">{guest.visits}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit size={18} />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={18} />
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
