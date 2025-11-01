"use client"

import { motion } from "framer-motion"
import { Edit, Trash2, Plus, Eye } from "lucide-react"
import { useState } from "react"

const roomsData = [
  { id: 1, number: "101", type: "Standard", status: "Available", price: "$120", floor: "1" },
  { id: 2, number: "102", type: "Deluxe", status: "Occupied", price: "$180", floor: "1" },
  { id: 3, number: "201", type: "Suite", status: "Available", price: "$280", floor: "2" },
  { id: 4, number: "202", type: "Standard", status: "Maintenance", price: "$120", floor: "2" },
  { id: 5, number: "301", type: "Presidential", status: "Available", price: "$450", floor: "3" },
]

export default function RoomsManagement() {
  const [rooms, setRooms] = useState(roomsData)

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Occupied":
        return "bg-blue-100 text-blue-800"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0A1F44]">Rooms Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          Add Room
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="bg-[#0A1F44] text-white">
              <th className="px-6 py-4 text-left font-semibold">Room No.</th>
              <th className="px-6 py-4 text-left font-semibold">Type</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Price</th>
              <th className="px-6 py-4 text-left font-semibold">Floor</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, idx) => (
              <motion.tr
                key={room.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-[#0A1F44]">{room.number}</td>
                <td className="px-6 py-4 text-gray-700">{room.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-[#D4AF37]">{room.price}</td>
                <td className="px-6 py-4 text-gray-700">{room.floor}</td>
                <td className="px-6 py-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                  >
                    <Eye size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                  >
                    <Edit size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 size={18} />
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
