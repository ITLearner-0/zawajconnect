import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ITCertificationService } from '@/services/it-certification.service';
import type {
  ITCertification,
  ITCertificationPDF,
  ITQuestion,
  QuestionType,
  Difficulty,
} from '@/types/it-certification';

export default function ITAdmin() {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<ITCertification[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<string>('');
  const [pdfs, setPdfs] = useState<ITCertificationPDF[]>([]);
  const [questions, setQuestions] = useState<ITQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload PDF State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Create Question State
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
  const [questionCategory, setQuestionCategory] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState<Difficulty>('MEDIUM');
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [choices, setChoices] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  useEffect(() => {
    loadCertifications();
  }, []);

  useEffect(() => {
    if (selectedCertId) {
      loadCertificationData();
    }
  }, [selectedCertId]);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const certs = await ITCertificationService.getAllCertifications();
      setCertifications(certs);
      if (certs.length > 0 && !selectedCertId) {
        setSelectedCertId(certs[0].id);
      }
    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificationData = async () => {
    if (!selectedCertId) return;

    try {
      const [pdfsData, questionsData] = await Promise.all([
        ITCertificationService.getPDFsByCertification(selectedCertId).catch(() => []),
        ITCertificationService.getQuestionsByCertification(selectedCertId).catch(() => []),
      ]);
      setPdfs(pdfsData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading certification data:', error);
    }
  };

  const handleUploadPDF = async () => {
    if (!uploadFile || !selectedCertId) return;

    try {
      setUploading(true);
      await ITCertificationService.uploadPDF(selectedCertId, uploadFile);
      alert('PDF uploadé avec succès !');
      setUploadFile(null);
      loadCertificationData();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Erreur lors de l\'upload du PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedCertId || !questionText) return;

    try {
      const validChoices = choices.filter(c => c.text.trim());
      if (validChoices.length < 2) {
        alert('Vous devez fournir au moins 2 choix de réponse');
        return;
      }

      if (!validChoices.some(c => c.isCorrect)) {
        alert('Vous devez marquer au moins une réponse comme correcte');
        return;
      }

      await ITCertificationService.createQuestion(
        {
          certification_id: selectedCertId,
          question_text: questionText,
          question_type: questionType,
          explanation: questionExplanation || undefined,
          difficulty: questionDifficulty,
          category: questionCategory || undefined,
          is_active: true,
          pdf_id: undefined,
        },
        validChoices.map((c, index) => ({
          choice_text: c.text,
          is_correct: c.isCorrect,
          choice_order: index + 1,
        }))
      );

      alert('Question créée avec succès !');
      setShowQuestionDialog(false);
      resetQuestionForm();
      loadCertificationData();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Erreur lors de la création de la question');
    }
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionType('MCQ');
    setQuestionCategory('');
    setQuestionDifficulty('MEDIUM');
    setQuestionExplanation('');
    setChoices([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
  };

  const addChoice = () => {
    setChoices([...choices, { text: '', isCorrect: false }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const updateChoice = (index: number, text: string, isCorrect?: boolean) => {
    const newChoices = [...choices];
    newChoices[index] = {
      text: text !== undefined ? text : newChoices[index].text,
      isCorrect: isCorrect !== undefined ? isCorrect : newChoices[index].isCorrect,
    };
    setChoices(newChoices);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/it-certification')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Administration IT Certification</h1>
          <p className="text-gray-600 mt-2">
            Gérez les certifications, PDFs et questions
          </p>
        </div>

        {/* Certification Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sélectionner une Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCertId} onValueChange={setSelectedCertId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une certification" />
              </SelectTrigger>
              <SelectContent>
                {certifications.map(cert => (
                  <SelectItem key={cert.id} value={cert.id}>
                    {cert.name} ({cert.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pdfs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pdfs">PDFs</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* PDFs Tab */}
          <TabsContent value="pdfs" className="space-y-6">
            {/* Upload PDF */}
            <Card>
              <CardHeader>
                <CardTitle>Uploader un PDF</CardTitle>
                <CardDescription>
                  Uploadez des fichiers PDF contenant des questions de certification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pdf-file">Fichier PDF</Label>
                    <Input
                      id="pdf-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    onClick={handleUploadPDF}
                    disabled={!uploadFile || uploading || !selectedCertId}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Uploader
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PDFs List */}
            <Card>
              <CardHeader>
                <CardTitle>PDFs Uploadés</CardTitle>
              </CardHeader>
              <CardContent>
                {pdfs.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Aucun PDF uploadé</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du fichier</TableHead>
                        <TableHead>Taille</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Questions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pdfs.map(pdf => (
                        <TableRow key={pdf.id}>
                          <TableCell className="font-medium">{pdf.file_name}</TableCell>
                          <TableCell>{(pdf.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                          <TableCell>
                            {new Date(pdf.upload_date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {pdf.processed ? (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Traité
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{pdf.questions_extracted}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            {/* Create Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Questions
                  <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Créer une Nouvelle Question</DialogTitle>
                        <DialogDescription>
                          Remplissez les détails de la question
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Question Text */}
                        <div>
                          <Label htmlFor="question-text">Question</Label>
                          <Textarea
                            id="question-text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            rows={3}
                            placeholder="Entrez la question..."
                          />
                        </div>

                        {/* Question Type */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="question-type">Type</Label>
                            <Select
                              value={questionType}
                              onValueChange={(v) => setQuestionType(v as QuestionType)}
                            >
                              <SelectTrigger id="question-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MCQ">QCM (Choix Multiple)</SelectItem>
                                <SelectItem value="MULTIPLE_ANSWER">Plusieurs Réponses</SelectItem>
                                <SelectItem value="TRUE_FALSE">Vrai/Faux</SelectItem>
                                <SelectItem value="YES_NO">Oui/Non</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="question-difficulty">Difficulté</Label>
                            <Select
                              value={questionDifficulty}
                              onValueChange={(v) => setQuestionDifficulty(v as Difficulty)}
                            >
                              <SelectTrigger id="question-difficulty">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EASY">Facile</SelectItem>
                                <SelectItem value="MEDIUM">Moyen</SelectItem>
                                <SelectItem value="HARD">Difficile</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <Label htmlFor="question-category">Catégorie (optionnel)</Label>
                          <Input
                            id="question-category"
                            value={questionCategory}
                            onChange={(e) => setQuestionCategory(e.target.value)}
                            placeholder="ex: Networking, Security, Cloud..."
                          />
                        </div>

                        {/* Choices */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Choix de Réponses</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addChoice}>
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {choices.map((choice, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={choice.text}
                                  onChange={(e) => updateChoice(index, e.target.value)}
                                  placeholder={`Choix ${index + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant={choice.isCorrect ? 'default' : 'outline'}
                                  size="icon"
                                  onClick={() => updateChoice(index, choice.text, !choice.isCorrect)}
                                  title="Marquer comme correct"
                                >
                                  {choice.isCorrect ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </Button>
                                {choices.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeChoice(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Explanation */}
                        <div>
                          <Label htmlFor="question-explanation">Explication (optionnel)</Label>
                          <Textarea
                            id="question-explanation"
                            value={questionExplanation}
                            onChange={(e) => setQuestionExplanation(e.target.value)}
                            rows={2}
                            placeholder="Expliquez pourquoi c'est la bonne réponse..."
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateQuestion}>Créer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Aucune question</p>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <Card key={q.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-2">{q.question_text}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{q.question_type}</Badge>
                                {q.category && <Badge variant="secondary">{q.category}</Badge>}
                                {q.difficulty && (
                                  <Badge
                                    variant={
                                      q.difficulty === 'EASY'
                                        ? 'default'
                                        : q.difficulty === 'HARD'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                  >
                                    {q.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCertId && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">PDFs Uploadés</p>
                      <p className="text-3xl font-bold text-green-600">{pdfs.length}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Questions Extraites</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {pdfs.reduce((sum, p) => sum + p.questions_extracted, 0)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
