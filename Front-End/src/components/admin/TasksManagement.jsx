"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Loader,
  RefreshCw,
  User,
  Bed,
  ChevronDown,
  Clock,
  Shield,
  Phone,
  Mail,
  ArrowUpDown,
  Building,
  ClipboardList,
  UserPlus,
  Plus,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000";

const Button = ({ children, onClick, variant, type, disabled, className }) => {
  let baseClasses = "px-4 py-2 font-semibold text-sm rounded-lg transition duration-200 shadow-md";
  if (variant === "outline") {
    baseClasses += " bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
  } else {
    baseClasses += ` text-white ${className}`;
  }
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [staffData, setStaffData] = useState([]); // For future use if needed
  const [selectedStaffId, setSelectedStaffId] = useState(null); // For future use if needed
  const [assigningTask, setAssigningTask] = useState(null); // For future use if needed

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTaskForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleCloseModal = () => setIsCreateModalOpen(false);
  const handleSubmitTask = () => {}

  // Fetch all tasks from backend
  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log("🔍 Fetching tasks...");
      const response = await fetch(`${API_BASE_URL}/task`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Response status:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 API Response:", result);

      if (result.success) {
        setTasks(result.data || []);
        console.log("✅ Tasks loaded:", result.data?.length || 0);
      } else {
        throw new Error(result.message || "Failed to load tasks");
      }
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
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

      const staffRoles = ["manager", "receptionist", "housekeeping"];
      const filteredStaff = users.filter((user) =>
        staffRoles.includes(user.role?.toLowerCase())
      );

      console.log({ users, filteredStaff });

      setStaffData(filteredStaff);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("[v0] Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (staffId) => {
    if (!assigningTask || !staffId) {
      console.error("Task ID or staff ID is missing.");
      return;
    }

    try {
      const userAuthToken = localStorage.getItem("authToken");
      if (!userAuthToken) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await fetch(`${API_BASE_URL}/task/${assigningTask._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // IMPORTANT: You MUST include an authorization token (e.g., Bearer token)
          Authorization: `Bearer ${userAuthToken}`,
        },
        body: JSON.stringify({
          // This is the data being sent to the backend
          assignedTo: staffId,
          // Optional: you might also want to set the status to 'in-progress' here
          status: "in-progress",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign task.");
      }

      // Task assigned successfully
      const data = await response.json();
      console.log("Task assignment successful:", data.data);

      // 1. Close the modal
      setAssigningTask(null);

      // 2. OPTIONAL: Refresh the task list in the parent component
      fetchTasks();
    } catch (error) {
      console.error("API Error during task assignment:", error);
      // Show error message to the user
      setError(error.message);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ FIXED: Changed 'status' to 'taskStatus' to match backend
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setActionLoading(taskId);
      console.log(`🔄 Updating task ${taskId} to ${newStatus}`);

      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/task/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // ✅ FIX: Changed 'status' to 'taskStatus'
        body: JSON.stringify({ taskStatus: newStatus }),
      });

      console.log("📡 Status update response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Status update error:", errorText);
        throw new Error(`Failed to update task status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Status update result:", result);

      if (result.success) {
        // Update local state immediately
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, taskStatus: newStatus } : task
          )
        );

        alert(`✅ Task status updated to ${newStatus}`);
      } else {
        throw new Error(result.message || "Failed to update task status");
      }
    } catch (error) {
      console.error("❌ Error updating task status:", error);
      alert(`❌ ${error.message || "Failed to update task status"}`);

      // Refresh data to show correct status
      fetchTasks();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckIn = async (taskId) => {
    try {
      setActionLoading(`checkin-${taskId}`);
      console.log(`🔄 Checking in task ${taskId}`);

      const token = localStorage.getItem("authToken");

      // ✅ FIX: Use the status update endpoint with 'checked-in' status
      const response = await fetch(`${API_BASE_URL}/task/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskStatus: "checked-in" }),
      });

      console.log("📡 Check-in response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Check-in error:", errorText);
        throw new Error(`Failed to check in: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Check-in result:", result);

      if (result.success) {
        // Update local state
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, taskStatus: "checked-in" } : task
          )
        );
        alert("✅ Check-in successful!");
      } else {
        throw new Error(result.message || "Failed to check in");
      }
    } catch (error) {
      console.error("❌ Error during check-in:", error);
      alert(`❌ ${error.message || "Failed to check in"}`);

      // Refresh data to show correct status
      fetchTasks();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (taskId) => {
    try {
      setActionLoading(`checkout-${taskId}`);
      console.log(`🔄 Checking out task ${taskId}`);

      const token = localStorage.getItem("authToken");

      // ✅ FIX: Use the status update endpoint with 'checked-out' status
      const response = await fetch(`${API_BASE_URL}/task/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskStatus: "checked-out" }),
      });

      console.log("📡 Check-out response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Check-out error:", errorText);
        throw new Error(`Failed to check out: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Check-out result:", result);

      if (result.success) {
        // Update local state
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, taskStatus: "checked-out" } : task
          )
        );
        alert("✅ Check-out successful!");
      } else {
        throw new Error(result.message || "Failed to check out");
      }
    } catch (error) {
      console.error("❌ Error during check-out:", error);
      alert(`❌ ${error.message || "Failed to check out"}`);

      // Refresh data to show correct status
      fetchTasks();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to cancel this task?")) {
      return;
    }

    try {
      setActionLoading(`cancel-${taskId}`);
      console.log(`🔄 Cancelling task ${taskId}`);

      const token = localStorage.getItem("authToken");

      // ✅ FIX: Use the status update endpoint with 'cancelled' status
      const response = await fetch(`${API_BASE_URL}/task/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskStatus: "cancelled" }),
      });

      console.log("📡 Cancel response:", response.status);

      if (response.status === 401) {
        throw new Error("Authentication required. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Cancel error:", errorText);
        throw new Error(`Failed to cancel task: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Cancel result:", result);

      if (result.success) {
        // Update local state
        setTasks((prev) =>
          prev.map((task) =>
            task._id === taskId ? { ...task, taskStatus: "cancelled" } : task
          )
        );
        alert("✅ Task cancelled successfully!");
      } else {
        throw new Error(result.message || "Failed to cancel task");
      }
    } catch (error) {
      console.error("❌ Error cancelling task:", error);
      alert(`❌ ${error.message || "Failed to cancel task"}`);

      // Refresh data to show correct status
      fetchTasks();
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleExportTasks = () => {
    if (tasks.length === 0) {
      alert("No tasks data to export");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Task ID,Guest Name,Room,Check-In,Check-Out,Guests,Status,Total Amount,Task Date,Payment Status\n" +
      tasks
        .map(
          (task) =>
            `"${task._id}","${task.guestDetails?.name || "N/A"}","${task.roomNumber || "N/A"
            }","${task.checkInDate || "N/A"}","${task.checkOutDate || "N/A"
            }","${task.numberOfGuests || 0}","${task.taskStatus || "pending"
            }","${task.totalAmount || 0}","${task.createdAt
              ? new Date(task.createdAt).toLocaleDateString()
              : "Unknown"
            }","${task.paymentStatus || "pending"}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `tasks_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );
      return nights > 0 ? nights : 0;
    } catch (error) {
      return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "approved":
        return "bg-emerald-500/15 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-500/15 text-amber-700 border border-amber-200";
      case "checked-in":
        return "bg-blue-500/15 text-blue-700 border border-blue-200";
      case "checked-out":
      case "completed":
        return "bg-purple-500/15 text-purple-700 border border-purple-200";
      case "cancelled":
      case "rejected":
        return "bg-rose-500/15 text-rose-700 border border-rose-200";
      default:
        return "bg-gray-500/15 text-gray-700 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle size={14} className="text-emerald-600" />;
      case "pending":
        return <Clock size={14} className="text-amber-600" />;
      case "checked-in":
        return <User size={14} className="text-blue-600" />;
      case "checked-out":
        return <Shield size={14} className="text-purple-600" />;
      case "cancelled":
        return <XCircle size={14} className="text-rose-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.guestDetails?.name &&
        task.guestDetails.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (task.roomNumber && task.roomNumber.includes(searchTerm)) ||
      (task._id && task._id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      !filterStatus ||
      (task.taskStatus &&
        task.taskStatus.toLowerCase() === filterStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle nested properties
    if (sortConfig.key === "guestDetails.name") {
      aValue = a.guestDetails?.name;
      bValue = b.guestDetails?.name;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Get available actions based on current status
  const getAvailableActions = (task) => {
    const actions = [];

    switch (task.taskStatus) {
      case "pending":
        actions.push({
          label: "Confirm",
          action: () => handleUpdateStatus(task._id, "confirmed"),
          icon: CheckCircle,
          color: "bg-emerald-500 hover:bg-emerald-600 text-white",
        });
        break;
      case "confirmed":
        actions.push({
          label: "Check In",
          action: () => handleCheckIn(task._id),
          icon: User,
          color: "bg-blue-500 hover:bg-blue-600 text-white",
        });
        break;
      case "checked-in":
        actions.push({
          label: "Check Out",
          action: () => handleCheckOut(task._id),
          icon: Bed,
          color: "bg-purple-500 hover:bg-purple-600 text-white",
        });
        break;
    }

    // Always allow cancellation for pending and confirmed tasks
    if (task.taskStatus === "pending" || task.taskStatus === "confirmed") {
      actions.push({
        label: "Cancel",
        action: () => handleCancelTask(task._id),
        icon: XCircle,
        color: "bg-rose-500 hover:bg-rose-600 text-white",
      });
    }

    return actions;
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((b) => b.taskStatus === "pending").length,
    confirmed: tasks.filter((b) => b.taskStatus === "confirmed").length,
    checkedIn: tasks.filter((b) => b.taskStatus === "checked-in").length,
    revenue: tasks.reduce((sum, task) => sum + (task.totalAmount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#0A1F44] border-t-transparent rounded-full mx-auto mb-6"
            />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Loading Tasks
            </h3>
            <p className="text-gray-600">Fetching your task data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Full width container - NO EMPTY SIDES */}
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tasks Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all hotel tasks and reservations
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportTasks}
              disabled={tasks.length === 0}
              className="flex items-center gap-2 bg-white text-[#0A1F44] px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTasks}
              className="flex items-center gap-2 bg-[#0A1F44] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#00326f] transition-all duration-300"
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1F44] focus:border-transparent appearance-none bg-white cursor-pointer transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={14}
              />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0A1F44] to-[#00326f] rounded-lg p-3 text-white">
              <div>
                <p className="text-xs opacity-90">Showing</p>
                <p className="text-lg font-bold">{filteredTasks.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-90">Filtered</p>
                <p className="text-sm font-semibold">
                  {filterStatus
                    ? filterStatus.charAt(0).toUpperCase() +
                    filterStatus.slice(1)
                    : "All"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-800">
                  Error Loading Tasks
                </p>
                <p className="text-rose-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchTasks}
              className="mt-3 bg-rose-100 text-rose-700 px-3 py-1.5 rounded text-sm font-semibold hover:bg-rose-200 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Tasks Table - FULL WIDTH */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full"
          >
            {sortedTasks.length > 0 ? (
              <div className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0A1F44] to-[#00326f] text-white">
                      {/* Title Column */}
                      <th
                        className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#00326f] transition-colors"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardList size={16} />
                          Title
                          <ArrowUpDown size={14} />
                        </div>
                      </th>

                      {/* Status Column */}
                      <th
                        className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#00326f] transition-colors"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          <Shield size={16} />{" "}
                          {/* Reusing Shield or another relevant icon */}
                          Status
                          <ArrowUpDown size={14} />
                        </div>
                      </th>

                      {/* Assigned To Column */}
                      <th className="px-6 py-4 text-left font-semibold">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Assigned To
                        </div>
                      </th>

                      {/* Date Column */}
                      <th
                        className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-[#00326f] transition-colors"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Date
                          <ArrowUpDown size={14} />
                        </div>
                      </th>

                      {/* Actions Column */}
                      <th className="px-6 py-4 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTasks.map((task, idx) => {
                      // Assuming getStatusColor and getStatusIcon are defined
                      // Assuming task.assignedTo is an object with a 'name' property
                      const assignedUserName =
                        task.assignedTo?.name || "Unassigned";

                      return (
                        <motion.tr
                          key={task._id || idx} // Use a unique key like _id
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                        >
                          {/* Title Column */}
                          <td className="px-6 py-4 font-medium text-gray-900 truncate">
                            {task.title}
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status || "pending"}
                              </span>
                            </div>
                          </td>

                          {/* Assigned To Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {assignedUserName}
                              </span>
                            </div>
                          </td>

                          {/* Date Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {task.date ? formatDate(task.date) : "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {task.date
                                  ? new Date(task.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : ""}
                              </p>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* View Details Button */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewDetails(task)}
                                className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600 hover:text-blue-700"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </motion.button>

                              {/* Assign/Edit Button */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setAssigningTask(task)}
                                disabled={task.assignedTo}
                                className="px-3 py-2 rounded text-sm font-semibold transition-all duration-200 flex items-center gap-1 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Assign/Edit"
                              >
                                <UserPlus size={14} />{" "}
                                {/* Assuming UserPlus or Edit icon is available */}
                                <span>Assign</span>
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {tasks.length === 0 ? "No Tasks Yet" : "No Matching Tasks"}
                </h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                  {tasks.length === 0
                    ? "Get started by accepting your first task."
                    : "Try adjusting your search terms or filters."}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("");
                  }}
                  className="bg-[#0A1F44] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#00326f] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Task Details Modal */}
        <AnimatePresence>
          {showModal && selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-8 pb-6 rounded-t-3xl z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Task Details
                      </h3>
                      <p className="text-gray-600">
                        Complete information for task #
                        {selectedTask._id?.slice(-8)}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setShowModal(false);
                        setSelectedTask(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-3 hover:bg-gray-100 rounded-2xl"
                    >
                      <XCircle size={28} />
                    </motion.button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Guest Information */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Guest Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#0A1F44] to-[#00326f] rounded-2xl flex items-center justify-center text-white font-semibold text-2xl">
                            {selectedTask.guestDetails?.name?.charAt(0) || "G"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">
                              {selectedTask.guestDetails?.name ||
                                "Unknown Guest"}
                            </p>
                            <p className="text-gray-600">
                              {selectedTask.guestDetails?.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Phone Number
                            </p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Phone size={16} />
                              {selectedTask.guestDetails?.phone || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Task ID</p>
                            <p className="font-medium text-gray-900 font-mono text-sm">
                              {selectedTask._id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task Summary */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Task Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Room</p>
                            <p className="font-medium text-gray-900">
                              Room {selectedTask.roomNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedTask.roomType}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium text-gray-900">
                              {calculateNights(
                                selectedTask.checkInDate,
                                selectedTask.checkOutDate
                              )}{" "}
                              nights
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Check-in</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />
                              {formatDate(selectedTask.checkInDate)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Check-out</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Calendar size={16} />
                              {formatDate(selectedTask.checkOutDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Payment Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#0A1F44] to-[#00326f] rounded-2xl text-white">
                          <div>
                            <p className="text-sm opacity-90">Total Amount</p>
                            <p className="text-2xl font-bold">
                              ${selectedTask.totalAmount || 0}
                            </p>
                          </div>
                          <DollarSign size={32} className="opacity-80" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Payment Status
                            </p>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-200">
                              <CheckCircle size={14} />
                              {selectedTask.paymentStatus || "pending"}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Guests</p>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Users size={16} />
                              {selectedTask.numberOfGuests || 0} guests
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task Status */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 border-b pb-3">
                        Task Status
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                          {getStatusIcon(selectedTask.taskStatus)}
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {selectedTask.taskStatus || "pending"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Current task status
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Task Date</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(selectedTask.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedTask.specialRequests && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-gray-900">
                        Special Requests
                      </h4>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedTask.specialRequests}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-8 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedTask(null);
                      }}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                    >
                      Close Details
                    </button>
                    {getAvailableActions(selectedTask).map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${action.color}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {assigningTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // 1. CLOSE VIA BACKDROP CLICK
              onClick={() => setAssigningTask(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                // PREVENTS BACKDROP CLICK FROM FIRING WHEN CLICKING INSIDE MODAL
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" // Added 'relative' for the absolute positioning of the close button
              >
                {/* 2. THE EXPLICIT CLOSE BUTTON (X) */}
                <button
                  onClick={() => setAssigningTask(null)} // Function to close the modal
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100 z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* The main content (Staff Listing and Assignment Button) */}
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-4">Assign Task To:</h3>
                  <ul className="space-y-2">
                    {staffData.map((staff) => (
                      <li
                        key={staff._id}
                        onClick={() => setSelectedStaffId(staff._id)} // Function to set the selected ID
                        className={`cursor-pointer p-3 rounded-xl transition duration-150 ${selectedStaffId === staff._id
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 hover:bg-gray-200"
                          }`}
                      >
                        <div className="font-semibold">{staff.name}</div>
                        <div className="text-sm opacity-80">{staff.role}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleAssign(selectedStaffId)} // Function to call the assignment API
                      disabled={!selectedStaffId}
                      className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition"
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="add-btn fixed right-0 bottom-0 bg-[#0A1F44] hover:bg-[#00326f] text-white p-2.5 rounded-full m-5 hover:scale-105 transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Plus size={28} />
      </div>

      {isCreateModalOpen && (
        // <motion.div
        //   initial={{ opacity: 0 }}
        //   animate={{ opacity: 1 }}
        //   exit={{ opacity: 0 }}
        //   className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        // >
        //   <motion.div
        //     initial={{ opacity: 0, scale: 0.9, y: 20 }}
        //     animate={{ opacity: 1, scale: 1, y: 0 }}
        //     exit={{ opacity: 0, scale: 0.9, y: 20 }}
        //     className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        //   >
        //     {/* form */}
        //   </motion.div>
        // </motion.div>

        <motion.div // initial, animate, exit properties assumed from framer-motion
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div // initial, animate, exit properties assumed from framer-motion
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8"
          >
            <div className="flex justify-between items-start border-b pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-[#1D293D]">
                Request New Task
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 p-1 rounded-full hover:text-gray-600 transition"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Task Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="E.g., Extra Towels, Dinner Booking"
                  value={newTaskForm.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Details / Instructions
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  placeholder="Please specify details like quantity, time, or location."
                  value={newTaskForm.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm resize-none"
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  type="button"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1D293D] text-white hover:bg-[#2D3B5D] flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
