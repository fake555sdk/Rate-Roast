import { supabase } from '../lib/supabase';
import { notificationService } from './notifications';

export interface PaymentPackage {
  id: string;
  name: string;
  stars: number;
  price: number; // USD
  bonus?: number;
  popular?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class PaymentService {
  // Telegram Stars packages
  static readonly STAR_PACKAGES: PaymentPackage[] = [
    { id: 'stars_100', name: '100 Stars', stars: 100, price: 0.99 },
    { id: 'stars_500', name: '500 Stars', stars: 500, price: 4.99, bonus: 50 },
    { id: 'stars_1000', name: '1000 Stars', stars: 1000, price: 9.99, bonus: 150, popular: true },
    { id: 'stars_2500', name: '2500 Stars', stars: 2500, price: 19.99, bonus: 500 },
    { id: 'stars_5000', name: '5000 Stars', stars: 5000, price: 39.99, bonus: 1250 },
  ];

  // Feature pricing
  static readonly FEATURE_PRICES = {
    ROAST_UNLOCK: 5,
    PROFILE_BOOST_PER_HOUR: 10,
    AI_ROAST_SAVAGE: 2,
    AI_ROAST_PIRATE: 2,
    AI_ROAST_PROGRAMMER: 2,
    AI_ROAST_GENZ: 2,
    AI_ROAST_SHAKESPEAREAN: 3,
    PREMIUM_THEME: 25,
    PRIORITY_PLACEMENT: 50,
    ANALYTICS_DASHBOARD: 30,
  };

  // Purchase Telegram Stars
  static async purchaseStars(userId: string, packageId: string): Promise<PaymentResult> {
    try {
      const package_ = this.STAR_PACKAGES.find(p => p.id === packageId);
      if (!package_) {
        return { success: false, error: 'Invalid package' };
      }

      // Check if running in Telegram WebApp
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        
        // Create invoice for Telegram Stars
        const invoice = {
          title: package_.name,
          description: `Purchase ${package_.stars}${package_.bonus ? ` + ${package_.bonus} bonus` : ''} stars`,
          payload: JSON.stringify({ userId, packageId, type: 'stars_purchase' }),
          provider_token: '', // Empty for Telegram Stars
          currency: 'XTR', // Telegram Stars currency
          prices: [{
            label: package_.name,
            amount: package_.stars, // Amount in stars
          }],
        };

        // Open invoice
        tg.openInvoice(invoice.payload, (status: string) => {
          if (status === 'paid') {
            this.handleSuccessfulPayment(userId, packageId);
          }
        });

        return { success: true };
      } else {
        // Development/testing mode - simulate purchase
        return await this.simulateStarsPurchase(userId, packageId);
      }
    } catch (error) {
      console.error('Stars purchase error:', error);
      return { success: false, error: 'Payment failed' };
    }
  }

  // Handle successful payment
  static async handleSuccessfulPayment(userId: string, packageId: string): Promise<void> {
    try {
      const package_ = this.STAR_PACKAGES.find(p => p.id === packageId);
      if (!package_) return;

      const totalStars = package_.stars + (package_.bonus || 0);

      // Update user's stars balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stars_balance: supabase.raw(`stars_balance + ${totalStars}`)
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Record transaction
      await this.recordTransaction(userId, 'purchase', totalStars, `Purchased ${package_.name}`, {
        package_id: packageId,
        usd_cost: package_.price,
        bonus_stars: package_.bonus || 0,
      });

      // Show success notification
      await notificationService.showNotification({
        title: '⭐ Stars Purchased!',
        body: `You received ${totalStars} stars!`,
        data: { type: 'stars_purchased', amount: totalStars },
      });

    } catch (error) {
      console.error('Payment handling error:', error);
    }
  }

  // Simulate stars purchase for development
  static async simulateStarsPurchase(userId: string, packageId: string): Promise<PaymentResult> {
    try {
      const package_ = this.STAR_PACKAGES.find(p => p.id === packageId);
      if (!package_) {
        return { success: false, error: 'Invalid package' };
      }

      const totalStars = package_.stars + (package_.bonus || 0);

      // Update user's stars balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stars_balance: supabase.raw(`stars_balance + ${totalStars}`)
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Record transaction
      const transactionId = await this.recordTransaction(
        userId, 
        'purchase', 
        totalStars, 
        `Purchased ${package_.name} (Simulated)`,
        {
          package_id: packageId,
          usd_cost: package_.price,
          bonus_stars: package_.bonus || 0,
          simulated: true,
        }
      );

      return { success: true, transactionId };
    } catch (error) {
      console.error('Simulated purchase error:', error);
      return { success: false, error: 'Purchase failed' };
    }
  }

  // Spend stars for features
  static async spendStars(
    userId: string, 
    amount: number, 
    description: string, 
    metadata?: any
  ): Promise<PaymentResult> {
    try {
      // Check user's balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('stars_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user || user.stars_balance < amount) {
        return { success: false, error: 'Insufficient stars balance' };
      }

      // Deduct stars
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stars_balance: supabase.raw(`stars_balance - ${amount}`)
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Record transaction
      const transactionId = await this.recordTransaction(
        userId, 
        'spend', 
        -amount, 
        description, 
        metadata
      );

      return { success: true, transactionId };
    } catch (error) {
      console.error('Stars spending error:', error);
      return { success: false, error: 'Transaction failed' };
    }
  }

  // Record transaction
  static async recordTransaction(
    userId: string,
    type: 'purchase' | 'spend' | 'reward' | 'refund',
    amount: number,
    description: string,
    metadata?: any
  ): Promise<string> {
    // Get current balance after transaction
    const { data: user } = await supabase
      .from('users')
      .select('stars_balance')
      .eq('id', userId)
      .single();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        transaction_type: type,
        amount,
        stars_balance_after: user?.stars_balance || 0,
        description,
        metadata: metadata || {},
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Get user's transaction history
  static async getTransactionHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Unlock roasts for a profile
  static async unlockRoasts(userId: string, profileId: string): Promise<PaymentResult> {
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('roast_unlocks')
        .select('id')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .single();

      if (existing) {
        return { success: false, error: 'Roasts already unlocked' };
      }

      // Spend stars
      const spendResult = await this.spendStars(
        userId,
        this.FEATURE_PRICES.ROAST_UNLOCK,
        'Unlocked roasts',
        { profile_id: profileId }
      );

      if (!spendResult.success) {
        return spendResult;
      }

      // Record unlock
      const { error: unlockError } = await supabase
        .from('roast_unlocks')
        .insert({
          user_id: userId,
          profile_id: profileId,
          stars_paid: this.FEATURE_PRICES.ROAST_UNLOCK,
        });

      if (unlockError) throw unlockError;

      return { success: true };
    } catch (error) {
      console.error('Roast unlock error:', error);
      return { success: false, error: 'Unlock failed' };
    }
  }

  // Boost profile
  static async boostProfile(
    userId: string, 
    profileId: string, 
    hours: number
  ): Promise<PaymentResult> {
    try {
      const cost = this.FEATURE_PRICES.PROFILE_BOOST_PER_HOUR * hours;

      // Spend stars
      const spendResult = await this.spendStars(
        userId,
        cost,
        `Boosted profile for ${hours} hour(s)`,
        { profile_id: profileId, hours }
      );

      if (!spendResult.success) {
        return spendResult;
      }

      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hours);

      // Record boost
      const { error: boostError } = await supabase
        .from('boosts')
        .insert({
          profile_id: profileId,
          user_id: userId,
          boost_type: 'visibility',
          stars_cost: cost,
          duration_hours: hours,
          expires_at: expiresAt.toISOString(),
        });

      if (boostError) throw boostError;

      // Update profile boost status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ boost_expires_at: expiresAt.toISOString() })
        .eq('id', profileId);

      if (profileError) throw profileError;

      return { success: true };
    } catch (error) {
      console.error('Profile boost error:', error);
      return { success: false, error: 'Boost failed' };
    }
  }

  // Purchase AI roast
  static async purchaseAIRoast(
    userId: string,
    profileId: string,
    theme: string
  ): Promise<PaymentResult> {
    try {
      const cost = this.getAIRoastCost(theme);

      // Spend stars
      const spendResult = await this.spendStars(
        userId,
        cost,
        `AI ${theme} roast`,
        { profile_id: profileId, theme }
      );

      if (!spendResult.success) {
        return spendResult;
      }

      return { success: true };
    } catch (error) {
      console.error('AI roast purchase error:', error);
      return { success: false, error: 'Purchase failed' };
    }
  }

  // Get AI roast cost by theme
  static getAIRoastCost(theme: string): number {
    switch (theme) {
      case 'savage': return this.FEATURE_PRICES.AI_ROAST_SAVAGE;
      case 'pirate': return this.FEATURE_PRICES.AI_ROAST_PIRATE;
      case 'programmer': return this.FEATURE_PRICES.AI_ROAST_PROGRAMMER;
      case 'gen-z': return this.FEATURE_PRICES.AI_ROAST_GENZ;
      case 'shakespearean': return this.FEATURE_PRICES.AI_ROAST_SHAKESPEAREAN;
      default: return 2;
    }
  }

  // Check if user has premium features
  static async checkPremiumStatus(userId: string): Promise<{
    isPremium: boolean;
    features: string[];
    expiresAt?: Date;
  }> {
    // For now, return basic status - can be expanded later
    return {
      isPremium: false,
      features: [],
    };
  }
}