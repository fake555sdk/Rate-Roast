export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    // Check if running in StackBlitz or WebContainer environment
    if (typeof window !== 'undefined' && (
      window.location.hostname.includes('stackblitz.io') ||
      window.location.hostname.includes('webcontainer') ||
      window.location.hostname.includes('bolt.new') ||
      window.location.hostname.includes('localhost')
    )) {
      console.warn('Service Workers are not supported in StackBlitz environment. Notifications will use fallback methods.');
      return;
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  async showNotification(data: NotificationData): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (this.registration) {
      // Use service worker for better notification handling
      await this.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/icon-192x192.png',
        data: data.data,
        actions: data.actions,
        requireInteraction: true,
        vibrate: [200, 100, 200],
      });
    } else {
      // Fallback to basic notification
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
      });
    }
  }

  // Predefined notification types
  async notifyNewRating(raterName: string, score: number): Promise<void> {
    await this.showNotification({
      title: '⭐ New Rating!',
      body: `${raterName} rated you ${score}/10`,
      data: { type: 'new_rating', score },
    });
  }

  async notifyNewRoast(roasterName: string): Promise<void> {
    await this.showNotification({
      title: '🔥 New Roast!',
      body: `${roasterName} left you a roast`,
      data: { type: 'new_roast' },
    });
  }

  async notifyReferralReward(referredName: string, stars: number): Promise<void> {
    await this.showNotification({
      title: '🎁 Referral Reward!',
      body: `${referredName} joined! You earned ${stars} stars`,
      data: { type: 'referral_reward', stars },
    });
  }

  async notifyLeaderboardPosition(position: number, type: 'daily' | 'weekly'): Promise<void> {
    await this.showNotification({
      title: '🏆 Leaderboard Update!',
      body: `You're now #${position} on the ${type} leaderboard!`,
      data: { type: 'leaderboard_update', position },
    });
  }

  async notifyBoostExpiring(minutesLeft: number): Promise<void> {
    await this.showNotification({
      title: '⚡ Boost Expiring Soon!',
      body: `Your profile boost expires in ${minutesLeft} minutes`,
      data: { type: 'boost_expiring', minutes: minutesLeft },
      actions: [
        { action: 'extend', title: 'Extend Boost' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }

  // Telegram WebApp specific notifications
  async sendTelegramNotification(message: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      
      // Use Telegram's haptic feedback
      if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
      
      // Show alert in Telegram
      tg.showAlert(message);
    }
  }

  async vibrate(pattern: number[] = [200, 100, 200]): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
    
    // Telegram WebApp haptic feedback
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      const tg = (window as any).Telegram.WebApp;
      tg.HapticFeedback.impactOccurred('medium');
    }
  }
}

// Initialize notification service
export const notificationService = NotificationService.getInstance();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  notificationService.initialize();
}