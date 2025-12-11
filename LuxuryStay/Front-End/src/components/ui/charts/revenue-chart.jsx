import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function RevenueChart() {
  const data = [
    { name: "Week 1", revenue: 12000 },
    { name: "Week 2", revenue: 18000 },
    { name: "Week 3", revenue: 15000 },
    { name: "Week 4", revenue: 24000 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis dataKey="name" stroke="#666666" />
        <YAxis stroke="#666666" />
        <Tooltip contentStyle={{ backgroundColor: "#f5f5f5", border: "1px solid #E0E0E0" }} />
        <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} dot={{ fill: "#D4AF37", r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
