import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Target,
  Shield
} from 'lucide-react';
import { useIslamicModeration } from '@/hooks/useIslamicModeration';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  message: string;
  expectedAction: 'approved' | 'blocked' | 'warned';
  expectedRules: string[];
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TestResult {
  testId: string;
  passed: boolean;
  actualAction: string;
  actualRules: string[];
  expectedAction: string;
  expectedRules: string[];
  executionTime: number;
  confidence: number;
}

const ModerationTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { moderateContent } = useIslamicModeration();
  const { toast } = useToast();

  const testCases: TestCase[] = [
    // Tests de contenu approprié
    {
      id: 'appropriate-1',
      name: 'Salutation islamique',
      message: 'Assalam alaykoum, comment allez-vous ?',
      expectedAction: 'approved',
      expectedRules: [],
      category: 'Approprié',
      severity: 'low'
    },
    {
      id: 'appropriate-2',
      name: 'Présentation respectueuse',
      message: 'Je suis ingénieur et je cherche une épouse pratiquante pour fonder une famille pieuse.',
      expectedAction: 'approved',
      expectedRules: [],
      category: 'Approprié',
      severity: 'low'
    },
    {
      id: 'appropriate-3',
      name: 'Discussion famille',
      message: 'Pouvons-nous organiser une rencontre avec nos familles respectives ?',
      expectedAction: 'approved',
      expectedRules: [],
      category: 'Approprié',
      severity: 'low'
    },

    // Tests de contenu inapproprié - Partage d\'informations personnelles
    {
      id: 'personal-info-1',
      name: 'Numéro de téléphone',
      message: 'Voici mon numéro: 0123456789',
      expectedAction: 'blocked',
      expectedRules: ['partage_informations_personnelles'],
      category: 'Informations personnelles',
      severity: 'critical'
    },
    {
      id: 'personal-info-2',
      name: 'Adresse email',
      message: 'Contacte-moi sur example@email.com',
      expectedAction: 'blocked',
      expectedRules: ['partage_informations_personnelles'],
      category: 'Informations personnelles',
      severity: 'critical'
    },
    {
      id: 'personal-info-3',
      name: 'Réseaux sociaux',
      message: 'Trouve-moi sur Instagram @username',
      expectedAction: 'blocked',
      expectedRules: ['partage_informations_personnelles'],
      category: 'Informations personnelles',
      severity: 'critical'
    },

    // Tests de contenu inapproprié - Rencontres privées
    {
      id: 'private-meeting-1',
      name: 'Invitation privée directe',
      message: 'On peut se voir en tête à tête ce soir ?',
      expectedAction: 'blocked',
      expectedRules: ['demande_rencontre_privee'],
      category: 'Rencontre privée',
      severity: 'critical'
    },
    {
      id: 'private-meeting-2',
      name: 'Rendez-vous secret',
      message: 'Retrouvons-nous au café sans dire à nos familles',
      expectedAction: 'blocked',
      expectedRules: ['demande_rencontre_privee'],
      category: 'Rencontre privée',
      severity: 'critical'
    },

    // Tests de contenu inapproprié - Pudeur
    {
      id: 'modesty-1',
      name: 'Contenu sexuel explicite',
      message: 'Tu me plais, on pourrait passer la nuit ensemble',
      expectedAction: 'blocked',
      expectedRules: ['contraire à la pudeur'],
      category: 'Pudeur',
      severity: 'critical'
    },
    {
      id: 'modesty-2',
      name: 'Langage romantique inapproprié',
      message: 'Tu es tellement sexy, j\'ai envie de toi',
      expectedAction: 'blocked',
      expectedRules: ['contraire à la pudeur', 'vulgarité et grossièreté'],
      category: 'Pudeur',
      severity: 'critical'
    },

    // Tests de contenu inapproprié - Vulgarité
    {
      id: 'vulgarity-1',
      name: 'Insultes',
      message: 'Tu es complètement stupide !',
      expectedAction: 'blocked',
      expectedRules: ['vulgarité et grossièreté'],
      category: 'Vulgarité',
      severity: 'high'
    },
    {
      id: 'vulgarity-2',
      name: 'Langage grossier',
      message: 'Merde, je suis en retard',
      expectedAction: 'warned',
      expectedRules: ['vulgarité et grossièreté'],
      category: 'Vulgarité',
      severity: 'medium'
    },

    // Tests de contenu límite
    {
      id: 'borderline-1',
      name: 'Compliment approprié',
      message: 'Vous semblez être une personne très pieuse et respectueuse',
      expectedAction: 'approved',
      expectedRules: [],
      category: 'Limite',
      severity: 'low'
    },
    {
      id: 'borderline-2',
      name: 'Question personnelle limite',
      message: 'Quel âge avez-vous et où habitez-vous ?',
      expectedAction: 'warned',
      expectedRules: ['partage_informations_personnelles'],
      category: 'Limite',
      severity: 'medium'
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);

    const results: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      if (!testCase) continue;
      
      setCurrentTest(testCase.name);
      setProgress((i / testCases.length) * 100);

      try {
        const startTime = Date.now();
        const result = await moderateContent(
          testCase.message,
          'test-user-id',
          'automated-test',
          'test-match-id'
        );
        const executionTime = Date.now() - startTime;

        const testResult: TestResult = {
          testId: testCase.id,
          passed: result.action === testCase.expectedAction,
          actualAction: result.action,
          actualRules: result.rulesTriggered,
          expectedAction: testCase.expectedAction,
          expectedRules: testCase.expectedRules,
          executionTime,
          confidence: result.confidence
        };

        results.push(testResult);
      } catch (error) {
        console.error(`Test ${testCase.id} failed:`, error);
        results.push({
          testId: testCase.id,
          passed: false,
          actualAction: 'error',
          actualRules: [],
          expectedAction: testCase.expectedAction,
          expectedRules: testCase.expectedRules,
          executionTime: 0,
          confidence: 0
        });
      }

      // Petit délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTestResults(results);
    setProgress(100);
    setIsRunning(false);
    setCurrentTest('');

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    toast({
      title: "Tests terminés",
      description: `${passedTests}/${totalTests} tests réussis (${successRate}%)`,
      variant: successRate >= 80 ? "default" : "destructive"
    });
  };

  const runSingleTest = async (testCase: TestCase) => {
    setCurrentTest(testCase.name);
    
    try {
      const startTime = Date.now();
      const result = await moderateContent(
        testCase.message,
        'test-user-id',
        'single-test',
        'test-match-id'
      );
      const executionTime = Date.now() - startTime;

      const testResult: TestResult = {
        testId: testCase.id,
        passed: result.action === testCase.expectedAction,
        actualAction: result.action,
        actualRules: result.rulesTriggered,
        expectedAction: testCase.expectedAction,
        expectedRules: testCase.expectedRules,
        executionTime,
        confidence: result.confidence
      };

      setTestResults(prev => {
        const filtered = prev.filter(r => r.testId !== testCase.id);
        return [...filtered, testResult];
      });

      toast({
        title: testResult.passed ? "Test réussi" : "Test échoué",
        description: `${testCase.name}: ${testResult.actualAction}`,
        variant: testResult.passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error(`Single test ${testCase.id} failed:`, error);
      toast({
        title: "Erreur de test",
        description: `Le test ${testCase.name} a échoué`,
        variant: "destructive"
      });
    } finally {
      setCurrentTest('');
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setProgress(0);
    setCurrentTest('');
  };

  const getTestResult = (testId: string) => {
    return testResults.find(r => r.testId === testId);
  };

  const getSuccessRate = () => {
    if (testResults.length === 0) return 0;
    const passed = testResults.filter(r => r.passed).length;
    return Math.round((passed / testResults.length) * 100);
  };

  const getAverageExecutionTime = () => {
    if (testResults.length === 0) return 0;
    const total = testResults.reduce((sum, r) => sum + r.executionTime, 0);
    return Math.round(total / testResults.length);
  };

  const getCategoryResults = (category: string) => {
    const categoryTests = testCases.filter(tc => tc.category === category);
    const categoryResults = testResults.filter(tr => 
      categoryTests.some(ct => ct.id === tr.testId)
    );
    if (categoryResults.length === 0) return { passed: 0, total: categoryTests.length };
    const passed = categoryResults.filter(r => r.passed).length;
    return { passed, total: categoryTests.length };
  };

  const categories = [...new Set(testCases.map(tc => tc.category))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Suite de Tests de Modération</h1>
          <p className="text-muted-foreground">
            Tests automatisés pour valider le système de modération islamique
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Contrôles de Test
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'En cours...' : 'Lancer Tous les Tests'}
              </Button>
              <Button
                variant="outline"
                onClick={resetTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test en cours: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {testResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-medium">Taux de Réussite</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{getSuccessRate()}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Tests Réussis</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.passed).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Tests Échoués</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {testResults.filter(r => !r.passed).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Temps Moyen</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{getAverageExecutionTime()}ms</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs defaultValue="all" className="space-y-6">
        <ResponsiveTabsList tabCount={6}>
          <TabsTrigger value="all">
            Tous
            <Badge variant="outline" className="ml-2">
              {testCases.length}
            </Badge>
          </TabsTrigger>
          {categories.map(category => {
            const { passed, total } = getCategoryResults(category);
            return (
              <TabsTrigger key={category} value={category}>
                {category}
                {testResults.length > 0 && (
                  <Badge
                    variant={passed === total ? "default" : passed > 0 ? "secondary" : "destructive"}
                    className="ml-2"
                  >
                    {passed}/{total}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </ResponsiveTabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {testCases.map(testCase => {
              const result = getTestResult(testCase.id);
              return (
                <Card key={testCase.id} className={`${result?.passed === false ? 'border-red-200 bg-red-50' : result?.passed === true ? 'border-green-200 bg-green-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{testCase.name}</h4>
                          <Badge variant="outline">{testCase.category}</Badge>
                          <Badge variant={
                            testCase.severity === 'critical' ? 'destructive' :
                            testCase.severity === 'high' ? 'secondary' :
                            testCase.severity === 'medium' ? 'outline' : 'default'
                          }>
                            {testCase.severity}
                          </Badge>
                          {result && (
                            <>
                              {result.passed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <Badge variant="outline">
                                {result.executionTime}ms
                              </Badge>
                            </>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Message: "{testCase.message}"
                        </p>
                        
                        <div className="flex gap-4 text-sm">
                          <span>Attendu: <Badge variant="outline">{testCase.expectedAction}</Badge></span>
                          {result && (
                            <span>Obtenu: <Badge variant={result.passed ? "default" : "destructive"}>{result.actualAction}</Badge></span>
                          )}
                        </div>

                        {result && !result.passed && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Règles attendues: {testCase.expectedRules.join(', ') || 'Aucune'}
                              <br />
                              Règles obtenues: {result.actualRules.join(', ') || 'Aucune'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleTest(testCase)}
                        disabled={isRunning || currentTest === testCase.name}
                      >
                        {currentTest === testCase.name ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="space-y-4">
              {testCases.filter(tc => tc.category === category).map(testCase => {
                const result = getTestResult(testCase.id);
                return (
                  <Card key={testCase.id} className={`${result?.passed === false ? 'border-red-200 bg-red-50' : result?.passed === true ? 'border-green-200 bg-green-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{testCase.name}</h4>
                            <Badge variant={
                              testCase.severity === 'critical' ? 'destructive' :
                              testCase.severity === 'high' ? 'secondary' :
                              testCase.severity === 'medium' ? 'outline' : 'default'
                            }>
                              {testCase.severity}
                            </Badge>
                            {result && (
                              <>
                                {result.passed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <Badge variant="outline">
                                  {result.executionTime}ms
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            Message: "{testCase.message}"
                          </p>
                          
                          <div className="flex gap-4 text-sm">
                            <span>Attendu: <Badge variant="outline">{testCase.expectedAction}</Badge></span>
                            {result && (
                              <span>Obtenu: <Badge variant={result.passed ? "default" : "destructive"}>{result.actualAction}</Badge></span>
                            )}
                          </div>

                          {result && !result.passed && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Règles attendues: {testCase.expectedRules.join(', ') || 'Aucune'}
                                <br />
                                Règles obtenues: {result.actualRules.join(', ') || 'Aucune'}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runSingleTest(testCase)}
                          disabled={isRunning || currentTest === testCase.name}
                        >
                          {currentTest === testCase.name ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ModerationTestSuite;