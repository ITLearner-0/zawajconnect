import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompatibilityMatch } from '@/types/compatibility';
import { CompatibilityVisualizationService } from '@/services/compatibilityVisualizationService';
import CompatibilityVisualizationComponent from './CompatibilityVisualization';
import { Heart, Eye, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnhancedMatchCardProps {
  match: CompatibilityMatch;
  onMessageClick?: () => void;
}

const EnhancedMatchCard: React.FC<EnhancedMatchCardProps> = ({ match, onMessageClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const visualization = CompatibilityVisualizationService.generateVisualization(match);

  const handleViewProfile = () => {
    navigate(`/profile/${match.userId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {match.profileData?.profile_picture ? (
              <img
                src={match.profileData.profile_picture}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                {match.profileData?.full_name?.[0] || 'U'}
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {match.profileData
                  ? match.profileData.full_name ?? 'Utilisateur'
                  : 'Utilisateur'}
              </h3>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {match.profileData?.age && <span>{match.profileData.age} ans</span>}
                {match.profileData?.location && (
                  <>
                    <span>•</span>
                    <span>{match.profileData.location}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                {match.profileData?.religious_practice_level && (
                  <Badge variant="outline" className="text-xs">
                    {match.profileData.religious_practice_level}
                  </Badge>
                )}
                {match.profileData?.education_level && (
                  <Badge variant="outline" className="text-xs">
                    {match.profileData.education_level}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getScoreColor(match.score ?? match.compatibilityScore ?? 0)}`}
            >
              <Heart className="h-4 w-4" />
              <span className="font-bold">{match.score ?? match.compatibilityScore ?? 0}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Aperçu rapide des compatibilités */}
        <div className="flex flex-wrap gap-2">
          {visualization.strengths.slice(0, 3).map((strength, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
              {strength.category}
            </Badge>
          ))}
          {visualization.differences.slice(0, 2).map((difference, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {difference.category}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Voir le profil
          </Button>

          {onMessageClick && (
            <Button
              size="sm"
              onClick={onMessageClick}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Détails de compatibilité */}
        {showDetails && (
          <CompatibilityVisualizationComponent
            visualization={visualization}
            className="mt-4 pt-4 border-t"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedMatchCard;
