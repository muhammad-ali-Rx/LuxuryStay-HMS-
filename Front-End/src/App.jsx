import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Rooms from "./pages/Rooms"
import RoomDetail from "./pages/RoomDetail"
import Booking from "./pages/Booking"
import Contact from "./pages/Contact"
import Dining from "./pages/Dining"
import Facilities from "./pages/Facilities"
import Gallery from "./pages/Gallery"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminBookings from "./pages/admin/AdminBookings"
import ConfirmationPage from "./pages/BookingConfirmation"


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/BookingConfirmation" element={<ConfirmationPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Routes>
    </Router>
  )
}
