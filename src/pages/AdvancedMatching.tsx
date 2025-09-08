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
import { Brain, Filter, Calculator, Sparkles, Shield, Target, Globe } from 'lucide-react';

const AdvancedMatching = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
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
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-emerald-600 bg-clip-text text-transparent">
                Système de Matching Avancé
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Découvrez vos compatibilités les plus profondes grâce à notre IA spécialisée dans les valeurs islamiques
            </p>
          </div>

          {/* Advanced Matching Tabs */}
          <Tabs defaultValue="ai-engine" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
              <TabsTrigger value="ai-engine" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Moteur IA</span>
              </TabsTrigger>
              <TabsTrigger value="islamic-calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Calculateur</span>
              </TabsTrigger>
              <TabsTrigger value="islamic-filters" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtres</span>
              </TabsTrigger>
              <TabsTrigger value="smart-recommendations" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Recommandations</span>
              </TabsTrigger>
              <TabsTrigger value="family-approval" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Famille</span>
              </TabsTrigger>
              <TabsTrigger value="cultural-preferences" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Culture</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-engine" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Moteur IA de Compatibilité</h2>
                </div>
                <p className="text-muted-foreground">
                  Intelligence artificielle spécialisée dans l'analyse de compatibilité islamique
                </p>
              </div>
              <AdvancedMatchingEngine />
            </TabsContent>

            <TabsContent value="islamic-calculator" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Calculateur de Compatibilité Islamique</h2>
                </div>
                <p className="text-muted-foreground">
                  Analysez en détail votre compatibilité selon les valeurs et pratiques islamiques
                </p>
              </div>
              <IslamicCompatibilityCalculator />
            </TabsContent>

            <TabsContent value="islamic-filters" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Filter className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Filtres Islamiques Avancés</h2>
                </div>
                <p className="text-muted-foreground">
                  Filtrez les profils selon vos critères religieux, culturels et personnels
                </p>
              </div>
              <AdvancedIslamicFiltering />
            </TabsContent>

            <TabsContent value="smart-recommendations" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Recommandations Intelligentes</h2>
                </div>
                <p className="text-muted-foreground">
                  Recevez des recommandations personnalisées basées sur l'analyse IA de votre profil
                </p>
              </div>
              <SmartRecommendationEngine />
            </TabsContent>

            <TabsContent value="family-approval" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Approbation Familiale</h2>
                </div>
                <p className="text-muted-foreground">
                  Workflow d'approbation des matches par la famille selon les valeurs islamiques
                </p>
              </div>
              <FamilyApprovalWorkflow />
            </TabsContent>

            <TabsContent value="cultural-preferences" className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Préférences Culturelles</h2>
                </div>
                <p className="text-muted-foreground">
                  Trouvez des personnes partageant vos origines culturelles et régionales
                </p>
              </div>
              <CulturalRegionalPreferences />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdvancedMatching;