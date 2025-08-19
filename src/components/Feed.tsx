import React from 'react';
import { useApp } from '../context/AppContext';
import ProfileCard from './ProfileCard';

export default function Feed() {
  const { state } = useApp();

  // Sort profiles: boosted first, then by rating
  const sortedProfiles = [...state.profiles].sort((a, b) => {
    const aIsBoosted = a.boostedUntil && a.boostedUntil > new Date();
    const bIsBoosted = b.boostedUntil && b.boostedUntil > new Date();
    
    if (aIsBoosted && !bIsBoosted) return -1;
    if (!aIsBoosted && bIsBoosted) return 1;
    
    return b.averageRating - a.averageRating;
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🔥 Rate & Roast</h1>
        <p className="text-white/70">Where profiles get rated and roasted!</p>
      </div>

      <div className="grid gap-6">
        {sortedProfiles.map((profile) => (
          <ProfileCard key={profile.userId} profile={profile} />
        ))}
      </div>
    </div>
  );
}