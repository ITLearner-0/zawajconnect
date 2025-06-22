
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useNavigate } from 'react-router-dom';
import { demoPersonas } from '@/data/demoPersonas';
import { DatabaseProfile } from '@/types/profile';
import DemoNavigation from '@/components/demo/DemoNavigation';
import DemoStatusBanner from '@/components/demo/DemoStatusBanner';
import InteractiveTutorial from '@/components/demo/InteractiveTutorial';
import EnhancedDemoMessaging from '@/components/demo/EnhancedDemoMessaging';
import ProfileList from '@/components/demo/ProfileList';
import FeaturesAndSettings from '@/components/demo/FeaturesAndSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  BookOpen, 
  Play,
  Shield,
  Star,
  Zap
} from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [completedTutorialSteps, setCompletedTutorialSteps] = useState<string[]>([]);

  // Handle selecting a profile from the list
  const handleSelectProfile = (profile: DatabaseProfile) => {
    // Navigate to profile page for detailed view
    navigate(`/profile/${profile.id}`);
  };

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    setActiveTab('messaging');
  };

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleTutorialStepComplete = (stepId: string) => {
    setCompletedTutorialSteps(prev => [...prev, stepId]);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    // Could navigate to sign-up or show completion message
  };

  const demoFeatures = [
    {
      icon: Users,
      title: 'Profils Représentatifs',
      description: '4 personas soigneusement créés pour représenter la diversité de notre communauté',
      count: demoPersonas.length
    },
    {
      icon: MessageSquare,
      title: 'Conversations Pré-écrites',
      description: 'Dialogues authentiques montrant les interactions respectueuses entre musulmans',
      count: 8
    },
    {
      icon: Shield,
      title: 'Supervision Wali',
      description: 'Démonstration des fonctionnalités de supervision familiale',
      count: 2
    },
    {
      icon: Heart,
      title: 'Test de Compatibilité',
      description: 'Algorithme basé sur les valeurs islamiques et la compatibilité personnelle',
      count: 25
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
      <DemoNavigation />
      
      <div className="container mx-auto py-6">
        {/* Demo Status Banner */}
        <DemoStatusBanner variant="prominent" />
        
        {/* Demo Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-rose-800 dark:text-rose-200 font-serif">
            Mode Démonstration
          </h1>
          <p className="text-xl text-rose-600 dark:text-rose-300 mb-6 max-w-3xl mx-auto">
            Explorez toutes les fonctionnalités de notre plateforme de mariage islamique dans un environnement sécurisé
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleStartTutorial}
              className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Play className="h-5 w-5 mr-2" />
              Commencer le Tutoriel Interactif
            </Button>
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
              <Zap className="h-4 w-4 mr-1" />
              100% Gratuit - Aucune inscription requise
            </Badge>
          </div>
        </div>

        {/* Demo Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {demoFeatures.map((feature, index) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 border-rose-200 dark:border-rose-700">
              <CardHeader className="text-center pb-2">
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-4 rounded-full w-16 h-16 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-rose-600 dark:text-rose-300" />
                </div>
                <CardTitle className="text-lg text-rose-800 dark:text-rose-200">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-rose-600 dark:text-rose-400 mb-3">
                  {feature.description}
                </CardDescription>
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-200">
                  {feature.count} {feature.count === 1 ? 'élément' : 'éléments'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Demo Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border border-rose-200 dark:border-rose-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="profiles" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200">
              <Users className="h-4 w-4 mr-2" />
              Profils
            </TabsTrigger>
            <TabsTrigger value="messaging" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messagerie
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200">
              <Star className="h-4 w-4 mr-2" />
              Fonctionnalités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
                <CardHeader>
                  <CardTitle className="text-rose-800 dark:text-rose-200 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    À propos de cette démonstration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-rose-600 dark:text-rose-300">
                    Cette démonstration vous permet d'explorer toutes les fonctionnalités de notre plateforme sans créer de compte. 
                    Toutes les données sont fictives et créées spécifiquement pour cette présentation.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-rose-800 dark:text-rose-200">Ce que vous pouvez tester :</h4>
                    <ul className="text-sm text-rose-600 dark:text-rose-300 space-y-1">
                      <li>• Navigation des profils représentatifs</li>
                      <li>• Système de messagerie avec supervision</li>
                      <li>• Test de compatibilité islamique</li>
                      <li>• Fonctionnalités de sécurité et confidentialité</li>
                      <li>• Ressources éducatives islamiques</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
                <CardHeader>
                  <CardTitle className="text-rose-800 dark:text-rose-200 flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Commencer l'exploration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-rose-600 dark:text-rose-300">
                    Nous recommandons de commencer par le tutoriel interactif pour une expérience guidée, 
                    ou d'explorer librement les différents onglets.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleStartTutorial} 
                      className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Lancer le tutoriel guidé
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('profiles')} 
                      variant="outline" 
                      className="w-full border-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Explorer les profils
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profiles">
            <ProfileList 
              profiles={demoPersonas} 
              onSelectProfile={handleSelectProfile}
            />
          </TabsContent>

          <TabsContent value="messaging">
            <EnhancedDemoMessaging
              selectedPersona={selectedPersona}
              onPersonaSelect={setSelectedPersona}
            />
          </TabsContent>

          <TabsContent value="features">
            <FeaturesAndSettings 
              encryptionEnabled={true}
              monitoringEnabled={true}
              retentionPolicy={{
                type: 'temporary',
                duration_days: 30,
                auto_delete: true
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Interactive Tutorial */}
      {showTutorial && (
        <InteractiveTutorial
          onStepComplete={handleTutorialStepComplete}
          onTutorialComplete={handleTutorialComplete}
          autoStart={true}
        />
      )}

      <Toaster />
    </div>
  );
};

export default Demo;
