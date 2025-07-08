/*
  # Create user data tracking tables

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `user_dm_generations` - Track DM generations per user
    - `user_pricing_calculations` - Track pricing calculations per user
    - `user_media_kits` - Track media kit generations per user
    - `user_activity_log` - Track all user activities for dashboard

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Authenticated users only
*/

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DM generations tracking
CREATE TABLE IF NOT EXISTS user_dm_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  message_type text NOT NULL, -- 'outreach' or 'reply'
  tone text NOT NULL,
  follower_count text,
  engagement_rate text,
  brand_type text,
  generated_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Pricing calculations tracking
CREATE TABLE IF NOT EXISTS user_pricing_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  follower_count text NOT NULL,
  engagement_rate text NOT NULL,
  niche text NOT NULL,
  deal_type text NOT NULL,
  suggested_min integer NOT NULL,
  suggested_max integer NOT NULL,
  suggested_recommended integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Media kit generations tracking
CREATE TABLE IF NOT EXISTS user_media_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_name text NOT NULL,
  niche text NOT NULL,
  kit_style text NOT NULL, -- 'email' or 'notion'
  email_tone text,
  platforms jsonb, -- Store platform data as JSON
  generated_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activity log for dashboard metrics
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL, -- 'dm_generation', 'pricing_calculation', 'media_kit_creation'
  activity_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dm_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pricing_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_dm_generations
CREATE POLICY "Users can view own DM generations"
  ON user_dm_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DM generations"
  ON user_dm_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_pricing_calculations
CREATE POLICY "Users can view own pricing calculations"
  ON user_pricing_calculations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pricing calculations"
  ON user_pricing_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_media_kits
CREATE POLICY "Users can view own media kits"
  ON user_media_kits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media kits"
  ON user_media_kits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();