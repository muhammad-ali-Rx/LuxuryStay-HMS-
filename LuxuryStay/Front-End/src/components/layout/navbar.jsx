"use client"

import { motion } from "framer-motion"
import { Menu, LogOut, Bell, Settings } from "lucide-react"

export default function Navbar({ sidebarOpen, setSidebarOpen, onLogout }) {
  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40"
    >
      <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:block p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
        >
          <Menu size={24} className="text-[#0A1F44]" />
        </button>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors relative">
            <Bell size={20} className="text-[#0A1F44]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
            <Settings size={20} className="text-[#0A1F44]" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#0A1F44] text-white rounded-lg hover:bg-[#1a3a5c] transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
