"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/app/store/apis/WishlistApi";
import { useAddToCartMutation } from "@/app/store/apis/CartApi";
import { useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";
import { generateProductPlaceholder } from "@/app/utils/placeholderImage";

const WishlistPage = () => {
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetWishlistQuery(undefined);
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const [addToCart] = useAddToCartMutation();

    const handleRemove = async (variantId: string) => {
        try {
            await removeFromWishlist(variantId).unwrap();
            dispatch(addToast({ message: "Removed from wishlist", type: "success" }));
        } catch (error: any) {
            dispatch(addToast({ message: error?.data?.message || "Failed to remove", type: "error" }));
        }
    };

    const handleMoveToCart = async (variantId: string) => {
        try {
            await addToCart({ variantId, quantity: 1 }).unwrap();
            await removeFromWishlist(variantId).unwrap();
            dispatch(addToast({ message: "Moved to cart", type: "success" }));
        } catch (error: any) {
            dispatch(addToast({ message: error?.data?.message || "Failed to add to cart", type: "error" }));
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const wishlistItems = data?.wishlist || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Heart className="text-red-500" fill="currentColor" /> My Wishlist
                </h1>
                <Link
                    href="/shop"
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> Continue Shopping
                </Link>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-100 p-12 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
                        <Heart size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Save items you love to your wishlist and they will appear here.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Explore Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item: any) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                        >
                            <div className="relative aspect-square bg-gray-50">
                                <Image
                                    src={item.variant?.images[0] || generateProductPlaceholder(item.variant?.product?.name || "Product")}
                                    alt={item.variant?.product?.name || "Product"}
                                    fill
                                    className="object-contain p-4"
                                />
                                <button
                                    onClick={() => handleRemove(item.variantId)}
                                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 shadow-sm transition-colors"
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                <Link href={`/product/${item.variant?.product?.slug}`} className="hover:text-indigo-600 transition-colors">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                                        {item.variant?.product?.name}
                                    </h3>
                                </Link>

                                <div className="mt-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-bold text-indigo-700">
                                            ${item.variant?.price.toFixed(2)}
                                        </span>
                                        {item.variant?.stock > 0 ? (
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        disabled={item.variant?.stock === 0}
                                        onClick={() => handleMoveToCart(item.variantId)}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-2.5 rounded-md font-medium transition-colors"
                                    >
                                        <ShoppingCart size={18} /> Move to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
