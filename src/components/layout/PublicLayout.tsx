import React from 'react';
import BaseLayout from './BaseLayout';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true 
}) => {
  return (
    <BaseLayout>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </BaseLayout>
  );
};

export default PublicLayout;