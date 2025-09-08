import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Star, MapPin, Users, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { MatchProfile } from '@/hooks/useMatchingHistory';

interface MatchCardProps {
  match: MatchProfile;
  familyApprovalRequired: boolean;
}

const MatchCard = ({ match, familyApprovalRequired }: MatchCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-gold-600 bg-gold-50 border-gold-200';
    if (score >= 65) return 'text-sage-600 bg-sage-50 border-sage-200';
    return 'text-muted-foreground bg-muted border-border';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Sparkles className="h-4 w-4" />;
    if (score >= 75) return <Star className="h-4 w-4" />;
    return <Heart className="h-4 w-4" />;
  };

  const handleViewProfile = () => {
    toast({
      title: "Profil ouvert",
      description: `Consultation du profil de ${match.full_name}`,
    });
    navigate(`/profile/${match.user_id}`);
  };

  const handleShowInterest = async () => {
    toast({
      title: "Intérêt envoyé",
      description: `Votre intérêt pour ${match.full_name} a été exprimé (Compatibilité: ${match.compatibility_score}%)`,
    });
    
    // TODO: Implement actual interest logic with database
  };

  const handleFamilyApproval = () => {
    toast({
      title: "Demande d'approbation envoyée",
      description: `Votre famille a été notifiée pour examiner ce match`,
    });
    
    // TODO: Implement family approval workflow
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={match.avatar_url} />
            <AvatarFallback>
              {match.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{match.full_name}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{match.age} ans</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.location}
                  </div>
                  <span>{match.profession}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getCompatibilityColor(match.compatibility_score)}`}>
                  {getScoreIcon(match.compatibility_score)}
                  {match.compatibility_score}% compatible
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="font-medium">Islamique</span>
                </div>
                <Progress value={match.islamic_score} className="h-2" />
                <span className="text-xs text-muted-foreground">{match.islamic_score}%</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3 text-sage-600" />
                  <span className="font-medium">Culturel</span>
                </div>
                <Progress value={match.cultural_score} className="h-2" />
                <span className="text-xs text-muted-foreground">{match.cultural_score}%</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="h-3 w-3 text-gold-600" />
                  <span className="font-medium">Personnalité</span>
                </div>
                <Progress value={match.personality_score} className="h-2" />
                <span className="text-xs text-muted-foreground">{match.personality_score}%</span>
              </div>
            </div>

            {/* Matching Reasons */}
            {match.matching_reasons.length > 0 && (
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-2">Points forts:</p>
                <div className="flex flex-wrap gap-2">
                  {match.matching_reasons.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Potential Concerns */}
            {match.potential_concerns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-700 mb-2">À considérer:</p>
                <div className="flex flex-wrap gap-2">
                  {match.potential_concerns.map((concern, index) => (
                    <Badge key={index} variant="outline" className="text-xs text-amber-700 border-amber-300">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={handleViewProfile}
              >
                Voir le profil
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={handleShowInterest}
              >
                Montrer l'intérêt
              </Button>
              {familyApprovalRequired && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={handleFamilyApproval}
                >
                  Demander approbation famille
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;