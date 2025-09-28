import React from 'react';
import BaseLayout from './BaseLayout';

interface AuthLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, showBackground = true }) => {
  return (
    <BaseLayout className={showBackground ? 'flex items-center justify-center p-4' : ''}>
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </BaseLayout>
  );
};

export default AuthLayout;