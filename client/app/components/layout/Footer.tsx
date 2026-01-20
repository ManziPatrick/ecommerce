import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Send,
  Users,
  Shield,
  Truck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "@/app/gql/Product";

const FooterLogo = () => (
  <Image
    src="/logoo.png"
    alt="macyemacye logo"
    width={120}
    height={40}
    className="h-10 w-auto object-contain brightness-0 invert"
  />
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Fetch real categories data
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  // Get top 6 categories for footer
  const footerCategories = categories.slice(0, 6);

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white pt-20 pb-10 relative overflow-hidden">
      {/* Decorative SVG Patterns (Vectors) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Abstract blobs/vectors */}
          <circle cx="10%" cy="20%" r="150" fill="url(#fade)" filter="blur(80px)" />
          <circle cx="90%" cy="80%" r="200" fill="url(#fade)" filter="blur(100px)" />

          <path d="M-100 100 Q 150 300 500 100 T 1100 200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 20" opacity="0.5" />
          <path d="M0 400 Q 300 200 700 450 T 1200 350" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>

      {/* Modern thin top gradient line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      {/* Glow Effects */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-8xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-16 pb-16 border-b border-gray-800/80">
          {/* Logo and description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center">
              <div className="text-white mr-4">
                <FooterLogo />
              </div>
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
              <span className="ml-2 text-sm font-medium tracking-wider text-gray-400 uppercase">
                Premium Store
              </span>
            </div>

            <p className="text-gray-400 mt-6 text-sm leading-relaxed">
              Discover high-quality products at macyemacye. Shop with
              confidence and enjoy premium selections tailored just for you.
              Fast shipping, secure payments, and exceptional customer service.
            </p>

            <div className="mt-8 flex flex-col space-y-4">
              <div className="flex items-start">
                <MapPin
                  size={18}
                  className="text-indigo-400 mr-3 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-gray-400">
                  Rwanda, Kigali, Nyarugenge
                </p>
              </div>
              <div className="flex items-center">
                <Phone
                  size={18}
                  className="text-indigo-400 mr-3 flex-shrink-0"
                />
                <p className="text-sm text-gray-400">+250 123 456 789</p>
              </div>
              <div className="flex items-center">
                <Mail
                  size={18}
                  className="text-indigo-400 mr-3 flex-shrink-0"
                />
                <p className="text-sm text-gray-400">support@macyemacye.com</p>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <Truck className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Fast Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Secure Payment</p>
              </div>
              <div className="text-center">
                <Users className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">24/7 Support</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-lg text-white mb-6 relative inline-block">
                  Categories
                  <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-indigo-500"></span>
                </h3>
                <ul className="space-y-3">
                  {footerCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/shop?categoryId=${category.id}`}
                        className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                      >
                        <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  {categories.length > 6 && (
                    <li>
                      <Link
                        href="/shop"
                        className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center group transition-all duration-200"
                      >
                        <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                        View All Categories
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-semibold text-lg text-white mb-6 relative inline-block">
                  Company
                  <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-indigo-500"></span>
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/press"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Press
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h3 className="font-semibold text-lg text-white mb-6 relative inline-block">
                  Support
                  <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-indigo-500"></span>
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/help"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shipping"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Shipping Info
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/returns"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Returns & Exchanges
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/track-order"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Track Order
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/size-guide"
                      className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200"
                    >
                      <span className="h-1 w-0 bg-indigo-500 rounded-full mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-200"></span>
                      Size Guide
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="font-semibold text-lg text-white mb-6 relative inline-block">
              Stay Updated
              <span className="absolute -bottom-2 left-0 h-0.5 w-8 bg-indigo-500"></span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Subscribe to get exclusive offers, new product updates, and
              special discounts.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-md transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-gray-500 text-xs">
                By subscribing, you agree to our Privacy Policy.
              </p>
            </form>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-300 mb-4">
                Follow Us
              </h4>
              <div className="flex space-x-3">
                {[
                  {
                    icon: <Facebook size={18} />,
                    name: "Facebook",
                    bg: "bg-blue-600",
                    href: "https://facebook.com/macyemacye",
                  },
                  {
                    icon: <Twitter size={18} />,
                    name: "Twitter",
                    bg: "bg-sky-500",
                    href: "https://twitter.com/macyemacye",
                  },
                  {
                    icon: <Instagram size={18} />,
                    name: "Instagram",
                    bg: "bg-pink-600",
                    href: "https://instagram.com/macyemacye",
                  },
                  {
                    icon: <Youtube size={18} />,
                    name: "YouTube",
                    bg: "bg-red-600",
                    href: "https://youtube.com/macyemacye",
                  },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`${social.bg} p-2.5 rounded-full text-white hover:opacity-90 hover:scale-110 transition-all duration-200`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods and copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            {[
              "Visa",
              "Mastercard",
              "PayPal",
              "Apple Pay",
              "Google Pay",
              "Stripe",
            ].map((method, idx) => (
              <div key={idx} className="text-xs text-gray-500 font-medium">
                {method}
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row text-center md:text-left items-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
            <p className="text-gray-400">
              © {currentYear} macyemacye. All rights reserved.
            </p>
            <div className="flex space-x-4 text-gray-500">
              {[
                { name: "Terms", href: "/terms" },
                { name: "Privacy", href: "/privacy" },
                { name: "Cookies", href: "/cookies" },
                { name: "Sitemap", href: "/sitemap" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
