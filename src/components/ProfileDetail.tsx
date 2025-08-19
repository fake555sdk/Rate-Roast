import React, { useState } from 'react';
import { ArrowLeft, Star, MessageCircle, Users, Zap, Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfileDetail() {
  const { state, dispatch } = useApp();
  const [showAllRoasts, setShowAllRoasts] = useState(false);
  
  if (!state.selectedProfile) return null;
  
  const profile = state.selectedProfile;
  const profileRoasts = state.roasts.filter(roast => roast.profileId === profile.userId);
  const hasUnlockedRoasts = state.unlockedRoasts.has(profile.userId);
  const isOwnProfile = state.currentUser?.id === profile.userId;
  
  const handleBack = () => {
    dispatch({ type: 'SELECT_PROFILE', payload: null });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'feed' });
  };

  const handleUnlockRoasts = () => {
    if (state.currentUser && state.currentUser.starsBalance >= 5) {
      dispatch({ type: 'UNLOCK_ROASTS', payload: profile.userId });
      dispatch({ type: 'UPDATE_STARS', payload: { userId: state.currentUser.id, amount: -5 } });
    }
  };

  const visibleRoasts = hasUnlockedRoasts || isOwnProfile 
    ? profileRoasts 
    : profileRoasts.slice(0, showAllRoasts ? profileRoasts.length : 1);

  return (
    <div className="space-y-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        Back to Feed
      </button>

      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-6 mb-6">
          <img
            src={profile.user.avatar}
            alt={profile.user.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile.user.firstName} {profile.user.lastName}
            </h1>
            <p className="text-white/70 mb-2">@{profile.user.username}</p>
            <p className="text-white/80">{profile.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="text-yellow-400 fill-current" size={24} />
              <span className="text-3xl font-bold text-white">{profile.averageRating}</span>
            </div>
            <p className="text-white/70">{profile.totalRatings} ratings</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="text-red-400" size={24} />
              <span className="text-3xl font-bold text-white">{profile.roastCount}</span>
            </div>
            <p className="text-white/70">roasts</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="text-blue-400" size={24} />
              <span className="text-3xl font-bold text-white">
                {state.referralStats.find(r => r.userId === profile.userId)?.referralCount || 0}
              </span>
            </div>
            <p className="text-white/70">referrals</p>
          </div>
        </div>

        {profile.boostedUntil && profile.boostedUntil > new Date() && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-yellow-300">
              <Zap size={20} />
              <span className="font-semibold">Profile Boosted!</span>
            </div>
            <p className="text-yellow-200/80 text-sm mt-1">
              Enhanced visibility until {profile.boostedUntil.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="text-red-400" />
            Roasts ({profileRoasts.length})
          </h2>
          
          {!isOwnProfile && !hasUnlockedRoasts && profileRoasts.length > 0 && (
            <button
              onClick={handleUnlockRoasts}
              disabled={!state.currentUser || state.currentUser.starsBalance < 5}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Lock size={16} />
              Unlock All (5⭐)
            </button>
          )}
        </div>

        {profileRoasts.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="text-white/30 mx-auto mb-4" size={48} />
            <p className="text-white/70">No roasts yet. Be the first to roast!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleRoasts.map((roast, index) => (
              <div
                key={roast.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  roast.type === 'ai'
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {roast.type === 'ai' && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        AI {roast.theme?.toUpperCase()}
                      </span>
                    )}
                    <span className="text-white/60 text-sm">Anonymous</span>
                  </div>
                  <span className="text-white/50 text-sm">
                    {roast.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white text-lg">{roast.content}</p>
              </div>
            ))}
            
            {!hasUnlockedRoasts && !isOwnProfile && profileRoasts.length > visibleRoasts.length && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <Lock className="text-white/50 mx-auto mb-3" size={32} />
                <p className="text-white/70 mb-4">
                  {profileRoasts.length - visibleRoasts.length} more roasts hidden
                </p>
                <button
                  onClick={handleUnlockRoasts}
                  disabled={!state.currentUser || state.currentUser.starsBalance < 5}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Unlock for 5⭐
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}