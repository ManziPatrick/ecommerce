"use client";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import MainLayout from "@/app/components/templates/MainLayout";
import ProductCard from "../../product/ProductCard";
import { GET_SHOP_BY_SLUG, GET_SHOP_BY_ID } from "@/app/gql/Shop";
import { Product } from "@/app/types/productTypes";
import { Store, Mail, Phone, MapPin, ExternalLink, Navigation, Package } from "lucide-react";
import BreadCrumb from "@/app/components/feedback/BreadCrumb";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { getCloudinaryUrl } from "@/app/utils/cloudinaryUtils";

const ShopMap = dynamic(() => import('./ShopMap'), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl" />
});

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
    placeName: string | null;
    latitude: number | null;
    longitude: number | null;
    products: Product[];
}

interface ShopClientProps {
    slug: string;
}

const ShopClient = ({ slug }: ShopClientProps) => {
    // Ensure slug is clean: decoded, lowercased, and trimmed
    const decodedSlug = decodeURIComponent(slug || '').toLowerCase().trim().replace(/\/$/, '');
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedSlug);
    
    const { data: slugData, loading: slugLoading, error: slugError } = useQuery<{ shop: Shop }>(GET_SHOP_BY_SLUG, {
        variables: { slug: decodedSlug },
        skip: !decodedSlug || isUuid,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        onError: (err) => {
            console.error("[ShopClient] GET_SHOP_BY_SLUG Error:", err);
        }
    });

    const { data: idData, loading: idLoading, error: idError } = useQuery<{ shopById: Shop }>(GET_SHOP_BY_ID, {
        variables: { id: decodedSlug },
        skip: !decodedSlug || !isUuid,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        onError: (err) => {
            console.error("🔍 [ShopClient] GET_SHOP_BY_ID Error:", err);
        }
    });

    const loading = isUuid ? idLoading : slugLoading;
    const error = isUuid ? idError : slugError;
    const shop = isUuid ? idData?.shopById : slugData?.shop;

    // Enhanced logging for debugging
    useEffect(() => {
        if (!loading) {
            console.log("🔍 [ShopClient] Load Complete:", {
                slug: decodedSlug,
                isUuid,
                hasShop: !!shop,
                productCount: shop?.products?.length || 0,
                error: error?.message || null
            });
            if (shop) console.log("🔍 [ShopClient] Shop Data:", shop);
            if (error) {
                console.error("🔍 [ShopClient] Full Error Object:", error);
                console.error("🔍 [ShopClient] Error Details:", {
                    message: error.message,
                    graphQLErrors: error.graphQLErrors,
                    networkError: error.networkError,
                    extraInfo: error.extraInfo
                });
            }
        }
    }, [decodedSlug, isUuid, loading, shop, error]);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-2xl mb-8"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 h-80"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !shop) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {error ? "Error loading shop" : "Shop not found"}
                        </h1>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {error 
                                ? "We encountered a problem reaching our servers. Please check your internet connection or try again later."
                                : "The shop you're looking for doesn't exist or has been removed."}
                        </p>
                        {error && (
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Retry Connection
                            </button>
                        )}
                    </div>
                </div>
            </MainLayout>
        );
    }

    const locationParts = [shop.street, shop.village, shop.city, shop.country].filter(Boolean);
    const hasLocation = shop.latitude && shop.longitude;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <BreadCrumb />
                    </div>
                </div>

                {/* Shop Header */}
                <div className="bg-white border-b border-gray-200">
                    {/* Premium Cover Banner with Gradient Overlay */}
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 w-full overflow-hidden">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        </div>
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        
                        {/* Floating Decorative Elements */}
                        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                            {/* Enhanced Shop Logo with Shadow */}
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="relative group"
                            >
                                <div className="w-36 h-36 md:w-40 md:h-40 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white flex-shrink-0 overflow-hidden transform transition-transform group-hover:scale-105">
                                    {shop.logo ? (
                                        <img
                                            src={getCloudinaryUrl(shop.logo)}
                                            alt={shop.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-6xl font-bold text-white">
                                                {shop.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Verified Badge */}
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg border-4 border-white">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Shop Info Section */}
                            <div className="flex-1 w-full md:pb-4">
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                                    {/* Shop Name and Description */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{shop.name}</h1>
                                            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                Verified Seller
                                            </span>
                                        </div>
                                        {shop.description && (
                                            <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                                                {shop.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex flex-wrap gap-6 mb-4 pb-4 border-b border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">{shop.products?.length || 0}</p>
                                                <p className="text-xs text-gray-500">Products</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{shop.city || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{shop.country || 'Location'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="flex flex-wrap gap-2">
                                        {shop.email && (
                                            <a
                                                href={`mailto:${shop.email}`}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 transition-all border border-indigo-100 hover:border-indigo-200 hover:shadow-md"
                                            >
                                                <Mail size={16} className="text-indigo-600" />
                                                <span className="hidden sm:inline">{shop.email}</span>
                                                <span className="sm:hidden">Email</span>
                                            </a>
                                        )}
                                        {shop.phone && (
                                            <a
                                                href={`tel:${shop.phone}`}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 transition-all border border-green-100 hover:border-green-200 hover:shadow-md"
                                            >
                                                <Phone size={16} className="text-green-600" />
                                                {shop.phone}
                                            </a>
                                        )}
                                        {locationParts.length > 0 && (
                                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-amber-100">
                                                <MapPin size={16} className="text-amber-600" />
                                                <span className="hidden md:inline">{locationParts.join(", ")}</span>
                                                <span className="md:hidden">{shop.city || locationParts[0]}</span>
                                            </span>
                                        )}
                                        {hasLocation && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 px-4 py-2 rounded-xl text-sm font-medium text-blue-700 transition-all border border-blue-100 hover:border-blue-200 hover:shadow-md"
                                            >
                                                <Navigation size={16} className="text-blue-600" />
                                                Get Directions
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        

                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Products
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {shop.products?.length || 0} items available
                            </p>
                        </div>
                    </div>

                    {shop.products && shop.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {shop.products.map((product) => (
                                <ProductCard key={product.id} product={product as Product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No products listed
                            </h3>
                            <p className="text-gray-500">
                                This shop currently has no active listings.
                            </p>
                        </div>
                    )}
                </div>

                {/* Map Section - Moved to Bottom */}
                {hasLocation && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Our Store</h2>
                                <p className="text-gray-600">Find us on the map and get directions to our location</p>
                            </div>
                            <ShopMap 
                                latitude={shop.latitude!} 
                                longitude={shop.longitude!} 
                                shopName={shop.name} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ShopClient;
