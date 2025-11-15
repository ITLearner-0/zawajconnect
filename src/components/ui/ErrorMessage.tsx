import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md',
        className
      )}
    >
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
