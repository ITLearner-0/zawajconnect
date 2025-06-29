
import { supabase } from '@/integrations/supabase/client';

export const checkProfileExists = async (userId: string) => {
  console.log('Checking if profile exists for user:', userId);
  
  try {
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing profile:", checkError);
      throw new Error(`Erreur lors de la vérification du profil existant: ${checkError.message}`);
    }

    console.log('Profile exists check result:', !!existingProfile);
    return existingProfile;
  } catch (error) {
    console.error("Unexpected error checking profile:", error);
    throw error;
  }
};

export const updateProfile = async (userId: string, updateData: any) => {
  console.log("Updating existing profile for user:", userId);
  console.log("Update data:", JSON.stringify(updateData, null, 2));
  
  try {
    const result = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (result.error) {
      console.error("Error updating profile:", result.error);
      throw new Error(`Erreur lors de la mise à jour du profil: ${result.error.message}`);
    }

    console.log("Profile updated successfully:", result.data);
    return result;
  } catch (error) {
    console.error("Unexpected error updating profile:", error);
    throw error;
  }
};

export const insertProfile = async (updateData: any) => {
  console.log("Creating new profile");
  console.log("Insert data:", JSON.stringify(updateData, null, 2));
  
  try {
    const result = await supabase
      .from('profiles')
      .insert(updateData)
      .select()
      .single();

    if (result.error) {
      console.error("Error inserting profile:", result.error);
      throw new Error(`Erreur lors de la création du profil: ${result.error.message}`);
    }

    console.log("Profile created successfully:", result.data);
    return result;
  } catch (error) {
    console.error("Unexpected error creating profile:", error);
    throw error;
  }
};
