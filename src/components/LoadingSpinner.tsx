import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  color?: 'white' | 'blue' | 'purple';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  fullScreen = false,
  color = 'white'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    white: 'text-white',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
      />
      {text && (
        <p className={`${colorClasses[color]} ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Skeleton loading components
export function SkeletonCard() {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full" />
        <div className="flex-1">
          <div className="h-6 bg-white/20 rounded mb-2 w-3/4" />
          <div className="h-4 bg-white/20 rounded mb-2 w-1/2" />
          <div className="h-4 bg-white/20 rounded w-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="h-8 bg-white/20 rounded mb-1" />
            <div className="h-3 bg-white/20 rounded" />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="h-10 bg-white/20 rounded-lg" />
        <div className="h-10 bg-white/20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonLeaderboard() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full" />
            <div className="w-12 h-12 bg-white/20 rounded-full" />
            <div className="flex-1">
              <div className="h-5 bg-white/20 rounded mb-2 w-3/4" />
              <div className="h-4 bg-white/20 rounded w-1/2" />
            </div>
            <div className="text-right">
              <div className="h-6 bg-white/20 rounded mb-1 w-16" />
              <div className="h-4 bg-white/20 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-white/20 rounded-full" />
          <div className="flex-1">
            <div className="h-8 bg-white/20 rounded mb-2 w-3/4" />
            <div className="h-5 bg-white/20 rounded mb-2 w-1/2" />
            <div className="h-4 bg-white/20 rounded w-full" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-10 bg-white/20 rounded mb-2" />
              <div className="h-4 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="h-8 bg-white/20 rounded mb-4 w-1/3" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="h-4 bg-white/20 rounded mb-2 w-1/4" />
              <div className="h-6 bg-white/20 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}