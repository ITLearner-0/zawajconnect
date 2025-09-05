import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompatibilityInsights from '@/components/CompatibilityInsights';

const CompatibilityInsightsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Vos Insights de Compatibilité
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez des analyses personnalisées basées sur vos réponses au test de compatibilité 
              et recevez des conseils pour améliorer votre recherche de partenaire.
            </p>
          </div>
          
          <CompatibilityInsights />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompatibilityInsightsPage;