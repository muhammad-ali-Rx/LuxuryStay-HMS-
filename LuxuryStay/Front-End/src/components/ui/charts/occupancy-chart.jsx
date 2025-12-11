import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function OccupancyChart() {
  const data = [
    { name: "Mon", occupancy: 85 },
    { name: "Tue", occupancy: 78 },
    { name: "Wed", occupancy: 92 },
    { name: "Thu", occupancy: 88 },
    { name: "Fri", occupancy: 95 },
    { name: "Sat", occupancy: 99 },
    { name: "Sun", occupancy: 87 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
        <XAxis dataKey="name" stroke="#666666" />
        <YAxis stroke="#666666" />
        <Tooltip contentStyle={{ backgroundColor: "#f5f5f5", border: "1px solid #E0E0E0" }} />
        <Bar dataKey="occupancy" fill="#0A1F44" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
