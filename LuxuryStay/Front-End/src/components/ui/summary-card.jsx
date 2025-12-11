import { motion } from "framer-motion"

export default function SummaryCard({ title, value, change, icon: Icon, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-md p-6 border border-[#E0E0E0] hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#666666]">{title}</h3>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-[#0A1F44]">{value}</div>
        <div className={`text-xs font-semibold ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
          {change}
        </div>
      </div>
    </motion.div>
  )
}