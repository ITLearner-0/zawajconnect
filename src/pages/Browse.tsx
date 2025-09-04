import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, GraduationCap, Briefcase, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url: string;
  islamic_preferences?: {
    prayer_frequency: string;
    quran_reading: string;
    sect: string;
    importance_of_religion: string;
  };
}

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    location: '',
    sect: '',
    education: '',
    profession: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfiles();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [profiles, filters, searchTerm]);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      // First get profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .limit(50);

      if (profilesData) {
        // Get Islamic preferences for each profile
        const profilesWithPrefs = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: prefs } = await supabase
              .from('islamic_preferences')
              .select('prayer_frequency, quran_reading, sect, importance_of_religion')
              .eq('user_id', profile.user_id)
              .single();

            return {
              ...profile,
              islamic_preferences: prefs || undefined
            };
          })
        );

        setProfiles(profilesWithPrefs);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = profiles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.profession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Age filters
    if (filters.ageMin) {
      filtered = filtered.filter(profile => profile.age >= parseInt(filters.ageMin));
    }
    if (filters.ageMax) {
      filtered = filtered.filter(profile => profile.age <= parseInt(filters.ageMax));
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(profile => 
        profile.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sect filter
    if (filters.sect) {
      filtered = filtered.filter(profile => 
        profile.islamic_preferences?.sect === filters.sect
      );
    }

    // Education filter
    if (filters.education) {
      filtered = filtered.filter(profile => 
        profile.education?.toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    // Profession filter
    if (filters.profession) {
      filtered = filtered.filter(profile => 
        profile.profession?.toLowerCase().includes(filters.profession.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  };

  const handleLike = async (profileId: string) => {
    if (!user) return;

    try {
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
        .single();

      if (existingMatch) {
        // Update existing match
        const isUser1 = existingMatch.user1_id === user.id;
        const updateData = isUser1 
          ? { user1_liked: true }
          : { user2_liked: true };

        // Check if it becomes mutual
        const isMutual = isUser1 
          ? existingMatch.user2_liked 
          : existingMatch.user1_liked;

        if (isMutual) {
          (updateData as any).is_mutual = true;
        }

        await supabase
          .from('matches')
          .update(updateData)
          .eq('id', existingMatch.id);

        if (isMutual) {
          alert('C\'est un match ! 🎉');
        }
      } else {
        // Create new match
        await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: profileId,
            user1_liked: true,
            match_score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
          });
      }

      // Remove profile from current view
      setFilteredProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handlePass = (profileId: string) => {
    // Simply remove from current view
    setFilteredProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const viewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Recherche de profils compatibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <Search className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Découvrir des Profils</h1>
              <p className="text-muted-foreground">Trouvez votre partenaire idéal selon vos critères islamiques</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-medium">Filtres de recherche</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Âge min"
                    type="number"
                    value={filters.ageMin}
                    onChange={(e) => setFilters(prev => ({...prev, ageMin: e.target.value}))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Âge max"
                    type="number"
                    value={filters.ageMax}
                    onChange={(e) => setFilters(prev => ({...prev, ageMax: e.target.value}))}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Localisation"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                  />
                </div>
                <div>
                  <Select value={filters.sect} onValueChange={(value) => setFilters(prev => ({...prev, sect: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Secte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous</SelectItem>
                      <SelectItem value="sunni">Sunnite</SelectItem>
                      <SelectItem value="shia">Chiite</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({ageMin: '', ageMax: '', location: '', sect: '', education: '', profession: ''})}
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="group hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-emerald/20 to-gold/20 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={`Photo de ${profile.full_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                          <span className="text-2xl text-primary-foreground font-bold">
                            {profile.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-foreground mb-1">{profile.full_name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{profile.age} ans</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location || 'Non spécifié'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.profession || 'Non spécifié'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{profile.education || 'Non spécifié'}</span>
                  </div>

                  {profile.islamic_preferences?.sect && (
                    <Badge variant="secondary" className="text-xs">
                      {profile.islamic_preferences.sect === 'sunni' ? 'Sunnite' : 
                       profile.islamic_preferences.sect === 'shia' ? 'Chiite' : 
                       'Autre'}
                    </Badge>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {profile.bio || 'Aucune description disponible.'}
                  </p>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePass(profile.id)}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Passer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewProfile(profile.id)}
                      className="flex-1"
                    >
                      Voir profil
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleLike(profile.id)}
                      className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Aimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun profil trouvé</h3>
              <p className="text-muted-foreground">Essayez d'ajuster vos filtres de recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;