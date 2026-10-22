import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showScore?: boolean;
  totalReviews?: number;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Mahina / Poor (1★)',
  2: 'Katamtaman / Fair (2★)',
  3: 'Maayos / Good (3★)',
  4: 'Napakaganda / Very Good (4★)',
  5: 'Ekselente / Excellent (5★)',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showScore = false,
  totalReviews,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = currentVal >= starValue;
          const isHalf = !isFilled && currentVal >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? 'cursor-pointer p-0.5 hover:scale-120 transition-transform active:scale-95 focus:outline-none'
                  : 'cursor-default p-0'
              }`}
              title={interactive ? RATING_LABELS[starValue] : `${rating} out of 5 stars`}
              aria-label={`${starValue} star`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {interactive && hoverRating !== null && (
        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-fadeIn">
          {RATING_LABELS[hoverRating]}
        </span>
      )}

      {showScore && (
        <div className="flex items-center gap-1 text-xs">
          <span className="font-extrabold text-[#173747] dark:text-slate-100">
            {rating > 0 ? rating.toFixed(1) : 'Bago'}
          </span>
          {totalReviews !== undefined && (
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
