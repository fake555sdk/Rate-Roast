import { supabase } from '../lib/supabase';

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  profile_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export class AnalyticsService {
  // Track user events
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  // Common event tracking methods
  static async trackProfileView(profileId: string, viewerId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'profile_view',
      user_id: viewerId,
      profile_id: profileId,
    });
  }

  static async trackRatingSubmission(profileId: string, raterId: string, score: number): Promise<void> {
    await this.trackEvent({
      event_type: 'rating_submitted',
      user_id: raterId,
      profile_id: profileId,
      metadata: { score },
    });
  }

  static async trackRoastSubmission(profileId: string, authorId: string, roastType: string): Promise<void> {
    await this.trackEvent({
      event_type: 'roast_submitted',
      user_id: authorId,
      profile_id: profileId,
      metadata: { roast_type: roastType },
    });
  }

  static async trackRoastUnlock(profileId: string, userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'roasts_unlocked',
      user_id: userId,
      profile_id: profileId,
      metadata: { stars_spent: 5 },
    });
  }

  static async trackProfileBoost(profileId: string, userId: string, hours: number, starsCost: number): Promise<void> {
    await this.trackEvent({
      event_type: 'profile_boosted',
      user_id: userId,
      profile_id: profileId,
      metadata: { hours, stars_cost: starsCost },
    });
  }

  static async trackReferral(referrerId: string, referredId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'referral_completed',
      user_id: referrerId,
      metadata: { referred_user_id: referredId },
    });
  }

  static async trackStarsPurchase(userId: string, amount: number, cost: number): Promise<void> {
    await this.trackEvent({
      event_type: 'stars_purchased',
      user_id: userId,
      metadata: { stars_amount: amount, cost_usd: cost },
    });
  }

  static async trackAIRoastGeneration(profileId: string, userId: string, theme: string, starsCost: number): Promise<void> {
    await this.trackEvent({
      event_type: 'ai_roast_generated',
      user_id: userId,
      profile_id: profileId,
      metadata: { theme, stars_cost: starsCost },
    });
  }

  // Get analytics data
  static async getUserEngagementMetrics(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, timestamp, metadata')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Process events into metrics
    const eventCounts = data.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    const dailyActivity = data.reduce((acc: any, event: any) => {
      const date = new Date(event.timestamp).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      total_events: data.length,
      event_counts: eventCounts,
      daily_activity: dailyActivity,
      most_active_day: Object.keys(dailyActivity).reduce((a, b) => 
        dailyActivity[a] > dailyActivity[b] ? a : b, Object.keys(dailyActivity)[0]
      ),
    };
  }

  static async getProfileEngagementMetrics(profileId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, timestamp, user_id, metadata')
      .eq('profile_id', profileId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const uniqueViewers = new Set(data.filter(e => e.event_type === 'profile_view').map(e => e.user_id)).size;
    const totalViews = data.filter(e => e.event_type === 'profile_view').length;
    const totalRatings = data.filter(e => e.event_type === 'rating_submitted').length;
    const totalRoasts = data.filter(e => e.event_type === 'roast_submitted').length;
    const roastUnlocks = data.filter(e => e.event_type === 'roasts_unlocked').length;

    return {
      unique_viewers: uniqueViewers,
      total_views: totalViews,
      total_ratings: totalRatings,
      total_roasts: totalRoasts,
      roast_unlocks: roastUnlocks,
      engagement_rate: totalViews > 0 ? (totalRatings + totalRoasts) / totalViews : 0,
    };
  }

  // Platform-wide analytics
  static async getPlatformMetrics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, timestamp, user_id')
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    const activeUsers = new Set(data.map(e => e.user_id)).size;
    const eventCounts = data.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    return {
      active_users: activeUsers,
      total_events: data.length,
      event_breakdown: eventCounts,
      avg_events_per_user: data.length / activeUsers,
    };
  }
}