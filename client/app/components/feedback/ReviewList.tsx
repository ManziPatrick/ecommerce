"use client";

import React from "react";
import Rating from "./Rating";
import { useGetReviewsByProductQuery, useDeleteReviewMutation } from "@/app/store/apis/ReviewApi";
import { format } from "date-fns";
import Image from "next/image";
import { getCloudinaryUrl } from "@/app/utils/cloudinaryUtils";
import { Trash2, User } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";

interface ReviewListProps {
    productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
    const { data, isLoading } = useGetReviewsByProductQuery(productId);
    const { user } = useAppSelector((state) => state.auth);
    const [deleteReview] = useDeleteReviewMutation();
    const dispatch = useAppDispatch();

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-50 rounded-lg"></div>
            ))}
        </div>;
    }

    const reviews = data?.reviews || [];

    const handleDelete = async (reviewId: string) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await deleteReview(reviewId).unwrap();
            dispatch(addToast({ message: "Review deleted", type: "success" }));
        } catch (err: any) {
            dispatch(addToast({ message: err?.data?.message || "Failed to delete", type: "error" }));
        }
    };

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review: any) => (
                <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                {review.user?.avatar ? (
                                    <Image src={getCloudinaryUrl(review.user.avatar, "w_100,h_100,c_fill,f_auto,q_auto")} alt={review.user.name} width={40} height={40} className="object-cover" />
                                ) : (
                                    <User size={20} className="text-indigo-600" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{review.user?.name}</h4>
                                <p className="text-xs text-gray-500">
                                    {review.createdAt ? (() => {
                                        try {
                                            return format(new Date(review.createdAt), "MMM dd, yyyy");
                                        } catch (e) {
                                            return "Recently";
                                        }
                                    })() : "Recently"}
                                </p>
                            </div>
                        </div>

                        {(user?.id === review.userId || user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
                            <button
                                onClick={() => handleDelete(review.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    <div className="mb-2">
                        <Rating rating={review.rating} size={16} />
                    </div>

                    {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>
                    )}

                    {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {review.images.map((img: string, idx: number) => (
                                <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-100">
                                    <Image src={getCloudinaryUrl(img, "w_300,h_300,c_fill,f_auto,q_auto")} alt="Review" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
