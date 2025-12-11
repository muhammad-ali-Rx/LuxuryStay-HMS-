export default function BookingsTable() {
  const bookings = [
    { id: 1, guest: "John Doe", room: "101", checkIn: "2024-01-15", checkOut: "2024-01-18", status: "Confirmed" },
    { id: 2, guest: "Jane Smith", room: "203", checkIn: "2024-01-20", checkOut: "2024-01-25", status: "Confirmed" },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A1F44]">Guest</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A1F44]">Room</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A1F44]">Check-in</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A1F44]">Check-out</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A1F44]">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5]">
              <td className="px-4 py-3 text-sm font-medium text-[#0A1F44]">{booking.guest}</td>
              <td className="px-4 py-3 text-sm text-[#666666]">{booking.room}</td>
              <td className="px-4 py-3 text-sm text-[#666666]">{booking.checkIn}</td>
              <td className="px-4 py-3 text-sm text-[#666666]">{booking.checkOut}</td>
              <td className="px-4 py-3 text-sm">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
