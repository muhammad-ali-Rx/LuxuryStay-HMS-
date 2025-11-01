"use client"

import { motion } from "framer-motion"
import { Mail, Phone, Badge, Edit, Trash2, Plus } from "lucide-react"

const staffData = [
  {
    id: 1,
    name: "Robert Brown",
    role: "Manager",
    email: "robert@hotel.com",
    phone: "+1 (555) 111-2222",
    department: "Management",
    status: "Active",
  },
  {
    id: 2,
    name: "Emily Davis",
    role: "Receptionist",
    email: "emily@hotel.com",
    phone: "+1 (555) 222-3333",
    department: "Front Desk",
    status: "Active",
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Chef",
    email: "james@hotel.com",
    phone: "+1 (555) 333-4444",
    department: "Kitchen",
    status: "Active",
  },
  {
    id: 4,
    name: "Lisa Anderson",
    role: "Housekeeper",
    email: "lisa@hotel.com",
    phone: "+1 (555) 444-5555",
    department: "Housekeeping",
    status: "On Leave",
  },
]

export default function StaffManagement() {
  const getStatusColor = (status) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0A1F44]">Staff Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold"
        >
          <Plus size={20} />
          Add Staff
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staffData.map((staff, idx) => (
          <motion.div
            key={staff.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">{staff.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge size={16} className="text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#D4AF37]">{staff.role}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(staff.status)}`}>
                {staff.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-700">
              <p>
                <strong>Department:</strong> {staff.department}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-[#D4AF37]" /> {staff.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-[#D4AF37]" /> {staff.phone}
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                <Edit size={18} />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                <Trash2 size={18} />
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
