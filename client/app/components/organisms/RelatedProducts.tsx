"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { GET_PRODUCTS } from "@/app/gql/Product";
import { Product } from "@/app/types/productTypes";
import ProductCard from "@/app/(public)/product/ProductCard";

interface RelatedProductsProps {
    categoryId: string;
    currentProductId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
    categoryId,
    currentProductId,
}) => {
    const { data, loading, error } = useQuery(GET_PRODUCTS, {
        variables: {
            first: 5,
            filters: { category: categoryId },
        },
        fetchPolicy: "cache-first",
    });

    const products = data?.products?.products || [];
    const filteredProducts = products.filter(
        (product: Product) => product.id !== currentProductId
    );

    if (loading) {
        return (
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Related Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                        >
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || filteredProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Related Products</h2>
                <div className="h-1 flex-1 bg-gray-100 ml-6 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.slice(0, 4).map((product: Product, index: number) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
