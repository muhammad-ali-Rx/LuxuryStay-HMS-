"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Edit, Trash2, Plus, X, ChevronRight } from "lucide-react";

const API_BASE_URL = "http://localhost:3000"; // Updated to match Express server port and removed /api prefix

export default function StaffManagement() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    verified: false,
    shift: "flexible",
    salary: "",
    password: "", // Only used when adding new staff
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`); // Updated endpoint
      if (!response.ok) throw new Error("Failed to fetch staff");

      const data = await response.json();
      // console.log("[v0] Fetched users:", data)

      // Filter only staff members with roles: admin, manager, receptionist, housekeeping
      const staffRoles = ["admin", "manager", "receptionist", "housekeeping"];
      const filteredStaff =
        data.users?.filter((user) =>
          staffRoles.includes(user.role?.toLowerCase())
        ) || [];

      setStaffData(filteredStaff);
      setError(null);
    } catch (err) {
      setError("Failed to fetch staff members");
      console.error("[v0] Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: staffData.length,
    admins: staffData.filter((s) => s.role?.toLowerCase() === "admin").length,
    managers: staffData.filter((s) => s.role?.toLowerCase() === "manager")
      .length,
    receptionists: staffData.filter(
      (s) => s.role?.toLowerCase() === "receptionist"
    ).length,
    housekeeping: staffData.filter(
      (s) => s.role?.toLowerCase() === "housekeeping"
    ).length,
    active: staffData.filter((s) => s.status === "active").length,
    verified: staffData.filter((s) => s.verified).length,
    morningShift: staffData.filter((s) => s.shift === "morning").length,
    afternoonShift: staffData.filter((s) => s.shift === "afternoon").length,
    nightShift: staffData.filter((s) => s.shift === "night").length,
    flexibleShift: staffData.filter((s) => s.shift === "flexible").length,
  };

  // Removed handleStatusChange as it's not used in the updated code.

  const handleEditSubmit = async () => {
    try {
      const staffId = selectedStaff._id || selectedStaff.id;

      // build payload but exclude password if empty
      const payload = { ...editFormData };
      if (!payload.password) {
        // remove password so backend doesn't overwrite with empty string
        delete payload.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/update/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          errorData.message || `Failed to update staff (${response.status})`
        );
      }

      // Update local state: avoid storing password in client-side list
      const updatedFields = { ...editFormData };
      delete updatedFields.password; // don't keep password in client state for security

      setStaffData(
        staffData.map((staff) =>
          (staff._id || staff.id) === staffId
            ? { ...staff, ...updatedFields }
            : staff
        )
      );
      setShowEditModal(false);
      if (selectedStaff) {
        setSelectedStaff({ ...selectedStaff, ...updatedFields });
      }
      setSuccessMessage("Staff updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setError(null);
    } catch (err) {
      console.error("[v0] Edit error:", err.message);
      setError(err.message || "Failed to update staff member");
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete/${staffId}`, {
          // Updated endpoint to /delete/:id
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete staff member");

        setStaffData(
          staffData.filter((staff) => (staff._id || staff.id) !== staffId)
        );
        setShowDetailView(false); // Close detail view if open
        setSelectedStaff(null); // Clear selected staff
        setSuccessMessage("Staff deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError("Failed to delete staff member");
        console.error("[v0] Delete error:", err);
      }
    }
  };

  const handleAddStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          status: editFormData.status === "active" ? "Active" : "Inactive",
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("[v0] Add error response:", errorData);
        throw new Error(
          errorData.message || `Failed to add staff member (${response.status})`
        );
      }

      const newStaff = await response.json();
      setStaffData([...staffData, newStaff.user || newStaff]);
      setShowAddModal(false);
      setEditFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        status: "active",
        verified: false,
        shift: "flexible",
        salary: "",
        password: "",
      });
      setSuccessMessage("Staff account created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setError(null);
    } catch (err) {
      console.error("[v0] Add error:", err.message);
      setError(err.message || "Failed to add staff member");
    }
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setEditFormData({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      role: staff.role || "",
      status: staff.status || "active",
      verified: staff.verified || false,
      shift: staff.shift || "flexible",
      salary: staff.salary || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const getAvatarInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-teal-100 text-teal-700"
      : "bg-red-100 text-red-700";
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      receptionist: "bg-green-100 text-green-700",
      housekeeping: "bg-orange-100 text-orange-700",
    };
    return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading staff members...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-teal-100 border border-teal-400 text-teal-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6"
        >
          <span>✓</span>
          {successMessage}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-teal-700 mb-6">
          Staff Management
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-teal-500"
          >
            <p className="text-gray-600 text-sm font-medium">Total Staff</p>
            <p className="text-2xl font-bold text-teal-700 mt-2">
              {stats.total}
            </p>
            <div className="h-1 bg-teal-200 rounded-full mt-3"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500"
          >
            <p className="text-gray-600 text-sm font-medium">Admins</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">
              {stats.admins}
            </p>
            <div className="h-1 bg-purple-200 rounded-full mt-3"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500"
          >
            <p className="text-gray-600 text-sm font-medium">Managers</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {stats.managers}
            </p>
            <div className="h-1 bg-blue-200 rounded-full mt-3"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500"
          >
            <p className="text-gray-600 text-sm font-medium">Receptionists</p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {stats.receptionists}
            </p>
            <div className="h-1 bg-green-200 rounded-full mt-3"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500"
          >
            <p className="text-gray-600 text-sm font-medium">Housekeeping</p>
            <p className="text-2xl font-bold text-orange-700 mt-2">
              {stats.housekeeping}
            </p>
            <div className="h-1 bg-orange-200 rounded-full mt-3"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-teal-500"
          >
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-2xl font-bold text-teal-700 mt-2">
              {stats.active}
            </p>
            <div className="h-1 bg-teal-200 rounded-full mt-3"></div>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-teal-500"
          >
            <p className="text-gray-600 text-sm font-medium">Verifed</p>
            <p className="text-2xl font-bold text-teal-700 mt-2">
              {stats.verified}
            </p>
            <div className="h-1 bg-teal-200 rounded-full mt-3"></div>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Staff List</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setEditFormData({
              name: "",
              email: "",
              phone: "",
              role: "",
              status: "active",
              verified: false,
              shift: "flexible",
              salary: "",
              password: "",
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          Add Staff
        </motion.button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staffData.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No staff members found
                  </td>
                </tr>
              ) : (
                staffData.map((staff, idx) => (
                  <tr
                    key={staff._id || staff.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                          {getAvatarInitials(staff.name)}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {staff.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {staff.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                          staff.role
                        )}`}
                      >
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          staff.status
                        )}`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedStaff(staff);
                          setShowDetailView(true);
                        }}
                        className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 text-sm"
                      >
                        More
                        <ChevronRight size={16} />
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailView && selectedStaff && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Detail Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-6 flex justify-between items-start">
              <div className="flex gap-4 items-start flex-1">
                <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-2xl font-bold">
                  {getAvatarInitials(selectedStaff.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStaff.name}</h2>
                  <span className="text-teal-100 text-sm capitalize">
                    {selectedStaff.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailView(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {/* Contact Section */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail size={18} className="text-teal-600" />
                  Contact
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      EMAIL
                    </p>
                    <p className="text-gray-800">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      PHONE
                    </p>
                    <p className="text-gray-800">
                      {selectedStaff.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employment Section */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Employment
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      ROLE
                    </p>
                    <p className="text-gray-800 capitalize font-semibold">
                      {selectedStaff.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      VERIFIED
                    </p>
                    <p className="text-gray-800">
                      {selectedStaff.verified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      JOINED
                    </p>
                    <p className="text-gray-800">
                      {selectedStaff.joiningDate
                        ? new Date(
                            selectedStaff.joiningDate
                          ).toLocaleDateString()
                        : "YES"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      CURRENT STATUS
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedStaff.status
                      )}`}
                    >
                      {selectedStaff.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      MEMBER SINCE
                    </p>
                    <p className="text-gray-800">
                      {selectedStaff.createdAt
                        ? new Date(selectedStaff.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">
                      Shift
                    </p>
                    <p className="text-gray-800">{selectedStaff.shift}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    openEditModal(selectedStaff);
                    setShowDetailView(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  <Edit size={18} />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    handleDelete(selectedStaff._id || selectedStaff.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">Edit Staff</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter email"
                />
              </div>
              {/* Password (Edit) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="New Password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Shift
                </label>
                <select
                  value={editFormData.shift}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, shift: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Salary
                </label>
                <input
                  type="number"
                  value={editFormData.salary}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, salary: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter salary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFormData.verified}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      verified: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded accent-teal-500"
                />
                <span className="text-sm font-medium text-gray-800">
                  Verified Staff Member
                </span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">
                Add New Staff
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Shift
                </label>
                <select
                  value={editFormData.shift}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, shift: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Salary
                </label>
                <input
                  type="number"
                  value={editFormData.salary}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, salary: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                  placeholder="Enter salary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFormData.verified}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      verified: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded accent-teal-500"
                />
                <span className="text-sm font-medium text-gray-800">
                  Verified Staff Member
                </span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleAddStaff}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                Add Staff
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
