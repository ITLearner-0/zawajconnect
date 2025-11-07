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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Matching Avancé
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez vos compatibilités avec notre intelligence artificielle spécialisée
            </p>
          </div>

          {/* Main Navigation */}
          <Tabs value={mainTab} onValueChange={(val) => {
            setMainTab(val);
            if (val === 'ai') setSubTab('ai-engine');
            if (val === 'filters') setSubTab('islamic-filters');
            if (val === 'family') setSubTab('islamic-calculator');
          }} className="space-y-8">
            {/* Sticky Tab Navigation */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
              <div className="py-4">
                <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto h-12 p-1">
                  <TabsTrigger value="ai" className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Analyse IA</span>
                    <span className="sm:hidden">IA</span>
                  </TabsTrigger>
                  <TabsTrigger value="filters" className="flex items-center gap-2 text-sm">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtres</span>
                    <span className="sm:hidden">Filtres</span>
                  </TabsTrigger>
                  <TabsTrigger value="family" className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Famille</span>
                    <span className="sm:hidden">Famille</span>
                  </TabsTrigger>
                </TabsList>

                {/* Sub Navigation */}
                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap px-4">
                  {subTabs[mainTab as keyof typeof subTabs].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setSubTab(tab.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        subTab === tab.value
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:scale-102'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
              {/* AI Category */}
              <TabsContent value="ai" className="mt-0 space-y-6">
                {subTab === 'ai-engine' && <AdvancedMatchingEngine />}
                {subTab === 'smart-recommendations' && <SmartRecommendationEngine />}
              </TabsContent>

              {/* Filters Category */}
              <TabsContent value="filters" className="mt-0 space-y-6">
                {subTab === 'islamic-filters' && <AdvancedIslamicFiltering />}
                {subTab === 'cultural-preferences' && <CulturalRegionalPreferences />}
              </TabsContent>

              {/* Family Category */}
              <TabsContent value="family" className="mt-0 space-y-6">
                {subTab === 'islamic-calculator' && <IslamicCompatibilityCalculator />}
                {subTab === 'family-approval' && <FamilyApprovalWorkflow />}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedMatching;