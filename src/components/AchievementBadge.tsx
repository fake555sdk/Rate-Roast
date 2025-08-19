import React, { useState, useEffect } from 'react';
import { Trophy, Star, Users, MessageCircle, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementBadge({ 
  achievement, 
  showProgress = false, 
  size = 'md' 
}: AchievementBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievement.unlocked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [achievement.unlocked]);

  const getIcon = () => {
    switch (achievement.icon) {
      case '🏆': return <Trophy className="text-yellow-400" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />;
      case '⭐': return <Star className="text-yellow-400 fill-current" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />;
      case '👥': return <Users className="text-blue-400" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />;
      case '🔥': return <MessageCircle className="text-red-400" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />;
      case '⚡': return <Zap className="text-purple-400" size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />;
      default: return <span className="text-xl">{achievement.icon}</span>;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-2 text-xs';
      case 'md': return 'p-3 text-sm';
      case 'lg': return 'p-4 text-base';
    }
  };

  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  return (
    <div
      className={`relative rounded-lg border transition-all duration-300 ${getSizeClasses()} ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-lg'
          : 'bg-white/10 border-white/20'
      } ${isAnimating ? 'animate-pulse scale-105' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 ${achievement.unlocked ? '' : 'opacity-50'}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${
            achievement.unlocked ? 'text-white' : 'text-white/70'
          }`}>
            {achievement.name}
          </h3>
          <p className={`text-xs truncate ${
            achievement.unlocked ? 'text-white/80' : 'text-white/50'
          }`}>
            {achievement.description}
          </p>
          
          {showProgress && achievement.maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/60">
                  {achievement.progress || 0}/{achievement.maxProgress}
                </span>
                <span className="text-xs text-yellow-400 font-semibold">
                  +{achievement.reward}⭐
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {achievement.unlocked && (
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              +{achievement.reward}⭐
            </div>
          </div>
        )}
      </div>
      
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg animate-ping" />
      )}
    </div>
  );
}