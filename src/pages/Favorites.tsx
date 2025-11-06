import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileCard from '@/components/ProfileCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  age: number | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  profession: string | null;
  education: string | null;
  interests: string[] | null;
}

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && favorites.size > 0) {
      fetchFavoriteProfiles();
    } else {
      setLoading(false);
    }
  }, [user, favorites]);

  const fetchFavoriteProfiles = async () => {
    if (!user || favorites.size === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      const favoriteIds = Array.from(favorites);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', favoriteIds);

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching favorite profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/browse')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la recherche
          </Button>
          
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            <h1 className="text-3xl font-bold">Mes Favoris</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {profiles.length} profil{profiles.length > 1 ? 's' : ''} favori{profiles.length > 1 ? 's' : ''}
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucun favori</h2>
            <p className="text-muted-foreground mb-6">
              Commencez à ajouter des profils à vos favoris pour les retrouver facilement ici.
            </p>
            <Button onClick={() => navigate('/browse')}>
              Explorer les profils
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.user_id} className="relative">
                <ProfileCard
                  profile={{
                    user_id: profile.user_id,
                    full_name: profile.full_name ?? 'Anonyme',
                    age: profile.age ?? 0,
                    location: profile.location ?? '',
                    profession: profile.profession ?? '',
                    bio: profile.bio ?? '',
                    avatar_url: profile.avatar_url ?? '',
                    interests: profile.interests ?? []
                  }}
                  showActions={false}
                  compact={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
