import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
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
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Matching Avancé</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Trouvez des profils compatibles grâce à notre système de matching intelligent
        </p>
      </div>

      {/* Main Navigation */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <Tabs
          value={mainTab}
          onValueChange={(val) => {
            setMainTab(val);
            if (val === 'ai') setSubTab('ai-engine');
            if (val === 'filters') setSubTab('islamic-filters');
            if (val === 'family') setSubTab('islamic-calculator');
          }}
          className="space-y-6"
        >
          {/* Main Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Catégories</h2>
            <ResponsiveTabsList tabCount={3}>
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
            </ResponsiveTabsList>
          </div>

          {/* Sub Navigation */}
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Options</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {subTabs[mainTab as keyof typeof subTabs].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSubTab(tab.value)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: subTab === tab.value ? '1px solid var(--color-primary)' : '1px solid var(--color-border-default)',
                    backgroundColor: subTab === tab.value ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: subTab === tab.value ? '#fff' : 'var(--color-text-primary)',
                  }}
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
