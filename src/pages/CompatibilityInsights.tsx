import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CompatibilityInsights from '@/components/CompatibilityInsights';
import CompatibilityAchievements from '@/components/CompatibilityAchievements';
import GamifiedInsights from '@/components/GamifiedInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CompatibilityInsightsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="animate-spin rounded-full h-8 w-8" style={{ borderBottom: '2px solid var(--color-primary)' }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Mes Insights de Compatibilité</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Analyses personnalisées basées sur votre test de compatibilité
        </p>
      </div>

      {/* Achievements Overview */}
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Progression & Récompenses</h2>
        <CompatibilityAchievements
          completionPercentage={100}
          insightsViewed={3}
          profilesVisited={7}
          guidanceRead={2}
        />
      </div>

      {/* Main Insights Section */}
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Analyses Détaillées</h2>
        <CompatibilityInsights />
      </div>

      {/* Gamified Section */}
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Système de Progression</h2>
        <GamifiedInsights />
      </div>
    </div>
  );
};

export default CompatibilityInsightsPage;
