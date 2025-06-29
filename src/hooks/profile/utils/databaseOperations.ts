
import { supabase } from '@/integrations/supabase/client';

export const checkProfileExists = async (userId: string) => {
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking existing profile:", checkError);
    throw new Error("Erreur lors de la vérification du profil existant");
  }

  return existingProfile;
};

export const updateProfile = async (userId: string, updateData: any) => {
  console.log("Updating existing profile");
  const result = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  return result;
};

export const insertProfile = async (updateData: any) => {
  console.log("Creating new profile");
  const result = await supabase
    .from('profiles')
    .insert(updateData)
    .select()
    .single();

  return result;
};
