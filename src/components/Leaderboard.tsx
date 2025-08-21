import React, { useState } from 'react';
import { useEffect } from 'react';
import { Trophy, Star, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRealtime } from '../hooks/useRealtime';
import { LeaderboardEntry } from '../types';
import PullToRefresh from './PullToRefresh';
import AchievementBadge from './AchievementBadge';
import { SkeletonLeaderboard } from './LoadingSpinner';
import { AnalyticsService } from '../services/analytics';

export default function Leaderboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'rated' | 'referrals'>('rated');
  const [refreshing, setRefreshing] = useState(false);

  // Real-time leaderboard updates
  useRealtime({
    onLeaderboardUpdate: () => {
      console.log('Leaderboard updated in real-time');
    },
  });

  // Generate leaderboard data
  const ratedLeaderboard: LeaderboardEntry[] = state.profiles
    .filter(profile => profile.totalRatings > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .map((profile, index) => ({
      profile,
      rank: index + 1,
      change: Math.floor(Math.random() * 3) - 1, // Random change for demo
    }));

  const referralLeaderboard = state.referralStats
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 10);

  const handleRefresh = async () => {
    setRefreshing(true);
    AnalyticsService.trackFeatureUsage('leaderboard_refresh', state.currentUser?.id);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Trophy className="text-gray-400" size={24} />;
    if (rank === 3) return <Trophy className="text-amber-600" size={24} />;
    return <span className="text-2xl font-bold text-white/70">#{rank}</span>;
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Leaderboards</h1>
          <p className="text-white/70">See who's leading the pack!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setActiveTab('rated')}
            onClick={() => {
              setActiveTab('rated');
              AnalyticsService.trackFeatureUsage('leaderboard_tab_switch', state.currentUser?.id, { tab: 'rated' });
            }}
            className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'rated'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Star size={20} />
            Top Rated
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            onClick={() => {
              setActiveTab('referrals');
              AnalyticsService.trackFeatureUsage('leaderboard_tab_switch', state.currentUser?.id, { tab: 'referrals' });
            }}
            className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'referrals'
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Users size={20} />
            Top Inviters
          </button>
        </div>

        {/* Achievement showcase for current user */}
        {state.currentUser && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Your Achievements</h2>
            <div className="grid grid-cols-1 gap-2">
              <AchievementBadge
                achievement={{
                  id: 'first_rating',
                  name: 'First Impression',
                  description: 'Submit your first rating',
                  icon: '⭐',
                  reward: 5,
                  unlocked: true,
                }}
                showProgress={false}
                size="sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'rated' ? (
          <div className="space-y-3">
            {refreshing && <SkeletonLeaderboard />}
            {ratedLeaderboard.map((entry) => (
              <div
                key={entry.profile.userId}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 ${
                  entry.rank <= 3 ? 'ring-2 ring-yellow-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <img
                    src={entry.profile.user.avatar}
                    alt={entry.profile.user.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {entry.profile.user.firstName} {entry.profile.user.lastName}
                    </h3>
                    <p className="text-white/60 text-sm">@{entry.profile.user.username}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="text-yellow-400 fill-current" size={18} />
                      <span className="text-xl font-bold text-white">{entry.profile.averageRating}</span>
                    </div>
                    <p className="text-white/60 text-sm">{entry.profile.totalRatings} ratings</p>
                  </div>
                  
                  {entry.change !== 0 && (
                    <div className="flex items-center">
                      {entry.change > 0 ? (
                        <TrendingUp className="text-green-400" size={20} />
                      ) : (
                        <TrendingDown className="text-red-400" size={20} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {refreshing && <SkeletonLeaderboard />}
            {referralLeaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 ${
                  index < 3 ? 'ring-2 ring-green-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <img
                    src={entry.user.avatar}
                    alt={entry.user.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {entry.user.firstName} {entry.user.lastName}
                    </h3>
                    <p className="text-white/60 text-sm">@{entry.user.username}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="text-blue-400" size={18} />
                      <span className="text-xl font-bold text-white">{entry.referralCount}</span>
                    </div>
                    <p className="text-white/60 text-sm">{entry.totalEarned}⭐ earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}