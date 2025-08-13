export interface InfluencerData {
  id?: string;
  platform: string;
  follower_count: string;
  engagement_rate: string;
  niche: string;
  region: string;
  dm_reply_example: string;
  pricing_example: string;
  media_kit_sections: string;
  media_kit_sample_template?: string; // New field for HTML templates
  created_at?: string;
}

export interface DMRequest {
  platform: string;
  followerCount: string;
  engagementRate: string;
  messageType: 'reply' | 'outreach';
  tone: 'professional' | 'friendly' | 'confident';
  brandType?: string;
  brandReply?: string; // New field for brand's message when replying
}

export interface DMResponse {
  primary: string;
  alternatives: string[];
  matchedData: InfluencerData[];
}

export interface PricingRequest {
  platform: string;
  followerCount: string;
  engagementRate: string;
  niche: string;
  region?: string;
  dealType: string;
}

export interface PricingResponse {
  suggestedRange: {
    min: number;
    max: number;
    recommended: number;
  };
  reasoning?: string; // New field for detailed explanation
  exampleDeals: Array<{
    platform: string;
    followers: string;
    rate: string;
    context: string;
  }>;
  premiumFactors: string[];
  matchedData: InfluencerData[];
}

export interface MediaKitRequest {
  creatorName: string;
  bio: string;
  niche: string;
  platforms: Array<{
    name: string;
    handle: string;
    followers: string;
  }>;
  audience: {
    gender: string;
    age: string;
    countries: string;
  };
  pastCollabs?: string;
  theme: 'creative' | 'elegant' | 'bold' | 'minimal';
  profileImageUrl?: string;
  brandLogoUrl?: string;
  brandColor?: string;
  kitStyle?: 'email' | 'notion';
  emailTone?: 'professional' | 'friendly' | 'confident';
  services?: string;
  location?: string;
  email?: string;
  brandName?: string; // New field for brand name in email templates
}

export interface MediaKitResponse {
  htmlContent: string;
  sections: string[];
  designTips: string[];
  matchedData: InfluencerData[];
  highlightBadge?: string;
}

export interface MediaKitData {
  creatorName: string;
  email: string;
  bio: string;
  niche: string;
  location: string;
  profileImageUrl: string;
  brandLogoUrl: string;
  brandColor: string;
  audience: {
    gender: string;
    age: string;
    country: string;
  };
  services: string;
  pastCollabs: string;
  socialMedia: {
    instagram?: { handle: string; followers: string };
    youtube?: { handle: string; followers: string };
    tiktok?: { handle: string; followers: string };
  };
  theme: 'creative' | 'elegant' | 'bold' | 'minimal';
}

export interface BrandMatchEnhancer {
  suggestions: string[];
  niche: string;
}
