"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, Badge, Edit, Trash2, Plus, X, Save } from "lucide-react"

const API_BASE_URL = "http://localhost:3000" // Updated to match Express server port and removed /api prefix

export default function StaffManagement() {
  const [staffData, setStaffData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "Active",
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/`) // Updated endpoint
      if (!response.ok) throw new Error("Failed to fetch staff")

      const data = await response.json()
      console.log("[v0] Fetched users:", data)

      // Filter only staff members with roles: admin, manager, receptionist, housekeeping
      const staffRoles = ["admin", "manager", "receptionist", "housekeeping"]
      const filteredStaff = data.users?.filter((user) => staffRoles.includes(user.role?.toLowerCase())) || []

      setStaffData(filteredStaff)
      setError(null)
    } catch (err) {
      setError("Failed to fetch staff members")
      console.error("[v0] Error fetching staff:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (selectedStaff) {
      try {
        const staffId = selectedStaff._id || selectedStaff.id
        console.log("[v0] Updating status for staff ID:", staffId, "New status:", newStatus)

        const response = await fetch(`${API_BASE_URL}/update/${staffId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })

        console.log("[v0] Status update response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
          console.error("[v0] Status update error response:", errorData)
          throw new Error(errorData.message || `Failed to update status (${response.status})`)
        }

        const updatedStaff = await response.json()
        console.log("[v0] Status updated successfully:", updatedStaff)

        setStaffData(
          staffData.map((staff) => ((staff._id || staff.id) === staffId ? { ...staff, status: newStatus } : staff)),
        )
        setSelectedStaff({ ...selectedStaff, status: newStatus })
        setShowStatusModal(false)
        setError(null)
      } catch (err) {
        console.error("[v0] Status update error:", err.message)
        setError(err.message || "Failed to update status")
      }
    }
  }

  const handleEditSubmit = async () => {
    try {
      const staffId = selectedStaff._id || selectedStaff.id
      console.log("[v0] Updating staff member:", staffId, editFormData)

      const response = await fetch(`${API_BASE_URL}/update/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      })

      console.log("[v0] Edit response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.error("[v0] Edit error response:", errorData)
        throw new Error(errorData.message || `Failed to update staff (${response.status})`)
      }

      const updatedStaff = await response.json()
      setStaffData(
        staffData.map((staff) => ((staff._id || staff.id) === staffId ? { ...staff, ...editFormData } : staff)),
      )
      setShowEditModal(false)
      setSelectedStaff(null)
      setError(null)
    } catch (err) {
      console.error("[v0] Edit error:", err.message)
      setError(err.message || "Failed to update staff member")
    }
  }

  const handleDelete = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete/${staffId}`, {
          // Updated endpoint to /delete/:id
          method: "DELETE",
        })

        if (!response.ok) throw new Error("Failed to delete staff member")

        setStaffData(staffData.filter((staff) => (staff._id || staff.id) !== staffId))
      } catch (err) {
        setError("Failed to delete staff member")
        console.error("[v0] Delete error:", err)
      }
    }
  }

  const handleAddStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        // Updated endpoint to /register for adding new staff
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          password: "default123",
        }),
      })

      if (!response.ok) throw new Error("Failed to add staff member")

      const newStaff = await response.json()
      setStaffData([...staffData, newStaff.user || newStaff])
      setShowAddModal(false)
      setEditFormData({ name: "", email: "", phone: "", role: "", status: "Active" })
    } catch (err) {
      setError("Failed to add staff member")
      console.error("[v0] Add error:", err)
    }
  }

  const openEditModal = (staff) => {
    setSelectedStaff(staff)
    setEditFormData({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      role: staff.role || "",
      status: staff.status || "Active",
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status) => {
    return status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading staff members...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0A1F44]">Staff Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setEditFormData({ name: "", email: "", phone: "", role: "", status: "Active" })
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500"
        >
          <Plus size={20} />
          Add Staff
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staffData.map((staff, idx) => (
          <motion.div
            key={staff._id || staff.id}
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
                  <span className="text-sm font-semibold text-[#D4AF37] capitalize">{staff.role}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(staff.status)}`}>
                {staff.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-700">
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
                onClick={() => openEditModal(staff)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                <Edit size={18} />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedStaff(staff)
                  setShowStatusModal(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
              >
                <Badge size={18} />
                Status
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleDelete(staff._id || staff.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                <Trash2 size={18} />
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Modal */}
      {showStatusModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-[#0A1F44] mb-2">Change Staff Status</h2>
            <p className="text-gray-600 mb-6">
              Updating status for <strong className="text-[#0A1F44]">{selectedStaff.name}</strong>
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleStatusChange("Active")}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  selectedStaff.status === "Active"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ✓ Active
              </button>
              <button
                onClick={() => handleStatusChange("Inactive")}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  selectedStaff.status === "Inactive"
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ✗ Inactive
              </button>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0A1F44]">Edit Staff Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#D4AF37] text-[#0A1F44] rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                <Save size={18} />
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0A1F44]">Add New Staff Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#D4AF37] text-[#0A1F44] rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
