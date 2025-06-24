import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  size = 'md',
  showValue = true,
  className = ''
}) => {
  const stars = 5;
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStar = (index: number) => {
    if (index < fullStars) {
      return <Star key={index} className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`} />;
    } else if (index === fullStars && hasHalfStar) {
      // For simplicity, we'll use the Star icon for half stars as well
      return <Star key={index} className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400 opacity-50`} />;
    } else {
      return <Star key={index} className={`${sizeClasses[size]} text-gray-300`} />;
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {[...Array(stars)].map((_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className={`ml-1 font-medium ${textSizeClasses[size]}`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;