import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserDMGeneration {
  id: string;
  user_id: string;
  platform: string;
  message_type: string;
  tone: string;
  follower_count?: string;
  engagement_rate?: string;
  brand_type?: string;
  generated_content: string;
  created_at: string;
}

export interface UserPricingCalculation {
  id: string;
  user_id: string;
  platform: string;
  follower_count: string;
  engagement_rate: string;
  niche: string;
  deal_type: string;
  suggested_min: number;
  suggested_max: number;
  suggested_recommended: number;
  created_at: string;
}

export interface UserMediaKit {
  id: string;
  user_id: string;
  creator_name: string;
  niche: string;
  kit_style: string;
  email_tone?: string;
  platforms: any;
  generated_content: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_details: any;
  created_at: string;
}

export interface DashboardStats {
  dmCount: number;
  avgDealValue: number;
  templatesCreated: number;
  responseRate: number;
  recentActivities: UserActivity[];
}

// User Profile Functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }

  return true;
};

// DM Generation Functions
export const saveDMGeneration = async (dmData: Omit<UserDMGeneration, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase
    .from('user_dm_generations')
    .insert(dmData);

  if (error) {
    console.error('Error saving DM generation:', error);
    return false;
  }

  // Log activity
  await logUserActivity(dmData.user_id, 'dm_generation', {
    platform: dmData.platform,
    message_type: dmData.message_type,
    tone: dmData.tone
  });

  return true;
};

export const getUserDMGenerations = async (userId: string, limit = 10): Promise<UserDMGeneration[]> => {
  const { data, error } = await supabase
    .from('user_dm_generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching DM generations:', error);
    return [];
  }

  return data || [];
};

// Pricing Calculation Functions
export const savePricingCalculation = async (pricingData: Omit<UserPricingCalculation, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase
    .from('user_pricing_calculations')
    .insert(pricingData);

  if (error) {
    console.error('Error saving pricing calculation:', error);
    return false;
  }

  // Log activity
  await logUserActivity(pricingData.user_id, 'pricing_calculation', {
    platform: pricingData.platform,
    niche: pricingData.niche,
    recommended_price: pricingData.suggested_recommended
  });

  return true;
};

export const getUserPricingCalculations = async (userId: string, limit = 10): Promise<UserPricingCalculation[]> => {
  const { data, error } = await supabase
    .from('user_pricing_calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching pricing calculations:', error);
    return [];
  }

  return data || [];
};

// Media Kit Functions
export const saveMediaKit = async (mediaKitData: Omit<UserMediaKit, 'id' | 'created_at'>): Promise<boolean> => {
  const { error } = await supabase
    .from('user_media_kits')
    .insert(mediaKitData);

  if (error) {
    console.error('Error saving media kit:', error);
    return false;
  }

  // Log activity
  await logUserActivity(mediaKitData.user_id, 'media_kit_creation', {
    creator_name: mediaKitData.creator_name,
    niche: mediaKitData.niche,
    kit_style: mediaKitData.kit_style
  });

  return true;
};

export const getUserMediaKits = async (userId: string, limit = 10): Promise<UserMediaKit[]> => {
  const { data, error } = await supabase
    .from('user_media_kits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching media kits:', error);
    return [];
  }

  return data || [];
};

// Activity Logging
export const logUserActivity = async (userId: string, activityType: string, activityDetails: any): Promise<boolean> => {
  const { error } = await supabase
    .from('user_activity_log')
    .insert({
      user_id: userId,
      activity_type: activityType,
      activity_details: activityDetails
    });

  if (error) {
    console.error('Error logging user activity:', error);
    return false;
  }

  return true;
};

// Dashboard Stats
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    // Get DM count
    const { count: dmCount } = await supabase
      .from('user_dm_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get pricing calculations for average deal value
    const { data: pricingData } = await supabase
      .from('user_pricing_calculations')
      .select('suggested_recommended')
      .eq('user_id', userId);

    const avgDealValue = pricingData && pricingData.length > 0
      ? Math.round(pricingData.reduce((sum, item) => sum + item.suggested_recommended, 0) / pricingData.length)
      : 0;

    // Get media kit count
    const { count: templatesCreated } = await supabase
      .from('user_media_kits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get recent activities
    const { data: recentActivities } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate response rate (mock calculation based on activity)
    const responseRate = dmCount && dmCount > 0 ? Math.min(Math.round((dmCount * 0.68) + Math.random() * 10), 100) : 0;

    return {
      dmCount: dmCount || 0,
      avgDealValue,
      templatesCreated: templatesCreated || 0,
      responseRate,
      recentActivities: recentActivities || []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      dmCount: 0,
      avgDealValue: 0,
      templatesCreated: 0,
      responseRate: 0,
      recentActivities: []
    };
  }
};