
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Set up Row Level Security (RLS) policies for all tables
 */
export const setupRLSPolicies = async () => {
  try {
    // Enable RLS on important tables
    await supabase.rpc('enable_rls_on_tables' as any);
    
    // Create profile policies
    await supabase.rpc('setup_profile_policies' as any);
    
    // Create messaging policies
    await supabase.rpc('setup_messaging_policies' as any);
    
    // Create monitoring policies
    await supabase.rpc('setup_monitoring_policies' as any);
    
    console.log('RLS policies setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up RLS policies:', error);
    toast({
      title: 'Error setting up security policies',
      description: 'There was an error configuring database security. Please contact support.',
      variant: 'destructive',
    });
    return false;
  }
};

/**
 * Check if proper RLS policies are in place
 * @returns boolean indicating if policies are properly set up
 */
export const checkRLSPolicies = async () => {
  try {
    const { data, error } = await supabase.rpc('check_rls_policies' as any);
    
    if (error) throw error;
    
    return data || false;
  } catch (error) {
    console.error('Error checking RLS policies:', error);
    return false;
  }
};
