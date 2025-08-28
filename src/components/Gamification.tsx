import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Crown, Target, Gift, Medal, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { AnalyticsService } from '../services/analytics';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  progress: number;
  maxProgress: number;
  reward: number;
  icon: string;
  completed: boolean;
  expiresAt?: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
}

export default function Gamification() {
  const { state } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'quests' | 'badges' | 'leaderboard'>('quests');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);

  useEffect(() => {
    loadGamificationData();
  }, [user]);

  const loadGamificationData = () => {
    // Mock quests data
    const mockQuests: Quest[] = [
      {
        id: 'daily_rate_3',
        title: 'Rate 3 Profiles',
        description: 'Rate 3 different profiles today',
        type: 'daily',
        progress: 1,
        maxProgress: 3,
        reward: 10,
        icon: '⭐',
        completed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: 'weekly_roast_10',
        title: 'Roast Master',
        description: 'Submit 10 roasts this week',
        type: 'weekly',
        progress: 3,
        maxProgress: 10,
        reward: 50,
        icon: '🔥',
        completed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'achievement_top_10',
        title: 'Top 10 Player',
        description: 'Reach top 10 in leaderboard',
        type: 'achievement',
        progress: 0,
        maxProgress: 1,
        reward: 100,
        icon: '🏆',
        completed: false,
      },
    ];

    // Mock badges data
    const mockBadges: Badge[] = [
      {
        id: 'first_rating',
        name: 'First Steps',
        description: 'Submit your first rating',
        icon: '⭐',
        rarity: 'common',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'roast_master',
        name: 'Roast Master',
        description: 'Submit 50 roasts',
        icon: '🔥',
        rarity: 'rare',
        unlocked: false,
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Get 100 profile views',
        icon: '🦋',
        rarity: 'epic',
        unlocked: false,
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Reach #1 on leaderboard',
        icon: '👑',
        rarity: 'legendary',
        unlocked: false,
      },
    ];

    setQuests(mockQuests);
    setBadges(mockBadges);

    // Calculate user level and XP
    const totalXP = 250; // Mock XP
    const level = Math.floor(totalXP / 100) + 1;
    const currentLevelXP = totalXP % 100;
    const nextLevel = level * 100;

    setUserLevel(level);
    setUserXP(currentLevelXP);
    setNextLevelXP(nextLevel);
  };

  const claimQuestReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed) return;

    setQuests(prev => prev.filter(q => q.id !== questId));
    
    if (user) {
      // Add stars reward (would be handled by backend)
      AnalyticsService.trackFeatureUsage('quest_completed', user.id, { 
        quest_id: questId, 
        reward: quest.reward 
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30';
      case 'rare': return 'text-blue-400 border-blue-400/30';
      case 'epic': return 'text-purple-400 border-purple-400/30';
      case 'legendary': return 'text-yellow-400 border-yellow-400/30';
      default: return 'text-white border-white/30';
    }
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-500/20 text-green-300';
      case 'weekly': return 'bg-blue-500/20 text-blue-300';
      case 'achievement': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-white/20 text-white';
    }
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎮 Gamification</h1>
        <p className="text-white/70">Complete quests, earn badges, and level up!</p>
      </div>

      {/* User Level Progress */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Crown className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Level {userLevel}</h3>
              <p className="text-white/70 text-sm">{userXP}/{nextLevelXP} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">Next Level</p>
            <p className="text-white font-semibold">{nextLevelXP - userXP} XP</p>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(userXP / nextLevelXP) * 100}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { id: 'quests', label: 'Quests', icon: Target },
          { id: 'badges', label: 'Badges', icon: Medal },
          { id: 'leaderboard', label: 'Rankings', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{quest.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{quest.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getQuestTypeColor(quest.type)}`}>
                        {quest.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">{quest.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-white font-bold">{quest.reward}</span>
                  </div>
                  {quest.expiresAt && (
                    <p className="text-white/50 text-xs">
                      {formatTimeRemaining(quest.expiresAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/70 text-sm">
                    Progress: {quest.progress}/{quest.maxProgress}
                  </span>
                  <span className="text-white/70 text-sm">
                    {Math.round((quest.progress / quest.maxProgress) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                  />
                </div>
              </div>

              {quest.completed && (
                <button
                  onClick={() => claimQuestReward(quest.id)}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Gift size={16} />
                  Claim Reward
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`relative rounded-xl p-4 border-2 transition-all duration-200 ${
                badge.unlocked
                  ? `bg-gradient-to-br from-${badge.rarity === 'legendary' ? 'yellow' : badge.rarity === 'epic' ? 'purple' : badge.rarity === 'rare' ? 'blue' : 'gray'}-500/20 to-${badge.rarity === 'legendary' ? 'orange' : badge.rarity === 'epic' ? 'pink' : badge.rarity === 'rare' ? 'indigo' : 'slate'}-500/20 ${getRarityColor(badge.rarity)}`
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className={`font-bold mb-1 ${badge.unlocked ? 'text-white' : 'text-white/50'}`}>
                  {badge.name}
                </h3>
                <p className={`text-xs mb-2 ${badge.unlocked ? 'text-white/70' : 'text-white/30'}`}>
                  {badge.description}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(badge.rarity)}`}>
                  {badge.rarity.toUpperCase()}
                </span>
                
                {badge.unlocked && badge.unlockedAt && (
                  <p className="text-white/50 text-xs mt-2">
                    Unlocked {badge.unlockedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
          <Trophy className="text-yellow-400 mx-auto mb-4" size={48} />
          <h3 className="text-white font-bold text-lg mb-2">Coming Soon!</h3>
          <p className="text-white/70">
            Seasonal leaderboards and competitive rankings are coming in the next update.
          </p>
        </div>
      )}
    </div>
  );
}