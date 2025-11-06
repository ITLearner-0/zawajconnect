import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileCard from '@/components/ProfileCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { useProfileTags, ProfileTag } from '@/hooks/useProfileTags';
import TagManager from '@/components/TagManager';
import FavoriteTagSelector from '@/components/FavoriteTagSelector';

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
  const { tags, getFavoriteTags } = useProfileTags();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [profileTags, setProfileTags] = useState<Map<string, ProfileTag[]>>(new Map());

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
      
      // Fetch tags for each favorite
      const tagsMap = new Map<string, ProfileTag[]>();
      for (const profile of data || []) {
        const tags = await getFavoriteTags(profile.user_id);
        tagsMap.set(profile.user_id, tags);
      }
      setProfileTags(tagsMap);
    } catch (error) {
      console.error('Error fetching favorite profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = selectedTagFilter
    ? profiles.filter(profile => 
        profileTags.get(profile.user_id)?.some(tag => tag.id === selectedTagFilter)
      )
    : profiles;

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
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <h1 className="text-3xl font-bold">Mes Favoris</h1>
              </div>
              <p className="text-muted-foreground">
                {filteredProfiles.length} profil{filteredProfiles.length > 1 ? 's' : ''} 
                {selectedTagFilter ? ' avec ce tag' : ' favori' + (filteredProfiles.length > 1 ? 's' : '')}
              </p>
            </div>
            
            <TagManager />
          </div>

          {/* Tag Filters */}
          {tags.length > 0 && (
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtrer par tag :</span>
                {selectedTagFilter && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTagFilter(null)}
                    className="ml-auto text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ 
                      backgroundColor: selectedTagFilter === tag.id ? tag.color : 'transparent',
                      color: selectedTagFilter === tag.id ? 'white' : tag.color,
                      borderColor: tag.color
                    }}
                    className="cursor-pointer border-2 hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id)}
                  >
                    {tag.tag_name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {selectedTagFilter ? 'Aucun favori avec ce tag' : 'Aucun favori'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {selectedTagFilter 
                ? 'Aucun profil favori ne correspond à ce filtre.'
                : 'Commencez à ajouter des profils à vos favoris pour les retrouver facilement ici.'
              }
            </p>
            {selectedTagFilter ? (
              <Button onClick={() => setSelectedTagFilter(null)} variant="outline">
                Voir tous les favoris
              </Button>
            ) : (
              <Button onClick={() => navigate('/browse')}>
                Explorer les profils
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.user_id} className="overflow-hidden">
                <div className="relative">
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
                <div className="p-4 border-t">
                  <FavoriteTagSelector profileId={profile.user_id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
