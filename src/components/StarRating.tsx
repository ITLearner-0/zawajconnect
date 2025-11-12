import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number | null;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md',
  className 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starValue: number) => {
    if (readonly || !onRatingChange) return;
    
    // If clicking the same star that's already selected, deselect it
    if (rating === starValue) {
      onRatingChange(0); // 0 means no rating
    } else {
      onRatingChange(starValue);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          onClick={() => handleStarClick(starValue)}
          disabled={readonly}
          className={cn(
            "transition-all",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
          aria-label={`${starValue} étoile${starValue > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              rating && starValue <= rating
                ? "fill-gold text-gold"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
