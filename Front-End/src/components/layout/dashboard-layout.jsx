"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Sidebar from "./sidebar"
import Navbar from "./navbar"
import Dashboard from "../pages/dashboard"
import RoomsPage from "../pages/rooms-page"
import BookingsPage from "../pages/bookings-page"
import StaffPage from "../pages/staff-page"
import GuestsPage from "../pages/guests-page"
import ReportsPage from "../pages/reports-page"
import FeedbackPage from "../pages/feedback-page"
import SettingsPage from "../pages/settings-page"

export default function DashboardLayout({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />
      case "rooms":
        return <RoomsPage />
      case "bookings":
        return <BookingsPage />
      case "staff":
        return <StaffPage />
      case "guests":
        return <GuestsPage />
      case "reports":
        return <ReportsPage />
      case "feedback":
        return <FeedbackPage />
      case "settings":
        return <SettingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout} />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 lg:p-8 mb-20 md:mb-0"
        >
          {renderPage()}
        </motion.main>
      </div>
    </div>
  )
}
