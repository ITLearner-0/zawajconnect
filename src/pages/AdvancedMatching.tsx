import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdvancedMatchingEngine from '@/components/matching/AdvancedMatchingEngine';
import IslamicCompatibilityCalculator from '@/components/matching/IslamicCompatibilityCalculator';
import AdvancedIslamicFiltering from '@/components/matching/AdvancedIslamicFiltering';
import SmartRecommendationEngine from '@/components/matching/SmartRecommendationEngine';
import FamilyApprovalWorkflow from '@/components/matching/FamilyApprovalWorkflow';
import CulturalRegionalPreferences from '@/components/matching/CulturalRegionalPreferences';
import { Brain, Filter, Calculator, Sparkles, Shield, Globe } from 'lucide-react';

const AdvancedMatching = () => {
  const { user, loading } = useAuth();
  const [mainTab, setMainTab] = useState('ai');
  const [subTab, setSubTab] = useState('ai-engine');

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

  // Sub-tabs configuration
  const subTabs = {
    ai: [
      { value: 'ai-engine', label: 'Moteur IA', icon: Brain },
      { value: 'smart-recommendations', label: 'Recommandations', icon: Sparkles },
    ],
    filters: [
      { value: 'islamic-filters', label: 'Islamique', icon: Filter },
      { value: 'cultural-preferences', label: 'Culture', icon: Globe },
    ],
    family: [
      { value: 'islamic-calculator', label: 'Calculateur', icon: Calculator },
      { value: 'family-approval', label: 'Approbation', icon: Shield },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header - Simplified */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Système de Matching Avancé
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Découvrez vos compatibilités avec notre IA spécialisée
            </p>
          </div>

          {/* Main Tabs - Sticky Navigation */}
          <Tabs value={mainTab} onValueChange={(val) => {
            setMainTab(val);
            // Set default sub-tab when switching main tab
            if (val === 'ai') setSubTab('ai-engine');
            if (val === 'filters') setSubTab('islamic-filters');
            if (val === 'family') setSubTab('islamic-calculator');
          }} className="space-y-6">
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b pb-4 mb-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Analyse IA</span>
                </TabsTrigger>
                <TabsTrigger value="filters" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtres</span>
                </TabsTrigger>
                <TabsTrigger value="family" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Famille</span>
                </TabsTrigger>
              </TabsList>

              {/* Sub Navigation */}
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                {subTabs[mainTab as keyof typeof subTabs].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSubTab(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      subTab === tab.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Category */}
            <TabsContent value="ai" className="mt-0">
              {subTab === 'ai-engine' && <AdvancedMatchingEngine />}
              {subTab === 'smart-recommendations' && <SmartRecommendationEngine />}
            </TabsContent>

            {/* Filters Category */}
            <TabsContent value="filters" className="mt-0">
              {subTab === 'islamic-filters' && <AdvancedIslamicFiltering />}
              {subTab === 'cultural-preferences' && <CulturalRegionalPreferences />}
            </TabsContent>

            {/* Family Category */}
            <TabsContent value="family" className="mt-0">
              {subTab === 'islamic-calculator' && <IslamicCompatibilityCalculator />}
              {subTab === 'family-approval' && <FamilyApprovalWorkflow />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedMatching;