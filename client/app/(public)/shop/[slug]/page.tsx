"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import MainLayout from "@/app/components/templates/MainLayout";
import ProductCard from "../../product/ProductCard";
import { GET_SHOP_BY_SLUG } from "@/app/gql/Shop";
import { Product } from "@/app/types/productTypes";
import { Store, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import BreadCrumb from "@/app/components/feedback/BreadCrumb";

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

const ShopDetailPage = () => {
    const params = useParams();
    const slug = typeof params?.slug === "string"
        ? decodeURIComponent(params.slug)
        : Array.isArray(params?.slug)
            ? decodeURIComponent(params.slug[0])
            : "";

    const { data, loading, error } = useQuery<{ shop: Shop }>(GET_SHOP_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-7xl mx-auto px-4 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 h-64"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error || !data?.shop) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop not found</h1>
                        <p className="text-gray-600">
                            The shop you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const shop = data.shop;
    const locationParts = [shop.street, shop.village, shop.city, shop.country].filter(Boolean);

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <BreadCrumb />
                    </div>
                </div>

                {/* Shop Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex items-start gap-6">
                            {/* Shop Logo */}
                            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                {shop.logo ? (
                                    <img
                                        src={shop.logo}
                                        alt={shop.name}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-indigo-600">
                                        {shop.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Shop Info */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
                                {shop.description && (
                                    <p className="text-indigo-100 mb-4 max-w-2xl">{shop.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm">
                                    {shop.email && (
                                        <a
                                            href={`mailto:${shop.email}`}
                                            className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            <Mail size={16} />
                                            {shop.email}
                                        </a>
                                    )}
                                    {shop.phone && (
                                        <a
                                            href={`tel:${shop.phone}`}
                                            className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            <Phone size={16} />
                                            {shop.phone}
                                        </a>
                                    )}
                                    {locationParts.length > 0 && (
                                        <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                                            <MapPin size={16} />
                                            {locationParts.join(", ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Products from {shop.name}
                        </h2>
                        <span className="text-gray-500">
                            {shop.products?.length || 0} products
                        </span>
                    </div>

                    {shop.products && shop.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {shop.products.map((product) => (
                                <ProductCard key={product.id} product={product as Product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No products yet
                            </h3>
                            <p className="text-gray-600">
                                This shop hasn&apos;t listed any products yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ShopDetailPage;
