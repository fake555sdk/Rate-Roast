import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Profile = Tables['profiles']['Row'];
type Rating = Tables['ratings']['Row'];
type Roast = Tables['roasts']['Row'];

export class ApiService {
  // User Management
  static async createOrUpdateUser(telegramUser: any, referralCode?: string): Promise<User> {
    const userData = {
      telegram_id: telegramUser.id,
      username: telegramUser.username,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      avatar_url: telegramUser.photo_url,
      language_code: telegramUser.language_code || 'en',
      referral_code: this.generateReferralCode(),
    };

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new user
      let referredBy = null;
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
        
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      const { data, error } = await supabase
        .from('users')
        .insert({ ...userData, referred_by: referredBy })
        .select()
        .single();

      if (error) throw error;

      // Create profile for new user
      await this.createProfile(data.id);

      // Process referral reward
      if (referredBy) {
        await this.processReferralReward(referredBy, data.id);
      }

      return data;
    }
  }

  static async createProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        bio: '🎮 New to Rate & Roast!',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        users (
          id,
          telegram_id,
          username,
          first_name,
          last_name,
          avatar_url,
          stars_balance
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Rating System
  static async submitRating(profileId: string, raterUserId: string, score: number): Promise<Rating> {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        profile_id: profileId,
        rater_user_id: raterUserId,
        score,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserRating(profileId: string, userId: string): Promise<Rating | null> {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('profile_id', profileId)
      .eq('rater_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Roast System
  static async submitRoast(profileId: string, authorUserId: string, content: string, roastType: string = 'user', aiTheme?: string): Promise<Roast> {
    const { data, error } = await supabase
      .from('roasts')
      .insert({
        profile_id: profileId,
        author_user_id: authorUserId,
        content,
        roast_type: roastType,
        ai_theme: aiTheme,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async unlockRoasts(userId: string, profileId: string): Promise<void> {
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('roast_unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .single();

    if (existing) return;

    // Create unlock record
    const { error: unlockError } = await supabase
      .from('roast_unlocks')
      .insert({
        user_id: userId,
        profile_id: profileId,
        stars_paid: 5,
      });

    if (unlockError) throw unlockError;

    // Deduct stars from user
    await this.updateUserStars(userId, -5, 'Unlocked roasts');
  }

  static async getRoasts(profileId: string, viewerUserId?: string): Promise<Roast[]> {
    let query = supabase
      .from('roasts')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Check if viewer has unlocked roasts or is the profile owner
    if (viewerUserId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single();

      const isOwner = profile?.user_id === viewerUserId;
      
      if (!isOwner) {
        const { data: unlock } = await supabase
          .from('roast_unlocks')
          .select('id')
          .eq('user_id', viewerUserId)
          .eq('profile_id', profileId)
          .single();

        if (!unlock) {
          // Return only first roast if not unlocked
          return data.slice(0, 1);
        }
      }
    }

    return data;
  }

  // Leaderboard
  static async getTopRatedProfiles(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        users (
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .gte('total_ratings', 1)
      .order('average_rating', { ascending: false })
      .order('total_ratings', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getTopReferrers(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        referrer_id,
        users!referrals_referrer_id_fkey (
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_rewarded', true);

    if (error) throw error;

    // Group by referrer and count
    const referrerCounts = data.reduce((acc: any, referral: any) => {
      const referrerId = referral.referrer_id;
      if (!acc[referrerId]) {
        acc[referrerId] = {
          user: referral.users,
          referral_count: 0,
          total_earned: 0,
        };
      }
      acc[referrerId].referral_count++;
      acc[referrerId].total_earned += 5; // 5 stars per referral
      return acc;
    }, {});

    return Object.values(referrerCounts)
      .sort((a: any, b: any) => b.referral_count - a.referral_count)
      .slice(0, limit);
  }

  // Stars and Transactions
  static async updateUserStars(userId: string, amount: number, description: string): Promise<void> {
    // Get current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stars_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const newBalance = user.stars_balance + amount;

    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ stars_balance: newBalance })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        transaction_type: amount > 0 ? 'reward' : 'spend',
        amount,
        stars_balance_after: newBalance,
        description,
      });

    if (transactionError) throw transactionError;
  }

  // Boost System
  static async boostProfile(userId: string, profileId: string, hours: number = 1): Promise<void> {
    const starsCost = hours * 10; // 10 stars per hour

    // Check user has enough stars
    const { data: user } = await supabase
      .from('users')
      .select('stars_balance')
      .eq('id', userId)
      .single();

    if (!user || user.stars_balance < starsCost) {
      throw new Error('Insufficient stars');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    // Create boost record
    const { error: boostError } = await supabase
      .from('boosts')
      .insert({
        profile_id: profileId,
        user_id: userId,
        stars_cost: starsCost,
        duration_hours: hours,
        expires_at: expiresAt.toISOString(),
      });

    if (boostError) throw boostError;

    // Update profile boost expiry
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ boost_expires_at: expiresAt.toISOString() })
      .eq('id', profileId);

    if (profileError) throw profileError;

    // Deduct stars
    await this.updateUserStars(userId, -starsCost, `Profile boost for ${hours} hour(s)`);
  }

  // Referral System
  static async processReferralReward(referrerId: string, referredId: string): Promise<void> {
    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        reward_stars: 5,
        is_rewarded: true,
      });

    if (referralError) throw referralError;

    // Award stars to referrer
    await this.updateUserStars(referrerId, 5, 'Referral reward');
  }

  // Utility Functions
  static generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  static async getFeedProfiles(userId?: string, limit: number = 20): Promise<any[]> {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        users (
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_public', true);

    // Exclude current user's profile
    if (userId) {
      query = query.neq('user_id', userId);
    }

    const { data, error } = await query
      .order('boost_expires_at', { ascending: false, nullsLast: true })
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}