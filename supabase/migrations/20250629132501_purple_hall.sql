/*
  # Add pro_until field to user_profiles table

  1. Changes
    - Add `pro_until` field to user_profiles table
    - This field will store the expiration date for Pro subscriptions
    - NULL means free plan, future date means active Pro plan

  2. Security
    - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'pro_until'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN pro_until timestamptz;
  END IF;
END $$;

-- Add index for efficient pro_until queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_pro_until ON user_profiles(pro_until);