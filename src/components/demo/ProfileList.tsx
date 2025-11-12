import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Shield,
  CheckCircle,
  Star,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { DatabaseProfile } from '@/types/profile';
import DemoStatusBanner from './DemoStatusBanner';

interface ProfileListProps {
  profiles: DatabaseProfile[];
  onSelectProfile: (profile: DatabaseProfile) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({ profiles, onSelectProfile }) => {
  const getEducationIcon = (level: string) => {
    return <GraduationCap className="h-4 w-4" />;
  };

  const getPracticeLevelColor = (level: string) => {
    switch (level) {
      case 'Very Practicing':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'Practicing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'Moderately Practicing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <DemoStatusBanner />

      <div className="text-center">
        <h2 className="text-3xl font-bold text-rose-800 dark:text-rose-200 mb-4">
          Profils Représentatifs
        </h2>
        <p className="text-rose-600 dark:text-rose-300 max-w-2xl mx-auto mb-6">
          Découvrez nos personas soigneusement créés pour représenter la diversité de notre
          communauté musulmane
        </p>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 mb-6">
          <Eye className="h-3 w-3 mr-1" />
          {profiles.length} profils de démonstration disponibles
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white dark:bg-rose-900/50 border border-rose-200 dark:border-rose-700 overflow-hidden"
          >
            <CardHeader className="relative">
              {/* Demo Badge */}
              <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 z-10">
                <Eye className="h-3 w-3 mr-1" />
                Démo
              </Badge>

              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 border-4 border-rose-200 dark:border-rose-700 group-hover:scale-105 transition-transform duration-300">
                  <AvatarImage
                    src={profile.profile_picture}
                    alt={`${profile.first_name} ${profile.last_name}`}
                  />
                  <AvatarFallback className="bg-rose-100 text-rose-800 text-lg font-bold">
                    {profile.first_name[0]}
                    {profile.last_name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-rose-800 dark:text-rose-200 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                      {profile.first_name} {profile.last_name}
                    </CardTitle>
                    {profile.is_verified && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                      <span>•</span>
                      <span>{calculateAge(profile.birth_date)} ans</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.occupation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* About Me */}
              <CardDescription className="line-clamp-3 text-rose-600 dark:text-rose-300 leading-relaxed">
                {profile.about_me}
              </CardDescription>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getPracticeLevelColor(profile.religious_practice_level)}>
                  <Heart className="h-3 w-3 mr-1" />
                  {profile.religious_practice_level}
                </Badge>

                <Badge
                  variant="outline"
                  className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30"
                >
                  {getEducationIcon(profile.education_level)}
                  <span className="ml-1">{profile.education_level}</span>
                </Badge>

                {profile.wali_verified && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Supervisé Wali
                  </Badge>
                )}
              </div>

              {/* Compatibility Score (Demo) */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    Compatibilité estimée
                  </span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">
                    <Star className="h-3 w-3 mr-1" />
                    {Math.floor(Math.random() * 15) + 85}%
                  </Badge>
                </div>
                <div className="w-full bg-rose-200 dark:bg-rose-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-rose-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.floor(Math.random() * 15) + 85}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onSelectProfile(profile)}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-medium py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le profil
                </Button>

                <Button
                  variant="outline"
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-900/50 rounded-full"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>

              {/* Demo Notice */}
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-rose-200 dark:border-rose-700">
                Profil créé pour la démonstration • Données fictives
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold mb-4">Prêt(e) à commencer votre recherche ?</h3>
          <p className="mb-6 opacity-90">
            Créez votre profil gratuit et découvrez des milliers de célibataires musulmans vérifiés
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-rose-600 hover:bg-rose-50 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Créer mon profil
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-full"
            >
              En savoir plus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileList;
