import { useEffect, useRef } from 'react';
import { RealtimeService } from '../services/realtime';
import { notificationService } from '../services/notifications';

interface UseRealtimeOptions {
  profileId?: string;
  userId?: string;
  onRatingUpdate?: (payload: any) => void;
  onRoastUpdate?: (payload: any) => void;
  onBoostUpdate?: (payload: any) => void;
  onLeaderboardUpdate?: (payload: any) => void;
  onNotification?: (payload: any) => void;
}

export function useRealtime(options: UseRealtimeOptions) {
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    // Subscribe to profile updates
    if (options.profileId) {
      const unsubscribeProfile = RealtimeService.subscribeToProfile(
        options.profileId,
        {
          onRatingUpdate: (payload) => {
            options.onRatingUpdate?.(payload);
            notificationService.vibrate([100, 50, 100]);
          },
          onRoastUpdate: (payload) => {
            options.onRoastUpdate?.(payload);
            notificationService.vibrate([200, 100, 200]);
          },
          onBoostUpdate: options.onBoostUpdate,
        }
      );
      unsubscribeFunctions.push(unsubscribeProfile);
    }

    // Subscribe to leaderboard updates
    if (options.onLeaderboardUpdate) {
      const unsubscribeLeaderboard = RealtimeService.subscribeToLeaderboard({
        onLeaderboardUpdate: options.onLeaderboardUpdate,
      });
      unsubscribeFunctions.push(unsubscribeLeaderboard);
    }

    // Subscribe to user notifications
    if (options.userId) {
      const unsubscribeNotifications = RealtimeService.subscribeToUserNotifications(
        options.userId,
        {
          onNewRating: async (payload) => {
            await notificationService.notifyNewRating('Someone', payload.new.score);
            options.onNotification?.(payload);
          },
          onNewRoast: async (payload) => {
            await notificationService.notifyNewRoast('Someone');
            options.onNotification?.(payload);
          },
          onReferralReward: async (payload) => {
            await notificationService.notifyReferralReward('New user', 5);
            options.onNotification?.(payload);
          },
        }
      );
      unsubscribeFunctions.push(unsubscribeNotifications);
    }

    unsubscribeRefs.current = unsubscribeFunctions;

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [options.profileId, options.userId]);

  const cleanup = () => {
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
  };

  return { cleanup };
}