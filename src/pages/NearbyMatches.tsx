import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Import direct du composant au lieu de lazy loading pour éviter les problèmes de hooks
import NearbyMatchesContent from './nearby';

const NearbyMatches = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <NearbyMatchesContent />
    </div>
  );
};

export default NearbyMatches;
