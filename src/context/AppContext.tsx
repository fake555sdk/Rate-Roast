import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Profile, Rating, Roast, ReferralStats } from '../types';
import { mockUsers, mockProfiles, mockRatings, mockRoasts, mockReferralStats } from '../data/mockData';
import { apiService } from '../services/api.tsx';
interface AppState {
  currentUser: User | null;
  profiles: Profile[];
  ratings: Rating[];
  roasts: Roast[];
  referralStats: ReferralStats[];
  activeTab: 'feed' | 'leaderboard' | 'profile' | 'referrals';
  selectedProfile: Profile | null;
  unlockedRoasts: Set<string>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ACTIVE_TAB'; payload: 'feed' | 'leaderboard' | 'profile' | 'referrals' }
  | { type: 'SELECT_PROFILE'; payload: Profile | null }
  | { type: 'ADD_RATING'; payload: { profileId: string; score: number } }
  | { type: 'ADD_ROAST'; payload: { profileId: string; content: string } }
  | { type: 'UNLOCK_ROASTS'; payload: string }
  | { type: 'BOOST_PROFILE'; payload: string }
  | { type: 'UPDATE_STARS'; payload: { userId: string; amount: number } };

const initialState: AppState = {
  currentUser: mockUsers[0],
  profiles: mockProfiles,
  ratings: mockRatings,
  roasts: mockRoasts,
  referralStats: mockReferralStats,
  activeTab: 'feed',
  selectedProfile: null,
  unlockedRoasts: new Set(),
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SELECT_PROFILE':
      return { ...state, selectedProfile: action.payload };
    case 'ADD_RATING': {
      const newRating: Rating = {
        id: Date.now().toString(),
        profileId: action.payload.profileId,
        raterId: state.currentUser!.id,
        score: action.payload.score,
        timestamp: new Date(),
      };
      const updatedProfiles = state.profiles.map(profile => {
        if (profile.userId === action.payload.profileId) {
          const newTotal = profile.totalRatings + 1;
          const newAverage = ((profile.averageRating * profile.totalRatings) + action.payload.score) / newTotal;
          return {
            ...profile,
            averageRating: Math.round(newAverage * 10) / 10,
            totalRatings: newTotal,
          };
        }
        return profile;
      });
      return {
        ...state,
        ratings: [...state.ratings, newRating],
        profiles: updatedProfiles,
      };
    }
    case 'ADD_ROAST': {
      const newRoast: Roast = {
        id: Date.now().toString(),
        profileId: action.payload.profileId,
        content: action.payload.content,
        timestamp: new Date(),
        type: 'user',
        isVisible: false,
      };
      const updatedProfiles = state.profiles.map(profile => {
        if (profile.userId === action.payload.profileId) {
          return { ...profile, roastCount: profile.roastCount + 1 };
        }
        return profile;
      });
      return {
        ...state,
        roasts: [...state.roasts, newRoast],
        profiles: updatedProfiles,
      };
    }
    case 'UNLOCK_ROASTS':
      return {
        ...state,
        unlockedRoasts: new Set([...state.unlockedRoasts, action.payload]),
      };
    case 'BOOST_PROFILE': {
      const updatedProfiles = state.profiles.map(profile => {
        if (profile.userId === action.payload) {
          return {
            ...profile,
            boostedUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          };
        }
        return profile;
      });
      return { ...state, profiles: updatedProfiles };
    }
    case 'UPDATE_STARS': {
      if (!state.currentUser) return state;
      const updatedUser = {
        ...state.currentUser,
        starsBalance: state.currentUser.starsBalance + action.payload.amount,
      };
      return { ...state, currentUser: updatedUser };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}