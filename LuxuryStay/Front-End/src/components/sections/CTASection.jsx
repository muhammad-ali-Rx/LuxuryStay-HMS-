import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="heading-lg text-white mb-6">Ready for Your Luxury Escape?</h2>
        <p className="text-xl text-white/80 mb-8">
          Book your perfect stay today and experience the pinnacle of hospitality
        </p>
        <Link to="/booking" className="inline-flex items-center gap-2 btn-accent">
          Book Your Stay Now
          <ChevronRight size={20} />
        </Link>
      </div>
    </section>
  )
}
