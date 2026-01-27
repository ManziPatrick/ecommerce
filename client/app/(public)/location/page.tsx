"use client";
import { useEffect } from "react";
import MainLayout from "@/app/components/templates/MainLayout";
import { MapPin, Phone, Mail, Navigation, Clock, Store } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <MapPin className="w-12 h-12 text-indigo-600 animate-bounce" />
    </div>
  ),
});

export default function LocationPage() {
  // Add JSON-LD structured data for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "macyemacye",
      "image": "https://macyemacye.com/logoo.png",
      "description": "Premium online shopping store in Kigali, Rwanda. Quality products, fast delivery, exceptional service.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "kkt39j, Nyakarambi",
        "addressLocality": "Kigali",
        "addressCountry": "RW",
        "addressRegion": "Kigali City"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -2.3102,
        "longitude": 30.8379
      },
      "url": "https://macyemacye.com",
      "telephone": "+250790706170",
      "email": "support@macyemacye.com",
      "priceRange": "$$",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "17:00"
        }
      ],
      "sameAs": [
        "https://facebook.com/macyemacye",
        "https://twitter.com/macyemacye",
        "https://instagram.com/macyemacye"
      ]
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Visit Our Store
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                Find us in the heart of Kigali, Rwanda. We're here to serve you with quality products and exceptional service.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Location Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Address Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Address</h2>
                </div>
                
                <address className="not-italic space-y-3 text-gray-700">
                  <p className="text-lg font-semibold">macyemacye</p>
                  <p>kkt39j, Nyakarambi</p>
                  <p>Kigali, Rwanda</p>
                  <p className="text-sm text-gray-500 italic">Near Bank of Kigali</p>
                </address>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=-2.3102,30.8379"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
                <div className="space-y-4">
                  <a
                    href="tel:+250790706170"
                    className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">+250 790 706 170</p>
                    </div>
                  </a>

                  <a
                    href="mailto:support@macyemacye.com"
                    className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">support@macyemacye.com</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-red-600">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/shop"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Store className="w-4 h-4" />
                    Browse Products
                  </Link>
                  <Link
                    href="/shops"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    All Shop Locations
                  </Link>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Us on the Map</h2>
                <LocationMap />
                
                {/* Landmarks */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Nearby Landmarks</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Bank of Kigali (Main landmark)</li>
                    <li>• Nyakarambi neighborhood</li>
                    <li>• Easy access from main roads</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About Our Kigali Location
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  Welcome to <strong>macyemacye</strong>, your premier shopping destination in <strong>Kigali, Rwanda</strong>. 
                  Located at <strong>kkt39j, Nyakarambi</strong>, we are conveniently situated <strong>near Bank of Kigali</strong>, 
                  making us easily accessible for all your shopping needs.
                </p>
                <p className="mb-4">
                  Our store in <strong>Nyakarambi, Kigali</strong> offers a wide range of premium products with exceptional 
                  customer service. Whether you're looking for electronics, fashion, home goods, or more, we have everything 
                  you need under one roof.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Why Shop at macyemacye in Kigali?
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Prime Location</strong>: Easy to find near Bank of Kigali in Nyakarambi</li>
                  <li><strong>Quality Products</strong>: Curated selection of premium items</li>
                  <li><strong>Fast Delivery</strong>: Quick shipping across Rwanda</li>
                  <li><strong>Secure Shopping</strong>: Safe and reliable payment options</li>
                  <li><strong>Expert Support</strong>: Knowledgeable staff ready to assist</li>
                </ul>
                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                  How to Find Us
                </h3>
                <p className="mb-4">
                  Our shop is located in the heart of <strong>Kigali</strong>, specifically in the <strong>Nyakarambi</strong> area. 
                  The exact address is <strong>kkt39j, Nyakarambi, Kigali, Rwanda</strong>. We are positioned near the 
                  <strong> Bank of Kigali</strong>, which serves as a major landmark for easy navigation.
                </p>
                <p>
                  For GPS navigation, you can use our location or simply search for "macyemacye Kigali" or "kkt39j Nyakarambi" 
                  in your maps application. We look forward to welcoming you to our store!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
