"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const reportData = [
  { period: "Week 1", occupancy: 75, revenue: 18000 },
  { period: "Week 2", occupancy: 82, revenue: 22000 },
  { period: "Week 3", occupancy: 88, revenue: 25000 },
  { period: "Week 4", occupancy: 92, revenue: 28000 },
]

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#0A1F44]">Reports & Analytics</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F44] px-6 py-3 rounded-lg font-semibold"
        >
          <Download size={20} />
          Export Report
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: "$93,000", change: "+12%" },
          { label: "Occupancy Rate", value: "84.25%", change: "+5%" },
          { label: "Guest Satisfaction", value: "4.8/5", change: "+0.3" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-[#0A1F44] mt-2">{stat.value}</p>
            <p className="text-green-600 text-sm mt-2">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-[#0A1F44] mb-4">Weekly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke="#D4AF37" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#0A1F44" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
