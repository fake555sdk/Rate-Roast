import React, { useState } from 'react';
import { Copy, Users, Star, Trophy, Share2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReferralSystem() {
  const { state } = useApp();
  const [copied, setCopied] = useState(false);
  
  if (!state.currentUser) return null;

  const referralLink = `https://t.me/RateRoastBot/app?startapp=${state.currentUser.referralCode}`;
  const userStats = state.referralStats.find(r => r.userId === state.currentUser.id);
  const userRank = state.referralStats
    .sort((a, b) => b.referralCount - a.referralCount)
    .findIndex(r => r.userId === state.currentUser.id) + 1;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rate & Roast - Join the Fun!',
        text: 'Join me on Rate & Roast! Get rated, roast others, and climb the leaderboards!',
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎁 Referral Program</h1>
        <p className="text-white/70">Invite friends and earn rewards!</p>
      </div>

      <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="text-green-400" />
          Your Stats
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {userStats?.referralCount || 0}
            </div>
            <p className="text-white/70 text-sm">Referrals</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-1">
              {userStats?.totalEarned || 0}
              <Star className="text-yellow-400 fill-current" size={20} />
            </div>
            <p className="text-white/70 text-sm">Stars Earned</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400" size={24} />
            <div>
              <p className="text-white font-semibold">Rank #{userRank}</p>
              <p className="text-white/70 text-sm">in referral leaderboard</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Your Referral Link</h3>
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Share2 size={20} />
          Share Referral Link
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-white font-semibold">Share Your Link</h3>
              <p className="text-white/70 text-sm">Send your unique referral link to friends</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-white font-semibold">Friends Join</h3>
              <p className="text-white/70 text-sm">They sign up using your link</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-white font-semibold">Earn Rewards</h3>
              <p className="text-white/70 text-sm">Get 5⭐ for each successful referral</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          Top Referrers
        </h2>
        <div className="space-y-3">
          {state.referralStats.slice(0, 5).map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                entry.userId === state.currentUser?.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                  : 'bg-white/5'
              }`}
            >
              <div className="text-lg font-bold text-white">
                #{index + 1}
              </div>
              <img
                src={entry.user.avatar}
                alt={entry.user.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
              />
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {entry.user.firstName} {entry.user.lastName}
                </p>
                <p className="text-white/60 text-sm">@{entry.user.username}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{entry.referralCount}</p>
                <p className="text-white/60 text-sm">{entry.totalEarned}⭐</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}