/**
 * Client Profile Service
 *
 * Supabase operations for client_profiles table
 * Uses server-side Supabase client with service role for admin operations
 */

import { supabaseServer } from '../supabase-server';
import type {
  ClientProfile,
  CreateClientProfileInput,
  UpdateClientProfileInput,
  GoalType,
  ExperienceLevel,
} from '../types/client-profile';

// ========================================
// CREATE
// ========================================

/**
 * Create a new client profile
 */
export async function createClientProfile(
  input: CreateClientProfileInput
): Promise<{ data: ClientProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabaseServer
      .from('client_profiles')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating client profile:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating client profile:', err);
    return { data: null, error: err };
  }
}

// ========================================
// READ
// ========================================

/**
 * Get all client profiles (for current trainer)
 */
export async function getAllClientProfiles(): Promise<ClientProfile[]> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching client profiles:', error);
    throw new Error(`Failed to fetch client profiles: ${error.message}`);
  }

  return data || [];
}

/**
 * Get client profile by ID
 */
export async function getClientProfileById(id: string): Promise<ClientProfile | null> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client profile:', error);
    return null;
  }

  return data;
}

/**
 * Get client profile by email
 */
export async function getClientProfileByEmail(email: string): Promise<ClientProfile | null> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - this is expected
      return null;
    }
    console.error('Error fetching client profile by email:', error);
    return null;
  }

  return data;
}

/**
 * Get client profiles by trainer ID
 */
export async function getClientProfilesByTrainer(trainerId: string): Promise<ClientProfile[]> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .eq('assigned_trainer_id', trainerId)
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching trainer client profiles:', error);
    throw new Error(`Failed to fetch client profiles: ${error.message}`);
  }

  return data || [];
}

/**
 * Search client profiles by name or email
 */
export async function searchClientProfiles(searchTerm: string): Promise<ClientProfile[]> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .eq('is_active', true)
    .order('last_name', { ascending: true })
    .limit(50);

  if (error) {
    console.error('Error searching client profiles:', error);
    throw new Error(`Failed to search client profiles: ${error.message}`);
  }

  return data || [];
}

// ========================================
// UPDATE
// ========================================

/**
 * Update client profile
 */
export async function updateClientProfile(
  id: string,
  updates: UpdateClientProfileInput
): Promise<{ data: ClientProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabaseServer
      .from('client_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client profile:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception updating client profile:', err);
    return { data: null, error: err };
  }
}

/**
 * Update client profile injuries
 */
export async function updateClientInjuries(
  id: string,
  injuries: any[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabaseServer
      .from('client_profiles')
      .update({ injuries })
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Update client profile goals
 */
export async function updateClientGoals(
  id: string,
  primaryGoal: GoalType,
  secondaryGoals: GoalType[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabaseServer
      .from('client_profiles')
      .update({
        primary_goal: primaryGoal,
        secondary_goals: secondaryGoals,
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

// ========================================
// DELETE / DEACTIVATE
// ========================================

/**
 * Soft delete - mark profile as inactive
 */
export async function deactivateClientProfile(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabaseServer
      .from('client_profiles')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

/**
 * Hard delete - permanently remove profile
 */
export async function deleteClientProfile(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabaseServer
      .from('client_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

// ========================================
// FILTERING & ANALYTICS
// ========================================

/**
 * Get client profiles by goal
 */
export async function getClientProfilesByGoal(goal: GoalType): Promise<ClientProfile[]> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .eq('primary_goal', goal)
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching client profiles by goal:', error);
    throw new Error(`Failed to fetch client profiles: ${error.message}`);
  }

  return data || [];
}

/**
 * Get client profiles by experience level
 */
export async function getClientProfilesByExperience(level: ExperienceLevel): Promise<ClientProfile[]> {
  const { data, error } = await supabaseServer
    .from('client_profiles')
    .select('*')
    .eq('experience_level', level)
    .eq('is_active', true)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching client profiles by experience:', error);
    throw new Error(`Failed to fetch client profiles: ${error.message}`);
  }

  return data || [];
}

/**
 * Get count of active client profiles
 */
export async function getActiveClientCount(): Promise<number> {
  const { count, error } = await supabaseServer
    .from('client_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) {
    console.error('Error counting client profiles:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get client profile statistics
 */
export async function getClientProfileStats(): Promise<{
  total: number;
  byGoal: Record<GoalType, number>;
  byExperience: Record<ExperienceLevel, number>;
}> {
  // Get all active profiles
  const profiles = await getAllClientProfiles();

  // Count by goal
  const byGoal: Partial<Record<GoalType, number>> = {};
  profiles.forEach((profile) => {
    byGoal[profile.primary_goal] = (byGoal[profile.primary_goal] || 0) + 1;
  });

  // Count by experience
  const byExperience: Partial<Record<ExperienceLevel, number>> = {};
  profiles.forEach((profile) => {
    byExperience[profile.experience_level] = (byExperience[profile.experience_level] || 0) + 1;
  });

  return {
    total: profiles.length,
    byGoal: byGoal as Record<GoalType, number>,
    byExperience: byExperience as Record<ExperienceLevel, number>,
  };
}

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Check if email is already in use
 */
export async function isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
  let query = supabaseServer
    .from('client_profiles')
    .select('id')
    .eq('email', email);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    console.error('Error checking email:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Validate required fields for profile creation
 */
export function validateClientProfile(input: Partial<CreateClientProfileInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.email) errors.push('Email is required');
  if (!input.first_name) errors.push('First name is required');
  if (!input.last_name) errors.push('Last name is required');
  if (!input.primary_goal) errors.push('Primary goal is required');
  if (!input.experience_level) errors.push('Experience level is required');

  // Validate email format
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Invalid email format');
  }

  // Validate training frequency
  if (input.preferred_training_frequency !== undefined) {
    if (input.preferred_training_frequency < 1 || input.preferred_training_frequency > 7) {
      errors.push('Training frequency must be between 1 and 7 days per week');
    }
  }

  // Validate session duration
  if (input.preferred_session_duration_minutes !== undefined) {
    if (input.preferred_session_duration_minutes < 15 || input.preferred_session_duration_minutes > 180) {
      errors.push('Session duration must be between 15 and 180 minutes');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
