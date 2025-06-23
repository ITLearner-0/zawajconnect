
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AccessibleLinkProps extends LinkProps {
  external?: boolean;
  newTab?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleLink: React.FC<AccessibleLinkProps> = ({
  external = false,
  newTab = false,
  ariaLabel,
  children,
  className,
  ...props
}) => {
  const linkProps = {
    ...props,
    className: cn(
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
      'underline-offset-4 hover:underline',
      className
    ),
    'aria-label': ariaLabel,
    ...(newTab && {
      target: '_blank',
      rel: 'noopener noreferrer'
    })
  };

  if (external) {
    return (
      <a href={props.to as string} {...linkProps}>
        {children}
        {newTab && (
          <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
        )}
      </a>
    );
  }

  return (
    <Link {...linkProps}>
      {children}
      {newTab && (
        <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
      )}
    </Link>
  );
};
