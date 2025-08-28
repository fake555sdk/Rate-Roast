import React, { useState, useEffect } from 'react';
import { Users, Target, Clock, Trophy, Star, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { AnalyticsService } from '../services/analytics';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'community' | 'individual';
  goal: number;
  currentProgress: number;
  participants: number;
  reward: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'upcoming';
  userParticipated: boolean;
  userProgress: number;
}

export default function CommunityChallenge() {
  const { state } = useApp();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    // Mock challenges data
    const mockChallenges: Challenge[] = [
      {
        id: 'community_ratings_1000',
        title: 'Community Rating Milestone',
        description: 'Help the community reach 1,000 total ratings this week!',
        type: 'community',
        goal: 1000,
        currentProgress: 743,
        participants: 156,
        reward: 25,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'active',
        userParticipated: true,
        userProgress: 12,
      },
      {
        id: 'roast_weekend',
        title: 'Roast Weekend',
        description: 'Submit 5 creative roasts during the weekend for bonus rewards!',
        type: 'individual',
        goal: 5,
        currentProgress: 0,
        participants: 89,
        reward: 15,
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        userParticipated: false,
        userProgress: 0,
      },
      {
        id: 'referral_boost',
        title: 'Referral Boost Challenge',
        description: 'Invite 3 friends to join Rate & Roast this month!',
        type: 'individual',
        goal: 3,
        currentProgress: 0,
        participants: 234,
        reward: 50,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active',
        userParticipated: true,
        userProgress: 1,
      },
    ];

    setChallenges(mockChallenges);
    setLoading(false);
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, userParticipated: true, participants: challenge.participants + 1 }
        : challenge
    ));

    AnalyticsService.trackFeatureUsage('challenge_joined', user?.id, { challenge_id: challengeId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      default: return 'bg-white/20 text-white border-white/30';
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-2 w-3/4" />
            <div className="h-4 bg-white/20 rounded mb-3 w-full" />
            <div className="h-2 bg-white/20 rounded mb-3" />
            <div className="h-8 bg-white/20 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🏆 Community Challenges</h1>
        <p className="text-white/70">Join challenges and earn exclusive rewards!</p>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(challenge.status)}`}>
                    {challenge.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-white/70 mb-3">{challenge.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{challenge.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>
                      {challenge.status === 'upcoming' 
                        ? `Starts in ${formatTimeRemaining(challenge.startDate)}`
                        : `${formatTimeRemaining(challenge.endDate)} left`
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="text-yellow-400 fill-current" size={20} />
                  <span className="text-2xl font-bold text-white">{challenge.reward}</span>
                </div>
                <p className="text-white/60 text-sm">Reward</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/70 text-sm">
                  {challenge.type === 'community' ? 'Community Progress' : 'Your Progress'}
                </span>
                <span className="text-white/70 text-sm">
                  {challenge.type === 'community' 
                    ? `${challenge.currentProgress}/${challenge.goal}`
                    : `${challenge.userProgress}/${challenge.goal}`
                  }
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    challenge.type === 'community'
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                      : 'bg-gradient-to-r from-green-400 to-teal-400'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (
                      challenge.type === 'community' 
                        ? (challenge.currentProgress / challenge.goal) 
                        : (challenge.userProgress / challenge.goal)
                    ) * 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* User Progress (for community challenges) */}
            {challenge.type === 'community' && challenge.userParticipated && (
              <div className="mb-4 bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/70 text-sm">Your Contribution</span>
                  <span className="text-white/70 text-sm">{challenge.userProgress}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (challenge.userProgress / 20) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex gap-3">
              {!challenge.userParticipated && challenge.status !== 'completed' && (
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  disabled={challenge.status === 'upcoming'}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Target size={16} />
                  {challenge.status === 'upcoming' ? 'Coming Soon' : 'Join Challenge'}
                </button>
              )}
              
              {challenge.userParticipated && (
                <div className="flex-1 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 text-green-300 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                  <Zap size={16} />
                  Participating
                </div>
              )}
              
              {challenge.status === 'completed' && (
                <div className="flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                  <Trophy size={16} />
                  Completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 text-center">
        <h3 className="text-white font-bold text-lg mb-2">More Challenges Coming Soon!</h3>
        <p className="text-white/70 text-sm">
          We're working on exciting new challenges including seasonal events, 
          themed competitions, and special community milestones.
        </p>
      </div>
    </div>
  );
}