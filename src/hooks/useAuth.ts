import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ApiService } from '../services/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface AuthState {
  user: any | null;
  profile: any | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if running in Telegram WebApp
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        const initData = tg.initData;
        
        if (initData) {
          // Parse Telegram user data
          const urlParams = new URLSearchParams(initData);
          const userParam = urlParams.get('user');
          
          if (userParam) {
            const telegramUser: TelegramUser = JSON.parse(decodeURIComponent(userParam));
            
            // Get referral code from start parameter
            const startParam = urlParams.get('start_param');
            
            // Create or update user in database
            const user = await ApiService.createOrUpdateUser(telegramUser, startParam);
            const profile = await ApiService.getProfile(user.id);
            
            setAuthState({
              user,
              profile,
              loading: false,
              error: null,
            });
            
            return;
          }
        }
      }
      
      // Fallback for development - use mock user
      if (import.meta.env.DEV) {
        const mockTelegramUser = {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'en',
        };
        
        const user = await ApiService.createOrUpdateUser(mockTelegramUser);
        const profile = await ApiService.getProfile(user.id);
        
        setAuthState({
          user,
          profile,
          loading: false,
          error: null,
        });
        
        return;
      }
      
      // No valid authentication found
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: 'Authentication required',
      });
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  };

  const updateProfile = async (updates: any) => {
    if (!authState.user) return;
    
    try {
      const updatedProfile = await ApiService.updateProfile(authState.user.id, updates);
      setAuthState(prev => ({
        ...prev,
        profile: updatedProfile,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updateStars = (amount: number) => {
    if (!authState.user) return;
    
    setAuthState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        stars_balance: prev.user.stars_balance + amount,
      },
    }));
  };

  return {
    ...authState,
    updateProfile,
    updateStars,
    refresh: initializeAuth,
  };
}