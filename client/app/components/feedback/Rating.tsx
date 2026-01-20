"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayedRating = hoverRating || rating;

  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isActive = value <= displayedRating;

        return (
          <button
            key={index}
            type="button"
            className={`${interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
          >
            <Star
              size={size}
              fill={isActive ? "#EAB308" : "transparent"}
              className={`${isActive ? "text-yellow-500" : "text-gray-300"}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
