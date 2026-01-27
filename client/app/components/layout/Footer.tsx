"use client";
import React, { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Send,
  Store,
  Loader2,
  ShoppingBag,
  Heart,
  Package,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES } from "@/app/gql/Product";
import useToast from "@/app/hooks/ui/useToast";
import dynamic from "next/dynamic";

const FooterShopsMap = dynamic(() => import("./FooterShopsMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800/50 h-[180px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  ),
});

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
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch real categories data
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  // Get top 4 categories for footer
  const footerCategories = categories.slice(0, 4);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsSubscribing(true);

    try {
      // Simulate API call - replace with actual newsletter API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      showToast("Successfully subscribed to newsletter! 🎉", "success");
      setEmail("");
    } catch (error) {
      showToast("Failed to subscribe. Please try again.", "error");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

      {/* Glow Effects */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12 pb-12 border-b border-gray-800/80">
          {/* Logo and description */}
          <div className="col-span-1 lg:col-span-4">
            <div className="flex items-center mb-6">
              <FooterLogo />
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600 ml-4 mr-2"></div>
              <span className="text-sm font-medium tracking-wider text-gray-400 uppercase">
                Premium Store
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Discover high-quality products at macyemacye. Shop with confidence and enjoy premium selections tailored just for you.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <MapPin size={16} className="text-indigo-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-400">Rwanda, Kigali, Nyarugenge</p>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="text-indigo-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-400">+250 790 706 170</p>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="text-indigo-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-400">support@macyemacye.com</p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                {[
                  { icon: <Facebook size={16} />, name: "Facebook", bg: "bg-blue-600", href: "https://facebook.com" },
                  { icon: <Twitter size={16} />, name: "Twitter", bg: "bg-sky-500", href: "https://twitter.com" },
                  { icon: <Instagram size={16} />, name: "Instagram", bg: "bg-pink-600", href: "https://instagram.com" },
                  { icon: <Youtube size={16} />, name: "YouTube", bg: "bg-red-600", href: "https://youtube.com" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`${social.bg} p-2 rounded-full text-white hover:opacity-90 hover:scale-110 transition-all duration-200`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 lg:col-span-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Shop Links */}
              <div>
                <h3 className="font-semibold text-base text-white mb-4 relative inline-block">
                  Shop
                  <span className="absolute -bottom-1 left-0 h-0.5 w-6 bg-indigo-500"></span>
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link href="/shop" className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200">
                      <ShoppingBag className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/shops" className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200">
                      <Store className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Browse Shops
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200">
                      <Heart className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="text-gray-400 hover:text-white text-sm flex items-center group transition-all duration-200">
                      <Package className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      My Orders
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-base text-white mb-4 relative inline-block">
                  Categories
                  <span className="absolute -bottom-1 left-0 h-0.5 w-6 bg-indigo-500"></span>
                </h3>
                <ul className="space-y-2.5">
                  {footerCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/shop?categoryId=${category.id}`}
                        className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter & Map */}
          <div className="col-span-1 lg:col-span-4">
            <h3 className="font-semibold text-base text-white mb-4 relative inline-block">
              Newsletter
              <span className="absolute -bottom-1 left-0 h-0.5 w-6 bg-indigo-500"></span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <form className="space-y-3 mb-6" onSubmit={handleNewsletterSubmit}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  disabled={isSubscribing}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 pl-4 pr-11 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </form>

            {/* Dynamic Shops Map */}
            <div className="mb-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Store size={14} className="text-indigo-400" />
                Our Shop Locations
              </h4>
            </div>
            <FooterShopsMap />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} macyemacye. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs text-gray-500">
              {["Visa", "Mastercard", "PayPal", "Stripe"].map((method, idx) => (
                <span key={idx} className="font-medium">{method}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
