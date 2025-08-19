// App Configuration
export const APP_CONFIG = {
  name: 'Rate & Roast',
  version: '1.0.0',
  description: 'Where profiles get rated and roasted!',
  
  // Limits and constraints
  MAX_BIO_LENGTH: 500,
  MAX_ROAST_LENGTH: 500,
  MIN_ROAST_LENGTH: 10,
  MAX_USERNAME_LENGTH: 30,
  MIN_USERNAME_LENGTH: 3,
  
  // Pagination
  PROFILES_PER_PAGE: 20,
  RATINGS_PER_PAGE: 50,
  ROASTS_PER_PAGE: 20,
  LEADERBOARD_SIZE: 50,
  
  // Rate limiting (in minutes)
  RATING_COOLDOWN: 1,
  ROAST_COOLDOWN: 5,
  PROFILE_UPDATE_COOLDOWN: 10,
  
  // Stars pricing
  ROAST_UNLOCK_COST: 5,
  PROFILE_BOOST_COST_PER_HOUR: 10,
  AI_ROAST_COSTS: {
    savage: 2,
    pirate: 2,
    programmer: 2,
    'gen-z': 2,
    shakespearean: 3,
  },
  
  // Boost durations (in hours)
  BOOST_DURATIONS: [1, 3, 6, 12, 24],
  
  // Referral rewards
  REFERRAL_REWARD_STARS: 5,
  
  // Image constraints
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // Analytics
  ANALYTICS_BATCH_SIZE: 100,
  ANALYTICS_FLUSH_INTERVAL: 30000, // 30 seconds
} as const;

// UI Constants
export const UI_CONFIG = {
  // Colors
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Animations
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  users: '/api/users',
  profiles: '/api/profiles',
  
  // Rating endpoints
  ratings: '/api/ratings',
  
  // Roast endpoints
  roasts: '/api/roasts',
  aiRoasts: '/api/roasts/ai',
  
  // Leaderboard endpoints
  leaderboard: '/api/leaderboard',
  dailyLeaderboard: '/api/leaderboard/daily',
  weeklyLeaderboard: '/api/leaderboard/weekly',
  
  // Referral endpoints
  referrals: '/api/referrals',
  
  // Transaction endpoints
  transactions: '/api/transactions',
  
  // Boost endpoints
  boosts: '/api/boosts',
  
  // Analytics endpoints
  analytics: '/api/analytics',
  
  // Upload endpoints
  upload: '/api/upload',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required',
  INVALID_TOKEN: 'Invalid authentication token',
  SESSION_EXPIRED: 'Session has expired',
  
  // Validation errors
  INVALID_INPUT: 'Invalid input provided',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_USERNAME: 'Invalid username format',
  
  // Rating errors
  ALREADY_RATED: 'You have already rated this profile',
  INVALID_RATING: 'Rating must be between 1 and 10',
  CANNOT_RATE_SELF: 'You cannot rate your own profile',
  
  // Roast errors
  ROAST_TOO_SHORT: 'Roast must be at least 10 characters',
  ROAST_TOO_LONG: 'Roast must be less than 500 characters',
  INAPPROPRIATE_CONTENT: 'Content contains inappropriate language',
  
  // Stars errors
  INSUFFICIENT_STARS: 'Insufficient stars balance',
  INVALID_PURCHASE: 'Invalid purchase request',
  
  // Rate limiting errors
  RATE_LIMITED: 'Too many requests. Please try again later',
  COOLDOWN_ACTIVE: 'Please wait before performing this action again',
  
  // Server errors
  SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  NETWORK_ERROR: 'Network connection error',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  RATING_SUBMITTED: 'Rating submitted successfully',
  ROAST_SUBMITTED: 'Roast submitted successfully',
  ROASTS_UNLOCKED: 'Roasts unlocked successfully',
  PROFILE_BOOSTED: 'Profile boosted successfully',
  REFERRAL_SENT: 'Referral link shared successfully',
  STARS_PURCHASED: 'Stars purchased successfully',
  IMAGE_UPLOADED: 'Image uploaded successfully',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  AI_ROASTS: true,
  PROFILE_BOOSTS: true,
  REFERRAL_SYSTEM: true,
  PUSH_NOTIFICATIONS: true,
  ANALYTICS: true,
  IMAGE_UPLOAD: true,
  REAL_TIME_UPDATES: true,
  CONTENT_MODERATION: true,
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  telegram: 'https://t.me/rateroastbot',
  twitter: 'https://twitter.com/rateroast',
  instagram: 'https://instagram.com/rateroast',
  discord: 'https://discord.gg/rateroast',
} as const;

// Telegram WebApp specific
export const TELEGRAM_CONFIG = {
  botUsername: 'RateRoastBot',
  webAppUrl: 'https://rateroast.app',
  supportUrl: 'https://t.me/rateroastsupport',
  
  // Telegram Stars packages
  starsPackages: [
    { stars: 100, price: 0.99 },
    { stars: 500, price: 4.99 },
    { stars: 1000, price: 9.99 },
    { stars: 2500, price: 19.99 },
    { stars: 5000, price: 39.99 },
  ],
  
  // Haptic feedback patterns
  hapticPatterns: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    success: 'success',
    warning: 'warning',
    error: 'error',
  },
} as const;

// Achievement Types
export const ACHIEVEMENTS = {
  FIRST_RATING: {
    id: 'first_rating',
    name: 'First Impression',
    description: 'Submit your first rating',
    icon: '⭐',
    reward: 5,
  },
  FIRST_ROAST: {
    id: 'first_roast',
    name: 'Roast Master',
    description: 'Submit your first roast',
    icon: '🔥',
    reward: 5,
  },
  TOP_RATED: {
    id: 'top_rated',
    name: 'Crowd Favorite',
    description: 'Reach the top 10 leaderboard',
    icon: '🏆',
    reward: 25,
  },
  REFERRAL_MASTER: {
    id: 'referral_master',
    name: 'Influencer',
    description: 'Refer 10 friends',
    icon: '👥',
    reward: 50,
  },
  ROAST_COLLECTOR: {
    id: 'roast_collector',
    name: 'Thick Skin',
    description: 'Receive 50 roasts',
    icon: '🛡️',
    reward: 20,
  },
} as const;