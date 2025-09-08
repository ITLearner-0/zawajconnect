import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Star,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  age: number | null;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url: string;
}

interface IslamicPreferences {
  prayer_frequency: string;
  quran_reading: string;
  sect: string;
  importance_of_religion: string;
  hijab_preference: string;
  beard_preference: string;
  madhab: string;
  halal_diet: boolean;
  smoking: string;
  desired_partner_sect: string;
}

interface ProfilePreviewProps {
  profileData: ProfileData;
  islamicPrefs: IslamicPreferences;
  completionPercentage: number;
}

const ProfilePreview = ({ profileData, islamicPrefs, completionPercentage }: ProfilePreviewProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald';
    if (percentage >= 60) return 'text-gold';
    return 'text-orange-500';
  };

  const getCompletionMessage = (percentage: number) => {
    if (percentage >= 90) return 'Profil excellent ! Prêt pour des matches de qualité';
    if (percentage >= 70) return 'Bon profil ! Ajoutez quelques détails pour plus de matches';
    if (percentage >= 50) return 'Profil en cours. Continuez pour de meilleurs résultats';
    return 'Profil incomplet. Complétez pour commencer à matcher';
  };

  const formatPreference = (key: string, value: any) => {
    const labels: { [key: string]: { [value: string]: string } } = {
      prayer_frequency: {
        '5_times_daily': '5x/jour',
        'sometimes': 'Parfois',
        'fridays_only': 'Vendredi',
        'occasionally': 'Occasionnel'
      },
      quran_reading: {
        'daily': 'Quotidien',
        'weekly': 'Hebdo',
        'occasionally': 'Occasionnel',
        'rarely': 'Rare'
      },
      sect: {
        'sunni': 'Sunnite',
        'shia': 'Chiite',
        'other': 'Autre'
      },
      importance_of_religion: {
        'very_important': 'Très important',
        'important': 'Important',
        'somewhat_important': 'Assez important',
        'not_very_important': 'Peu important'
      }
    };
    return labels[key]?.[value] || value;
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-border/50 shadow-soft animate-slide-in-left">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Aperçu de votre profil</CardTitle>
          <Badge 
            variant={completionPercentage >= 80 ? 'default' : 'secondary'} 
            className={`${getCompletionColor(completionPercentage)} animate-pulse-gentle`}
          >
            {Math.round(completionPercentage)}% complété
          </Badge>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-2 animate-slide-in-right" 
        />
        <p className={`text-sm ${getCompletionColor(completionPercentage)} font-medium`}>
          {getCompletionMessage(completionPercentage)}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 animate-fade-in">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-emerald/20">
              <AvatarImage src={profileData.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald to-emerald-light text-white font-semibold">
                {profileData.full_name ? getInitials(profileData.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            {profileData.avatar_url && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {profileData.full_name || 'Votre nom'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {profileData.age && <span>{profileData.age} ans</span>}
              {profileData.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{profileData.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio Preview */}
        {profileData.bio && (
          <div className="animate-slide-up">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-emerald" />
              <span>À propos</span>
            </h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {profileData.bio.slice(0, 100)}{profileData.bio.length > 100 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Professional Info */}
        {(profileData.profession || profileData.education) && (
          <div className="animate-slide-up">
            <h4 className="font-medium mb-2">Professionnel</h4>
            <div className="space-y-2">
              {profileData.profession && (
                <div className="flex items-center space-x-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.profession}</span>
                </div>
              )}
              {profileData.education && (
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.education}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {profileData.interests.length > 0 && (
          <div className="animate-slide-up">
            <h4 className="font-medium mb-2">Centres d'intérêt</h4>
            <div className="flex flex-wrap gap-2">
              {profileData.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profileData.interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profileData.interests.length - 3} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Islamic Preferences Preview */}
        <div className="animate-slide-up">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald" />
            <span>Pratique religieuse</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {islamicPrefs.prayer_frequency && (
              <div className="bg-emerald/10 p-2 rounded">
                <div className="text-muted-foreground">Prière</div>
                <div className="font-medium">{formatPreference('prayer_frequency', islamicPrefs.prayer_frequency)}</div>
              </div>
            )}
            {islamicPrefs.sect && (
              <div className="bg-emerald/10 p-2 rounded">
                <div className="text-muted-foreground">Secte</div>
                <div className="font-medium">{formatPreference('sect', islamicPrefs.sect)}</div>
              </div>
            )}
            {islamicPrefs.quran_reading && (
              <div className="bg-emerald/10 p-2 rounded">
                <div className="text-muted-foreground">Coran</div>
                <div className="font-medium">{formatPreference('quran_reading', islamicPrefs.quran_reading)}</div>
              </div>
            )}
            {islamicPrefs.importance_of_religion && (
              <div className="bg-emerald/10 p-2 rounded">
                <div className="text-muted-foreground">Importance</div>
                <div className="font-medium">{formatPreference('importance_of_religion', islamicPrefs.importance_of_religion)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Looking for */}
        {profileData.looking_for && (
          <div className="animate-slide-up">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <Star className="w-4 h-4 text-gold" />
              <span>Recherche</span>
            </h4>
            <p className="text-sm text-muted-foreground bg-gold/10 p-3 rounded-lg">
              {profileData.looking_for.slice(0, 80)}{profileData.looking_for.length > 80 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Completion Tips */}
        {completionPercentage < 90 && (
          <div className="bg-gradient-to-r from-gold/10 to-emerald/10 p-4 rounded-lg animate-slide-up">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-sm mb-1">Conseils pour améliorer votre profil</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {!profileData.avatar_url && <li>• Ajoutez une photo de profil</li>}
                  {!profileData.bio && <li>• Rédigez une description personnelle</li>}
                  {profileData.interests.length < 3 && <li>• Ajoutez plus de centres d'intérêt</li>}
                  {!islamicPrefs.prayer_frequency && <li>• Complétez vos préférences islamiques</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePreview;