"use client"

import { motion } from "framer-motion"
import { Save, User, Globe } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    hotelName: "LuxuryStay Hotel",
    email: "admin@luxurystay.com",
    phone: "+1 (555) 123-4567",
    timezone: "EST",
    currency: "USD",
  })

  const settingsSections = [
    {
      title: "Profile Settings",
      icon: User,
      fields: ["hotelName", "email", "phone"],
    },
    {
      title: "System Settings",
      icon: Globe,
      fields: ["timezone", "currency"],
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-[#0A1F44]">Settings</h2>

      <div className="space-y-6">
        {settingsSections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <section.icon size={24} className="text-[#D4AF37]" />
              <h3 className="text-xl font-bold text-[#0A1F44]">{section.title}</h3>
            </div>

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    value={settings[field]}
                    onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F44] px-8 py-3 rounded-lg font-semibold hover:shadow-lg"
      >
        <Save size={20} />
        Save Settings
      </motion.button>
    </div>
  )
}
