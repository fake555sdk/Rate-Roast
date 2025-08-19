import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../types';

interface SwipeableCardProps {
  profile: Profile;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  children: React.ReactNode;
}

export default function SwipeableCard({ 
  profile, 
  onSwipeLeft, 
  onSwipeRight, 
  onTap, 
  children 
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const offset = clientX - startX;
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (Math.abs(dragOffset) < 10) {
      // Consider it a tap if minimal movement
      onTap?.();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX]);

  const getSwipeIndicator = () => {
    if (Math.abs(dragOffset) < 50) return null;
    
    if (dragOffset > 0) {
      return (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          👍 LIKE
        </div>
      );
    } else {
      return (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          👎 PASS
        </div>
      );
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative select-none cursor-grab active:cursor-grabbing transition-transform duration-200 ${
        isDragging ? 'z-10' : ''
      }`}
      style={{
        transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
        opacity: Math.max(0.5, 1 - Math.abs(dragOffset) / 300),
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      {getSwipeIndicator()}
    </div>
  );
}