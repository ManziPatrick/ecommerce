"use client";

import React from "react";
import ReviewForm from "@/app/components/feedback/ReviewForm";
import ReviewList from "@/app/components/feedback/ReviewList";
import Rating from "@/app/components/feedback/Rating";
import { MessageSquare, ThumbsUp, User } from "lucide-react";
import { useAppSelector } from "@/app/store/hooks";
import { useGetReviewsByProductQuery } from "@/app/store/apis/ReviewApi";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetReviewsByProductQuery(productId);

  const reviews = data?.reviews || [];

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const getRatingDistribution = () => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    });
    return counts.map((count) => ({
      count,
      percentage: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    })).reverse();
  };

  const distribution = getRatingDistribution();

  if (isLoading) {
    return <div className="p-8 text-center">Loading reviews...</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Summary and List */}
        <div className="flex-grow lg:w-2/3">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {reviews.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 bg-indigo-50/30 p-8 rounded-2xl border border-indigo-100/50 relative overflow-hidden">
            {/* Decorative background vectors for review summary */}
            <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="0" cy="0" r="100" fill="#4F46E5" />
                <circle cx="400" cy="200" r="120" fill="#818CF8" />
                <path d="M50 150 Q 150 100 250 180" stroke="#4F46E5" strokeWidth="2" fill="none" strokeDasharray="5 5" />
              </svg>
            </div>

            <div className="text-center md:border-r border-indigo-100 relative z-10">
              <div className="text-5xl font-black text-gray-900 mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                <Rating rating={Math.round(Number(averageRating))} size={20} />
              </div>
              <p className="text-sm text-gray-500 font-medium">Average Rating</p>
            </div>

            <div className="col-span-2 space-y-2">
              {distribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <span className="text-xs font-semibold text-gray-600 w-12">{5 - idx} Stars</span>
                  <div className="flex-grow bg-gray-200/50 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500 ease-out group-hover:bg-yellow-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-400 w-10">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <User size={18} className="text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">Community Feedback</h3>
            </div>
            {/* We can pass reviews here too to avoid double fetching, but for now we let it fetch */}
            <ReviewList productId={productId} />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <ThumbsUp size={18} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Your Experience</h3>
            </div>
            {user ? (
              <ReviewForm productId={productId} />
            ) : (
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl text-center">
                <p className="text-indigo-900 font-medium mb-4 italic">"Help others find great products. Log in to share your thoughts!"</p>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
