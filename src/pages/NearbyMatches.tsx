
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const NearbyMatchesContent = lazy(() => import('./nearby'));

const NearbyMatches = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Skeleton className="h-96 w-full max-w-4xl" /></div>}>
      <NearbyMatchesContent />
    </Suspense>
  );
};

export default NearbyMatches;
