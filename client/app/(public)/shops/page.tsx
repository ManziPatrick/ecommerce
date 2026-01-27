"use client";
import { useState, useEffect } from "react";
import MainLayout from "@/app/components/templates/MainLayout";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { MapPin, Store, Navigation, Phone, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const AllShopsMap = dynamic(() => import("./AllShopsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  ),
});

const GET_ALL_SHOPS = gql`
  query GetAllShops {
    shops {
      id
      name
      slug
      description
      logo
      email
      phone
      country
      city
      village
      street
      latitude
      longitude
      _count {
        products
      }
    }
  }
`;

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  village: string | null;
  street: string | null;
  latitude: number | null;
  longitude: number | null;
  _count: {
    products: number;
  };
}

export default function ShopsPage() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [sortedShops, setSortedShops] = useState<Shop[]>([]);

  const { data, loading, error } = useQuery<{ shops: Shop[] }>(GET_ALL_SHOPS, {
    fetchPolicy: "network-only",
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort shops by distance when user location is available
  useEffect(() => {
    if (data?.shops && userLocation) {
      const shopsWithDistance = data.shops
        .filter((shop) => shop.latitude && shop.longitude)
        .map((shop) => ({
          ...shop,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            shop.latitude!,
            shop.longitude!
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      setSortedShops(shopsWithDistance as Shop[]);
    } else if (data?.shops) {
      setSortedShops(data.shops.filter((shop) => shop.latitude && shop.longitude));
    }
  }, [data, userLocation]);

  const shopsWithLocation = sortedShops.length > 0 ? sortedShops : (data?.shops?.filter((shop) => shop.latitude && shop.longitude) || []);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error loading shops
            </h1>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Shops Near You
            </h1>
            <p className="text-lg text-indigo-100 max-w-2xl">
              Explore {shopsWithLocation.length} verified shops across different locations.
              {userLocation && " We've sorted them by distance from your location."}
            </p>
          </div>
        </div>

        {/* Map Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                Shop Locations Map
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on any marker to view shop details
              </p>
            </div>
            <AllShopsMap
              shops={shopsWithLocation}
              userLocation={userLocation}
              onShopSelect={setSelectedShop}
            />
          </div>
        </div>

        {/* Shops List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {userLocation ? "Nearest Shops" : "All Shops"}
            </h2>
            <span className="text-sm text-gray-600">
              {shopsWithLocation.length} shops found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopsWithLocation.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 ${
                  selectedShop?.id === shop.id
                    ? "border-indigo-500"
                    : "border-gray-100"
                }`}
              >
                <div className="p-6">
                  {/* Shop Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        shop.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {shop.city}, {shop.country}
                      </p>
                      {userLocation && shop.latitude && shop.longitude && (
                        <p className="text-xs text-indigo-600 font-semibold mt-1">
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            shop.latitude,
                            shop.longitude
                          ).toFixed(1)}{" "}
                          km away
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {shop.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {shop.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {shop._count.products} products
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    {shop.email && (
                      <a
                        href={`mailto:${shop.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{shop.email}</span>
                      </a>
                    )}
                    {shop.phone && (
                      <a
                        href={`tel:${shop.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {shop.phone}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/shop/${shop.slug}`}
                      className="flex-1 bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                      View Shop
                    </Link>
                    {shop.latitude && shop.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Get Directions"
                      >
                        <Navigation className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {shopsWithLocation.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No shops with locations found
              </h3>
              <p className="text-gray-600">
                Check back later for new shops in your area
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
