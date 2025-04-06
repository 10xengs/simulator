"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Type definitions for component props
interface SimulatorCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  tags?: string[];
  isPopular?: boolean;
  isComingSoon?: boolean;
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

// SimulatorCard component
const SimulatorCard = ({
  title,
  description,
  icon,
  path,
  tags = [],
  isPopular = false,
  isComingSoon = false,
}: SimulatorCardProps) => {
  return (
    <div className="group bg-white border border-gray-50 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="mb-4 flex items-center justify-between">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            {icon}
          </div>
          <div className="flex space-x-2">
            {isPopular && (
              <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">
                Popular
              </span>
            )}
            {isComingSoon && (
              <span className="bg-gray-50 text-gray-500 text-xs px-2.5 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            )}
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 tracking-[-0.01em]">
          {title}
        </h3>
        <p className="text-gray-600 text-sm md:text-base">{description}</p>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-6 pt-0 mt-auto">
        <Link
          href={path}
          className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-colors shadow-sm hover:shadow font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-disabled={isComingSoon}
        >
          {isComingSoon ? "Coming Soon" : "Explore Simulator"}
          {!isComingSoon && (
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          )}
        </Link>
      </div>
    </div>
  );
};

// Feature component
const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-start">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
};

// Testimonial component
const Testimonial = ({ quote, author, role, company }: TestimonialProps) => {
  return (
    <div className="bg-white border border-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <svg
        className="w-8 h-8 text-blue-200 mb-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-gray-800 mb-5 text-base md:text-lg leading-relaxed italic font-light">
        {quote}
      </p>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-500 font-medium text-lg">
            {author.charAt(0)}
          </div>
        </div>
        <div className="ml-3">
          <div className="font-medium text-sm text-gray-900">{author}</div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span>{role}</span>
            <span>•</span>
            <span>{company}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const simulatorsRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("hero");

  // Handle scroll to section
  const scrollToSimulators = () => {
    simulatorsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Intersection observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Add reveal-on-scroll animation
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.classList.add("revealed");
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 },
    );

    revealElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      revealObserver.observe(el);
    });

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  // Updated Simulators data with better descriptions
  const simulators = [
    {
      title: "Metrics Infrastructure Simulator",
      description:
        "Model your monitoring stack's resource needs with precision. Make informed scaling decisions before deployment.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      path: "/simulator",
      tags: ["Infrastructure", "StatsD", "Graphite"],
      isPopular: true,
      isComingSoon: false,
    },
    {
      title: "Load Balancer Simulator",
      description:
        "Test traffic distribution strategies under varied conditions. Optimize for performance and resilience.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
      path: "/coming-soon",
      tags: ["Networking", "Performance"],
      isComingSoon: true,
    },
    {
      title: "Database Schema Simulator",
      description:
        "Evaluate schema designs with real-world query patterns. Identify bottlenecks before they impact production.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
      path: "/coming-soon",
      tags: ["Database", "SQL", "NoSQL"],
      isComingSoon: true,
    },
    {
      title: "API Gateway Simulator",
      description:
        "Model API traffic patterns to test limiting, throttling and caching strategies. Ensure reliability at scale.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      ),
      path: "/coming-soon",
      tags: ["API", "Gateway", "Traffic"],
      isComingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-50 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center font-medium text-xl">
              <span className="text-blue-600">10x</span>
              <span className="ml-1 text-gray-900">Engineers</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#simulators"
              className={`text-sm ${activeSection === "simulators" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"} transition-colors`}
            >
              Simulators
            </a>
            <a
              href="#features"
              className={`text-sm ${activeSection === "features" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"} transition-colors`}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className={`text-sm ${activeSection === "testimonials" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"} transition-colors`}
            >
              Testimonials
            </a>
          </div>

          <div className="hidden md:block">
            <a
              href="https://github.com/10xengs/simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>
          </div>

          <button
            onClick={() => setIsNavVisible(!isNavVisible)}
            className="md:hidden flex items-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isNavVisible
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isNavVisible && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-4 animate-fadeIn">
            <a
              href="#simulators"
              className="block text-gray-600 hover:text-gray-900"
              onClick={() => setIsNavVisible(false)}
            >
              Simulators
            </a>
            <a
              href="#features"
              className="block text-gray-600 hover:text-gray-900"
              onClick={() => setIsNavVisible(false)}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="block text-gray-600 hover:text-gray-900"
              onClick={() => setIsNavVisible(false)}
            >
              Testimonials
            </a>
            <a
              href="https://github.com/10xengs/simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-600 hover:text-gray-900"
              onClick={() => setIsNavVisible(false)}
            >
              GitHub
            </a>
          </div>
        )}
      </header>

      {/* Floating Action Button - visible when scrolled past simulators section */}
      {activeSection !== "hero" && activeSection !== "simulators" && (
        <div className="fixed bottom-6 right-6 z-40 animate-fadeIn">
          <Link
            href="/simulator"
            className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            title="Try Metrics Simulator"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-16 md:pt-24 pb-16 md:pb-24 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] text-gray-900 mb-6">
              Powerful Engineering Simulators
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Precision-engineered simulation tools for critical infrastructure
              decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToSimulators}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow duration-300"
              >
                Discover Simulators
                <svg
                  className="ml-2 w-5 h-5 animate-bounce-subtle"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-16 md:mt-24 max-w-6xl mx-auto relative">
            <div className="aspect-[16/9] bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>

              {/* Animated dots to represent simulation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="simulation-dot simulation-dot-1"></div>
                <div className="simulation-dot simulation-dot-2"></div>
                <div className="simulation-dot simulation-dot-3"></div>
              </div>

              <div className="relative p-8 flex items-center justify-center">
                <svg
                  className="w-48 h-48 md:w-64 md:h-64 text-blue-500 opacity-20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.5}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                <div className="absolute">
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-2 tracking-[-0.01em]">
                      Infrastructure Simulation
                    </h3>
                    <div className="text-gray-600 text-sm md:text-base max-w-md text-center">
                      Created by engineers who understand the challenges you
                      face
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Introduction */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-6">
              About 10x Engineers
            </h2>
            <p className="text-gray-600 mb-8">
              We build sophisticated simulation tools that help engineering
              teams make better infrastructure decisions. Our simulators provide
              accurate modeling of complex systems, allowing you to predict
              resource needs, test scaling strategies, and optimize before
              deployment.
            </p>
            <p className="text-gray-900 font-medium">
              Simulate before you build. Test before you deploy.
            </p>
          </div>
        </div>
      </section>

      {/* Simulators Section */}
      <section id="simulators" className="py-16 md:py-24" ref={simulatorsRef}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-6">
              Explore Our Simulators
            </h2>
            <p className="text-gray-600">
              Powerful tools built for engineers by engineers. Each simulator is
              designed to model real-world infrastructure challenges with
              precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {simulators.map((simulator, index) => (
              <div
                key={index}
                className="reveal-on-scroll"
                style={{ opacity: 0 }}
              >
                <SimulatorCard
                  title={simulator.title}
                  description={simulator.description}
                  icon={simulator.icon}
                  path={simulator.path}
                  tags={simulator.tags}
                  isPopular={simulator.isPopular}
                  isComingSoon={simulator.isComingSoon}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-6">
              Common Features
            </h2>
            <p className="text-gray-600">
              All our simulators share these powerful capabilities that make
              infrastructure planning easier and more reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="reveal-on-scroll" style={{ opacity: 0 }}>
              <Feature
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                title="Real-time Calculations"
                description="See immediate feedback as you adjust parameters. No waiting for complex calculations."
              />
            </div>

            <div className="reveal-on-scroll" style={{ opacity: 0 }}>
              <Feature
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                title="Accurate Resource Modeling"
                description="Built on real-world performance data from thousands of production environments."
              />
            </div>

            <div className="reveal-on-scroll" style={{ opacity: 0 }}>
              <Feature
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                }
                title="Save & Share Configurations"
                description="Export your simulation settings and share them with your team for collaborative planning."
              />
            </div>

            <div className="reveal-on-scroll" style={{ opacity: 0 }}>
              <Feature
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                    />
                  </svg>
                }
                title="Platform Integration"
                description="Connect simulation results with your infrastructure management tools for seamless planning."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl font-light tracking-[-0.02em] text-gray-900 mb-6">
              What Engineers Say
            </h2>
            <p className="text-gray-600">
              Our simulators help engineering teams make confident
              infrastructure decisions and avoid costly mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Testimonial
              quote="The metrics simulator helped us rightsize our monitoring infrastructure. We avoided overprovisioning by 40% while ensuring we had enough capacity for traffic spikes."
              author="Sarah Chen"
              role="DevOps Lead"
              company="TechStream"
            />

            <Testimonial
              quote="Being able to test different configurations and immediately see the impact on resource utilization has been invaluable for our infrastructure planning."
              author="Michael Rodriguez"
              role="SRE Manager"
              company="CloudScale"
            />

            <Testimonial
              quote="We use these simulators for capacity planning exercises. They've helped us optimize our cloud spend while maintaining system reliability."
              author="Ava Johnson"
              role="Cloud Architect"
              company="DataSphere"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] mb-6">
              Ready to simulate your infrastructure?
            </h2>
            <p className="text-blue-100 mb-10 max-w-2xl mx-auto">
              Start with our most popular simulator and make infrastructure
              decisions with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/simulator"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-blue-600 transition-all shadow-sm hover:shadow duration-300"
              >
                Visualize Your Infrastructure
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-white font-medium text-xl mb-4">
                <span className="text-blue-400">10x</span>
                <span className="ml-1">Engineers</span>
              </div>
              <p className="text-sm mb-4">
                Building precision tools for modern infrastructure.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://github.com/10xengs/simulator"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Simulators
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/simulator"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Metrics Simulator
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Load Balancer Simulator
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Database Schema Simulator
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    API Gateway Simulator
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Guides & Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} 10x Engineers. All rights
              reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors mr-4"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for grid pattern background, simulation dots, and animations */}
      <style jsx>{`
        .bg-grid-pattern {
          background-size: 30px 30px;
          background-image: radial-gradient(
            circle,
            rgba(99, 102, 241, 0.4) 1px,
            transparent 1px
          );
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .simulation-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: rgba(59, 130, 246, 0.6);
          border-radius: 50%;
        }

        .simulation-dot-1 {
          top: 30%;
          left: 20%;
          animation: moveDot1 9s linear infinite;
        }

        .simulation-dot-2 {
          top: 60%;
          left: 40%;
          animation: moveDot2 12s linear infinite;
        }

        .simulation-dot-3 {
          top: 40%;
          left: 70%;
          animation: moveDot3 7s linear infinite;
        }

        @keyframes moveDot1 {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(100px, 50px);
          }
          50% {
            transform: translate(200px, -50px);
          }
          75% {
            transform: translate(100px, -100px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes moveDot2 {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-150px, -30px);
          }
          50% {
            transform: translate(-100px, 100px);
          }
          75% {
            transform: translate(50px, 50px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes moveDot3 {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-70px, -70px);
          }
          50% {
            transform: translate(-150px, 30px);
          }
          75% {
            transform: translate(-50px, 100px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        .revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
