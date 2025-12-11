import Navbar from "../components/Navbar"
import HeroSection from "../components/sections/HeroSection"
import FeaturesSection from "../components/sections/FeaturesSection"
import AboutSection from "../components/sections/AboutSection"
import RoomHighlights from "../components/sections/RoomHighlights"
import FacilitiesSection from "../components/sections/FacilitiesSection"
import GallerySection from "../components/sections/GallerySection"
import ReviewsSection from "../components/sections/ReviewsSection"
import CTASection from "../components/sections/CTASection"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <RoomHighlights />
      <FacilitiesSection />
      <GallerySection />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
