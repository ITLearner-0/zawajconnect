import { Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePersonalityQuestionnaire } from '@/hooks/usePersonalityQuestionnaire';

interface PersonalityQuestionnaireBadgeProps {
  showCompleted?: boolean;
}

/**
 * Badge component to display personality questionnaire completion status
 * Can be used in navigation, profile header, or any other location
 */
const PersonalityQuestionnaireBadge = ({ showCompleted = false }: PersonalityQuestionnaireBadgeProps) => {
  const { isCompleted, loading } = usePersonalityQuestionnaire();

  if (loading) return null;

  // Show badge if not completed, or if completed and showCompleted is true
  if (!isCompleted) {
    return (
      <Badge
        variant="outline"
        className="bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
      >
        <Brain className="h-3 w-3 mr-1" />
        À compléter
      </Badge>
    );
  }

  if (showCompleted) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-700 border-emerald-300"
      >
        <Brain className="h-3 w-3 mr-1" />
        Complété
      </Badge>
    );
  }

  return null;
};

export default PersonalityQuestionnaireBadge;
