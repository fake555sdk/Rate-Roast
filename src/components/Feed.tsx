import React from 'react';
import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useRealtime } from '../hooks/useRealtime';
import ProfileCard from './ProfileCard';
import PullToRefresh from './PullToRefresh';
import InfiniteScroll from './InfiniteScroll';
import SwipeableCard from './SwipeableCard';
import ConfettiEffect from './ConfettiEffect';

export default function Feed() {
  const { state } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Real-time updates
  useRealtime({
    userId: state.currentUser?.id,
    onLeaderboardUpdate: () => {
      // Refresh feed when leaderboard changes
      console.log('Leaderboard updated');
    },
    onNotification: () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    },
  });

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPage(1);
    setLoading(false);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPage(prev => prev + 1);
    
    // Simulate end of data
    if (page >= 3) {
      setHasMore(false);
    }
    
    setLoading(false);
  }, [loading, page]);

  const handleSwipeRight = useCallback((profile: any) => {
    console.log('Liked profile:', profile.user.username);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  }, []);

  const handleSwipeLeft = useCallback((profile: any) => {
    console.log('Passed profile:', profile.user.username);
  }, []);
  // Sort profiles: boosted first, then by rating
  const sortedProfiles = [...state.profiles].sort((a, b) => {
    const aIsBoosted = a.boostedUntil && a.boostedUntil > new Date();
    const bIsBoosted = b.boostedUntil && b.boostedUntil > new Date();
    
    if (aIsBoosted && !bIsBoosted) return -1;
    if (!aIsBoosted && bIsBoosted) return 1;
    
    return b.averageRating - a.averageRating;
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔥 Rate & Roast</h1>
          <p className="text-white/70">Where profiles get rated and roasted!</p>
        </div>

        <InfiniteScroll
          hasMore={hasMore}
          loading={loading}
          onLoadMore={handleLoadMore}
        >
          <div className="grid gap-6">
            {sortedProfiles.map((profile) => (
              <SwipeableCard
                key={profile.userId}
                profile={profile}
                onSwipeRight={() => handleSwipeRight(profile)}
                onSwipeLeft={() => handleSwipeLeft(profile)}
              >
                <ProfileCard profile={profile} />
              </SwipeableCard>
            ))}
          </div>
        </InfiniteScroll>
      </div>
      
      <ConfettiEffect trigger={showConfetti} />
    </PullToRefresh>
  );
}