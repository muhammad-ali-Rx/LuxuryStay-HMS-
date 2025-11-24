import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AdminSidebar from "../../components/admin/AdminSidebar"
import AdminHeader from "../../components/admin/AdminHeader"
import AdminDashboard from "../../components/admin/AdminDashboard"
import RoomsManagement from "../../components/admin/RoomsManagement"
import BookingsManagement from "../../components/admin/BookingsManagement"
import GuestsManagement from "../../components/admin/GuestsManagement"
import StaffManagement from "../../components/admin/StaffManagement"
import ReportsPage from "../../components/admin/ReportsPage"
import SettingsPage from "../../components/admin/SettingsPage"
import RestaurantsManagement from "../../components/admin/RestaurantsManagement"
import BillingPayments from "../../components/admin/BillingPayments"
import TasksManagement from "../../components/admin/TasksManagement"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    navigate("/admin-login")
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/admin-login")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />
      case "rooms":
        return <RoomsManagement />
      case "dining":
        return <RestaurantsManagement />
      case "bookings":
        return <BookingsManagement />
        case "tasks":
          return <TasksManagement />
      case "guests":
        return <GuestsManagement />
      case "staff":
        return <StaffManagement />
      case "Biling":
        return <BillingPayments/>
      case "reports":
        return <ReportsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5]">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onLogout={handleLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  )
}
