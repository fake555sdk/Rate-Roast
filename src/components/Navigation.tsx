import React from 'react';
import { Home, Trophy, User, Users, Star, ShoppingBag, BarChart3, Gamepad2, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import StarsShop from './StarsShop';
import TransactionHistory from './TransactionHistory';
import AnalyticsDashboard from './AnalyticsDashboard';
import SocialFeatures from './SocialFeatures';
import Gamification from './Gamification';
import CommunityChallenge from './CommunityChallenge';

export default function Navigation() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [showStarsShop, setShowStarsShop] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);

  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed', color: 'from-blue-500 to-purple-600' },
    { id: 'leaderboard', icon: Trophy, label: 'Rankings', color: 'from-yellow-500 to-orange-600' },
    { id: 'referrals', icon: Users, label: 'Referrals', color: 'from-green-500 to-teal-600' },
    { id: 'profile', icon: User, label: 'Profile', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id as any })}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Stars Balance */}
      {state.currentUser && (
        <div className="absolute top-0 right-4 transform -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={() => setShowSocial(true)}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-2 rounded-full hover:scale-105 transition-transform"
          >
            <MessageSquare size={14} />
          </button>
          
          <button
            onClick={() => setShowGamification(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-2 rounded-full hover:scale-105 transition-transform"
          >
            <Gamepad2 size={14} />
          </button>
          
          <button
            onClick={() => setShowAnalytics(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full hover:scale-105 transition-transform"
          >
            <BarChart3 size={14} />
          </button>
          
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setShowStarsShop(true)}
          >
            <Star className="fill-current" size={14} />
            {state.currentUser.starsBalance}
            <ShoppingBag size={12} className="ml-1 opacity-70" />
          </div>
        </div>
      )}
      
      {showStarsShop && (
        <StarsShop onClose={() => setShowStarsShop(false)} />
      )}
      
      {showTransactionHistory && (
        <TransactionHistory onClose={() => setShowTransactionHistory(false)} />
      )}
      
      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}
      
      {showSocial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto">
            <SocialFeatures />
            <button
              onClick={() => setShowSocial(false)}
              className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {showGamification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-lg border border-white/20 max-h-[90vh] overflow-y-auto">
            <Gamification />
            <button
              onClick={() => setShowGamification(false)}
              className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}