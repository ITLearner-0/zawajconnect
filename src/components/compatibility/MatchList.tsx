
import { CompatibilityMatch } from "@/types/compatibility";
import MatchCard from "./MatchCard";

interface MatchListProps {
  matches: CompatibilityMatch[];
}

const MatchList = ({ matches }: MatchListProps) => {
  if (matches.length === 0) {
    return <p className="text-gray-500 italic">No matches found</p>;
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchCard key={match.userId} match={match} />
      ))}
    </div>
  );
};

export default MatchList;
