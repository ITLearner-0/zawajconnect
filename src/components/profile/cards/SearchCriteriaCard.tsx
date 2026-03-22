import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface SearchCriteriaCardProps {
  aboutMe: string;
}

const SearchCriteriaCard = ({ aboutMe }: SearchCriteriaCardProps) => {
  if (!aboutMe) return null;

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" />
          Ce que je recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{aboutMe}</p>
      </CardContent>
    </Card>
  );
};

export default SearchCriteriaCard;
