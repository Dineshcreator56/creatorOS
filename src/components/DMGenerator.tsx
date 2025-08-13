import React, { useState, useEffect } from 'react';
import { Send, Copy, Loader2, TrendingUp, Users, MessageSquare, Star, Info, Zap, Lightbulb, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
import { generateDMWithAI, generateDailyOutreachTip } from '../lib/openrouter';
import { supabase } from '../lib/supabase';
import { DMRequest, DMResponse, InfluencerData } from '../types';
import { saveDMGeneration } from '../lib/userDataService';
import { canPerformAction, incrementUsage } from '../lib/subscriptionService';
import UsageLimitModal from './UsageLimitModal';

interface DMGeneratorProps {
  userId: string;
  onShowPricing: () => void;
}

const DMGenerator: React.FC<DMGeneratorProps> = ({ userId, onShowPricing }) => {
  const [dmType, setDmType] = useState<'outreach' | 'reply'>('outreach');
  const [platform, setPlatform] = useState('Instagram');
  const [followerCount, setFollowerCount] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [brandType, setBrandType] = useState('');
  const [brandReply, setBrandReply] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dmResponse, setDmResponse] = useState<DMResponse | null>(null);
  const [topPerformingDMs, setTopPerformingDMs] = useState<InfluencerData[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    loadTopPerformingDMs();
  }, []);


  const loadTopPerformingDMs = async () => {
    try {
      const { data, error } = await supabase
        .from('influencer_data')
        .select('*')
        .order('engagement_rate', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTopPerformingDMs(data || []);
    } catch (error) {
      console.error('Error loading top performing DMs:', error);
    }
  };


  const generateDM = async () => {
    if (!followerCount || !engagementRate) return;
    if (dmType === 'reply' && !brandReply.trim()) return;
    
    // Reset previous response when generating new content
    setDmResponse(null);

    // Check if user can perform this action
    const canPerform = await canPerformAction(userId, 'dm_generation');
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

      const request: DMRequest = {
        platform,
        followerCount,
        engagementRate,
        messageType: dmType,
        tone: tone as 'professional' | 'friendly' | 'confident',
        brandType,
        brandReply: dmType === 'reply' ? brandReply : undefined
      };

      const response = await generateDMWithAI(request, influencerData || []);
      setDmResponse(response);

      // Save DM generation to user's data
      await saveDMGeneration({
        user_id: userId,
        platform,
        message_type: dmType,
        tone: tone as 'professional' | 'friendly' | 'confident',
        follower_count: followerCount,
        engagement_rate: engagementRate,
        brand_type: brandType,
        generated_content: response.primary
      });

      // Increment usage counter
      await incrementUsage(userId, 'dm_generation');

    } catch (error) {
      console.error('Error generating DM:', error);
      // Show fallback message
      setDmResponse({
        primary: "Sorry, there was an error generating your DM. Please try again.",
        alternatives: [],
        matchedData: []
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getBestToneByPlatform = (platform: string) => {
    const toneMap: Record<string, string> = {
      'Instagram': 'Friendly works best - visual storytelling',
      'TikTok': 'Confident & energetic - viral potential',
      'YouTube': 'Professional - long-form content',
      'Twitter': 'Confident - thought leadership'
    };
    return toneMap[platform] || 'Professional approach recommended';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-800/30 via-pink-800/30 to-purple-800/30 rounded-3xl p-8 text-white shadow-2xl border border-purple-500/20">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">AI-Powered DM Generator</h2>
              <p className="text-purple-200 text-lg">Generate high-converting messages using data from successful creator campaigns.</p>
            </div>
          </div>
        </div>




        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 mr-3 text-purple-400" />
              Message Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-purple-400" />
                  Message Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDmType('outreach')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform ${
                      dmType === 'outreach' 
                        ? 'bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-400/50 text-purple-200 scale-105 shadow-lg' 
                        : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📤</div>
                      <div className="font-semibold">First Outreach</div>
                      <div className="text-xs opacity-75">Reach out to brands</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setDmType('reply')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform ${
                      dmType === 'reply' 
                        ? 'bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-400/50 text-purple-200 scale-105 shadow-lg' 
                        : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💬</div>
                      <div className="font-semibold">Reply to Brand</div>
                      <div className="text-xs opacity-75">Respond to inquiries</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Brand Reply Section - Only show when "Reply to Brand" is selected */}
              {dmType === 'reply' && (
                <div className="bg-gradient-to-r from-blue-800/20 to-indigo-800/20 border border-blue-500/20 rounded-2xl p-6 animate-in slide-in-from-top duration-300">
                  <label className="block text-sm font-semibold text-blue-100 mb-3 flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Brand's Message *
                  </label>
                  <textarea
                    value={brandReply}
                    onChange={(e) => setBrandReply(e.target.value)}
                    placeholder="Paste the brand's message here that you want to reply to..."
                    rows={4}
                    className="w-full px-4 py-3 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                  <p className="text-xs text-blue-200 mt-2 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Paste the exact message from the brand so AI can craft a perfect response
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-400" />
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                >
                  <option value="Instagram">📷 Instagram</option>
                  <option value="TikTok">🎵 TikTok</option>
                  <option value="YouTube">🎥 YouTube</option>
                  <option value="Twitter">🐦 Twitter</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-400" />
                    Follower Count
                  </label>
                  <input
                    type="text"
                    value={followerCount}
                    onChange={(e) => setFollowerCount(e.target.value)}
                    placeholder="e.g., 25,000 or 25K"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-400" />
                    Engagement Rate (%)
                  </label>
                  <input
                    type="text"
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(e.target.value)}
                    placeholder="e.g., 3.5"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Brand Type (Optional)</label>
                <input
                  type="text"
                  value={brandType}
                  onChange={(e) => setBrandType(e.target.value)}
                  placeholder="e.g., Fashion, Tech, Beauty"
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-slate-400" />
                  Tone
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'professional', label: 'Professional', icon: '💼', desc: 'Formal and business-focused' },
                    { value: 'friendly', label: 'Friendly', icon: '😊', desc: 'Warm and approachable' },
                    { value: 'confident', label: 'Confident', icon: '🚀', desc: 'Bold and results-driven' }
                  ].map((toneOption) => (
                    <button
                      key={toneOption.value}
                      onClick={() => setTone(toneOption.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        tone === toneOption.value
                          ? 'border-purple-500 bg-purple-800/30 shadow-md transform scale-105'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/30 hover:bg-slate-600/30'
                      }`}
                    >
                      <div className="text-lg mb-1">{toneOption.icon}</div>
                      <h4 className="font-semibold text-white text-sm">{toneOption.label}</h4>
                      <p className="text-xs text-slate-400">{toneOption.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateDM}
                disabled={!followerCount || !engagementRate || isGenerating || (dmType === 'reply' && !brandReply.trim())}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none relative z-10 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-3" />
                    Generate AI-Powered {dmType === 'reply' ? 'Reply' : 'DM'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips and Insights */}
          <div className="space-y-6">
            {/* Best Tone by Platform */}
            <div className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-2xl p-6 border border-blue-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-blue-100 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Best Tone by Platform
              </h3>
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-2">{platform}:</p>
                <p className="leading-relaxed">{getBestToneByPlatform(platform)}</p>
              </div>
            </div>

            {/* Top Performing DMs */}
            <div className="bg-gradient-to-br from-green-800/20 to-emerald-800/20 rounded-2xl p-6 border border-green-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-green-100 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Top Performing Messages
              </h3>
              <div className="space-y-4 text-sm text-green-200">
                {topPerformingDMs.slice(0, 3).map((dm, index) => (
                  <div key={index} className="p-4 bg-slate-800/30 rounded-xl border border-green-500/20 shadow-sm">
                    <p className="font-semibold mb-1">{dm.platform} - {dm.engagement_rate} engagement</p>
                    <p className="text-xs leading-relaxed truncate">{dm.dm_reply_example.substring(0, 80)}...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-br from-purple-800/20 to-pink-800/20 rounded-2xl p-6 border border-purple-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-purple-100 mb-4">💡 Pro Tips</h3>
              <ul className="space-y-3 text-sm text-purple-200">
                {dmType === 'reply' ? (
                  <>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Reference specific details from their message</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Show enthusiasm about their brand/campaign</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Include your relevant metrics and rates</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Ask clarifying questions about deliverables</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Suggest a call to discuss further</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Personalize with specific campaign mentions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Include your best engagement metrics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Show genuine interest in the brand</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Follow up after 1-2 weeks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Attach your media kit</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Generated DM Output */}
        {dmResponse && (
          <div className="space-y-6">
            {/* Primary DM */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8 relative overflow-hidden">
              {/* Animated background highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Zap className="h-6 w-6 mr-3 text-purple-400" />
                    ⚡ Smart Suggestion
                  </h3>
                  <button
                    onClick={() => copyToClipboard(dmResponse.primary)}
                    className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-purple-500/30"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                </div>
                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-slate-200 font-sans leading-relaxed">{dmResponse.primary}</pre>
                </div>
              </div>
            </div>

            {/* Alternative DMs */}
            {dmResponse.alternatives.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dmResponse.alternatives.map((alt, index) => (
                  <div key={index} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Alternative {index + 1}</h4>
                      <button
                        onClick={() => copyToClipboard(alt)}
                        className="flex items-center px-3 py-1.5 text-xs bg-slate-600/50 text-slate-200 rounded-lg hover:bg-slate-600/70 transition-colors font-medium"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      <pre className="whitespace-pre-wrap text-xs text-slate-200 font-sans leading-relaxed">{alt}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Matched Data Info */}
            {dmResponse.matchedData.length > 0 && (
              <div className="bg-blue-800/20 rounded-xl p-6 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-blue-100 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Based on {dmResponse.matchedData.length} similar successful creators
                </h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  This {dmType === 'reply' ? 'reply' : 'message'} was generated using data from creators with similar follower counts and engagement rates on {platform}.
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
          featureType="DM Generation"
          limit={3}
        />
      </div>
    </div>
  );
};

export default DMGenerator;