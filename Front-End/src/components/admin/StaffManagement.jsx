"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Edit, Trash2, Plus, X, ChevronRight, Users, UserCheck, Shield, Home } from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

export default function StaffManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("staff");

  const [editFormData, setEditFormData] = useState({
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

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      console.log("[v0] Fetched all users response:", data);

      let users = [];
      if (data.data && data.data.users) {
        users = data.data.users;
      } else if (data.users) {
        users = data.users;
      } else {
        users = data;
      }

      setAllUsers(users);
      
      const staffRoles = ["admin", "manager", "receptionist", "housekeeping"];
      const filteredStaff = users.filter((user) =>
        staffRoles.includes(user.role?.toLowerCase())
      );
      
      setStaffData(filteredStaff);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("[v0] Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalUsers: allUsers.length,
    totalStaff: staffData.length,
    regularUsers: allUsers.filter(user => 
      ["user", "guest"].includes(user.role?.toLowerCase())
    ).length,
    admins: staffData.filter((s) => s.role?.toLowerCase() === "admin").length,
    managers: staffData.filter((s) => s.role?.toLowerCase() === "manager").length,
    receptionists: staffData.filter((s) => s.role?.toLowerCase() === "receptionist").length,
    housekeeping: staffData.filter((s) => s.role?.toLowerCase() === "housekeeping").length,
    active: allUsers.filter((s) => s.status === "active").length,
    verified: allUsers.filter((s) => s.verified).length,
  };

  const getCurrentData = () => {
    if (activeTab === "all") return allUsers;
    if (activeTab === "regular") return allUsers.filter(user => 
      ["user", "guest"].includes(user.role?.toLowerCase())
    );
    return staffData;
  };

  const handleEditSubmit = async () => {
    try {
      const staffId = selectedStaff._id || selectedStaff.id;

      const payload = { ...editFormData };
      if (!payload.password) {
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
          errorData.message || `Failed to update user (${response.status})`
        );
      }

      const updatedFields = { ...editFormData };
      delete updatedFields.password;

      setAllUsers(allUsers.map((user) =>
        (user._id || user.id) === staffId
          ? { ...user, ...updatedFields }
          : user
      ));
      
      setStaffData(staffData.map((staff) =>
        (staff._id || staff.id) === staffId
          ? { ...staff, ...updatedFields }
          : staff
      ));
      
      setShowEditModal(false);
      if (selectedStaff) {
        setSelectedStaff({ ...selectedStaff, ...updatedFields });
      }
      setSuccessMessage("User updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setError(null);
    } catch (err) {
      console.error("[v0] Edit error:", err.message);
      setError(err.message || "Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/delete/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete user");

        setAllUsers(allUsers.filter((user) => (user._id || user.id) !== userId));
        setStaffData(staffData.filter((staff) => (staff._id || staff.id) !== userId));
        
        setShowDetailView(false);
        setSelectedStaff(null);
        setSuccessMessage("User deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError("Failed to delete user");
        console.error("[v0] Delete error:", err);
      }
    }
  };

  const handleAddStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
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

      const result = await response.json();
      const newStaff = result.data;
      
      setAllUsers([...allUsers, newStaff]);
      setStaffData([...staffData, newStaff]);
      
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

  const openEditModal = (user) => {
    setSelectedStaff(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      status: user.status || "active",
      verified: user.verified || false,
      shift: user.shift || "flexible",
      salary: user.salary || "",
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
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      receptionist: "bg-green-100 text-green-700",
      housekeeping: "bg-orange-100 text-orange-700",
      user: "bg-gray-100 text-gray-700",
      guest: "bg-indigo-100 text-indigo-700",
    };
    return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <Shield size={16} />,
      manager: <Users size={16} />,
      receptionist: <UserCheck size={16} />,
      housekeeping: <Home size={16} />,
    };
    return icons[role?.toLowerCase()] || <Users size={16} />;
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1F44] mx-auto"></div>
        <p className="mt-4">Loading users...</p>
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
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6"
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
        <h2 className="text-3xl font-bold text-[#0A1F44] mb-2">User Management</h2>
        <p className="text-gray-600 mb-6">Manage all users and staff members in your system</p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Total Users</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.totalUsers}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Staff Members</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.totalStaff}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Regular Users</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.regularUsers}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.active}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Verified</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.verified}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Admins</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.admins}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Managers</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.managers}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#0A1F44]"
          >
            <p className="text-gray-600 text-sm font-medium">Receptionists</p>
            <p className="text-2xl font-bold text-[#0A1F44] mt-2">
              {stats.receptionists}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-[#0A1F44] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Users size={18} />
            All Users
            <span className="bg-[#0A1F44] text-white text-xs px-2 py-1 rounded-full">
              {stats.totalUsers}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "staff"
                ? "bg-[#0A1F44] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <UserCheck size={18} />
            Staff Members
            <span className="bg-[#0A1F44] text-white text-xs px-2 py-1 rounded-full">
              {stats.totalStaff}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("regular")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "regular"
                ? "bg-[#0A1F44] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Users size={18} />
            Regular Users
            <span className="bg-[#0A1F44] text-white text-xs px-2 py-1 rounded-full">
              {stats.regularUsers}
            </span>
          </button>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
          className="flex items-center gap-2 bg-[#0A1F44] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#00326f] transition-colors shadow-md"
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
                  User
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
                  Verified
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {getCurrentData().length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No {activeTab === "all" ? "users" : activeTab + " users"} found</p>
                    <p className="text-sm mt-2">
                      {activeTab === "staff" ? "No staff members have been added yet." : 
                       activeTab === "regular" ? "No regular users found." : 
                       "No users found in the system."}
                    </p>
                  </td>
                </tr>
              ) : (
                getCurrentData().map((user, idx) => (
                  <tr
                    key={user._id || user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0A1F44] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                          {getAvatarInitials(user.name)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800 block">
                            {user.name}
                          </span>
                          {user.phone && (
                            <span className="text-xs text-gray-500">
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {getRoleIcon(user.role)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.verified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedStaff(user);
                            setShowDetailView(true);
                          }}
                          className="text-[#0A1F44] hover:text-[#00326f] font-semibold flex items-center gap-1 text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          View
                          <ChevronRight size={16} />
                        </motion.button>
                        
                        {(user.role === "admin" || user.role === "manager" || user.role === "receptionist" || user.role === "housekeeping") && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Edit size={16} />
                            Edit
                          </motion.button>
                        )}
                      </div>
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
            <div className="bg-gradient-to-r from-[#0A1F44] to-[#00326f] text-white px-8 py-6 flex justify-between items-start">
              <div className="flex gap-4 items-start flex-1">
                <div className="w-16 h-16 rounded-full bg-[#0A1F44] flex items-center justify-center text-2xl font-bold shadow-lg">
                  {getAvatarInitials(selectedStaff.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStaff.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-100 text-sm capitalize">
                      {selectedStaff.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedStaff.status)}`}>
                      {selectedStaff.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailView(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail size={18} className="text-[#0A1F44]" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                      Email Address
                    </p>
                    <p className="text-gray-800 font-medium">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                      Phone Number
                    </p>
                    <p className="text-gray-800 font-medium">
                      {selectedStaff.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Account Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                      User Role
                    </p>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(selectedStaff.role)}
                      <span className="text-gray-800 font-medium capitalize">
                        {selectedStaff.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                      Verification Status
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedStaff.verified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {selectedStaff.verified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  {selectedStaff.salary && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                        Salary
                      </p>
                      <p className="text-gray-800 font-medium">
                        ${selectedStaff.salary}
                      </p>
                    </div>
                  )}
                  {selectedStaff.shift && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                        Shift
                      </p>
                      <p className="text-gray-800 font-medium capitalize">
                        {selectedStaff.shift}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Account History</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                      Member Since
                    </p>
                    <p className="text-gray-800 font-medium">
                      {selectedStaff.createdAt
                        ? new Date(selectedStaff.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                      Last Updated
                    </p>
                    <p className="text-gray-800 font-medium">
                      {selectedStaff.updatedAt
                        ? new Date(selectedStaff.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    openEditModal(selectedStaff);
                    setShowDetailView(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0A1F44] text-white py-3 rounded-xl font-semibold hover:bg-[#00326f] transition-colors"
                >
                  <Edit size={18} />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleDelete(selectedStaff._id || selectedStaff.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete Account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter email address"
                />
              </div>

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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  User Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="user">Regular User</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              {(editFormData.role === "admin" || editFormData.role === "manager" || editFormData.role === "receptionist" || editFormData.role === "housekeeping") && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Work Shift
                    </label>
                    <select
                      value={editFormData.shift}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, shift: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                    >
                      <option value="morning">Morning Shift</option>
                      <option value="afternoon">Afternoon Shift</option>
                      <option value="night">Night Shift</option>
                      <option value="flexible">Flexible Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Salary ($)
                    </label>
                    <input
                      type="number"
                      value={editFormData.salary}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, salary: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                      placeholder="Enter salary amount"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Account Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={editFormData.verified}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      verified: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded accent-[#0A1F44]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800 block">
                    Verified Account
                  </span>
                  <span className="text-xs text-gray-500">
                    User has verified their email address
                  </span>
                </div>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-3 bg-[#0A1F44] text-white rounded-xl font-semibold hover:bg-[#00326f] transition-colors"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">
                Add New Staff Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Password *
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Staff Role *
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  required
                >
                  <option value="">Select Staff Role</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="housekeeping">Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Work Shift
                </label>
                <select
                  value={editFormData.shift}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, shift: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                >
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="flexible">Flexible Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Salary ($)
                </label>
                <input
                  type="number"
                  value={editFormData.salary}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, salary: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                  placeholder="Enter salary amount"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Account Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A1F44] focus:ring-2 focus:ring-blue-200 outline-none transition-colors bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddStaff}
                className="flex-1 px-4 py-3 bg-[#0A1F44] text-white rounded-xl font-semibold hover:bg-[#00326f] transition-colors"
              >
                Create Staff Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}