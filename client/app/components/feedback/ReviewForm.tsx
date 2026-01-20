"use client";

import React, { useState } from "react";
import Rating from "./Rating";
import { useCreateReviewMutation } from "@/app/store/apis/ReviewApi";
import { Camera, X, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/app/store/hooks";
import { addToast } from "@/app/store/slices/ToastSlice";
import Image from "next/image";
import { getCloudinaryUrl } from "@/app/utils/cloudinaryUtils";

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const dispatch = useAppDispatch();

    const [createReview, { isLoading }] = useCreateReviewMutation();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            dispatch(addToast({ message: "Maximum 5 images allowed", type: "warning" }));
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            dispatch(addToast({ message: "Please select a rating", type: "error" }));
            return;
        }

        try {
            await createReview({
                productId,
                rating,
                comment,
                images,
            }).unwrap();

            dispatch(addToast({ message: "Review submitted successfully", type: "success" }));
            setRating(0);
            setComment("");
            setImages([]);
            setPreviews([]);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            dispatch(addToast({ message: error?.data?.message || "Failed to submit review", type: "error" }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                <Rating
                    rating={rating}
                    interactive
                    onRatingChange={setRating}
                    size={28}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                    placeholder="Share your thoughts about the product..."
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                <div className="flex flex-wrap gap-3">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                            <Image src={preview} alt="Preview" fill className="object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    {images.length < 5 && (
                        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                            <Camera size={24} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500 mt-1">Add Photo</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Submit Review"}
            </button>
        </form>
    );
};

export default ReviewForm;
