/*
  # Create influencer data table

  1. New Tables
    - `influencer_data`
      - `id` (uuid, primary key)
      - `platform` (text)
      - `follower_count` (text)
      - `engagement_rate` (text)
      - `niche` (text)
      - `region` (text)
      - `dm_reply_example` (text)
      - `pricing_example` (text)
      - `media_kit_sections` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `influencer_data` table
    - Add policy for public read access
    - Add policy for service role insert access
*/

CREATE TABLE IF NOT EXISTS influencer_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text,
  follower_count text,
  engagement_rate text,
  niche text,
  region text,
  dm_reply_example text,
  pricing_example text,
  media_kit_sections text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE influencer_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read influencer data" ON influencer_data;
DROP POLICY IF EXISTS "Service role can insert influencer data" ON influencer_data;

-- Create policies
CREATE POLICY "Anyone can read influencer data"
  ON influencer_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can insert influencer data"
  ON influencer_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);