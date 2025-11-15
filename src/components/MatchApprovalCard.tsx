import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart,
  User,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react';
import { MatchApprovalData } from '@/types/match-approval';

interface MatchApprovalCardProps {
  match: MatchApprovalData;
  onApprove: (match: MatchApprovalData) => void;
  onReject: (match: MatchApprovalData) => void;
}

const MatchApprovalCard: React.FC<MatchApprovalCardProps> = ({ match, onApprove, onReject }) => {
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getCompatibilityBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="border-l-4 border-l-warning">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Nouveau Match Détecté
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getCompatibilityBadge(match.match_score)}>
              Compatibilité: {match.match_score}%
            </Badge>
            <Badge variant="outline">
              {new Date(match.created_at).toLocaleDateString('fr-FR')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profils */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Utilisateur supervisé */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Utilisateur Supervisé
            </h4>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {match.user1_profile.avatar_url ? (
                  <img
                    src={match.user1_profile.avatar_url}
                    alt={match.user1_profile.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{match.user1_profile.full_name}</h5>
                {match.user1_profile.age && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {match.user1_profile.age} ans
                  </p>
                )}
                {match.user1_profile.profession && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {match.user1_profile.profession}
                  </p>
                )}
                {match.user1_profile.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.user1_profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Match potentiel */}
          <div className="space-y-3">
            <h4 className="font-semibold">Match Potentiel</h4>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                {match.user2_profile.avatar_url ? (
                  <img
                    src={match.user2_profile.avatar_url}
                    alt={match.user2_profile.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-secondary-foreground" />
                )}
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{match.user2_profile.full_name}</h5>
                {match.user2_profile.age && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {match.user2_profile.age} ans
                  </p>
                )}
                {match.user2_profile.profession && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {match.user2_profile.profession}
                  </p>
                )}
                {match.user2_profile.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.user2_profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio du match potentiel */}
        {match.user2_profile.bio && (
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <strong>Présentation:</strong> {match.user2_profile.bio}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onReject(match)} className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />
            Refuser le Match
          </Button>
          <Button onClick={() => onApprove(match)} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approuver le Match
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchApprovalCard;
