
import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleFieldProps {
  label: string;
  children: React.ReactElement;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  children,
  error,
  description,
  required = false,
  className
}) => {
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();

  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': [
      description ? descriptionId : '',
      error ? errorId : ''
    ].filter(Boolean).join(' ') || undefined,
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required ? 'true' : 'false'
  });

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="requis">*</span>
        )}
      </label>
      
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          {description}
        </p>
      )}
      
      {childWithProps}
      
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  'aria-label'?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  className,
  'aria-label': ariaLabel
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={className}
      aria-label={ariaLabel}
      noValidate
    >
      {children}
    </form>
  );
};
