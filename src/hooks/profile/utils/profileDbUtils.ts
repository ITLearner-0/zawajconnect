import { supabase } from '@/integrations/supabase/client';

export const fetchProfileFromDb = async (userId: string) => {
  return await supabase.from('profiles').select('*').eq('id', userId);
};

export const createNewProfile = async (userId: string) => {
  return await (supabase as any).from('profiles').insert({
    id: userId,
    first_name: '',
    last_name: '',
    privacy_settings: {
      profileVisibilityLevel: 1,
      showAge: true,
      showLocation: true,
      showOccupation: true,
      allowNonMatchMessages: true,
    },
    is_visible: true,
  });
};

export const getUserEmail = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
};
