
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const NearbyMatchesContent = lazy(() => import('./nearby'));

const NearbyMatches = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <Skeleton className="h-96 w-full max-w-4xl bg-rose-200/50 dark:bg-rose-800/50" />
      </div>
    }>
      <NearbyMatchesContent />
    </Suspense>
  );
};

export default NearbyMatches;
