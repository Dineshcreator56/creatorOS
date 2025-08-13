import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Download, 
  Palette, 
  Database,
  ArrowRight,
  Sparkles,
  Star,
  Users,
  TrendingUp,
  MessageSquare,
  DollarSign,
  FileText,
  Loader2,
  Shield,
  Rocket,
  Target,
  Globe,
  Headphones
} from 'lucide-react';
import { getUserProfile, getUserUsage, isUserPro, UserProfile, UserUsage } from '../lib/subscriptionService';

interface PricingPageProps {
  userId: string;
  onClose: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ userId, onClose }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profileData, usageData] = await Promise.all([
        getUserProfile(userId),
        getUserUsage(userId)
      ]);
      setUserProfile(profileData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.open('https://saasbuilder4.gumroad.com/l/poxlin', '_blank');
  };

  const isPro = isUserPro(userProfile);

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const isLimitReached = (used: number, limit: number) => {
    return used >= limit;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700/50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
            <p className="text-slate-300">Loading your plan details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-800/30 via-blue-800/30 to-purple-800/30 text-white p-12 rounded-3xl overflow-hidden mb-12 border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Choose Your Plan
                  </h1>
                  <p className="text-purple-200 text-xl mt-2">Unlock the full potential of your creator business</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-xl text-purple-100 mb-4">Join thousands of creators growing their business</p>
              <div className="flex items-center justify-center space-x-8 text-sm text-purple-200">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>10,000+ creators</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span>$2M+ deals closed</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Usage (Free Plan Only) */}
        {!isPro && usage && (
          <div className="mb-12 bg-gradient-to-r from-amber-800/20 to-orange-800/20 rounded-3xl p-8 border border-amber-500/20 shadow-xl backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-amber-100 mb-6 flex items-center">
              <TrendingUp className="h-7 w-7 mr-3" />
              Your Current Usage This Month
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DM Usage */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-amber-500/20 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">AI DMs</span>
                  </div>
                  <span className={`text-lg font-bold ${isLimitReached(usage.dm_generations, 3) ? 'text-red-400' : 'text-slate-300'}`}>
                    {usage.dm_generations}/3
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isLimitReached(usage.dm_generations, 3) ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${getUsagePercentage(usage.dm_generations, 3)}%` }}
                  />
                </div>
              </div>

              {/* Pricing Usage */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-amber-500/20 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Pricing</span>
                  </div>
                  <span className={`text-lg font-bold ${isLimitReached(usage.pricing_calculations, 2) ? 'text-red-400' : 'text-slate-300'}`}>
                    {usage.pricing_calculations}/2
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isLimitReached(usage.pricing_calculations, 2) ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${getUsagePercentage(usage.pricing_calculations, 2)}%` }}
                  />
                </div>
              </div>

              {/* Media Kit Usage */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-amber-500/20 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Media Kits</span>
                  </div>
                  <span className={`text-lg font-bold ${isLimitReached(usage.media_kit_generations, 1) ? 'text-red-400' : 'text-slate-300'}`}>
                    {usage.media_kit_generations}/1
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isLimitReached(usage.media_kit_generations, 1) ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}
                    style={{ width: `${getUsagePercentage(usage.media_kit_generations, 1)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pro Status Display */}
        {isPro && userProfile?.pro_until && (
          <div className="mb-12 bg-gradient-to-r from-purple-800/20 to-blue-800/20 rounded-3xl p-8 border border-purple-500/20 shadow-xl backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-purple-100 mb-4 flex items-center">
              <Crown className="h-7 w-7 mr-3" />
              Pro Plan Active
            </h3>
            <p className="text-purple-200 text-lg">
              Your Pro plan is active until <strong>{new Date(userProfile.pro_until).toLocaleDateString()}</strong>
            </p>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Free Plan */}
          <div className={`relative rounded-3xl border-2 p-10 transition-all duration-300 backdrop-blur-sm ${
            !isPro 
              ? 'border-purple-400/50 bg-gradient-to-br from-purple-800/20 to-blue-800/20 shadow-xl scale-105' 
              : 'border-slate-600/50 bg-slate-800/30 hover:shadow-lg'
          }`}>
            {!isPro && (
              <div className="absolute -top-4 left-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                CURRENT PLAN
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-500 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Free</h3>
              <div className="text-5xl font-bold text-white mb-3">$0<span className="text-xl text-slate-400">/mo</span></div>
              <p className="text-slate-300 text-lg">Perfect for getting started</p>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">3 AI DM generations per month</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">2 pricing suggestions per month</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">1 media kit generation per month</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">Basic templates only</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">Community support</span>
              </div>
              <div className="flex items-center">
                <X className="h-6 w-6 text-slate-500 mr-4 flex-shrink-0" />
                <span className="text-slate-500 text-lg">Premium themed media kits</span>
              </div>
              <div className="flex items-center">
                <X className="h-6 w-6 text-slate-500 mr-4 flex-shrink-0" />
                <span className="text-slate-500 text-lg">PDF downloads</span>
              </div>
              <div className="flex items-center">
                <X className="h-6 w-6 text-slate-500 mr-4 flex-shrink-0" />
                <span className="text-slate-500 text-lg">Unlimited generations</span>
              </div>
            </div>

            <button
              disabled={!isPro}
              className="w-full py-4 px-8 rounded-2xl border-2 border-slate-600 text-slate-400 font-bold text-lg hover:bg-slate-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isPro ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`relative rounded-3xl border-2 p-10 transition-all duration-300 backdrop-blur-sm ${
            isPro 
              ? 'border-purple-400/50 bg-gradient-to-br from-purple-800/20 to-blue-800/20 shadow-xl scale-105' 
              : 'border-purple-500/50 bg-gradient-to-br from-purple-800/20 to-blue-800/20 shadow-xl hover:scale-105'
          }`}>
            <div className="absolute -top-4 left-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
              <Star className="h-4 w-4 mr-2" />
              {isPro ? 'CURRENT PLAN' : 'MOST POPULAR'}
            </div>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Pro</h3>
              <div className="text-5xl font-bold text-white mb-3">
                $7<span className="text-xl text-slate-400">/month</span>
              </div>
              <p className="text-slate-300 text-lg">Unlimited access to everything</p>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg font-semibold">Unlimited AI DM generations</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg font-semibold">Unlimited pricing suggestions</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg font-semibold">Unlimited media kit generations</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">Premium themed media kits</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">PDF downloads</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">Real creator data & smart-matching</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">Priority support</span>
              </div>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                <span className="text-slate-200 text-lg">Early access to new features</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isPro}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 px-8 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPro ? (
                'Current Plan'
              ) : (
                <>
                  <Rocket className="h-6 w-6 mr-3" />
                  Upgrade to Pro
                  <ArrowRight className="h-6 w-6 ml-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-3xl p-12 mb-16 backdrop-blur-sm border border-slate-600/50">
          <h3 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            <Sparkles className="h-8 w-8 mr-4 text-purple-400" />
            What You Get With Pro
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-white mb-3 text-lg">Unlimited AI DMs</h4>
              <p className="text-slate-300">Generate as many personalized DMs as you need with smart database matching</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-white mb-3 text-lg">Real Creator Data</h4>
              <p className="text-slate-300">Pricing suggestions based on actual creator deals and market data</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-white mb-3 text-lg">Premium Themes</h4>
              <p className="text-slate-300">Beautiful media kit themes: Elegant, Bold, Creative, and more</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-white mb-3 text-lg">PDF Downloads</h4>
              <p className="text-slate-300">Export your media kits as professional PDFs ready to send to brands</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-gradient-to-r from-purple-800/20 to-blue-800/20 rounded-3xl p-12 mb-16 backdrop-blur-sm border border-purple-500/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Trusted by Creators Worldwide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm border border-slate-600/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Sarah Chen</h4>
                  <p className="text-slate-400 text-sm">Fashion Creator, 150K followers</p>
                </div>
              </div>
              <p className="text-slate-300 italic">"Creator Toolkit helped me increase my rates by 40%. The AI suggestions are spot-on!"</p>
              <div className="flex text-yellow-400 mt-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm border border-slate-600/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Marcus Johnson</h4>
                  <p className="text-slate-400 text-sm">Tech Reviewer, 85K followers</p>
                </div>
              </div>
              <p className="text-slate-300 italic">"The DM generator saves me hours every week. My response rate has doubled!"</p>
              <div className="flex text-yellow-400 mt-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm border border-slate-600/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">Ana Rodriguez</h4>
                  <p className="text-slate-400 text-sm">Lifestyle Creator, 220K followers</p>
                </div>
              </div>
              <p className="text-slate-300 italic">"Professional media kits in minutes. Brands love the quality and I love the time saved!"</p>
              <div className="flex text-yellow-400 mt-4">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-600/50 shadow-lg backdrop-blur-sm">
              <h4 className="font-bold text-white mb-3 text-lg">Can I cancel anytime?</h4>
              <p className="text-slate-300">Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-600/50 shadow-lg backdrop-blur-sm">
              <h4 className="font-bold text-white mb-3 text-lg">What happens to my data?</h4>
              <p className="text-slate-300">All your generated content is saved to your account and remains accessible even if you downgrade to the free plan.</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-600/50 shadow-lg backdrop-blur-sm">
              <h4 className="font-bold text-white mb-3 text-lg">Do limits reset monthly?</h4>
              <p className="text-slate-300">Yes, free plan limits reset on the first day of each month. Pro users have unlimited access.</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-600/50 shadow-lg backdrop-blur-sm">
              <h4 className="font-bold text-white mb-3 text-lg">Is there a refund policy?</h4>
              <p className="text-slate-300">We offer a 7-day money-back guarantee if you're not satisfied with the Pro features.</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        {!isPro && (
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Grow Your Creator Business?</h3>
            <p className="text-xl text-purple-100 mb-8">Join thousands of creators who've upgraded their game with Pro</p>
            <button
              onClick={handleUpgrade}
              className="bg-white text-purple-600 py-4 px-12 rounded-2xl hover:bg-purple-50 transition-all duration-300 flex items-center justify-center font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 mx-auto"
            >
              <Rocket className="h-6 w-6 mr-3" />
              Start Your Pro Journey - $7/month
              <ArrowRight className="h-6 w-6 ml-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingPage;