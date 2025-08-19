import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          telegram_id: number;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          language_code: string;
          stars_balance: number;
          referral_code: string;
          referred_by: string | null;
          is_premium: boolean;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id: number;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          language_code?: string;
          stars_balance?: number;
          referral_code: string;
          referred_by?: string | null;
          is_premium?: boolean;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: number;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          language_code?: string;
          stars_balance?: number;
          referral_code?: string;
          referred_by?: string | null;
          is_premium?: boolean;
          is_banned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string;
          custom_avatar_url: string | null;
          is_public: boolean;
          allow_anonymous_ratings: boolean;
          allow_anonymous_roasts: boolean;
          total_ratings: number;
          average_rating: number;
          total_roasts: number;
          profile_views: number;
          boost_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string;
          custom_avatar_url?: string | null;
          is_public?: boolean;
          allow_anonymous_ratings?: boolean;
          allow_anonymous_roasts?: boolean;
          total_ratings?: number;
          average_rating?: number;
          total_roasts?: number;
          profile_views?: number;
          boost_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          custom_avatar_url?: string | null;
          is_public?: boolean;
          allow_anonymous_ratings?: boolean;
          allow_anonymous_roasts?: boolean;
          total_ratings?: number;
          average_rating?: number;
          total_roasts?: number;
          profile_views?: number;
          boost_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          profile_id: string;
          rater_user_id: string;
          score: number;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          rater_user_id: string;
          score: number;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          rater_user_id?: string;
          score?: number;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      roasts: {
        Row: {
          id: string;
          profile_id: string;
          author_user_id: string;
          content: string;
          roast_type: string;
          ai_theme: string | null;
          is_visible: boolean;
          is_reported: boolean;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          author_user_id: string;
          content: string;
          roast_type?: string;
          ai_theme?: string | null;
          is_visible?: boolean;
          is_reported?: boolean;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          author_user_id?: string;
          content?: string;
          roast_type?: string;
          ai_theme?: string | null;
          is_visible?: boolean;
          is_reported?: boolean;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
  };
}