import React, { useState, useEffect } from 'react';
import { Star, Sparkles } from 'lucide-react';

interface AnimatedRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export default function AnimatedRating({ 
  rating, 
  onRatingChange, 
  size = 'md',
  showAnimation = true 
}: AnimatedRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [animatingStars, setAnimatingStars] = useState<number[]>([]);
  const [showSparkles, setShowSparkles] = useState(false);

  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const starSize = sizes[size];

  useEffect(() => {
    if (rating > 0 && showAnimation) {
      // Animate stars one by one
      const animateStars = async () => {
        setAnimatingStars([]);
        for (let i = 1; i <= rating; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setAnimatingStars(prev => [...prev, i]);
        }
        
        // Show sparkles for high ratings
        if (rating >= 8) {
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 1000);
        }
      };
      
      animateStars();
    }
  }, [rating, showAnimation]);

  const handleStarClick = (starRating: number) => {
    onRatingChange(starRating);
    
    // Trigger haptic feedback
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  return (
    <div className="relative flex justify-center gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starRating) => {
        const isActive = starRating <= (hoveredRating || rating);
        const isAnimating = animatingStars.includes(starRating);
        
        return (
          <button
            key={starRating}
            onClick={() => handleStarClick(starRating)}
            onMouseEnter={() => setHoveredRating(starRating)}
            onMouseLeave={() => setHoveredRating(0)}
            className={`transition-all duration-200 hover:scale-125 ${
              isAnimating ? 'animate-bounce' : ''
            }`}
            style={{
              animationDelay: `${(starRating - 1) * 100}ms`,
            }}
          >
            <Star
              size={starSize}
              className={`${
                isActive
                  ? 'text-yellow-400 fill-current drop-shadow-lg'
                  : 'text-white/30 hover:text-white/50'
              } transition-all duration-200`}
            />
          </button>
        );
      })}
      
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <Sparkles
              key={i}
              size={16}
              className="absolute text-yellow-300 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}