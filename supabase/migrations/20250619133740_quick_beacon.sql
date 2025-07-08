/*
  # Add media kit sample template column

  1. Changes
    - Add `media_kit_sample_template` column to existing `influencer_data` table
    - This column stores ready-to-use HTML+CSS templates
    - All other columns remain unchanged for DM Generator and Pricing Assistant compatibility

  2. Security
    - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'influencer_data' AND column_name = 'media_kit_sample_template'
  ) THEN
    ALTER TABLE influencer_data ADD COLUMN media_kit_sample_template text;
  END IF;
END $$;