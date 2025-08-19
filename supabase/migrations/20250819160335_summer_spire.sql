/*
  # Initial Database Schema for Rate & Roast App

  1. New Tables
    - `users` - Store user information from Telegram
    - `profiles` - Extended profile information and settings
    - `ratings` - Anonymous rating submissions
    - `roasts` - Anonymous roast comments
    - `referrals` - Track referral relationships
    - `transactions` - Stars transactions and purchases
    - `boosts` - Profile boost tracking
    - `achievements` - User achievements and badges

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure anonymous operations where needed

  3. Indexes
    - Performance indexes for common queries
    - Composite indexes for leaderboards
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (core Telegram user data)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id bigint UNIQUE NOT NULL,
  username text,
  first_name text,
  last_name text,
  avatar_url text,
  language_code text DEFAULT 'en',
  stars_balance integer DEFAULT 0,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES users(id),
  is_premium boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table (extended profile information)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  bio text DEFAULT '',
  custom_avatar_url text,
  is_public boolean DEFAULT true,
  allow_anonymous_ratings boolean DEFAULT true,
  allow_anonymous_roasts boolean DEFAULT true,
  total_ratings integer DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0.00,
  total_roasts integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  boost_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Ratings table (anonymous rating system)
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rater_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, rater_user_id) -- Prevent duplicate ratings
);

-- Roasts table (anonymous roast comments)
CREATE TABLE IF NOT EXISTS roasts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  roast_type text DEFAULT 'user' CHECK (roast_type IN ('user', 'ai')),
  ai_theme text, -- For AI-generated roasts (savage, pirate, etc.)
  is_visible boolean DEFAULT false, -- Hidden until unlocked
  is_reported boolean DEFAULT false,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Referrals table (track referral relationships and rewards)
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reward_stars integer DEFAULT 5,
  is_rewarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Transactions table (Stars purchases and spending)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'reward', 'refund')),
  amount integer NOT NULL, -- Positive for credits, negative for debits
  stars_balance_after integer NOT NULL,
  description text NOT NULL,
  telegram_payment_id text, -- For Telegram Stars purchases
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Boosts table (profile boost tracking)
CREATE TABLE IF NOT EXISTS boosts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  boost_type text DEFAULT 'visibility' CHECK (boost_type IN ('visibility', 'premium')),
  stars_cost integer NOT NULL,
  duration_hours integer DEFAULT 1,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Achievements table (user achievements and badges)
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  icon_url text,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Roast unlocks table (track which users unlocked which profiles' roasts)
CREATE TABLE IF NOT EXISTS roast_unlocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  stars_paid integer DEFAULT 5,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roast_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for ratings table
CREATE POLICY "Anyone can read ratings" ON ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid()::text = rater_user_id::text);

-- RLS Policies for roasts table
CREATE POLICY "Profile owners can read their roasts" ON roasts
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users who unlocked roasts can read them" ON roasts
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM roast_unlocks WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Authenticated users can insert roasts" ON roasts
  FOR INSERT WITH CHECK (auth.uid()::text = author_user_id::text);

-- RLS Policies for referrals table
CREATE POLICY "Users can read their referral data" ON referrals
  FOR SELECT USING (
    auth.uid()::text = referrer_id::text OR 
    auth.uid()::text = referred_id::text
  );

-- RLS Policies for transactions table
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for boosts table
CREATE POLICY "Anyone can read active boosts" ON boosts
  FOR SELECT USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can read own boosts" ON boosts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own boosts" ON boosts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for achievements table
CREATE POLICY "Users can read own achievements" ON achievements
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can read achievements for leaderboards" ON achievements
  FOR SELECT USING (true);

-- RLS Policies for roast_unlocks table
CREATE POLICY "Users can read own unlocks" ON roast_unlocks
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own unlocks" ON roast_unlocks
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_average_rating ON profiles(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_boost_expires ON profiles(boost_expires_at);
CREATE INDEX IF NOT EXISTS idx_ratings_profile_id ON ratings(profile_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roasts_profile_id ON roasts(profile_id);
CREATE INDEX IF NOT EXISTS idx_roasts_created_at ON roasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_boosts_profile_id ON boosts(profile_id);
CREATE INDEX IF NOT EXISTS idx_boosts_expires_at ON boosts(expires_at);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile rating statistics
CREATE OR REPLACE FUNCTION update_profile_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET 
      total_ratings = (
        SELECT COUNT(*) FROM ratings WHERE profile_id = NEW.profile_id
      ),
      average_rating = (
        SELECT ROUND(AVG(score)::numeric, 2) FROM ratings WHERE profile_id = NEW.profile_id
      )
    WHERE id = NEW.profile_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to update profile stats when rating is added
CREATE TRIGGER update_profile_stats_on_rating AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating_stats();

-- Function to update roast count
CREATE OR REPLACE FUNCTION update_profile_roast_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET total_roasts = (
      SELECT COUNT(*) FROM roasts WHERE profile_id = NEW.profile_id
    )
    WHERE id = NEW.profile_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to update roast count when roast is added
CREATE TRIGGER update_profile_roast_count_trigger AFTER INSERT ON roasts
  FOR EACH ROW EXECUTE FUNCTION update_profile_roast_count();