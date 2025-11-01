"use client"

import { motion } from "framer-motion"
import { Menu, Bell, User, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function AdminHeader({ onLogout, onMenuToggle }) {
  const { adminUser } = useAuth()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={24} className="text-[#0A1F44]" />
        </button>

        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-[#0A1F44]">Welcome back!</h2>
          <p className="text-sm text-gray-600">Manage your hotel operations</p>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell size={24} className="text-[#0A1F44]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#0A1F44]">{adminUser?.name}</p>
              <p className="text-xs text-gray-600">{adminUser?.role}</p>
            </div>
            <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <User size={20} className="text-[#0A1F44]" />
            </div>
          </div>

          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
