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
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const [user, profile] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        ApiService.getProfile(userId)
      ]);

      if (user.error) throw user.error;

      setAuthState({
        user: user.data,
        profile: profile,
        loading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load user data',
      }));
    }
  };

  const initializeAuth = async () => {
    try {
      // Check if running in Telegram WebApp
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        const initData = tg.initData;
        
        if (initData) {
          await authenticateWithTelegram(initData);
          return;
        }
      }
      
      // Fallback for development - use mock user
      if (import.meta.env.DEV) {
        await authenticateWithMockUser();
        return;
      }
      
      // No valid authentication found
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: 'Authentication required',
        isAuthenticated: false,
      });
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        isAuthenticated: false,
      });
    }
  };

  const authenticateWithTelegram = async (initData: string) => {
    // Parse Telegram user data
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      throw new Error('No user data in Telegram init data');
    }

    const telegramUser: TelegramUser = JSON.parse(decodeURIComponent(userParam));
    
    // Get referral code from start parameter
    const startParam = urlParams.get('start_param');
    
    // Validate referral code if provided
    let referralCode = startParam;
    if (referralCode) {
      const referrerId = await ApiService.validateReferralCode(referralCode);
      if (!referrerId) {
        referralCode = undefined; // Invalid referral code
      }
    }
    
    // Create or update user in database
    const user = await ApiService.createOrUpdateUser(telegramUser, referralCode);
    const profile = await ApiService.getProfile(user.id);
    
    // Sign in with Supabase (create session)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${user.telegram_id}@telegram.local`,
      password: user.id, // Use user ID as password for Telegram users
    });

    if (signInError) {
      // If sign in fails, try to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: `${user.telegram_id}@telegram.local`,
        password: user.id,
      });
      
      if (signUpError) throw signUpError;
    }
    
    setAuthState({
      user,
      profile,
      loading: false,
      error: null,
      isAuthenticated: true,
    });
  };

  const authenticateWithMockUser = async () => {
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
      isAuthenticated: true,
    });
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    updateProfile,
    updateStars,
    signOut,
    refresh: initializeAuth,
  };
}