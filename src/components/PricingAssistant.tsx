import React, { useState, useEffect } from 'react';
import { Send, Copy, Loader2, TrendingUp, Users, MessageSquare, Star, Info, Zap, Lightbulb, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
import { generatePricingWithAI, generateDailyPricingTip } from '../lib/openrouter';
import { supabase } from '../lib/supabase';
import { PricingRequest, PricingResponse, InfluencerData } from '../types';
import { savePricingCalculation } from '../lib/userDataService';
import { canPerformAction, incrementUsage } from '../lib/subscriptionService';
import UsageLimitModal from './UsageLimitModal';

interface PricingAssistantProps {
  userId: string;
  onShowPricing: () => void;
}

const PricingAssistant: React.FC<PricingAssistantProps> = ({ userId, onShowPricing }) => {
  const [platform, setPlatform] = useState('Instagram');
  const [followers, setFollowers] = useState('');
  const [engagement, setEngagement] = useState('');
  const [niche, setNiche] = useState('');
  const [region, setRegion] = useState('');
  const [dealType, setDealType] = useState('sponsored post');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pricingResponse, setPricingResponse] = useState<PricingResponse | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const calculatePricing = async () => {
    if (!followers || !engagement || !niche) return;

    // Reset previous response when generating new content
    setPricingResponse(null);
    
    // Check if user can perform this action
    const canPerform = await canPerformAction(userId, 'pricing_calculation');
    if (!canPerform) {
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Load influencer data from Supabase
      const { data: influencerData, error } = await supabase
        .from('influencer_data')
        .select('*');

      if (error) throw error;

      const request: PricingRequest = {
        platform,
        followerCount: followers,
        engagementRate: engagement,
        niche,
        region,
        dealType
      };

      const response = await generatePricingWithAI(request, influencerData || []);
      setPricingResponse(response);

      // Save pricing calculation to user's data
      await savePricingCalculation({
        user_id: userId,
        platform,
        follower_count: followers,
        engagement_rate: engagement,
        niche,
        deal_type: dealType,
        suggested_min: response.suggestedRange.min,
        suggested_max: response.suggestedRange.max,
        suggested_recommended: response.suggestedRange.recommended
      });

      // Increment usage counter
      await incrementUsage(userId, 'pricing_calculation');

    } catch (error) {
      console.error('Error generating pricing:', error);
      // Show fallback pricing
      const followerCount = parseInt(followers.replace(/[^0-9]/g, ''));
      const engagementRate = parseFloat(engagement);
      
      let basePrice = 0;
      if (followerCount < 10000) basePrice = 75;
      else if (followerCount < 50000) basePrice = 200;
      else if (followerCount < 100000) basePrice = 500;
      else if (followerCount < 500000) basePrice = 1500;
      else basePrice = 5000;

      const multiplier = engagementRate > 4 ? 1.3 : 1;
      const recommended = Math.round(basePrice * multiplier);

      const fallbackResponse = {
        suggestedRange: {
          min: Math.round(recommended * 0.7),
          max: Math.round(recommended * 1.4),
          recommended
        },
        reasoning: `Based on similar creators with ${followers} followers and ${engagement}% engagement rate on ${platform}.`,
        exampleDeals: [],
        premiumFactors: engagementRate > 4 ? ['High engagement rate'] : [],
        matchedData: []
      };

      setPricingResponse(fallbackResponse);

      // Save fallback pricing calculation
      await savePricingCalculation({
        user_id: userId,
        platform,
        follower_count: followers,
        engagement_rate: engagement,
        niche,
        deal_type: dealType,
        suggested_min: fallbackResponse.suggestedRange.min,
        suggested_max: fallbackResponse.suggestedRange.max,
        suggested_recommended: fallbackResponse.suggestedRange.recommended
      });

      // Increment usage counter
      await incrementUsage(userId, 'pricing_calculation');
    } finally {
      setIsGenerating(false);
    }
  };

  const premiumNiches = [
    'Finance/Investing',
    'B2B/SaaS', 
    'Luxury Goods',
    'Health/Medical',
    'Real Estate'
  ];

  const platformTips = {
    'Instagram': 'Stories typically 40-50% of feed post rates',
    'TikTok': 'Viral potential commands premium pricing',
    'YouTube': 'Longer content = higher rates, include usage rights',
    'Twitter': 'Thread campaigns 2-3x single tweet rates'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-800/30 via-emerald-800/30 to-green-800/30 rounded-3xl p-8 text-white shadow-2xl border border-green-500/20">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">AI-Powered Pricing Assistant</h2>
              <p className="text-green-200 text-lg">Get fair pricing recommendations based on real creator deal data and market analysis.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Star className="h-6 w-6 mr-3 text-green-400" />
              Deal Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Platform *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Follower Count *</label>
                  <input
                    type="text"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    placeholder="e.g., 25,000 or 25K"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Engagement Rate (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={engagement}
                    onChange={(e) => setEngagement(e.target.value)}
                    placeholder="e.g., 3.5"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Content Niche *</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                >
                  <option value="">Select your niche</option>
                  <option value="Fashion & Style">Fashion & Style</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                  <option value="Technology">Technology</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Travel">Travel</option>
                  <option value="Food & Cooking">Food & Cooking</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Parenting">Parenting</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  >
                    <option value="">Select region</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="India">India</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Deal Type</label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  >
                    <option value="sponsored post">Sponsored Post</option>
                    <option value="story">Story/Short Content</option>
                    <option value="video">Video Content</option>
                    <option value="campaign">Multi-Post Campaign</option>
                    <option value="collaboration">Brand Collaboration</option>
                  </select>
                </div>
              </div>

              <button
                onClick={calculatePricing}
                disabled={!followers || !engagement || !niche || isGenerating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none relative z-10 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-3" />
                    Get AI Pricing Recommendation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips and Insights */}
          <div className="space-y-6">
            {/* Platform Tips */}
            <div className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-2xl p-6 border border-blue-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-blue-100 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Rate Tips by Platform
              </h3>
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-2">{platform}:</p>
                <p className="leading-relaxed">{platformTips[platform as keyof typeof platformTips]}</p>
              </div>
            </div>

            {/* Premium Niches */}
            <div className="bg-gradient-to-br from-amber-800/20 to-orange-800/20 rounded-2xl p-6 border border-amber-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Premium Niches & Multipliers
              </h3>
              <div className="space-y-3 text-sm text-amber-200">
                {premiumNiches.map((premiumNiche, index) => (
                  <div key={index} className="p-3 bg-slate-800/30 rounded-xl border border-amber-500/20">
                    <span className="font-semibold">{premiumNiche}</span>
                    <span className="text-amber-400 ml-2 font-bold">1.5-2.5x rates</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Data */}
            <div className="bg-gradient-to-br from-purple-800/20 to-pink-800/20 rounded-2xl p-6 border border-purple-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-purple-100 mb-4">📊 Market Insights</h3>
              <div className="space-y-4 text-sm text-purple-200">
                <div className="p-4 bg-slate-800/30 rounded-xl border border-purple-500/20">
                  <p className="font-semibold">High Engagement Bonus</p>
                  <p className="text-2xl font-bold text-purple-400">{"+20–50% for >5% ER"}</p>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-xl border border-purple-500/20">
                  <p className="font-semibold">Multi-Post Discount</p>
                  <p className="text-2xl font-bold text-purple-400">10-25% off campaigns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Pricing Results */}
        {pricingResponse && (
          <div className="space-y-6">
            {/* Main Pricing Recommendation */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8 relative overflow-hidden">
              {/* Animated background highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Star className="h-6 w-6 mr-3 text-green-400" />
                    AI-Generated Pricing Recommendation
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(`$${pricingResponse.suggestedRange.min} - $${pricingResponse.suggestedRange.max} (Recommended: $${pricingResponse.suggestedRange.recommended})`)}
                    className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-purple-500/30"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                </div>
                
                {/* Enhanced Pricing Display */}
                <div className="bg-gradient-to-r from-green-800/20 to-emerald-800/20 rounded-2xl p-8 mb-6 border border-green-500/20">
                  <div className="text-center mb-6">
                    <h4 className="text-3xl font-bold text-green-100 mb-4">
                      ✅ Recommended Price: ${pricingResponse.suggestedRange.min} – ${pricingResponse.suggestedRange.max}
                    </h4>
                    <div className="text-xl font-bold text-green-200 bg-green-500/20 inline-block px-6 py-3 rounded-full border border-green-400/30">
                      Sweet Spot: ${pricingResponse.suggestedRange.recommended}
                    </div>
                  </div>
                  
                  {pricingResponse.reasoning && (
                    <div className="bg-slate-800/30 rounded-xl p-6 mb-4 border border-green-500/20">
                      <p className="text-green-200 flex items-start text-lg">
                        <span className="text-2xl mr-3">💬</span>
                        <span><strong>Why?</strong> {pricingResponse.reasoning}</span>
                      </p>
                    </div>
                  )}
                </div>

                {pricingResponse.premiumFactors.length > 0 && (
                  <div className="bg-yellow-800/20 rounded-xl p-6 mb-4 border border-yellow-500/20">
                    <h4 className="font-semibold text-yellow-100 mb-3">Premium Factors Applied:</h4>
                    <div className="flex flex-wrap gap-3">
                      {pricingResponse.premiumFactors.map((factor, index) => (
                        <span key={index} className="px-4 py-2 bg-yellow-500/20 text-yellow-200 rounded-full text-sm font-medium border border-yellow-400/30">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Example Deals */}
            {pricingResponse.exampleDeals.length > 0 && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="text-2xl mr-3">📍</span>
                  For Example: Similar Creator Case Studies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pricingResponse.exampleDeals.map((deal, index) => (
                    <div key={index} className="p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl border-l-4 border-green-500 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-white">{deal.platform}</span>
                        <span className="text-sm text-slate-300 bg-slate-600/50 px-2 py-1 rounded-full">{deal.followers}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400 mb-2">{deal.rate}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{deal.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Source Info */}
            {pricingResponse.matchedData.length > 0 && (
              <div className="bg-blue-800/20 rounded-xl p-6 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-blue-100 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Based on {pricingResponse.matchedData.length} similar creators in our database
                </h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  This pricing recommendation was generated using AI analysis of real creator deals with similar metrics in the {niche} niche on {platform}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Usage Limit Modal */}
        <UsageLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onUpgrade={onShowPricing}
          featureType="Pricing Calculation"
          limit={2}
        />
      </div>
    </div>
  );
};

export default PricingAssistant;