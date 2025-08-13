import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Loader2, 
  FileText, 
  Palette, 
  User, 
  Mail, 
  MapPin, 
  Instagram, 
  Youtube, 
  Twitter,
  Sparkles, 
  Crown,
  Zap,
  Star,
  Users,
  TrendingUp,
  Globe,
  Camera, 
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Target,
  Award,
  Briefcase,
  Upload,
  Image as ImageIcon, 
  Wand2
} from 'lucide-react';
import { generateMediaKitWithAI, enhanceBioWithAI } from '../lib/openrouter';
import { supabase } from '../lib/supabase';
import { MediaKitRequest, MediaKitResponse, InfluencerData, BrandMatchEnhancer } from '../types';
import { saveMediaKit, getUserPricingCalculations } from '../lib/userDataService';
import { canPerformAction, incrementUsage } from '../lib/subscriptionService';
import UsageLimitModal from './UsageLimitModal';
import html2pdf from 'html2pdf.js';

interface MediaKitProps {
  userId: string;
  onShowPricing: () => void;
}

const MediaKit: React.FC<MediaKitProps> = ({ userId, onShowPricing }) => {
  const [kitStyle, setKitStyle] = useState<'email' | 'notion'>('notion');
  const [creatorName, setCreatorName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState('');
  const [pastCollabs, setPastCollabs] = useState('');
  const [brandName, setBrandName] = useState('');
  const [emailTone, setEmailTone] = useState<'professional' | 'friendly' | 'confident'>('professional');
  const [theme, setTheme] = useState<'creative' | 'elegant' | 'bold' | 'minimal'>('creative');
  const [profileImage, setProfileImage] = useState<string>('');
  const [logoImage, setLogoImage] = useState<string>('');
  const [customColor, setCustomColor] = useState('#8B5CF6');
  const [isEnhancingBio, setIsEnhancingBio] = useState(false);
  const [recentPricing, setRecentPricing] = useState<any>(null);
  const [platforms, setPlatforms] = useState([
    { name: 'Instagram', handle: '', followers: '' },
    { name: 'YouTube', handle: '', followers: '' },
    { name: 'TikTok', handle: '', followers: '' }
  ]);
  const [audience, setAudience] = useState({
    gender: '',
    age: '',
    countries: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaKitResponse, setMediaKitResponse] = useState<MediaKitResponse | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  useEffect(() => {
    if (userId) {
      // Fetch recent pricing calculations to use in the media kit
      getUserPricingCalculations(userId, 1).then(data => {
        if (data && data.length > 0) {
          setRecentPricing(data[0]);
        }
      }).catch(err => console.error('Error fetching pricing data:', err));
    }
  }, [userId]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'profile') {
          setProfileImage(result);
        } else {
          setLogoImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const enhanceBio = async () => {
    if (!bio || !niche) return;
    
    setIsEnhancingBio(true);
    try {
      const enhancedBio = await enhanceBioWithAI(bio, niche, []);
      setBio(enhancedBio);
    } catch (error) {
      console.error('Error enhancing bio:', error);
      // Fallback enhancement
      setBio(bio + ' I specialize in creating authentic, engaging content that resonates with my audience and drives real results for brand partners.');
    } finally {
      setIsEnhancingBio(false);
    }
  };


  const updatePlatform = (index: number, field: string, value: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    setPlatforms(newPlatforms);
  };

  const generateMediaKit = async () => {
    if (!creatorName || !bio || !niche) return; 
    if (kitStyle === 'email' && !brandName) return;
    
    // Reset previous response when generating new content
    setMediaKitResponse(null);

    // Check if user can perform this action
    const canPerform = await canPerformAction(userId, 'media_kit_generation');
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

      const request: MediaKitRequest = {
        creatorName,
        bio,
        niche,
        platforms: platforms.filter(p => p.handle && p.followers),
        audience,
        pastCollabs,
        theme,
        kitStyle,
        emailTone: kitStyle === 'email' ? emailTone : undefined,
        services,
        location,
        pricing: recentPricing,
        email,
        brandName: kitStyle === 'email' ? brandName : undefined,
        profileImageUrl: profileImage,
        brandLogoUrl: logoImage,
        brandColor: customColor
      };

      const response = await generateMediaKitWithAI(request, influencerData || []);
      
      // For Notion kit, inject the uploaded images into the HTML
      // Images are now automatically handled by the backend
      setMediaKitResponse(response);

      // Save media kit to user's data
      await saveMediaKit({
        user_id: userId,
        creator_name: creatorName,
        niche,
        kit_style: kitStyle,
        email_tone: kitStyle === 'email' ? emailTone : undefined,
        platforms: platforms.filter(p => p.handle && p.followers),
        generated_content: response.htmlContent
      });

      // Increment usage counter
      await incrementUsage(userId, 'media_kit_generation');

    } catch (error) {
      console.error('Error generating media kit:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!mediaKitResponse) return;

    const element = document.createElement('div');
    element.innerHTML = mediaKitResponse.htmlContent;
    
    const opt = {
      margin: 0.5,
      filename: `${creatorName.replace(/\s+/g, '_')}_MediaKit.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getThemeColors = (themeName: string) => {
    const themes = {
      creative: { primary: customColor, secondary: customColor + '80', bg: 'from-purple-800/20 to-pink-800/20', border: 'border-purple-500/20' },
      elegant: { primary: customColor, secondary: customColor + '80', bg: 'from-amber-800/20 to-orange-800/20', border: 'border-amber-500/20' },
      bold: { primary: customColor, secondary: customColor + '80', bg: 'from-red-800/20 to-pink-800/20', border: 'border-red-500/20' },
      minimal: { primary: customColor, secondary: customColor + '80', bg: 'from-slate-800/20 to-slate-700/20', border: 'border-slate-500/20' }
    };
    return themes[themeName as keyof typeof themes] || themes.creative;
  };

  const themeColors = getThemeColors(theme);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-800/30 via-red-800/30 to-orange-800/30 rounded-3xl p-8 text-white shadow-2xl border border-orange-500/20">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">Creator Toolkit</h2>
              <p className="text-orange-200 text-lg">Generate professional media kits and email templates that convert brands into partnerships.</p>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <User className="h-6 w-6 mr-3 text-orange-400" />
              Creator Information
            </h3>

            {/* Output Style Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-300 mb-3">Output Style:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setKitStyle('notion')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    kitStyle === 'notion'
                      ? 'bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border-blue-400/50 text-blue-200'
                      : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">Notion Kit</div>
                  <div className="text-xs opacity-75">Professional media kit page</div>
                </button>
                <button
                  onClick={() => setKitStyle('email')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    kitStyle === 'email'
                      ? 'bg-gradient-to-r from-purple-800/30 to-pink-800/30 border-purple-400/50 text-purple-200'
                      : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">Email Template</div>
                  <div className="text-xs opacity-75">Outreach email to brands</div>
                </button>
              </div>
            </div>

            {/* Image Upload Section - Only for Notion Kit */}
            {kitStyle === 'notion' && (
              <div className="mb-8 bg-gradient-to-r from-blue-800/20 to-indigo-800/20 border border-blue-500/20 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-blue-100 mb-4 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Media Kit Images
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-3">Profile Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400/50 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors"
                      >
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-blue-400 mb-2" />
                            <span className="text-sm text-blue-200">Upload Profile Image</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Logo Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-3">Brand Logo (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400/50 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors"
                      >
                        {logoImage ? (
                          <img src={logoImage} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-blue-400 mb-2" />
                            <span className="text-sm text-blue-200">Upload Brand Logo</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Picker - Only for Notion Kit */}
            {kitStyle === 'notion' && (
              <div className="mb-8 bg-gradient-to-r from-purple-800/20 to-pink-800/20 border border-purple-500/20 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-purple-100 mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Custom Color Theme
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-purple-200 mb-2">Choose Your Brand Color</label>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full h-12 rounded-xl border border-purple-400/50 cursor-pointer"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl border-2 border-purple-400/50" style={{ backgroundColor: customColor }}></div>
                  </div>
                </div>
                <p className="text-xs text-purple-200 mt-2">This color will be used throughout your media kit design</p>
              </div>
            )}
            {/* Brand Name for Email Template */}
            {kitStyle === 'email' && (
              <div className="mb-6 bg-gradient-to-r from-blue-800/20 to-indigo-800/20 border border-blue-500/20 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-blue-100 mb-3 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Brand Name (Required for Email Template)
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Nike, Sephora, Apple"
                  className="w-full px-4 py-3 border border-blue-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                />
                <p className="text-xs text-blue-200 mt-2">Enter the brand name you want to reach out to for collaboration</p>
              </div>
            )}

            {/* Email Tone for Email Template */}
            {kitStyle === 'email' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">Email Tone Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'professional', label: 'Professional', icon: '💼', desc: 'Formal and business-focused' },
                    { value: 'friendly', label: 'Friendly', icon: '😊', desc: 'Warm and approachable' },
                    { value: 'confident', label: 'Confident', icon: '🚀', desc: 'Bold and results-driven' }
                  ].map((toneOption) => (
                    <button
                      key={toneOption.value}
                      onClick={() => setEmailTone(toneOption.value as 'professional' | 'friendly' | 'confident')}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                        emailTone === toneOption.value
                          ? 'border-purple-500 bg-purple-800/30 shadow-md'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                      }`}
                    >
                      <div className="text-lg mb-1">{toneOption.icon}</div>
                      <h4 className="font-semibold text-white text-xs">{toneOption.label}</h4>
                      <p className="text-xs text-slate-400">{toneOption.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-400" />
                    Creator Name *
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Your name or brand"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-400" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Content Niche *</label>
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                  >
                    <option value="">Select your primary niche</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Food">Food</option>
                    <option value="Tech">Tech</option>
                    <option value="Travel">Travel</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-300">Bio *</label>
                  <button
                    onClick={enhanceBio}
                    disabled={!bio || !niche || isEnhancingBio}
                    className="flex items-center px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnhancingBio ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 mr-1" />
                        AI Optimize
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                />
                <p className="text-xs text-slate-400 mt-2">Click "AI Optimize" to enhance your bio for better brand appeal</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Services</label>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="e.g., Sponsored posts, Product reviews, Brand partnerships"
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Past Collaborations</label>
                <textarea
                  value={pastCollabs}
                  onChange={(e) => setPastCollabs(e.target.value)}
                  placeholder="Mention notable brands you've worked with..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white shadow-sm transition-all duration-200"
                />
              </div>

              {/* Platform Information */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-4">Platform Statistics</label>
                <div className="space-y-4">
                  {platforms.map((platform, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                          {platform.name === 'Instagram' && <Instagram className="h-4 w-4 text-white" />}
                          {platform.name === 'YouTube' && <Youtube className="h-4 w-4 text-white" />}
                          {platform.name === 'TikTok' && <Camera className="h-4 w-4 text-white" />}
                        </div>
                        <span className="font-medium text-white">{platform.name}</span>
                      </div>
                      <input
                        type="text"
                        value={platform.handle}
                        onChange={(e) => updatePlatform(index, 'handle', e.target.value)}
                        placeholder="@username"
                        className="px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white text-sm"
                      />
                      <input
                        type="text"
                        value={platform.followers}
                        onChange={(e) => updatePlatform(index, 'followers', e.target.value)}
                        placeholder="e.g., 25K"
                        className="px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Demographics */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-4">Audience Demographics</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Gender Split</label>
                    <input
                      type="text"
                      value={audience.gender}
                      onChange={(e) => setAudience({...audience, gender: e.target.value})}
                      placeholder="e.g., 60% Female, 40% Male"
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Age Range</label>
                    <input
                      type="text"
                      value={audience.age}
                      onChange={(e) => setAudience({...audience, age: e.target.value})}
                      placeholder="e.g., 18-34 years"
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Top Countries</label>
                    <input
                      type="text"
                      value={audience.countries}
                      onChange={(e) => setAudience({...audience, countries: e.target.value})}
                      placeholder="e.g., US, UK, Canada"
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-700/50 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Selection for Notion Kit */}
              {kitStyle === 'notion' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-4 flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Theme Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'creative', label: 'Creative', colors: 'from-purple-500 to-pink-500', desc: 'Bold and artistic' },
                      { value: 'elegant', label: 'Elegant', colors: 'from-amber-500 to-orange-500', desc: 'Sophisticated and refined' },
                      { value: 'bold', label: 'Bold', colors: 'from-red-500 to-pink-500', desc: 'Eye-catching and vibrant' },
                      { value: 'minimal', label: 'Minimal', colors: 'from-slate-500 to-slate-700', desc: 'Clean and simple' }
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value as 'creative' | 'elegant' | 'bold' | 'minimal')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          theme === themeOption.value
                            ? 'border-orange-500 bg-orange-800/30 shadow-md transform scale-105'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        }`}
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${themeOption.colors} rounded-lg mb-2`}></div>
                        <h4 className="font-semibold text-white text-sm">{themeOption.label}</h4>
                        <p className="text-xs text-slate-400">{themeOption.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={generateMediaKit}
                disabled={!creatorName || !bio || !niche || isGenerating || (kitStyle === 'email' && !brandName)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none relative z-10 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-3" />
                    Generate {kitStyle === 'email' ? 'Email Template' : 'Media Kit'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips and Insights */}
          <div className="space-y-6">
            {/* Media Kit Tips */}
            <div className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-2xl p-6 border border-blue-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-blue-100 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Media Kit Best Practices
              </h3>
              <ul className="space-y-3 text-sm text-blue-200">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Include high-quality profile photos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Showcase your best content samples</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Highlight engagement rates, not just followers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Include testimonials from past collaborations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Keep it concise but comprehensive</span>
                </li>
              </ul>
            </div>

            {/* Theme Preview */}
            {kitStyle === 'notion' && (
              <div className={`bg-gradient-to-br ${themeColors.bg} rounded-2xl p-6 ${themeColors.border} border shadow-lg backdrop-blur-sm`}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Preview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: themeColors.primary }}
                    ></div>
                    <span className="text-white text-sm">Primary Color</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: themeColors.secondary }}
                    ></div>
                    <span className="text-white text-sm">Secondary Color</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    This theme will be applied to your media kit with professional typography and spacing.
                  </p>
                </div>
              </div>
            )}

            {/* Engagement Metrics */}
            <div className="bg-gradient-to-br from-green-800/20 to-emerald-800/20 rounded-2xl p-6 border border-green-500/20 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-green-100 mb-4">📊 Key Metrics to Include</h3>
              <div className="space-y-4 text-sm text-green-200">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-green-500/20">
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-400" />
                    Engagement Rate
                  </span>
                  <span className="font-bold">3-6% is excellent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-green-500/20">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-blue-400" />
                    Reach & Impressions
                  </span>
                  <span className="font-bold">Show growth trends</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-green-500/20">
                  <span className="flex items-center">
                    <Share2 className="h-4 w-4 mr-2 text-purple-400" />
                    Save Rate
                  </span>
                  <span className="font-bold">High-value content</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Media Kit Output */}
        {mediaKitResponse && (
          <div className="space-y-6">
            {/* Media Kit Preview */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Crown className="h-6 w-6 mr-3 text-orange-400" />
                  Your {kitStyle === 'email' ? 'Email Template' : 'Media Kit'}
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => copyToClipboard(mediaKitResponse.htmlContent)}
                    className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-purple-500/30"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy {kitStyle === 'email' ? 'Email' : 'HTML'}
                  </button>
                  {kitStyle === 'notion' && (
                    <button
                      onClick={downloadPDF}
                      className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-200 rounded-xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 font-medium shadow-sm hover:shadow-md border border-orange-500/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {kitStyle === 'email' ? (
                  <div className="p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 overflow-x-auto">
                      {mediaKitResponse.htmlContent}
                    </pre>
                  </div>
                ) : (
                  <div className="max-h-[800px] overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: mediaKitResponse.htmlContent }} />
                  </div>
                )}
              </div>
            </div>

            {/* Design Tips */}
            {mediaKitResponse.designTips.length > 0 && (
              <div className="bg-gradient-to-r from-amber-800/20 to-orange-800/20 rounded-xl p-6 border border-amber-500/20">
                <h4 className="text-sm font-semibold text-amber-100 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Design Tips for Your {kitStyle === 'email' ? 'Email' : 'Media Kit'}
                </h4>
                <ul className="space-y-2 text-xs text-amber-200">
                  {mediaKitResponse.designTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-400 mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Source Info */}
            {mediaKitResponse.matchedData.length > 0 && (
              <div className="bg-blue-800/20 rounded-xl p-6 border border-blue-500/20">
                <h4 className="text-sm font-semibold text-blue-100 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Based on {mediaKitResponse.matchedData.length} successful creator templates
                </h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  This {kitStyle === 'email' ? 'email template' : 'media kit'} was generated using best practices from successful {niche} creators.
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
          featureType="Media Kit Generation"
          limit={1}
        />
      </div>
    </div>
  );
};

export default MediaKit;