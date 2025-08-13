/*
  # Add user plans and usage tracking

  1. New Tables
    - `user_subscriptions` - Track user subscription plans
    - `user_usage` - Track monthly usage for free plan limits

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL DEFAULT 'free', -- 'free' or 'pro'
  status text NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL, -- Format: 'YYYY-MM'
  dm_generations integer DEFAULT 0,
  pricing_calculations integer DEFAULT 0,
  media_kit_generations integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_usage
CREATE POLICY "Users can view own usage"
  ON user_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON user_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON user_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating default subscription for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user subscription
DROP TRIGGER IF EXISTS on_user_created_subscription ON auth.users;
CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Function to get or create current month usage
CREATE OR REPLACE FUNCTION get_or_create_usage(user_uuid uuid)
RETURNS user_usage AS $$
DECLARE
  current_month text;
  usage_record user_usage;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  SELECT * INTO usage_record
  FROM user_usage
  WHERE user_id = user_uuid AND month_year = current_month;
  
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, month_year)
    VALUES (user_uuid, current_month)
    RETURNING * INTO usage_record;
  END IF;
  
  RETURN usage_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_default_subscription() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_or_create_usage(uuid) TO postgres, anon, authenticated, service_role;
GRANT ALL ON user_subscriptions TO postgres, anon, authenticated, service_role;
GRANT ALL ON user_usage TO postgres, anon, authenticated, service_role;