import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Import direct du composant au lieu de lazy loading pour éviter les problèmes de hooks
import NearbyMatchesContent from './nearby';

const NearbyMatches = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
      <NearbyMatchesContent />
    </div>
  );
};

export default NearbyMatches;
