import { supabase } from '../lib/supabase';
import { User, Profile, Rating, Roast, Transaction, ReferralStats } from '../types';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export class ApiService {
  // User Management
  static async createOrUpdateUser(telegramUser: TelegramUser, referralCode?: string): Promise<User> {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            avatar_url: telegramUser.photo_url,
            language_code: telegramUser.language_code,
            updated_at: new Date().toISOString(),
          })
          .eq('telegram_id', telegramUser.id)
          .select()
          .single();

        if (error) throw error;
        return updatedUser;
      }

      // Create new user
      const referralCodeToUse = referralCode || this.generateReferralCode();
      let referredBy = null;

      if (referralCode && referralCode !== referralCodeToUse) {
        const referrer = await this.validateReferralCode(referralCode);
        if (referrer) {
          referredBy = referrer;
        }
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          avatar_url: telegramUser.photo_url,
          language_code: telegramUser.language_code || 'en',
          referral_code: referralCodeToUse,
          referred_by: referredBy,
        })
        .select()
        .single();

      if (error) throw error;

      // Create profile for new user
      await this.createProfile(newUser.id);

      // Process referral reward if applicable
      if (referredBy) {
        await this.processReferralReward(referredBy, newUser.id);
      }

      return newUser;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async validateReferralCode(code: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (error || !data) return null;
      return data.id;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return null;
    }
  }

  // Profile Management
  private static async createProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          bio: '',
          is_public: true,
          allow_anonymous_ratings: true,
          allow_anonymous_roasts: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  // Rating System
  static async submitRating(profileId: string, score: number, raterId: string): Promise<Rating> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          profile_id: profileId,
          rater_user_id: raterId,
          score,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  // Roast System
  static async submitRoast(profileId: string, content: string, authorId: string): Promise<Roast> {
    try {
      const { data, error } = await supabase
        .from('roasts')
        .insert({
          profile_id: profileId,
          author_user_id: authorId,
          content,
          roast_type: 'user',
          is_visible: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting roast:', error);
      throw error;
    }
  }

  static async unlockRoasts(userId: string, profileId: string): Promise<void> {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('roast_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .single();

      if (existing) return; // Already unlocked

      // Create unlock record
      const { error } = await supabase
        .from('roast_unlocks')
        .insert({
          user_id: userId,
          profile_id: profileId,
          stars_paid: 5,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error unlocking roasts:', error);
      throw error;
    }
  }

  // Payment System
  static async purchaseStars(userId: string, packageId: string, amount: number): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_type: 'purchase',
          amount,
          description: `Purchased ${amount} stars`,
          metadata: { package_id: packageId },
        })
        .select()
        .single();

      if (error) throw error;

      // Update user balance
      await supabase
        .from('users')
        .update({
          stars_balance: supabase.sql`stars_balance + ${amount}`,
        })
        .eq('id', userId);

      return data;
    } catch (error) {
      console.error('Error purchasing stars:', error);
      throw error;
    }
  }

  static async spendStars(userId: string, amount: number, description: string): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_type: 'spend',
          amount: -amount,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      // Update user balance
      await supabase
        .from('users')
        .update({
          stars_balance: supabase.sql`stars_balance - ${amount}`,
        })
        .eq('id', userId);

      return data;
    } catch (error) {
      console.error('Error spending stars:', error);
      throw error;
    }
  }

  // Utility Methods
  private static generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private static async processReferralReward(referrerId: string, referredId: string): Promise<void> {
    try {
      // Create referral record
      await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredId,
          reward_stars: 5,
          is_rewarded: true,
        });

      // Award stars to referrer
      await supabase
        .from('users')
        .update({
          stars_balance: supabase.sql`stars_balance + 5`,
        })
        .eq('id', referrerId);

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: referrerId,
          transaction_type: 'reward',
          amount: 5,
          description: 'Referral reward',
          metadata: { referred_user_id: referredId },
        });
    } catch (error) {
      console.error('Error processing referral reward:', error);
    }
  }
}

export const apiService = new ApiService();