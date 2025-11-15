import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyState {
  title: string;
  description: string;
  action?: EmptyStateAction;
}

interface StandardLoadingStateProps {
  loading?: boolean;
  error?: string | null;
  message?: string;
  loadingText?: string;
  emptyState?: EmptyState;
  children?: React.ReactNode;
}

const StandardLoadingState: React.FC<StandardLoadingStateProps> = ({
  loading = false,
  error = null,
  message = 'Chargement...',
  loadingText,
  emptyState,
  children,
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">{loadingText || message}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-destructive font-medium">Erreur</p>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state if no children and emptyState is provided
  if (!children && emptyState) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">{emptyState.title}</h3>
          <p className="text-muted-foreground">{emptyState.description}</p>
          {emptyState.action && (
            <Button onClick={emptyState.action.onClick}>{emptyState.action.label}</Button>
          )}
        </div>
      </div>
    );
  }

  // Render children if provided
  return <>{children}</>;
};

export default StandardLoadingState;
