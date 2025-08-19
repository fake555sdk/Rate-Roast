import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to profile updates (ratings, roasts, boosts)
  static subscribeToProfile(profileId: string, callbacks: {
    onRatingUpdate?: (payload: any) => void;
    onRoastUpdate?: (payload: any) => void;
    onBoostUpdate?: (payload: any) => void;
  }): () => void {
    const channelName = `profile:${profileId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          callbacks.onRatingUpdate?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'roasts',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          callbacks.onRoastUpdate?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`,
        },
        (payload) => {
          callbacks.onBoostUpdate?.(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Subscribe to leaderboard updates
  static subscribeToLeaderboard(callbacks: {
    onLeaderboardUpdate?: (payload: any) => void;
  }): () => void {
    const channelName = 'leaderboard';
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratings',
        },
        (payload) => {
          callbacks.onLeaderboardUpdate?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          callbacks.onLeaderboardUpdate?.(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Subscribe to user notifications
  static subscribeToUserNotifications(userId: string, callbacks: {
    onNewRating?: (payload: any) => void;
    onNewRoast?: (payload: any) => void;
    onReferralReward?: (payload: any) => void;
  }): () => void {
    const channelName = `user:${userId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings',
        },
        async (payload) => {
          // Check if this rating is for user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', payload.new.profile_id)
            .single();
          
          if (profile?.user_id === userId) {
            callbacks.onNewRating?.(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'roasts',
        },
        async (payload) => {
          // Check if this roast is for user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', payload.new.profile_id)
            .single();
          
          if (profile?.user_id === userId) {
            callbacks.onNewRoast?.(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${userId}`,
        },
        (payload) => {
          callbacks.onReferralReward?.(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Clean up all subscriptions
  static cleanup(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

// Auto cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    RealtimeService.cleanup();
  });
}