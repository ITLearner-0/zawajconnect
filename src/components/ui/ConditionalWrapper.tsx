import React, { ReactNode } from 'react';

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}

// Utility component to conditionally wrap children
export const ConditionalWrapper = ({ condition, wrapper, children }: ConditionalWrapperProps) => {
  return condition ? wrapper(children) : children;
};

export default ConditionalWrapper;
