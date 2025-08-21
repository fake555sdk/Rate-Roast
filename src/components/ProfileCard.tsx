import React, { useState } from 'react';
import { Star, MessageCircle, Zap, Users } from 'lucide-react';
import { Profile } from '../types';
import { useApp } from '../context/AppContext';
import { useRealtime } from '../hooks/useRealtime';
import { OptimizedImage } from '../hooks/useOptimizedImages';
import { AnalyticsService } from '../services/analytics';
import RatingModal from './RatingModal';
import RoastModal from './RoastModal';

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { state, dispatch } = useApp();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRoastModal, setShowRoastModal] = useState(false);
  const [liveStats, setLiveStats] = useState({
    averageRating: profile.averageRating,
    totalRatings: profile.totalRatings,
    roastCount: profile.roastCount,
  });
  
  // Real-time updates for this profile
  useRealtime({
    profileId: profile.userId,
    onRatingUpdate: (payload) => {
      // Update live stats when new rating comes in
      setLiveStats(prev => ({
        ...prev,
        totalRatings: prev.totalRatings + 1,
        // Recalculate average (simplified)
        averageRating: ((prev.averageRating * prev.totalRatings) + payload.new.score) / (prev.totalRatings + 1),
      }));
    },
    onRoastUpdate: () => {
      setLiveStats(prev => ({
        ...prev,
        roastCount: prev.roastCount + 1,
      }));
    },
  });

  const isBoosted = profile.boostedUntil && profile.boostedUntil > new Date();
  const isOwnProfile = state.currentUser?.id === profile.userId;
  
  const handleViewProfile = () => {
    AnalyticsService.trackProfileView(profile.userId, state.currentUser?.id);
    dispatch({ type: 'SELECT_PROFILE', payload: profile });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'profile' });
  };

  const handleBoost = () => {
    if (state.currentUser && state.currentUser.starsBalance >= 10) {
      dispatch({ type: 'BOOST_PROFILE', payload: profile.userId });
      dispatch({ type: 'UPDATE_STARS', payload: { userId: state.currentUser.id, amount: -10 } });
    }
  };

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isBoosted 
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 shadow-yellow-500/25' 
          : 'bg-white/10 border border-white/20 shadow-xl'
      }`}>
        {isBoosted && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Zap size={14} />
            BOOSTED
          </div>
        )}
        
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <OptimizedImage
              src={profile.user.avatar}
              alt={profile.user.username}
              className="w-16 h-16 rounded-full object-cover border-3 border-white/30"
              optimization={{ maxWidth: 64, maxHeight: 64, quality: 85 }}
            />
            {profile.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {profile.user.firstName} {profile.user.lastName}
            </h3>
            <p className="text-white/70 text-sm">@{profile.user.username}</p>
            <p className="text-white/80 text-sm mt-2">{profile.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="text-yellow-400 fill-current" size={20} />
              <span className="text-2xl font-bold text-white">{liveStats.averageRating.toFixed(1)}</span>
            </div>
            <p className="text-white/70 text-xs">{liveStats.totalRatings} ratings</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="text-red-400" size={20} />
              <span className="text-2xl font-bold text-white">{liveStats.roastCount}</span>
            </div>
            <p className="text-white/70 text-xs">roasts</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="text-blue-400" size={20} />
              <span className="text-2xl font-bold text-white">
                {state.referralStats.find(r => r.userId === profile.userId)?.referralCount || 0}
              </span>
            </div>
            <p className="text-white/70 text-xs">referrals</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!isOwnProfile && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Star size={16} />
              Rate
            </button>
          )}
          
          <button
            onClick={() => setShowRoastModal(true)}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Roast
          </button>
          
          {isOwnProfile && (
            <button
              onClick={handleBoost}
              disabled={!state.currentUser || state.currentUser.starsBalance < 10}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Boost (10⭐)
            </button>
          )}
        </div>
        
        <button
          onClick={handleViewProfile}
          className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          View Profile
        </button>
      </div>

      {showRatingModal && (
        <RatingModal
          profile={profile}
          onClose={() => setShowRatingModal(false)}
        />
      )}
      
      {showRoastModal && (
        <RoastModal
          profile={profile}
          onClose={() => setShowRoastModal(false)}
        />
      )}
    </>
  );
}