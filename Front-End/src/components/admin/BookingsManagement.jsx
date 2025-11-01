"use client"

import { motion } from "framer-motion"
import { Eye, CheckCircle, XCircle } from "lucide-react"

const bookingsData = [
  {
    id: 1,
    guestName: "John Doe",
    room: "101",
    checkIn: "2024-11-05",
    checkOut: "2024-11-08",
    status: "Confirmed",
    amount: "$360",
  },
  {
    id: 2,
    guestName: "Jane Smith",
    room: "201",
    checkIn: "2024-11-10",
    checkOut: "2024-11-15",
    status: "Pending",
    amount: "$1,400",
  },
  {
    id: 3,
    guestName: "Mike Johnson",
    room: "301",
    checkIn: "2024-11-02",
    checkOut: "2024-11-05",
    status: "Checked Out",
    amount: "$1,350",
  },
  {
    id: 4,
    guestName: "Sarah Williams",
    room: "102",
    checkIn: "2024-11-06",
    checkOut: "2024-11-09",
    status: "Confirmed",
    amount: "$540",
  },
]

export default function BookingsManagement() {
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Checked Out":
        return "bg-gray-100 text-gray-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-[#0A1F44]">Bookings Management</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="bg-[#0A1F44] text-white">
              <th className="px-6 py-4 text-left font-semibold">Guest Name</th>
              <th className="px-6 py-4 text-left font-semibold">Room</th>
              <th className="px-6 py-4 text-left font-semibold">Check-In</th>
              <th className="px-6 py-4 text-left font-semibold">Check-Out</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Amount</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingsData.map((booking, idx) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-[#0A1F44]">{booking.guestName}</td>
                <td className="px-6 py-4 text-gray-700">{booking.room}</td>
                <td className="px-6 py-4 text-gray-700">{booking.checkIn}</td>
                <td className="px-6 py-4 text-gray-700">{booking.checkOut}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-[#D4AF37]">{booking.amount}</td>
                <td className="px-6 py-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                  >
                    <Eye size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                  >
                    <CheckCircle size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  >
                    <XCircle size={18} />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
