import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Menu,
  X,
  TrendingUp,
  Users,
  Mail,
  Star,
  Send,
  Copy,
  Download,
  Instagram,
  Youtube,
  Twitter,
  Loader2,
  Tag,
  Lightbulb,
  Sparkles,
  LogOut,
  Crown,
  CreditCard,
  Shield,
  Rocket,
  Info,
  AlertCircle
} from 'lucide-react';
import Logo from './components/Logo';
import DMGenerator from './components/DMGenerator';
import MediaKit from './components/MediaKit';
import Auth from './components/Auth';
import PricingPage from './components/PricingPage';
import LandingPage from './components/LandingPage';
import UsageLimitModal from './components/UsageLimitModal';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { generatePricingWithAI, generateDailyPricingTip } from './lib/openrouter';
import { PricingRequest, PricingResponse, InfluencerData } from './types';
import { getDashboardStats, savePricingCalculation, DashboardStats } from './lib/userDataService';
import { 
  getUserProfile, 
  isUserPro,
  canPerformAction, 
  incrementUsage, 
  UserProfile,
  getUserUsage,
  UserUsage,
  FREE_PLAN_LIMITS
} from './lib/subscriptionService';

type ActiveView = 'landing' | 'dashboard' | 'dm-generator' | 'pricing-assistant' | 'media-kit' | 'pricing-page';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSignOut: () => void;
  userEmail?: string;
  userProfile?: UserProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen, onSignOut, userEmail, userProfile }) => {
  const isPro = isUserPro(userProfile);
  
  const menuItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-purple-600' },
    { id: 'dm-generator' as ActiveView, label: 'AI DM Generator', icon: MessageSquare, gradient: 'from-purple-500 to-pink-600' },
    { id: 'pricing-assistant' as ActiveView, label: 'Pricing Assistant', icon: DollarSign, gradient: 'from-green-500 to-emerald-600' },
    { id: 'media-kit' as ActiveView, label: 'Creator Toolkit', icon: FileText, gradient: 'from-orange-500 to-red-600' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 z-50 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-0 shadow-2xl`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Logo size="md" className="shadow-lg" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">CreatorOS</h1>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Plan Status Badge - Prominent */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            isPro 
              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50' 
              : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {isPro ? (
                  <>
                    <Crown className="h-5 w-5 text-purple-400" />
                    <span className="text-lg font-bold text-purple-300">Pro Plan</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 text-amber-400" />
                    <span className="text-lg font-bold text-amber-300">Free Plan</span>
                  </>
                )}
              </div>
              {isPro && (
                <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ACTIVE
                </div>
              )}
            </div>
            
            {isPro ? (
              <p className="text-sm text-purple-200 mb-3">
                Unlimited access to all features
                {userProfile?.pro_until && (
                  <span className="block text-xs text-purple-300 mt-1">
                    Until {new Date(userProfile.pro_until).toLocaleDateString()}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-amber-200 mb-3">
                Limited monthly usage
              </p>
            )}
            
            {!isPro && (
              <button
                onClick={() => setActiveView('pricing-page')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-semibold text-sm flex items-center justify-center shadow-lg"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </button>
            )}
          </div>
          
          <nav className="space-y-3 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' shadow-lg shadow-purple-500/25 scale-105'
                      : 'bg-slate-800/50 hover:bg-slate-700/50 hover:scale-102'
                  }`}
                >
                  <div className="flex items-center px-4 py-4 relative z-10">
                    <div className={`p-2 rounded-lg mr-4 transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                    }`}>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                    </div>
                    <span className={`font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info & Sign Out */}
          <div className="mt-auto">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userEmail}
                  </p>
                  <p className="text-xs text-slate-400">Creator Account</p>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Dashboard: React.FC<{ userId: string; userProfile: UserProfile | null }> = ({ userId, userProfile }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    dmCount: 0,
    avgDealValue: 0,
    templatesCreated: 0,
    responseRate: 0,
    recentActivities: []
  });
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const isPro = isUserPro(userProfile);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, usageData] = await Promise.all([
        getDashboardStats(userId),
        getUserUsage(userId)
      ]);
      setDashboardStats(stats);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'AI DMs Generated', 
      value: dashboardStats.dmCount.toString(), 
      change: '+12%', 
      icon: MessageSquare, 
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-900/20 to-pink-900/20'
    },
    { 
      label: 'Average Deal Value', 
      value: dashboardStats.avgDealValue > 0 ? `$${dashboardStats.avgDealValue}` : '$0', 
      change: '+8%', 
      icon: DollarSign, 
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-900/20 to-emerald-900/20'
    },
    { 
      label: 'Templates Created', 
      value: dashboardStats.templatesCreated.toString(), 
      change: '+25%', 
      icon: FileText, 
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-900/20 to-red-900/20'
    },
    { 
      label: 'Response Rate', 
      value: `${dashboardStats.responseRate}%`, 
      change: '+15%', 
      icon: TrendingUp, 
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-900/20 to-indigo-900/20'
    },
  ];

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'dm_generation':
        return MessageSquare;
      case 'pricing_calculation':
        return DollarSign;
      case 'media_kit_creation':
        return FileText;
      default:
        return TrendingUp;
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.activity_type) {
      case 'dm_generation':
        return `Generated ${activity.activity_details?.message_type || 'DM'} for ${activity.activity_details?.platform || 'platform'}`;
      case 'pricing_calculation':
        return `Calculated pricing for ${activity.activity_details?.platform || 'platform'} in ${activity.activity_details?.niche || 'niche'}`;
      case 'media_kit_creation':
        return `Created ${activity.activity_details?.kit_style || 'media kit'} for ${activity.activity_details?.creator_name || 'creator'}`;
      default:
        return 'Unknown activity';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div>
              <h2 className="text-3xl font-bold">Loading Dashboard...</h2>
              <p className="text-slate-300">Fetching your latest activity and stats.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-800/30 via-blue-800/30 to-purple-800/30 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Welcome back!</h2>
                  <p className="text-purple-200 text-lg">Here's what's happening with your creator business today.</p>
                </div>
              </div>
              <div className={`px-6 py-3 rounded-full border-2 ${
                isPro 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-200' 
                  : 'bg-amber-500/20 border-amber-400 text-amber-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {isPro ? <Crown className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  <span className="font-bold text-lg">{isPro ? 'Pro Plan' : 'Free Plan'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Credits for Free Users */}
        {!isPro && usage && (
          <div className="bg-gradient-to-r from-amber-800/30 to-orange-800/30 rounded-3xl p-8 border border-amber-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-100 flex items-center">
                <CreditCard className="h-7 w-7 mr-3" />
                Your Monthly Credits
              </h3>
              <span className="text-sm text-amber-200 bg-amber-500/20 px-4 py-2 rounded-full font-medium border border-amber-400/30">
                Resets {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DM Credits */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">AI DMs</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {usage.dm_generations}/{FREE_PLAN_LIMITS.dm_generations}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${getUsagePercentage(usage.dm_generations, FREE_PLAN_LIMITS.dm_generations)}%` }}
                  />
                </div>
              </div>

              {/* Pricing Credits */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Pricing</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {usage.pricing_calculations}/{FREE_PLAN_LIMITS.pricing_calculations}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${getUsagePercentage(usage.pricing_calculations, FREE_PLAN_LIMITS.pricing_calculations)}%` }}
                  />
                </div>
              </div>

              {/* Media Kit Credits */}
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-orange-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white">Media Kits</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    {usage.media_kit_generations}/{FREE_PLAN_LIMITS.media_kit_generations}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                    style={{ width: `${getUsagePercentage(usage.media_kit_generations, FREE_PLAN_LIMITS.media_kit_generations)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/10 hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                    <p className="text-sm text-green-400 font-medium">{stat.change} from last month</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {dashboardStats.recentActivities.length > 0 ? (
              dashboardStats.recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.activity_type);
                return (
                  <div key={index} className="flex items-center p-4 rounded-xl hover:bg-slate-700/30 transition-all duration-200 group border border-transparent hover:border-slate-600/50">
                    <div className={`p-3 rounded-xl mr-4 ${
                      activity.activity_type === 'dm_generation' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' :
                      activity.activity_type === 'pricing_calculation' ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' : 
                      'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        activity.activity_type === 'dm_generation' ? 'text-purple-400' :
                        activity.activity_type === 'pricing_calculation' ? 'text-green-400' : 'text-orange-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-slate-200">{getActivityDescription(activity)}</p>
                      <p className="text-xs text-slate-400">{getTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No activity yet</h4>
                <p className="text-slate-400">Start using the tools to see your activity here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingAssistant: React.FC<{ userId: string; onShowPricing: () => void }> = ({ userId, onShowPricing }) => {
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
              <DollarSign className="h-8 w-8 text-white" />
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
              <Tag className="h-6 w-6 mr-3 text-green-400" />
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
                    <DollarSign className="h-5 w-5 mr-3" />
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
                    <Tag className="h-6 w-6 mr-3 text-green-400" />
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

function App() {
  const { user, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      setActiveView('dashboard');
    } else {
      setActiveView('landing');
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const profile = await getUserProfile(user.id);
    setUserProfile(profile);
  };

  const handleAuthSuccess = () => {
    setActiveView('dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    setActiveView('landing');
  };

  const handleShowPricing = () => {
    setActiveView('pricing-page');
  };

  const handleGetStarted = () => {
    if (user) {
      setActiveView('dashboard');
    } else {
      setActiveView('auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4 shadow-lg" />
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-slate-300">Loading CreatorOS...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user && activeView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show auth page when user clicks get started but isn't logged in
  if (!user && activeView === 'auth') {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Show auth page if user is not authenticated and trying to access other views
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard userId={user.id} userProfile={userProfile} />;
      case 'dm-generator':
        return <DMGenerator userId={user.id} onShowPricing={handleShowPricing} />;
      case 'pricing-assistant':
        return <PricingAssistant userId={user.id} onShowPricing={handleShowPricing} />;
      case 'media-kit':
        return <MediaKit userId={user.id} onShowPricing={handleShowPricing} />;
      case 'pricing-page':
        return <PricingPage userId={user.id} onClose={() => setActiveView('dashboard')} />;
      default:
        return <Dashboard userId={user.id} userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onSignOut={handleSignOut}
        userEmail={user.email}
        userProfile={userProfile}
      />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <h1 className="text-lg font-bold text-white">CreatorOS</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-h-screen">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;