"use client";

import { useEffect, useRef, useState } from "react";
import { UtensilsCrossed, Coffee, Car, Sparkles, Home } from "lucide-react";

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: UtensilsCrossed,
      title: "Fine Dining",
      description: "World-class culinary experiences prepared by master chefs.",
    },
    {
      icon: Coffee,
      title: "Premium Breakfast",
      description: "Enjoy gourmet morning selections with stunning views.",
    },
    {
      icon: Car,
      title: "Concierge Service",
      description: "Luxury chauffeur & travel arrangements at your request.",
    },
    {
      icon: Sparkles,
      title: "Luxury Spa",
      description: "Indulge in rejuvenating treatments and total relaxation.",
    },
    {
      icon: Home,
      title: "Elegant Suites",
      description: "Sophisticated, spacious rooms designed for ultimate comfort.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 overflow-hidden"
    >
      {/* Decorative glows */}
      <div className="absolute top-[-50px] right-[-100px] w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-80px] left-[-100px] w-[450px] h-[450px] bg-accent/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-20">
        <p className="text-accent font-semibold text-sm tracking-[0.25em] uppercase mb-3">
          Why Choose LuxuryStay
        </p>
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-6">
          You’ll Never Want To Leave
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Experience refined elegance and unmatched comfort at every moment of your stay.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className={`relative group transform-gpu transition-all duration-700 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Glowing border animation */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/40 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700"></div>

              {/* Card */}
              <div
                className="relative h-full bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center border border-gray-200
                transition-all duration-700 transform-gpu group-hover:-translate-y-3 group-hover:rotate-[1deg]
                group-hover:border-accent/40 group-hover:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)]"
              >
                {/* Animated background pulse */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/5 to-accent/10 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700"></div>

                {/* Icon with shimmer */}
                <div className="relative inline-flex items-center justify-center mb-6 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-8 h-8 text-primary group-hover:text-accent transition-all duration-500 group-hover:animate-icon-shine" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-playfair font-bold text-primary mb-3 transition-all duration-500 group-hover:text-accent">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-500">
                  {feature.description}
                </p>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[3px] bg-gradient-to-r from-accent via-accent/70 to-transparent rounded-full group-hover:w-2/3 transition-all duration-700 ease-out"></div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes icon-shine {
          0% { filter: brightness(1); transform: rotate(0deg); }
          50% { filter: brightness(1.3); transform: rotate(3deg) scale(1.05); }
          100% { filter: brightness(1); transform: rotate(0deg); }
        }

        .group-hover\\:animate-icon-shine:hover {
          animation: icon-shine 1.2s ease-in-out;
        }
      `}</style>
    </section>
  );
}
