
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface StandardLoadingStateProps {
  message?: string;
}

const StandardLoadingState: React.FC<StandardLoadingStateProps> = ({ 
  message = "Chargement..." 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default StandardLoadingState;
