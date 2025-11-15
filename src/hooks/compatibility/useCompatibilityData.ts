
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface CompatibilityResult {
  user_id: string;
  answers: Record<string, any>;
  preferences: any;
}

export interface ProfileData {
  id: string;
  first_name: string;
  last_name?: string;
  gender: string;
  location?: string;
  education_level?: string;
  religious_practice_level?: string;
  birth_date: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  id_verified?: boolean;
  age?: number;
}

export async function fetchCompatibilityResults(): Promise<{
  myResults: { answers: Record<string, any>; preferences: any } | null;
  otherResults: CompatibilityResult[];
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { myResults: null, otherResults: [] };
  }

  // Fetch other users' results
  const { data: results, error } = await (supabase as any)
    .from('compatibility_results')
    .select('user_id, answers, preferences')
    .neq('user_id', session.user.id);

  if (error) {
    throw new Error("Failed to fetch potential matches");
  }

  if (!results?.length) {
    return { myResults: null, otherResults: [] };
  }

  // Get current user's latest results
  const { data: myResults } = await (supabase as any)
    .from('compatibility_results')
    .select('answers, preferences')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    myResults: myResults ? {
      answers: (myResults as any).answers as Record<string, any>,
      preferences: (myResults as any).preferences
    } : null,
    otherResults: results.map((result: any) => ({
      user_id: result.user_id,
      answers: result.answers as Record<string, any>,
      preferences: result.preferences
    }))
  };
}

export async function fetchProfilesData(): Promise<ProfileData[]> {
  const { data: profiles, error } = await (supabase as any)
    .from('profiles')
    .select('id, first_name, last_name, gender, location, education_level, religious_practice_level, birth_date, email_verified, phone_verified, id_verified');
  
  if (error) {
    throw new Error("Error fetching profiles");
  }

  return profiles?.map((profile: any) => {
    let age;
    if (profile.birth_date) {
      const birthDate = new Date(profile.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }
    return { 
      ...profile, 
      age,
      last_name: profile.last_name ?? undefined,
      location: profile.location ?? undefined,
      education_level: profile.education_level ?? undefined,
      religious_practice_level: profile.religious_practice_level ?? undefined
    };
  }) || [];
}
