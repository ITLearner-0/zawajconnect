
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
}

// Optimized list component with memoization
export const OptimizedList = <T,>({
  items,
  renderItem,
  keyExtractor,
  className,
  emptyMessage = 'No items found',
  loading = false,
  loadingComponent,
}: OptimizedListProps<T>) => {
  const renderedItems = useMemo(() => {
    return items.map((item, index) => (
      <React.Fragment key={keyExtractor(item, index)}>
        {renderItem(item, index)}
      </React.Fragment>
    ));
  }, [items, renderItem, keyExtractor]);

  if (loading) {
    return loadingComponent || <div className="text-center py-4">Loading...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-4 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {renderedItems}
    </div>
  );
};

export default OptimizedList;
