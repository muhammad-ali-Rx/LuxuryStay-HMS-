import DashboardLayout from "../../components/layout/dashboard-layout"
import { useNavigate } from "react-router-dom"

export default function AdminDashboard() {
  const navigate = useNavigate()

  return <DashboardLayout onLogout={() => navigate("/admin-login")} />
}
