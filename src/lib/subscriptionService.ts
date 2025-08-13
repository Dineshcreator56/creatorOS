import { supabase } from './supabase';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  pro_until?: string;
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  month_year: string;
  dm_generations: number;
  pricing_calculations: number;
  media_kit_generations: number;
  created_at: string;
  updated_at: string;
}

export interface UsageLimits {
  dm_generations: number;
  pricing_calculations: number;
  media_kit_generations: number;
}

// Free plan limits
export const FREE_PLAN_LIMITS: UsageLimits = {
  dm_generations: 3,
  pricing_calculations: 2,
  media_kit_generations: 1
};

// Check if user has active Pro subscription based on pro_until field
export const isUserPro = (user: UserProfile | null): boolean => {
  if (!user || !user.pro_until) return false;
  return new Date(user.pro_until) > new Date();
};

// Get user profile with pro_until field
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

// Get user's current subscription (legacy - keeping for compatibility)
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  // First check the pro_until field in user_profiles
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const isPro = isUserPro(profile);
  
  // Return a subscription object based on pro_until status
  return {
    id: 'profile-based',
    user_id: userId,
    plan_type: isPro ? 'pro' : 'free',
    status: 'active',
    started_at: profile.created_at,
    expires_at: profile.pro_until || undefined,
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
};

// Get user's current month usage
export const getUserUsage = async (userId: string): Promise<UserUsage | null> => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  // First, try to fetch existing usage record
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', currentMonth)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No usage record found, try to create one
      const { data: newUsage, error: insertError } = await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          month_year: currentMonth,
          dm_generations: 0,
          pricing_calculations: 0,
          media_kit_generations: 0
        })
        .select()
        .single();

      if (insertError) {
        // Check if it's a duplicate key error (race condition)
        if (insertError.code === '23505') {
          // Another process created the record, try to fetch it again
          const { data: existingUsage, error: refetchError } = await supabase
            .from('user_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

          if (refetchError) {
            console.error('Error refetching usage record after race condition:', refetchError);
            return null;
          }

          return existingUsage;
        }

        console.error('Error creating usage record:', insertError);
        return null;
      }

      return newUsage;
    }
    console.error('Error fetching user usage:', error);
    return null;
  }

  return data;
};

// Check if user can perform an action
export const canPerformAction = async (
  userId: string, 
  actionType: 'dm_generation' | 'pricing_calculation' | 'media_kit_generation'
): Promise<boolean> => {
  // Check pro status using pro_until field
  const profile = await getUserProfile(userId);
  const isPro = isUserPro(profile);
  
  // Pro users have unlimited access
  if (isPro) {
    return true;
  }

  // Free users need to check limits
  const usage = await getUserUsage(userId);
  if (!usage) return false;

  const limits = FREE_PLAN_LIMITS;
  
  switch (actionType) {
    case 'dm_generation':
      return usage.dm_generations < limits.dm_generations;
    case 'pricing_calculation':
      return usage.pricing_calculations < limits.pricing_calculations;
    case 'media_kit_generation':
      return usage.media_kit_generations < limits.media_kit_generations;
    default:
      return false;
  }
};

// Increment usage counter
export const incrementUsage = async (
  userId: string,
  actionType: 'dm_generation' | 'pricing_calculation' | 'media_kit_generation'
): Promise<boolean> => {
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Get current usage
  let usage = await getUserUsage(userId);
  if (!usage) return false;

  // Increment the appropriate counter
  const updates: Partial<UserUsage> = {};
  switch (actionType) {
    case 'dm_generation':
      updates.dm_generations = usage.dm_generations + 1;
      break;
    case 'pricing_calculation':
      updates.pricing_calculations = usage.pricing_calculations + 1;
      break;
    case 'media_kit_generation':
      updates.media_kit_generations = usage.media_kit_generations + 1;
      break;
  }

  const { error } = await supabase
    .from('user_usage')
    .update(updates)
    .eq('user_id', userId)
    .eq('month_year', currentMonth);

  if (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }

  return true;
};

// Update user's pro_until field (called by webhook)
export const updateUserProStatus = async (
  userEmail: string,
  proUntil: string | null
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      pro_until: proUntil,
      updated_at: new Date().toISOString()
    })
    .eq('email', userEmail);

  if (error) {
    console.error('Error updating user pro status:', error);
    return false;
  }

  return true;
};

// Create or update subscription (legacy - keeping for compatibility)
export const updateUserSubscription = async (
  userId: string,
  planType: 'free' | 'pro',
  status: 'active' | 'cancelled' | 'expired' = 'active'
): Promise<boolean> => {
  // Update the pro_until field instead of subscription table
  const proUntil = planType === 'pro' ? null : undefined; // null means unlimited pro
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      pro_until: proUntil,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }

  return true;
};

// Get remaining usage for free plan
export const getRemainingUsage = async (userId: string): Promise<UsageLimits | null> => {
  const profile = await getUserProfile(userId);
  const isPro = isUserPro(profile);
  
  // Pro users have unlimited access
  if (isPro) {
    return {
      dm_generations: -1, // -1 indicates unlimited
      pricing_calculations: -1,
      media_kit_generations: -1
    };
  }

  const usage = await getUserUsage(userId);
  if (!usage) return null;

  return {
    dm_generations: Math.max(0, FREE_PLAN_LIMITS.dm_generations - usage.dm_generations),
    pricing_calculations: Math.max(0, FREE_PLAN_LIMITS.pricing_calculations - usage.pricing_calculations),
    media_kit_generations: Math.max(0, FREE_PLAN_LIMITS.media_kit_generations - usage.media_kit_generations)
  };
};