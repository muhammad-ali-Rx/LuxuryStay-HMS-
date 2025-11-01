"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, DoorOpen, Calendar } from "lucide-react"

const dashboardData = {
  occupancy: [
    { month: "Jan", rate: 75 },
    { month: "Feb", rate: 82 },
    { month: "Mar", rate: 88 },
    { month: "Apr", rate: 92 },
    { month: "May", rate: 85 },
    { month: "Jun", rate: 95 },
  ],
  revenue: [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 58000 },
    { month: "Apr", amount: 65000 },
    { month: "May", amount: 61000 },
    { month: "Jun", amount: 72000 },
  ],
  roomTypes: [
    { name: "Standard", value: 45 },
    { name: "Deluxe", value: 30 },
    { name: "Suite", value: 20 },
    { name: "Presidential", value: 5 },
  ],
}

const statCards = [
  { label: "Total Guests", value: "1,245", icon: Users, color: "#D4AF37" },
  { label: "Available Rooms", value: "28", icon: DoorOpen, color: "#0A1F44" },
  { label: "Bookings Today", value: "12", icon: Calendar, color: "#1a3a5c" },
  { label: "Revenue (Monthly)", value: "$72,000", icon: TrendingUp, color: "#D4AF37" },
]

const COLORS = ["#0A1F44", "#D4AF37", "#1a3a5c", "#e8d5b7"]

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-[#0A1F44] mt-2">{card.value}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: card.color + "20" }}>
                <card.icon size={24} style={{ color: card.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-bold text-[#0A1F44] mb-4">Occupancy Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.occupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ddd" }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#D4AF37"
                strokeWidth={3}
                dot={{ fill: "#D4AF37", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-bold text-[#0A1F44] mb-4">Room Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.roomTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.roomTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <h3 className="text-lg font-bold text-[#0A1F44] mb-4">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ddd" }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Bar dataKey="amount" fill="#D4AF37" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
