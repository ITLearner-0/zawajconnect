
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Recommendation {
  id: string;
  type: 'photo' | 'content' | 'activity' | 'verification';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionText: string;
}

export const useProfileRecommendations = (userId?: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const generateRecommendations = async () => {
      try {
        setLoading(true);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile for recommendations:', error);
          return;
        }

        if (!profile) return;

        const newRecommendations: Recommendation[] = [];

        // Check for missing profile information
        if (!(profile as any).about_me || (profile as any).about_me.trim().length < 50) {
          newRecommendations.push({
            id: 'about-me',
            type: 'content',
            title: 'Complétez votre description',
            description: 'Une description détaillée augmente vos chances de trouver des correspondances compatibles.',
            priority: 'high',
            actionText: 'Ajouter une description'
          });
        }

        // Check for verification status
        if (!(profile as any).email_verified) {
          newRecommendations.push({
            id: 'email-verification',
            type: 'verification',
            title: 'Vérifiez votre email',
            description: 'La vérification de votre email augmente la confiance des autres utilisateurs.',
            priority: 'high',
            actionText: 'Vérifier mon email'
          });
        }

        if (!(profile as any).phone_verified) {
          newRecommendations.push({
            id: 'phone-verification',
            type: 'verification',
            title: 'Vérifiez votre téléphone',
            description: 'La vérification du téléphone améliore la sécurité de votre compte.',
            priority: 'medium',
            actionText: 'Vérifier mon téléphone'
          });
        }

        // Check for wali information if female
        if ((profile as any).gender === 'female' && (!(profile as any).wali_name || !(profile as any).wali_contact)) {
          newRecommendations.push({
            id: 'wali-info',
            type: 'content',
            title: 'Ajoutez les informations de votre wali',
            description: 'Les informations du wali facilitent la communication selon les principes islamiques.',
            priority: 'medium',
            actionText: 'Ajouter les infos du wali'
          });
        }

        // Activity-based recommendations
        newRecommendations.push({
          id: 'take-compatibility-test',
          type: 'activity',
          title: 'Passez le test de compatibilité',
          description: 'Le test de compatibilité vous aide à trouver des partenaires plus compatibles.',
          priority: 'low',
          actionText: 'Passer le test'
        });

        setRecommendations(newRecommendations);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [userId]);

  const handleRecommendationAction = (recommendationId: string) => {
    // Remove the recommendation once action is taken
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
    
    // In a real implementation, you would handle the specific action here
    console.log(`Action taken for recommendation: ${recommendationId}`);
  };

  return { 
    recommendations, 
    loading, 
    handleRecommendationAction 
  };
};
