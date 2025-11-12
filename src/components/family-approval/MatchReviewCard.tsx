import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Star,
  Heart,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  MapPin,
  Briefcase,
} from 'lucide-react';

interface MatchProfile {
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  bio?: string;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  is_mutual: boolean;
  created_at: string;
  profiles: MatchProfile;
}

interface FamilyReview {
  id: string;
  match_id: string;
  family_member_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_discussion';
  notes?: string;
  reviewed_at?: string;
  family_member: {
    full_name: string;
    relationship: string;
  };
}

interface MatchReviewCardProps {
  match: Match;
  reviews?: FamilyReview[];
  onApprove?: (notes?: string) => void;
  onReject?: (notes?: string) => void;
  onScheduleDiscussion?: () => void;
  showActions?: boolean;
}

const MatchReviewCard: React.FC<MatchReviewCardProps> = ({
  match,
  reviews = [],
  onApprove,
  onReject,
  onScheduleDiscussion,
  showActions = false,
}) => {
  const [notes, setNotes] = useState('');
  const [showNotesField, setShowNotesField] = useState(false);

  const profile = match.profiles;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-success bg-success/10 border-success/20';
      case 'rejected':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'needs_discussion':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-success/10 text-success border-success/20">
              <Star className="h-3 w-3 mr-1" />
              {match.match_score}% compatible
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Heart className="h-3 w-3 mr-1" />
              Match mutuel
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(match.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{profile.full_name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {profile.age} ans
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {profile.profession}
              </div>
            </div>
            {profile.bio && <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>}
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${getCompatibilityColor(match.match_score)}`}>
              {match.match_score}%
            </div>
            <p className="text-xs text-muted-foreground">Compatibilité</p>
          </div>
        </div>

        {/* Family Reviews */}
        {reviews.length > 0 && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-3">Avis de la famille</h4>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.family_member.full_name}</span>
                      <Badge variant="outline" className={getStatusColor(review.status)}>
                        {review.status === 'approved'
                          ? 'Approuvé'
                          : review.status === 'rejected'
                            ? 'Refusé'
                            : 'Discussion requise'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {review.family_member.relationship}
                    </p>
                    {review.notes && <p className="text-sm">{review.notes}</p>}
                  </div>
                  {review.reviewed_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.reviewed_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="space-y-4">
            {showNotesField && (
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optionnel)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez vos commentaires sur ce match..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => {
                  if (!showNotesField) {
                    setShowNotesField(true);
                  } else {
                    onApprove?.(notes);
                    setNotes('');
                    setShowNotesField(false);
                  }
                }}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {showNotesField ? 'Confirmer Approbation' : 'Approuver'}
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (!showNotesField) {
                    setShowNotesField(true);
                  } else {
                    onReject?.(notes);
                    setNotes('');
                    setShowNotesField(false);
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {showNotesField ? 'Confirmer Refus' : 'Exprimer des Réserves'}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  onScheduleDiscussion?.();
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Programmer Discussion
              </Button>

              {showNotesField && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNotesField(false);
                    setNotes('');
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchReviewCard;
