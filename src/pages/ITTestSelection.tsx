import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Zap, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ITCertificationService } from '@/services/it-certification.service';
import type { ITCertification, TestMode } from '@/types/it-certification';

export default function ITTestSelection() {
  const { certificationId } = useParams<{ certificationId: string }>();
  const navigate = useNavigate();

  const [certification, setCertification] = useState<ITCertification | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [testMode, setTestMode] = useState<TestMode>('PRACTICE');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [creating, setCreating] = useState(false);

  const questionOptions = [5, 10, 15, 20, 25, 30, 50];

  useEffect(() => {
    if (certificationId) {
      loadData();
    }
  }, [certificationId]);

  const loadData = async () => {
    if (!certificationId) return;

    try {
      setLoading(true);
      const [cert, cats] = await Promise.all([
        ITCertificationService.getCertificationById(certificationId),
        ITCertificationService.getQuestionCategories(certificationId),
      ]);
      setCertification(cert);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreateTest = async () => {
    if (!certificationId) return;

    try {
      setCreating(true);
      const test = await ITCertificationService.createTest({
        certification_id: certificationId,
        test_mode: testMode,
        total_questions: questionCount,
        duration_minutes: testMode === 'EXAM' ? certification?.exam_duration : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        difficulty: difficulty || undefined,
      });

      navigate(`/it-certification/test/${test.id}`);
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Erreur lors de la création du test');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Certification non trouvée</p>
              <Button onClick={() => navigate('/it-certification')} className="mt-4">
                Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/it-certification')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Configurer votre test
          </h1>
          <p className="text-gray-600 mt-1">{certification.name}</p>
        </div>

        <div className="space-y-6">
          {/* Test Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Mode de Test</CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez passer le test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={testMode} onValueChange={(v) => setTestMode(v as TestMode)}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer">
                    <RadioGroupItem value="PRACTICE" id="practice" />
                    <Label htmlFor="practice" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Mode Pratique
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pas de limite de temps. Idéal pour apprendre et réviser.
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="EXAM" id="exam" />
                    <Label htmlFor="exam" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold">
                        <Clock className="h-5 w-5 text-orange-600" />
                        Mode Examen
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Avec chronomètre ({certification.exam_duration} min). Simule les conditions réelles d'examen.
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-purple-50 cursor-pointer">
                    <RadioGroupItem value="REVIEW" id="review" />
                    <Label htmlFor="review" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-semibold">
                        <RotateCcw className="h-5 w-5 text-purple-600" />
                        Mode Révision
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Révisez vos questions incorrectes précédentes.
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Number of Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Nombre de Questions</CardTitle>
              <CardDescription>
                Sélectionnez combien de questions vous voulez dans ce test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {questionOptions.map(count => (
                  <Button
                    key={count}
                    variant={questionCount === count ? 'default' : 'outline'}
                    onClick={() => setQuestionCount(count)}
                    className="h-16"
                    disabled={count > certification.total_questions}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs">questions</div>
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Questions disponibles: {certification.total_questions}
              </p>
            </CardContent>
          </Card>

          {/* Categories (Optional) */}
          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Catégories (Optionnel)</CardTitle>
                <CardDescription>
                  Filtrez par catégories spécifiques ou laissez vide pour toutes les catégories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={category} className="cursor-pointer flex-1">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Difficulty (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulté (Optionnel)</CardTitle>
              <CardDescription>
                Choisissez le niveau de difficulté ou laissez vide pour un mélange
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="" id="all" />
                    <Label htmlFor="all" className="cursor-pointer flex-1">
                      Toutes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="EASY" id="easy" />
                    <Label htmlFor="easy" className="cursor-pointer flex-1">
                      Facile
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="MEDIUM" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer flex-1">
                      Moyen
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value="HARD" id="hard" />
                    <Label htmlFor="hard" className="cursor-pointer flex-1">
                      Difficile
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Prêt à commencer ?</h3>
                  <p className="text-sm text-gray-600">
                    {questionCount} questions • Mode {testMode === 'PRACTICE' ? 'Pratique' : testMode === 'EXAM' ? 'Examen' : 'Révision'}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleCreateTest}
                  disabled={creating || questionCount > certification.total_questions}
                  className="w-full sm:w-auto"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Commencer le Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
