import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NotesSearchFilterProps {
  onSearch: (keyword: string) => void;
  onClear: () => void;
  isActive: boolean;
  resultsCount?: number;
}

const NotesSearchFilter = ({
  onSearch,
  onClear,
  isActive,
  resultsCount,
}: NotesSearchFilterProps) => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  const handleClear = () => {
    setKeyword('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="p-4 border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Rechercher dans vos notes privées..."
            className="pl-10 border-gold/30 focus:border-gold"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!keyword.trim()}
          className="bg-gold text-white hover:bg-gold/90"
        >
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
        {isActive && (
          <Button
            onClick={handleClear}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>
      {isActive && resultsCount !== undefined && (
        <div className="mt-2 text-sm text-muted-foreground">
          {resultsCount} profil{resultsCount > 1 ? 's' : ''} avec des notes correspondantes
        </div>
      )}
    </Card>
  );
};

export default NotesSearchFilter;
