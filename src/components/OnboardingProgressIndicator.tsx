import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingStatus {
  onboardingCompleted: boolean;
  completionPercentage: number;
}

export const OnboardingProgressIndicator = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOnboardingStatus = async () => {
      try {
        // Fetch profile and related data
        const [profileRes, islamicRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('onboarding_completed, full_name, age, gender, bio, looking_for, interests, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('islamic_preferences')
            .select('prayer_frequency, quran_reading, sect, importance_of_religion')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        const profile = profileRes.data;
        const islamicPrefs = islamicRes.data;

        // If onboarding is completed, don't show indicator
        if (profile?.onboarding_completed) {
          setStatus(null);
          setLoading(false);
          return;
        }

        // Calculate completion percentage based on key fields
        let completedFields = 0;
        let totalFields = 0;

        // Basic info (6 fields)
        const basicFields = ['full_name', 'age', 'gender', 'bio', 'looking_for', 'avatar_url'];
        basicFields.forEach(field => {
          totalFields++;
          if (profile?.[field as keyof typeof profile]) completedFields++;
        });

        // Interests (1 field, but checking if at least 3 interests)
        totalFields++;
        if (profile?.interests && Array.isArray(profile.interests) && profile.interests.length >= 3) {
          completedFields++;
        }

        // Islamic preferences (4 key fields)
        const islamicFields = ['prayer_frequency', 'quran_reading', 'sect', 'importance_of_religion'];
        islamicFields.forEach(field => {
          totalFields++;
          if (islamicPrefs?.[field as keyof typeof islamicPrefs]) completedFields++;
        });

        const percentage = Math.round((completedFields / totalFields) * 100);

        setStatus({
          onboardingCompleted: false,
          completionPercentage: percentage
        });
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();

    // Subscribe to profile changes
    const channel = supabase
      .channel(`onboarding-progress-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchOnboardingStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Don't show anything if loading, no user, or onboarding is complete
  if (loading || !user || !status) {
    return null;
  }

  return (
    <Link 
      to="/onboarding" 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
    >
      <Target className="h-3.5 w-3.5 text-emerald" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground">
          Profil: {status.completionPercentage}%
        </span>
        {status.completionPercentage >= 80 ? (
          <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-emerald/20 text-emerald hover:bg-emerald/30">
            <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
            Presque fini
          </Badge>
        ) : (
          <Progress 
            value={status.completionPercentage} 
            className="h-1.5 w-16"
          />
        )}
      </div>
    </Link>
  );
};
