
import LazyMatchCard from './LazyMatchCard';
import { CompatibilityMatch } from "@/types/compatibility";
import { EnhancedCompatibilityMatch } from "@/hooks/compatibility/utils/enhancedCompatibilityScoring";

interface MatchCardProps {
  match: CompatibilityMatch | EnhancedCompatibilityMatch;
}

const MatchCard = ({ match }: MatchCardProps) => {
  return <LazyMatchCard match={match} />;
};

export default MatchCard;
