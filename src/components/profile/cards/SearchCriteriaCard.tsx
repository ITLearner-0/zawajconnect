import { Search } from 'lucide-react';

interface SearchCriteriaCardProps {
  aboutMe: string;
}

const SearchCriteriaCard = ({ aboutMe }: SearchCriteriaCardProps) => {
  if (!aboutMe) return null;

  return (
    <div
      className="rounded-2xl md:col-span-2"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="p-4 pb-3">
        <h3
          className="text-base font-semibold flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Search className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          Ce que je recherche
        </h3>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {aboutMe}
        </p>
      </div>
    </div>
  );
};

export default SearchCriteriaCard;
