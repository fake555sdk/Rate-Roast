import { supabase } from '../lib/supabase';

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  profile_id?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export class AnalyticsService {
  private static eventQueue: AnalyticsEvent[] = [];
  private static batchSize = 10;
  private static flushInterval = 30000; // 30 seconds
  private static flushTimer: NodeJS.Timeout | null = null;

  static {
    // Auto-flush events periodically
    this.startAutoFlush();
  }

  // Track user events with batching
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const eventWithTimestamp = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      };

      this.eventQueue.push(eventWithTimestamp);

      // Flush if batch size reached
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Flush events to database
  private static async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would send to analytics service
      // For now, we'll just log and store locally
      console.log('Analytics batch:', eventsToFlush);
      
      // Store in localStorage for demo purposes
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      existingEvents.push(...eventsToFlush);
      localStorage.setItem('analytics_events', JSON.stringify(existingEvents.slice(-1000))); // Keep last 1000 events
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  // Start auto-flush timer
  private static startAutoFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Stop auto-flush timer
  static stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Common event tracking methods
  static async trackProfileView(profileId: string, viewerId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'profile_view',
      user_id: viewerId,
      profile_id: profileId,
      metadata: { timestamp: Date.now() },
    });
  }

  static async trackRatingSubmission(profileId: string, raterId: string, score: number): Promise<void> {
    await this.trackEvent({
      event_type: 'rating_submitted',
      user_id: raterId,
      profile_id: profileId,
      metadata: { score, timestamp: Date.now() },
    });
  }

  static async trackRoastSubmission(profileId: string, authorId: string, roastType: string): Promise<void> {
    await this.trackEvent({
      event_type: 'roast_submitted',
      user_id: authorId,
      profile_id: profileId,
      metadata: { roast_type: roastType, timestamp: Date.now() },
    });
  }

  static async trackRoastUnlock(profileId: string, userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'roasts_unlocked',
      user_id: userId,
      profile_id: profileId,
      metadata: { stars_spent: 5, timestamp: Date.now() },
    });
  }

  static async trackProfileBoost(profileId: string, userId: string, hours: number, starsCost: number): Promise<void> {
    await this.trackEvent({
      event_type: 'profile_boosted',
      user_id: userId,
      profile_id: profileId,
      metadata: { hours, stars_cost: starsCost, timestamp: Date.now() },
    });
  }

  static async trackStarsPurchase(userId: string, amount: number, cost: number): Promise<void> {
    await this.trackEvent({
      event_type: 'stars_purchased',
      user_id: userId,
      metadata: { stars_amount: amount, cost_usd: cost, timestamp: Date.now() },
    });
  }

  static async trackFeatureUsage(featureName: string, userId?: string, metadata?: any): Promise<void> {
    await this.trackEvent({
      event_type: 'feature_used',
      user_id: userId,
      metadata: { feature: featureName, ...metadata, timestamp: Date.now() },
    });
  }

  static async trackError(error: string, userId?: string, context?: any): Promise<void> {
    await this.trackEvent({
      event_type: 'error_occurred',
      user_id: userId,
      metadata: { error, context, timestamp: Date.now() },
    });
  }

  // Get analytics data for dashboard
  static getStoredEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  static getUserEngagementMetrics(userId: string, days: number = 30): any {
    const events = this.getStoredEvents();
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const userEvents = events.filter(e => 
      e.user_id === userId && 
      new Date(e.timestamp!).getTime() > startDate
    );

    const eventCounts = userEvents.reduce((acc: any, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    return {
      total_events: userEvents.length,
      event_counts: eventCounts,
      most_active_day: this.getMostActiveDay(userEvents),
      engagement_score: this.calculateEngagementScore(eventCounts),
    };
  }

  private static getMostActiveDay(events: AnalyticsEvent[]): string {
    const dailyActivity = events.reduce((acc: any, event) => {
      const date = new Date(event.timestamp!).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(dailyActivity).reduce((a, b) => 
      dailyActivity[a] > dailyActivity[b] ? a : b, 
      Object.keys(dailyActivity)[0] || 'No activity'
    );
  }

  private static calculateEngagementScore(eventCounts: any): number {
    const weights = {
      profile_view: 1,
      rating_submitted: 3,
      roast_submitted: 5,
      roasts_unlocked: 10,
      stars_purchased: 15,
    };

    return Object.entries(eventCounts).reduce((score, [event, count]) => {
      const weight = weights[event as keyof typeof weights] || 1;
      return score + (weight * (count as number));
    }, 0);
  }

  // Cleanup on app close
  static async cleanup(): Promise<void> {
    this.stopAutoFlush();
    await this.flushEvents();
  }
}

// Auto cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    AnalyticsService.cleanup();
  });
}