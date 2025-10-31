import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="heading-xl mb-8">Admin Dashboard</h1>
          <p className="text-lg text-muted">Admin dashboard coming soon...</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
