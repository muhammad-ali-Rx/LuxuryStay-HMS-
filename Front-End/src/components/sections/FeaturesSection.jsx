"use client";

import { useEffect, useRef, useState } from "react";
import { UtensilsCrossed, Coffee, Car, Sparkles, Home, ArrowRight } from "lucide-react";

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto relative">
        {/* Clean Header */}
        <div className="text-center mb-16">
          <p className="text-gray-500 font-medium text-sm tracking-widest uppercase mb-4">
            Why Choose LuxuryStay
          </p>
          
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            You'll Never Want To Leave
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Experience refined elegance and unmatched comfort at every moment of your stay.
            </p>
          </div>
        </div>

        {/* Clean Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Main Card */}
                <div
                  className={`relative h-full bg-white rounded-xl p-6 text-center border border-gray-100
                  transition-all duration-500 transform-gpu 
                  ${hoveredCard === index 
                    ? "-translate-y-2 shadow-lg border-gray-200 bg-gray-50" 
                    : "shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <div 
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gray-100 border border-gray-200
                      transition-all duration-500
                      ${hoveredCard === index 
                        ? "bg-gray-900 transform scale-110" 
                        : "group-hover:bg-gray-900/5"
                      }`}
                    >
                      <Icon 
                        className={`w-6 h-6 transition-all duration-500
                        ${hoveredCard === index 
                          ? "text-white transform scale-110" 
                          : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className={`text-lg font-semibold mb-3 transition-colors duration-500
                      ${hoveredCard === index ? "text-gray-900" : "text-gray-800"}`}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Subtle CTA */}
                    <div className={`flex items-center justify-center gap-1 text-xs font-medium text-gray-500 
                      opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 
                      transition-all duration-500`}>
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Bottom Border */}
                  <div 
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gray-900 rounded-full 
                    transition-all duration-500 ease-out 
                    ${hoveredCard === index ? "w-3/4" : "group-hover:w-1/2"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Divider */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className={`text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <p className="text-gray-500 text-sm">
              Experience the difference of true luxury hospitality
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 