import { DMRequest, DMResponse, InfluencerData, PricingRequest, PricingResponse, MediaKitRequest, MediaKitResponse, BrandMatchEnhancer } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Call the Supabase Edge Function instead of making direct API calls
async function callOpenRouterProxy(action: string, data: any): Promise<any> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/openrouter-proxy`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle specific API key configuration error
    if (errorData.error === 'API_KEY_NOT_CONFIGURED') {
      console.warn('OpenRouter API key not configured. Using fallback responses.');
      throw new Error('API_KEY_NOT_CONFIGURED');
    }
    
    // Handle 402 Payment Required error specifically
    if (response.status === 402 || errorData.error?.includes('402')) {
      console.warn('OpenRouter API quota/billing issue detected.');
      throw new Error('OPENROUTER_API_402_ERROR');
    }
    
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return await response.json();
}

export async function generateDailyOutreachTip(platform: string): Promise<string> {
  try {
    return await callOpenRouterProxy('generateDailyOutreachTip', { platform });
  } catch (error) {
    console.error('Daily tip generation error:', error);
    
    // Check if it's an API key configuration error
    if (error instanceof Error && error.message === 'API_KEY_NOT_CONFIGURED') {
      return getFallbackOutreachTipWithNotice(platform);
    }
    
    // Check if it's a 402 quota/billing error
    if (error instanceof Error && error.message === 'OPENROUTER_API_402_ERROR') {
      return getFallbackOutreachTipWithQuotaNotice(platform);
    }
    
    return getFallbackOutreachTip(platform);
  }
}

export async function generateDailyPricingTip(): Promise<string> {
  try {
    return await callOpenRouterProxy('generateDailyPricingTip', {});
  } catch (error) {
    console.error('Daily pricing tip generation error:', error);
    
    // Check if it's an API key configuration error
    if (error instanceof Error && error.message === 'API_KEY_NOT_CONFIGURED') {
      return getFallbackPricingTipWithNotice();
    }
    
    // Check if it's a 402 quota/billing error
    if (error instanceof Error && error.message === 'OPENROUTER_API_402_ERROR') {
      return getFallbackPricingTipWithQuotaNotice();
    }
    
    return getFallbackPricingTip();
  }
}

export async function generateBrandMatchEnhancer(niche: string): Promise<BrandMatchEnhancer> {
  try {
    return await callOpenRouterProxy('generateBrandMatchEnhancer', { niche });
  } catch (error) {
    console.error('Brand match enhancer generation error:', error);
    return {
      suggestions: getFallbackBrandEnhancers(niche),
      niche
    };
  }
}

export async function enhanceBioWithAI(bio: string, niche: string, influencerData: InfluencerData[]): Promise<string> {
  try {
    return await callOpenRouterProxy('enhanceBioWithAI', { bio, niche, influencerData });
  } catch (error) {
    console.error('Bio enhancement error:', error);
    // Fallback enhancement
    return `${bio} I specialize in creating authentic, engaging content that resonates with my audience and drives real results for brand partners.`;
  }
}

export async function generateDMWithAI(request: DMRequest, influencerData: InfluencerData[]): Promise<DMResponse> {
  try {
    return await callOpenRouterProxy('generateDMWithAI', { request, influencerData });
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      primary: generateFallbackDM(request, 'primary'),
      alternatives: [
        generateFallbackDM(request, 'alternative1'),
        generateFallbackDM(request, 'alternative2')
      ],
      matchedData: influencerData.slice(0, 3)
    };
  }
}

export async function generatePricingWithAI(request: PricingRequest, influencerData: InfluencerData[]): Promise<PricingResponse> {
  try {
    return await callOpenRouterProxy('generatePricingWithAI', { request, influencerData });
  } catch (error) {
    console.error('Pricing AI generation error:', error);
    return generateFallbackPricing(request, influencerData);
  }
}

export async function generateMediaKitWithAI(request: MediaKitRequest, influencerData: InfluencerData[]): Promise<MediaKitResponse> {
  try {
    return await callOpenRouterProxy('generateMediaKitWithAI', { request, influencerData });
  } catch (error) {
    console.error('Media Kit AI generation error:', error);
    return generateFallbackMediaKit(request);
  }
}

// Enhanced fallback functions with API key configuration notices
function getFallbackOutreachTipWithNotice(platform: string): string {
  const baseTip = getFallbackOutreachTip(platform);
  return `⚠️ AI features require API key setup. ${baseTip}`;
}

function getFallbackPricingTipWithNotice(): string {
  const baseTip = getFallbackPricingTip();
  return `⚠️ AI features require API key setup. ${baseTip}`;
}

// New fallback functions for 402 quota/billing errors
function getFallbackOutreachTipWithQuotaNotice(platform: string): string {
  const baseTip = getFallbackOutreachTip(platform);
  return `💳 AI quota exceeded - check OpenRouter billing. ${baseTip}`;
}

function getFallbackPricingTipWithQuotaNotice(): string {
  const baseTip = getFallbackPricingTip();
  return `💳 AI quota exceeded - check OpenRouter billing. ${baseTip}`;
}

// Fallback functions remain the same
function getFallbackOutreachTip(platform: string): string {
  const tips = {
    'Instagram': '💡 Personalize your DMs by mentioning specific posts or stories from the brand. This shows genuine interest and increases response rates by 40%.',
    'TikTok': '🎯 Reference trending sounds or challenges in your outreach. Brands love creators who stay current with platform trends.',
    'YouTube': '📹 Mention specific videos from their channel and how your content style would complement their brand message.',
    'Twitter': '🐦 Engage with their tweets first, then send a thoughtful DM referencing your interaction. Build rapport before pitching.'
  };
  return tips[platform as keyof typeof tips] || tips['Instagram'];
}

function getFallbackPricingTip(): string {
  const tips = [
    '💰 Bundle multiple deliverables (post + story + reel) for 15-25% higher rates than individual posts.',
    '📈 Track your engagement rates monthly. High-performing content justifies 20-30% rate increases.',
    '🎯 Charge premium rates (1.5-2x) for exclusive partnerships or first-to-market product launches.',
    '⏰ Offer early bird discounts for brands booking 30+ days in advance to secure consistent work.',
    '🔄 Create tiered packages: Basic (post), Standard (post + story), Premium (post + story + reel + usage rights).'
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getFallbackBrandEnhancers(niche: string): string[] {
  const enhancers: Record<string, string[]> = {
    'Fashion': [
      '✨ "I turn fashion into stories that sell - 35% higher click-through rates"',
      '🛍️ "My followers ask "where to buy" on 80% of my outfit posts"',
      '📸 "Professional styling + authentic reviews = brand loyalty that lasts"'
    ],
    'Beauty': [
      '💄 "Before/after content that drives 3x more engagement than standard posts"',
      '✨ "My tutorials generate 50% more saves than industry average"',
      '🌟 "Honest reviews that build trust - 90% follower retention rate"'
    ],
    'Fitness': [
      '💪 "Transformation content that motivates real lifestyle changes"',
      '🏃‍♀️ "My workout videos get 60% more shares than fitness industry average"',
      '⚡ "Results-driven content that turns followers into customers"'
    ],
    'Food': [
      '🍽️ "Recipe videos that get saved 4x more than standard food content"',
      '👨‍🍳 "My restaurant reviews drive 25% increase in foot traffic"',
      '📱 "Food styling that makes followers hungry for your brand"'
    ],
    'Tech': [
      '📱 "Tech reviews that simplify complex products for everyday users"',
      '⚡ "My unboxing videos generate 40% more purchase intent"',
      '🔧 "Honest tech advice that builds long-term brand credibility"'
    ]
  };

  return enhancers[niche] || [
    '🎯 "Content that converts viewers into loyal customers"',
    '📈 "Authentic storytelling that drives real business results"',
    '✨ "Creative campaigns that make your brand unforgettable"'
  ];
}

function generateFallbackDM(request: DMRequest, type: string): string {
  const { platform, messageType, tone, brandType, brandReply } = request;
  
  if (messageType === 'reply' && brandReply) {
    if (tone === 'professional') {
      return `Thank you for reaching out regarding the collaboration opportunity.\n\nI'm very interested in working with ${brandType || 'your brand'}. Based on my ${request.followerCount} followers and ${request.engagementRate}% engagement rate on ${platform}, I believe we can create impactful content together.\n\nI'd love to discuss the campaign details, deliverables, and timeline. Could we schedule a brief call to align on the partnership specifics?\n\nI look forward to creating exceptional content for your brand.\n\nBest regards,`;
    } else if (tone === 'friendly') {
      return `Hi! Thanks so much for reaching out! 😊\n\nI'm super excited about the possibility of working together! Your brand aligns perfectly with my content style and I know my ${request.followerCount} followers would love it.\n\nI'd love to learn more about your campaign goals and discuss how we can create something amazing together. My ${request.engagementRate}% engagement rate shows how connected I am with my audience.\n\nWhen would be a good time to chat more about this opportunity?\n\nCan't wait to hear from you! 💫`;
    } else {
      return `Thank you for considering me for this campaign!\n\nI'm confident we can create exceptional results together. With ${request.followerCount} followers and a ${request.engagementRate}% engagement rate on ${platform}, I consistently deliver high-performing content that drives real business outcomes.\n\nI'd like to understand your specific goals and KPIs so I can propose the most effective content strategy. My approach focuses on authentic storytelling that converts.\n\nLet's discuss how I can help exceed your campaign objectives.\n\nBest,`;
    }
  }
  
  // First outreach - creator reaching out to brand
  if (messageType === 'outreach') {
    if (tone === 'professional') {
      return `Hello ${brandType || '[Brand Name]'} team,\n\nI hope this message finds you well. I'm a ${platform} creator with ${request.followerCount} engaged followers and a ${request.engagementRate}% engagement rate.\n\nI've been following your brand and believe there's excellent synergy between your products and my audience. I specialize in creating authentic content that drives real engagement and conversions.\n\nI'd love to discuss potential collaboration opportunities that could benefit both of us. I can provide my media kit and previous campaign results upon request.\n\nWould you be open to exploring a partnership?\n\nBest regards,`;
    } else if (tone === 'friendly') {
      return `Hi there! 👋\n\nI absolutely love what ${brandType || '[Brand Name]'} is doing! Your recent campaigns caught my attention and I think my ${platform} community (${request.followerCount} followers with ${request.engagementRate}% engagement) would be genuinely excited about your products.\n\nI create authentic content that my audience trusts, and I'd love to showcase your brand in a way that feels natural and engaging.\n\nWould you be interested in chatting about a potential collaboration? I'd be happy to share my media kit and some ideas!\n\nLooking forward to hearing from you! ✨`;
    } else {
      return `Hello ${brandType || '[Brand Name]'}!\n\nI'm reaching out because I believe we could create something amazing together. With ${request.followerCount} highly engaged followers on ${platform} (${request.engagementRate}% engagement rate), I consistently deliver results for brand partners.\n\nI specialize in creating authentic, conversion-focused content that resonates with my audience. My previous collaborations have generated impressive ROI for brands in similar spaces.\n\nI'd love to discuss how we can achieve your marketing goals together. My content drives real business outcomes, not just vanity metrics.\n\nShall we schedule a brief call to explore partnership opportunities?\n\nBest,`;
    }
  }
  
  return "Sorry, something went wrong generating this message. Please try again.";
}

function generateFallbackPricing(request: PricingRequest, influencerData: InfluencerData[]): PricingResponse {
  const followerCount = parseInt(request.followerCount.replace(/[^0-9]/g, ''));
  const engagementRate = parseFloat(request.engagementRate);

  let basePrice = 0;
  let multiplier = 1;

  // Base pricing by follower count and platform
  if (request.platform.toLowerCase() === 'instagram') {
    if (followerCount < 10000) basePrice = 100;
    else if (followerCount < 50000) basePrice = 250;
    else if (followerCount < 100000) basePrice = 600;
    else if (followerCount < 500000) basePrice = 1800;
    else basePrice = 5500;
  } else if (request.platform.toLowerCase() === 'tiktok') {
    if (followerCount < 10000) basePrice = 150;
    else if (followerCount < 50000) basePrice = 350;
    else if (followerCount < 100000) basePrice = 800;
    else if (followerCount < 500000) basePrice = 2200;
    else basePrice = 6500;
  } else if (request.platform.toLowerCase() === 'youtube') {
    if (followerCount < 10000) basePrice = 250;
    else if (followerCount < 50000) basePrice = 700;
    else if (followerCount < 100000) basePrice = 1800;
    else if (followerCount < 500000) basePrice = 5500;
    else basePrice = 16000;
  } else if (request.platform.toLowerCase() === 'twitter') {
    if (followerCount < 10000) basePrice = 80;
    else if (followerCount < 50000) basePrice = 200;
    else if (followerCount < 100000) basePrice = 450;
    else if (followerCount < 500000) basePrice = 1200;
    else basePrice = 3500;
  }

  // Engagement rate multiplier
  if (engagementRate > 6) multiplier = 1.6;
  else if (engagementRate > 4) multiplier = 1.4;
  else if (engagementRate > 2) multiplier = 1.2;
  else if (engagementRate < 1) multiplier = 0.7;

  // Niche multiplier
  const premiumNiches = ['finance', 'investing', 'b2b', 'saas', 'luxury', 'health', 'medical'];
  if (premiumNiches.some(niche => request.niche.toLowerCase().includes(niche))) {
    multiplier *= 1.6;
  }

  const recommended = Math.round(basePrice * multiplier);
  const min = Math.round(recommended * 0.8);
  const max = Math.round(recommended * 1.5);

  return {
    suggestedRange: { min, max, recommended },
    reasoning: `Based on market analysis for ${request.niche} creators with ${request.followerCount} followers and ${request.engagementRate}% engagement rate on ${request.platform}. Your engagement rate ${engagementRate > 3 ? 'is above average' : 'could be improved'} for your follower count, which ${engagementRate > 3 ? 'positively impacts' : 'affects'} your pricing power. ${request.dealType ? `For ${request.dealType} content, we recommend staying within this range for optimal brand-creator fit.` : ''}`,
    exampleDeals: influencerData.slice(0, 3).map(data => ({
      platform: data.platform,
      followers: data.follower_count,
      rate: data.pricing_example,
      context: `${data.niche} creator with ${data.engagement_rate} engagement`
    })),
    premiumFactors: [
      ...(engagementRate > 4 ? ['High engagement rate'] : []),
      ...(premiumNiches.some(niche => request.niche.toLowerCase().includes(niche)) ? ['Premium niche'] : []),
      ...(request.dealType && request.dealType.includes('campaign') ? ['Multi-post campaign value'] : []),
      ...(request.region && ['US', 'UK', 'Australia'].some(r => request.region.includes(r)) ? ['High-value region'] : [])
    ],
    matchedData: influencerData
  };
}

function generateFallbackMediaKit(request: MediaKitRequest): MediaKitResponse {
  const themeColors = {
    'creative': { primary: '#8B5CF6', secondary: '#A78BFA', text: '#1F2937' },
    'elegant': { primary: '#F5F5DC', secondary: '#D2B48C', text: '#8B4513' },
    'bold': { primary: '#EF4444', secondary: '#F87171', text: '#1F2937' },
    'minimal': { primary: '#FFFFFF', secondary: '#F8F9FA', text: '#343A40' }
  };

  const colors = themeColors[request.theme];

  return {
    htmlContent: createProfessionalMediaKit(request),
    sections: ['Header', 'About Me', 'Platform Statistics', 'Audience Demographics', 'Services', 'Past Collaborations', 'Contact'],
    designTips: [
      'Use consistent brand colors throughout',
      'Keep sections concise and scannable',
      'Include high-quality profile image',
      'Add social proof with past collaborations',
      'Make contact information prominent',
      'Ensure mobile responsiveness'
    ],
    matchedData: []
  };
}

// Professional media kit generator
function createProfessionalMediaKit(request: MediaKitRequest): string {
  const { creatorName, bio, niche, platforms, audience, pastCollabs, services, location, email, profileImageUrl, brandLogoUrl, brandColor } = request
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${creatorName} - Media Kit</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .media-kit {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
        }
        
        .header {
            background: linear-gradient(135deg, ${brandColor || '#6366f1'} 0%, ${brandColor || '#8b5cf6'} 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
        }
        
        .logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            object-fit: contain;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
        }
        
        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255, 255, 255, 0.3);
            margin: 0 auto 20px;
            display: block;
        }
        
        .creator-name {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .creator-niche {
            font-size: 20px;
            font-weight: 500;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        
        .creator-location {
            font-size: 16px;
            opacity: 0.8;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section:last-child {
            margin-bottom: 0;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: ${brandColor || '#6366f1'};
            margin-bottom: 16px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: ${brandColor || '#6366f1'};
            margin-right: 12px;
            border-radius: 2px;
        }
        
        .bio-text {
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
        }
        
        .platforms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 16px;
        }
        
        .platform-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .platform-card:hover {
            border-color: ${brandColor || '#6366f1'};
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .platform-name {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .platform-followers {
            font-size: 28px;
            font-weight: 800;
            color: ${brandColor || '#6366f1'};
            margin-bottom: 4px;
        }
        
        .platform-handle {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .audience-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin-top: 16px;
        }
        
        .audience-item {
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
        }
        
        .audience-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        
        .audience-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .services-list {
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            margin-top: 16px;
        }
        
        .contact-section {
            background: linear-gradient(135deg, ${brandColor || '#6366f1'} 0%, ${brandColor || '#8b5cf6'} 100%);
            color: white;
            padding: 40px;
            text-align: center;
            margin: 0 -40px -40px -40px;
            border-radius: 0 0 24px 24px;
        }
        
        .contact-title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 16px;
        }
        
        .contact-subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 24px;
        }
        
        .contact-email {
            font-size: 20px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.2);
            padding: 12px 24px;
            border-radius: 12px;
            display: inline-block;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            
            .media-kit {
                box-shadow: none;
                max-width: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="media-kit">
        <div class="header">
            ${brandLogoUrl ? `<img src="${brandLogoUrl}" alt="Logo" class="logo" />` : ''}
            ${profileImageUrl ? `<img src="${profileImageUrl}" alt="${creatorName}" class="profile-image" />` : ''}
            <h1 class="creator-name">${creatorName}</h1>
            <p class="creator-niche">${niche} Creator</p>
            ${location ? `<p class="creator-location">${location}</p>` : ''}
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">About Me</h2>
                <p class="bio-text">${bio}</p>
            </div>
            
            <div class="section">
                <h2 class="section-title">Platform Statistics</h2>
                <div class="platforms-grid">
                    ${platforms.map(platform => `
                        <div class="platform-card">
                            <div class="platform-name">${platform.name}</div>
                            <div class="platform-followers">${platform.followers}</div>
                            <div class="platform-handle">${platform.handle}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${(audience.gender || audience.age || audience.countries) ? `
                <div class="section">
                    <h2 class="section-title">Audience Demographics</h2>
                    <div class="audience-grid">
                        ${audience.gender ? `
                            <div class="audience-item">
                                <div class="audience-label">Gender Split</div>
                                <div class="audience-value">${audience.gender}</div>
                            </div>
                        ` : ''}
                        ${audience.age ? `
                            <div class="audience-item">
                                <div class="audience-label">Age Range</div>
                                <div class="audience-value">${audience.age}</div>
                            </div>
                        ` : ''}
                        ${audience.countries ? `
                            <div class="audience-item">
                                <div class="audience-label">Top Countries</div>
                                <div class="audience-value">${audience.countries}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${services ? `
                <div class="section">
                    <h2 class="section-title">Services</h2>
                    <p class="services-list">${services}</p>
                </div>
            ` : ''}
            
            ${pastCollabs ? `
                <div class="section">
                    <h2 class="section-title">Past Collaborations</h2>
                    <p class="services-list">${pastCollabs}</p>
                </div>
            ` : ''}
        </div>
        
        <div class="contact-section">
            <h2 class="contact-title">Let's Work Together</h2>
            <p class="contact-subtitle">Ready to create amazing content for your brand?</p>
            ${email ? `<div class="contact-email">${email}</div>` : ''}
        </div>
    </div>
</body>
</html>`
}