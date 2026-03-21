import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Star, CheckCircle2, X, Clock, BookOpen, Heart, Users,
  Briefcase, Shield, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CriteriaScore {
  religious_practice: number;
  character: number;
  family_background: number;
  financial_stability: number;
  education: number;
  compatibility: number;
}

interface Review {
  id: string;
  candidateName: string;
  rating: number;
  criteria: CriteriaScore;
  notes: string;
  isApproved: boolean | null;
  date: string;
}

const criteriaConfig = [
  { key: 'religious_practice' as const, label: 'Pratique religieuse', icon: BookOpen, description: 'Prière, Coran, comportement islamique' },
  { key: 'character' as const, label: 'Caractère (khuluq)', icon: Heart, description: 'Patience, honnêteté, douceur' },
  { key: 'family_background' as const, label: 'Milieu familial', icon: Users, description: 'Famille connue, valeurs, éducation' },
  { key: 'financial_stability' as const, label: 'Stabilité financière', icon: Briefcase, description: 'Emploi stable, capacité à entretenir un foyer' },
  { key: 'education' as const, label: 'Éducation', icon: Shield, description: 'Niveau d\'études et culture générale' },
  { key: 'compatibility' as const, label: 'Compatibilité perçue', icon: MessageSquare, description: 'Impression générale de compatibilité avec votre protégé(e)' },
];

interface CandidateReviewFormProps {
  wardUserId: string;
}

const CandidateReviewForm = ({ wardUserId }: CandidateReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      candidateName: 'Ahmed M.',
      rating: 4,
      criteria: { religious_practice: 5, character: 4, family_background: 4, financial_stability: 3, education: 4, compatibility: 5 },
      notes: 'Très bon candidat. Pratiquant assidu, famille connue à la mosquée. Situation financière correcte mais pas encore propriétaire. À approfondir.',
      isApproved: true,
      date: '2026-03-18',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    criteria: { religious_practice: 3, character: 3, family_background: 3, financial_stability: 3, education: 3, compatibility: 3 } as CriteriaScore,
    notes: '',
    decision: null as boolean | null,
  });

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star className={`h-5 w-5 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  const handleSubmit = async () => {
    if (!formData.candidateName) return;

    const avgRating = Math.round(
      Object.values(formData.criteria).reduce((a, b) => a + b, 0) / 6
    );

    const review: Review = {
      id: Date.now().toString(),
      candidateName: formData.candidateName,
      rating: avgRating,
      criteria: formData.criteria,
      notes: formData.notes,
      isApproved: formData.decision,
      date: new Date().toISOString().split('T')[0],
    };

    if (user) {
      try {
        await supabase.from('family_reviews').insert({
          wali_user_id: user.id,
          candidate_user_id: user.id, // Placeholder
          ward_user_id: wardUserId,
          rating: avgRating,
          notes: formData.notes,
          criteria_scores: formData.criteria,
          is_approved: formData.decision,
        });
      } catch {
        // Continue
      }
    }

    setReviews((prev) => [review, ...prev]);
    setShowForm(false);
    setFormData({
      candidateName: '',
      criteria: { religious_practice: 3, character: 3, family_background: 3, financial_stability: 3, education: 3, compatibility: 3 },
      notes: '',
      decision: null,
    });
    toast({ title: 'Évaluation enregistrée', description: `Évaluation de ${review.candidateName} sauvegardée.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Évaluations des candidats</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700">
          <Star className="h-4 w-4 mr-1" /> Évaluer
        </Button>
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Nom du candidat</Label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                placeholder="Nom du prétendant"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Critères islamiques d'évaluation</p>
              {criteriaConfig.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.key} className="flex items-center justify-between p-2 rounded-lg bg-white">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                    </div>
                    <StarRating
                      value={formData.criteria[c.key]}
                      onChange={(v) => setFormData({
                        ...formData,
                        criteria: { ...formData.criteria, [c.key]: v },
                      })}
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <Label>Notes privées (visibles uniquement par le Wali)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Vos impressions, observations, points d'attention..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label>Décision</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={formData.decision === true ? 'default' : 'outline'}
                  className={formData.decision === true ? 'bg-emerald-600' : ''}
                  onClick={() => setFormData({ ...formData, decision: true })}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approuver
                </Button>
                <Button
                  variant={formData.decision === false ? 'default' : 'outline'}
                  className={formData.decision === false ? 'bg-red-600' : ''}
                  onClick={() => setFormData({ ...formData, decision: false })}
                >
                  <X className="h-4 w-4 mr-1" /> Refuser
                </Button>
                <Button
                  variant={formData.decision === null ? 'default' : 'outline'}
                  className={formData.decision === null ? 'bg-amber-600' : ''}
                  onClick={() => setFormData({ ...formData, decision: null })}
                >
                  <Clock className="h-4 w-4 mr-1" /> En attente
                </Button>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full bg-amber-600 hover:bg-amber-700">
              Enregistrer l'évaluation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{review.candidateName}</p>
                  <Badge className={
                    review.isApproved === true ? 'bg-emerald-100 text-emerald-700' :
                    review.isApproved === false ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }>
                    {review.isApproved === true ? '✓ Approuvé' :
                     review.isApproved === false ? '✗ Refusé' : '⏳ En attente'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {criteriaConfig.map((c) => (
                <div key={c.key} className="text-center p-1.5 rounded bg-gray-50">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="font-bold text-sm">{review.criteria[c.key]}/5</p>
                </div>
              ))}
            </div>
            {review.notes && (
              <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded mt-2">
                📝 {review.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CandidateReviewForm;
