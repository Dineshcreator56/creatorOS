/*
  # Create influencer_data table

  1. New Tables
    - `influencer_data`
      - `id` (uuid, primary key)
      - `platform` (text) - Social media platform name
      - `follower_count` (text) - Number of followers as text (e.g., "25K", "1.2M")
      - `engagement_rate` (text) - Engagement rate as text (e.g., "3.5%", "4.2")
      - `niche` (text) - Content niche/category
      - `region` (text) - Geographic region
      - `dm_reply_example` (text) - Sample DM reply content
      - `pricing_example` (text) - Sample pricing information
      - `media_kit_sections` (text) - Media kit section content
      - `media_kit_sample_template` (text) - HTML template for media kits
      - `created_at` (timestamp) - Record creation timestamp

  2. Security
    - Enable RLS on `influencer_data` table
    - Add policy for public read access (anyone can read influencer data)
    - Add policy for service role insert access (for data management)

  3. Sample Data
    - Insert sample influencer data for testing and AI training
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
  media_kit_sample_template text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE influencer_data ENABLE ROW LEVEL SECURITY;

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

-- Insert sample data for AI training and testing
INSERT INTO influencer_data (platform, follower_count, engagement_rate, niche, region, dm_reply_example, pricing_example, media_kit_sections, media_kit_sample_template) VALUES
('Instagram', '25000', '4.2', 'Fashion & Style', 'US', 'Hi! Thank you so much for reaching out about this collaboration opportunity. I absolutely love your brand''s aesthetic and would be thrilled to work together. My engagement rate is consistently above 4% and my audience is primarily 18-34 year old women interested in sustainable fashion. I''d love to discuss rates and deliverables - could we schedule a quick call this week?', '$200-400 per post, $100-200 per story', 'About Me, Platform Statistics, Audience Demographics, Past Collaborations, Services & Rates, Contact Information', '<div class="media-kit"><h1>Fashion Creator</h1><p>Sustainable fashion advocate with engaged community</p></div>'),

('TikTok', '50000', '6.8', 'Health & Fitness', 'UK', 'Hey! Thanks for the collab inquiry! I''m super excited about your fitness products. My TikTok has been growing rapidly with 50K+ followers who are really engaged with fitness content. I specialize in workout routines and nutrition tips. My rates start at $300 for a single video, but I''d love to discuss a package deal for multiple posts. When would be a good time to chat?', '$300-600 per video, $150-300 per story', 'Creator Bio, TikTok Analytics, Audience Insights, Content Examples, Collaboration History, Pricing Guide', '<div class="media-kit fitness"><h1>Fitness Creator</h1><p>Helping people achieve their fitness goals</p></div>'),

('YouTube', '15000', '3.5', 'Technology', 'Canada', 'Hello! Thank you for considering me for this partnership. I run a tech review channel focused on consumer electronics and software. My audience trusts my honest reviews and recommendations. I''d be happy to create a dedicated review video or integrate your product into my existing content. My standard rate for a sponsored segment is $500-800 depending on the length and complexity. Let''s discuss how we can create authentic content that resonates with my tech-savvy audience.', '$500-1200 per video, $200-400 per community post', 'Channel Overview, Subscriber Demographics, Video Performance, Equipment & Setup, Review Process, Collaboration Terms', '<div class="media-kit tech"><h1>Tech Reviewer</h1><p>Honest reviews for tech enthusiasts</p></div>'),

('Instagram', '100000', '3.8', 'Beauty & Skincare', 'Australia', 'Hi there! I''m so excited about the possibility of working with your skincare brand. As someone who''s struggled with sensitive skin, I only partner with brands I genuinely believe in. My audience of 100K+ followers trusts my recommendations because I''m always honest about what works and what doesn''t. I''d love to try your products first and then create authentic content showcasing real results. My rates are $800-1200 per post depending on usage rights.', '$800-1500 per post, $400-600 per story', 'Brand Story, Instagram Analytics, Skincare Journey, Product Testing Process, Audience Testimonials, Media Kit', '<div class="media-kit beauty"><h1>Beauty Influencer</h1><p>Authentic skincare recommendations</p></div>'),

('TikTok', '75000', '5.2', 'Food & Cooking', 'US', 'Hey! Thanks for reaching out about featuring your kitchen products. I love creating quick, easy recipes that busy people can actually make. My followers are always asking about the tools and ingredients I use, so product recommendations perform really well on my account. I typically charge $400-700 per video depending on the complexity of the recipe and how prominently the product is featured. Would love to see what you have in mind!', '$400-800 per video, $200-350 per story', 'Cooking Style, Recipe Development, Kitchen Setup, Audience Engagement, Brand Partnerships, Content Calendar', '<div class="media-kit food"><h1>Food Creator</h1><p>Quick recipes for busy lifestyles</p></div>'),

('YouTube', '30000', '4.1', 'Travel', 'Germany', 'Hello! Your destination looks absolutely stunning and I''d love to feature it on my travel channel. I create cinematic travel vlogs that showcase both popular attractions and hidden gems. My audience is primarily millennials and Gen Z who are planning their own adventures. I can offer a comprehensive package including a main travel vlog, shorts content, and social media posts across platforms. My rates start at $1000 for a destination feature plus travel expenses.', '$1000-2500 per destination feature, $300-500 per short video', 'Travel Philosophy, Channel Analytics, Destination Coverage, Equipment List, Previous Collaborations, Travel Calendar', '<div class="media-kit travel"><h1>Travel Vlogger</h1><p>Inspiring wanderlust through storytelling</p></div>'),

('Instagram', '40000', '4.7', 'Lifestyle', 'US', 'Hi! I''m really interested in this collaboration opportunity. My Instagram focuses on authentic lifestyle content - from morning routines to home decor to self-care tips. My audience appreciates genuine recommendations and I only work with brands that align with my values. I''d love to learn more about your products and how we might create content that feels natural and valuable to my followers. My rates typically range from $300-600 per post.', '$300-700 per post, $150-300 per story', 'Lifestyle Brand, Content Themes, Audience Demographics, Engagement Metrics, Brand Alignment, Collaboration Examples', '<div class="media-kit lifestyle"><h1>Lifestyle Creator</h1><p>Authentic living and mindful choices</p></div>'),

('TikTok', '120000', '7.1', 'Gaming', 'US', 'What''s up! Thanks for the gaming collab offer. My TikTok is all about gaming highlights, reviews, and funny moments. My community is super engaged and always looking for new games to try. I''ve got a great track record with gaming sponsors - my last mobile game promotion got over 2M views and drove significant downloads. My rates are $600-1000 per video depending on the game and campaign requirements. Let''s make some epic content!', '$600-1200 per video, $300-500 per stream highlight', 'Gaming Setup, Content Style, Audience Demographics, Previous Gaming Campaigns, Streaming Schedule, Performance Metrics', '<div class="media-kit gaming"><h1>Gaming Creator</h1><p>Epic gaming content and reviews</p></div>');