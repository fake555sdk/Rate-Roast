export interface User {
  id: string;
  username: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  joinDate: Date;
  starsBalance: number;
  referralCode: string;
  referredBy?: string;
}

export interface Profile {
  userId: string;
  user: User;
  bio: string;
  averageRating: number;
  totalRatings: number;
  roastCount: number;
  boostedUntil?: Date;
  isOnline: boolean;
}

export interface Rating {
  id: string;
  profileId: string;
  raterId: string;
  score: number;
  timestamp: Date;
}

export interface Roast {
  id: string;
  profileId: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'ai';
  theme?: string;
  isVisible: boolean;
}

export interface ReferralStats {
  userId: string;
  user: User;
  referralCount: number;
  totalEarned: number;
}

export interface LeaderboardEntry {
  profile: Profile;
  rank: number;
  change: number;
}