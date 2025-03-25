
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PRIVACY_SETTINGS } from "../constants/defaultSettings";

export const fetchProfileFromDb = async (userId: string) => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);
};

export const createNewProfile = async (userId: string) => {
  const defaultProfileData = {
    first_name: '',
    last_name: '',
    birth_date: new Date().toISOString().split('T')[0], // Current date as default
    gender: '',
    location: '',
    religious_practice_level: '',
    prayer_frequency: '',
    privacy_settings: DEFAULT_PRIVACY_SETTINGS,
    blocked_users: [],
    is_visible: true
  };
  
  return await supabase
    .from('profiles')
    .insert({
      id: userId,
      ...defaultProfileData
    });
};

export const getUserEmail = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.email || null;
};
