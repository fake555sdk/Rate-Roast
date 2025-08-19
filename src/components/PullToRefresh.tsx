import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, Math.min(maxPull, currentY - startY));
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Trigger haptic feedback
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const getRefreshStatus = () => {
    if (isRefreshing) return 'Refreshing...';
    if (pullDistance >= threshold) return 'Release to refresh';
    if (pullDistance > 0) return 'Pull to refresh';
    return '';
  };

  const getRotation = () => {
    if (isRefreshing) return 'animate-spin';
    return `rotate-${Math.min(180, (pullDistance / threshold) * 180)}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-600/20 to-transparent backdrop-blur-sm transition-all duration-300 ease-out z-10"
        style={{
          height: `${Math.max(0, pullDistance)}px`,
          transform: `translateY(-${Math.max(0, maxPull - pullDistance)}px)`,
        }}
      >
        {pullDistance > 20 && (
          <>
            <RefreshCw
              size={24}
              className={`text-white mb-2 transition-transform duration-300 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${Math.min(180, (pullDistance / threshold) * 180)}deg)`,
              }}
            />
            <p className="text-white text-sm font-medium">
              {getRefreshStatus()}
            </p>
          </>
        )}
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}