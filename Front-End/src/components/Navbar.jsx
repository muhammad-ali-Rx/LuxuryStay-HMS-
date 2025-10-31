"use client";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rooms", label: "Rooms" },
    { href: "/dining", label: "Dining" },
    { href: "/facilities", label: "Facilities" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-lg"
          : "bg-white/60 backdrop-blur-md"
      } border-b border-white/20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 flex-shrink-0 hover:scale-105 transition-transform"
          >
            <div className="w-11 h-11 bg-accent rounded-2xl flex items-center justify-center shadow-md hover:shadow-accent/40 transition-shadow">
              <span className="font-playfair text-primary font-extrabold text-lg tracking-wide">
                LS
              </span>
            </div>
            <span className="font-playfair text-2xl font-extrabold text-primary hidden sm:inline tracking-wider">
              LuxuryStay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-primary font-medium text-sm uppercase tracking-wide transition-all duration-300 hover:text-accent group"
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/admin"
              className="text-primary hover:text-accent transition-colors text-sm font-semibold"
            >
              Admin
            </Link>
            <Link
              to="/booking"
              className="btn-accent text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-accent/50 hover:scale-105 transition-all duration-300"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary p-2 rounded-lg hover:bg-secondary/40 transition-all duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isOpen ? "max-h-[400px] opacity-100 pb-5" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-3 mt-3 backdrop-blur-md bg-white/70 rounded-2xl shadow-inner p-4 border border-white/30">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-primary font-medium hover:bg-secondary rounded-lg hover:text-accent transition-all duration-300 text-center"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-primary font-medium hover:bg-secondary rounded-lg hover:text-accent transition-all duration-300 text-center"
            >
              Admin
            </Link>
            <Link
              to="/booking"
              onClick={() => setIsOpen(false)}
              className="block btn-accent text-center mt-3 py-2 font-semibold rounded-xl hover:scale-105 transition-transform"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
