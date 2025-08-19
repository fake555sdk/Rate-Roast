import React, { useState } from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { Profile } from '../types';
import { useApp } from '../context/AppContext';

interface RoastModalProps {
  profile: Profile;
  onClose: () => void;
}

const aiRoastThemes = [
  { id: 'savage', name: '🔥 Savage', price: 2 },
  { id: 'pirate', name: '🏴‍☠️ Pirate', price: 2 },
  { id: 'shakespearean', name: '🎭 Shakespearean', price: 3 },
  { id: 'programmer', name: '💻 Programmer', price: 2 },
  { id: 'gen-z', name: '😎 Gen Z', price: 2 },
];

export default function RoastModal({ profile, onClose }: RoastModalProps) {
  const { state, dispatch } = useApp();
  const [roastText, setRoastText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [mode, setMode] = useState<'user' | 'ai'>('user');

  const handleSubmit = () => {
    if (mode === 'user' && roastText.trim()) {
      dispatch({
        type: 'ADD_ROAST',
        payload: { profileId: profile.userId, content: roastText.trim() }
      });
      onClose();
    } else if (mode === 'ai' && selectedTheme) {
      const theme = aiRoastThemes.find(t => t.id === selectedTheme);
      if (theme && state.currentUser && state.currentUser.starsBalance >= theme.price) {
        // Generate AI roast based on theme
        const aiRoasts = {
          savage: `${profile.user.firstName}'s personality is so basic, they make vanilla ice cream look exotic`,
          pirate: `Arrr, ${profile.user.firstName} be so landlocked, they get seasick looking at puddles!`,
          shakespearean: `Verily, ${profile.user.firstName} doth possess the wit of a drowsy hedgehog`,
          programmer: `${profile.user.firstName}'s social skills have more bugs than their first "Hello World"`,
          'gen-z': `${profile.user.firstName} is giving "main character energy" but the plot is really not plotting`
        };
        
        dispatch({
          type: 'ADD_ROAST',
          payload: { profileId: profile.userId, content: aiRoasts[selectedTheme as keyof typeof aiRoasts] || 'AI roast failed to load!' }
        });
        dispatch({ type: 'UPDATE_STARS', payload: { userId: state.currentUser.id, amount: -theme.price } });
        onClose();
      }
    }
  };

  const canAffordTheme = (price: number) => {
    return state.currentUser && state.currentUser.starsBalance >= price;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-red-900/90 to-pink-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Roast Profile</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-center mb-6">
          <img
            src={profile.user.avatar}
            alt={profile.user.username}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-3 border-white/30"
          />
          <h3 className="text-xl font-semibold text-white">
            {profile.user.firstName} {profile.user.lastName}
          </h3>
          <p className="text-white/70">@{profile.user.username}</p>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setMode('user')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === 'user'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <MessageCircle size={16} />
              Write Roast
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === 'ai'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <Sparkles size={16} />
              AI Roast
            </button>
          </div>

          {mode === 'user' ? (
            <textarea
              value={roastText}
              onChange={(e) => setRoastText(e.target.value)}
              placeholder="Write your anonymous roast here..."
              className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40"
              maxLength={200}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-white/80 text-sm mb-3">Choose an AI roast theme:</p>
              {aiRoastThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  disabled={!canAffordTheme(theme.price)}
                  className={`w-full p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                    selectedTheme === theme.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : canAffordTheme(theme.price)
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <span>{theme.name}</span>
                  <span className="text-sm">{theme.price}⭐</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              (mode === 'user' && !roastText.trim()) ||
              (mode === 'ai' && (!selectedTheme || !canAffordTheme(aiRoastThemes.find(t => t.id === selectedTheme)?.price || 0)))
            }
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Send Roast
          </button>
        </div>
      </div>
    </div>
  );
}