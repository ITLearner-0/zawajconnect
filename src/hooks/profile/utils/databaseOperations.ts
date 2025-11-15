import { supabase } from '@/integrations/supabase/client';

export const checkProfileExists = async (userId: string) => {
  console.log('Checking if profile exists for user:', userId);

  if (!userId || typeof userId !== 'string' || userId.length < 30) {
    throw new Error('Invalid user ID format');
  }

  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking existing profile:', checkError);
    throw new Error(`Erreur lors de la vérification du profil: ${checkError.message}`);
  }

  console.log('Profile exists:', !!existingProfile);
  return existingProfile;
};

export const updateProfile = async (userId: string, updateData: any) => {
  console.log('Updating profile for user:', userId);
  console.log('Update data:', JSON.stringify(updateData, null, 2));

  // Clean data - remove undefined values
  const cleanUpdateData = Object.keys(updateData).reduce((acc, key) => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      acc[key] = updateData[key];
    }
    return acc;
  }, {} as any);

  const result = await supabase
    .from('profiles')
    .update(cleanUpdateData)
    .eq('id', userId)
    .select()
    .single();

  if (result.error) {
    console.error('Error updating profile:', result.error);
    throw new Error(`Erreur lors de la mise à jour: ${result.error.message}`);
  }

  console.log('Profile updated successfully');
  return result;
};

export const insertProfile = async (updateData: any) => {
  console.log('Creating new profile');
  console.log('Insert data:', JSON.stringify(updateData, null, 2));

  // Clean data - remove undefined values
  const cleanInsertData = Object.keys(updateData).reduce((acc, key) => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      acc[key] = updateData[key];
    }
    return acc;
  }, {} as any);

  const result = await supabase.from('profiles').insert(cleanInsertData).select().single();

  if (result.error) {
    console.error('Error inserting profile:', result.error);
    throw new Error(`Erreur lors de la création: ${result.error.message}`);
  }

  console.log('Profile created successfully');
  return result;
};
