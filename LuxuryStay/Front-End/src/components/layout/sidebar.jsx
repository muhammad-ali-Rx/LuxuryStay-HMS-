"use client"

import { motion } from "framer-motion"
import {
  LayoutGrid,
  Book as Door,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "rooms", label: "Rooms", icon: Door },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "staff", label: "Staff", icon: Users },
  { id: "guests", label: "Guests", icon: UserCheck },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }) {
  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex flex-col bg-[#0A1F44] text-white sticky top-0 h-screen border-r border-[#1a3a5c] overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          {isOpen && <span className="text-xl font-bold text-[#D4AF37]">LuxuryStay</span>}
          <button onClick={() => setIsOpen(!isOpen)} className="hover:bg-[#1a3a5c] p-2 rounded-lg transition-colors">
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#D4AF37] text-[#0A1F44] font-semibold"
                    : "text-white/70 hover:text-white hover:bg-[#1a3a5c]"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="text-sm">{item.label}</span>}
              </motion.button>
            )
          })}
        </nav>

        {isOpen && (
          <div className="p-4 border-t border-[#1a3a5c]">
            <p className="text-xs text-white/50 text-center">© 2025 LuxuryStay</p>
          </div>
        )}
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A1F44] border-t border-[#1a3a5c] z-50">
        <nav className="flex overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs transition-colors ${
                  isActive ? "text-[#D4AF37] font-semibold" : "text-white/60"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
