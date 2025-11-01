"use client"

import { motion } from "framer-motion"
import { LayoutDashboard, DoorOpen, Calendar, Users, UserCheck, FileText, Settings, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "guests", label: "Guests", icon: Users },
  { id: "staff", label: "Staff", icon: UserCheck },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function AdminSidebar({ activeTab, setActiveTab, isOpen }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/admin-login")
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-[#0A1F44] text-white overflow-hidden transition-all duration-300 flex flex-col shadow-lg`}
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <span className="font-bold text-[#0A1F44]">LS</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">LuxuryStay</h1>
            <p className="text-xs text-white/60">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            whileHover={{ x: 5 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id ? "bg-[#D4AF37] text-[#0A1F44] font-semibold" : "text-white hover:bg-white/10"
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 5 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-red-500/20 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  )
}
