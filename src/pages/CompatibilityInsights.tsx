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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mes Insights de Compatibilité
        </h1>
        <p className="text-muted-foreground">
          Analyses personnalisées basées sur votre test de compatibilité
        </p>
      </div>

      {/* Achievements Overview */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Progression & Récompenses</h2>
        <CompatibilityAchievements 
          completionPercentage={100}
          insightsViewed={3}
          profilesVisited={7}
          guidanceRead={2}
        />
      </div>

      {/* Main Insights Section */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Analyses Détaillées</h2>
        <CompatibilityInsights />
      </div>

      {/* Gamified Section */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Système de Progression</h2>
        <GamifiedInsights />
      </div>
    </div>
  );
};

export default CompatibilityInsightsPage;