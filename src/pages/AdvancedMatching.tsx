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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-card rounded-lg border p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Matching Avancé
        </h1>
        <p className="text-muted-foreground">
          Trouvez des profils compatibles grâce à notre système de matching intelligent
        </p>
      </div>

      {/* Main Navigation */}
      <div className="bg-card rounded-lg border p-6">
        <Tabs value={mainTab} onValueChange={(val) => {
          setMainTab(val);
          if (val === 'ai') setSubTab('ai-engine');
          if (val === 'filters') setSubTab('islamic-filters');
          if (val === 'family') setSubTab('islamic-calculator');
        }} className="space-y-6">
          {/* Main Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Catégories</h2>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Analyse IA
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </TabsTrigger>
              <TabsTrigger value="family" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Famille
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sub Navigation */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Options</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {subTabs[mainTab as keyof typeof subTabs].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSubTab(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${
                    subTab === tab.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="border-t pt-6">
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
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedMatching;