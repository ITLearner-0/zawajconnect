/**
 * Admin Questions Dashboard - Phase 4
 * Comprehensive admin interface for managing daily questions
 * CRUD operations, analytics, and scheduling
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircleQuestion,
  Sparkles,
  Settings,
} from 'lucide-react';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface Question {
  id: string;
  question_text: string;
  question_fr: string;
  category: string;
  subcategory: string;
  difficulty_level: string;
  question_type: string;
  choices: any;
  is_active: boolean;
  priority: number;
  used_count: number;
  last_used_at: string | null;
  tags: string[];
  average_response_length: number | null;
  skip_rate: number | null;
  created_at: string;
}

interface QuestionStats {
  total_responses: number;
  total_skips: number;
  average_response_length: number;
  total_likes: number;
  engagement_rate: number;
}

const AdminQuestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    question_fr: '',
    question_text: '',
    category: 'religion',
    subcategory: '',
    difficulty_level: 'medium',
    question_type: 'open_ended',
    priority: 5,
    tags: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkAdminAccess();
    fetchQuestions();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        toast({
          title: 'Accès refusé',
          description: 'Vous devez être administrateur pour accéder à cette page',
          variant: 'destructive',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const { error } = await supabase.from('daily_questions').insert({
        question_text: formData.question_text,
        question_fr: formData.question_fr,
        category: formData.category,
        subcategory: formData.subcategory,
        difficulty_level: formData.difficulty_level,
        question_type: formData.question_type,
        priority: formData.priority,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_active: true,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: '✅ Question créée !',
        description: 'La question a été ajoutée avec succès',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la question',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const { error } = await supabase
        .from('daily_questions')
        .update({
          question_text: formData.question_text,
          question_fr: formData.question_fr,
          category: formData.category,
          subcategory: formData.subcategory,
          difficulty_level: formData.difficulty_level,
          question_type: formData.question_type,
          priority: formData.priority,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        })
        .eq('id', editingQuestion.id);

      if (error) throw error;

      toast({
        title: '✅ Question mise à jour !',
        description: 'Les modifications ont été enregistrées',
      });

      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la question',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (questionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_questions')
        .update({ is_active: !currentStatus })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: !currentStatus ? '✅ Question activée' : '⏸️ Question désactivée',
        description: !currentStatus
          ? 'La question est maintenant active'
          : 'La question a été désactivée',
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error toggling question status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      return;
    }

    try {
      const { error } = await supabase.from('daily_questions').delete().eq('id', questionId);

      if (error) throw error;

      toast({
        title: '🗑️ Question supprimée',
        description: 'La question a été supprimée avec succès',
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la question',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question_fr: question.question_fr,
      question_text: question.question_text,
      category: question.category,
      subcategory: question.subcategory || '',
      difficulty_level: question.difficulty_level || 'medium',
      question_type: question.question_type,
      priority: question.priority,
      tags: question.tags?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      question_fr: '',
      question_text: '',
      category: 'religion',
      subcategory: '',
      difficulty_level: 'medium',
      question_type: 'open_ended',
      priority: 5,
      tags: '',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      religion: 'bg-emerald-100 text-emerald-800',
      family: 'bg-purple-100 text-purple-800',
      values: 'bg-blue-100 text-blue-800',
      lifestyle: 'bg-pink-100 text-pink-800',
      goals: 'bg-orange-100 text-orange-800',
      relationship: 'bg-rose-100 text-rose-800',
      personality: 'bg-cyan-100 text-cyan-800',
      finance: 'bg-green-100 text-green-800',
      culture: 'bg-indigo-100 text-indigo-800',
      fun: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch =
      q.question_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: questions.length,
    active: questions.filter((q) => q.is_active).length,
    inactive: questions.filter((q) => !q.is_active).length,
    avgUsage: Math.round(
      questions.reduce((sum, q) => sum + q.used_count, 0) / questions.length || 0
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 flex items-center justify-center">
        <StandardLoadingState message="Chargement du tableau de bord..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Gestion des Questions
              </h1>
              <p className="text-gray-600">
                Dashboard administrateur pour gérer les questions quotidiennes
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="bg-emerald hover:bg-emerald-dark"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Modifier la question' : 'Créer une nouvelle question'}
                  </DialogTitle>
                  <DialogDescription>
                    Remplissez tous les champs pour {editingQuestion ? 'modifier' : 'créer'}{' '}
                    une question
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="question_fr">Question (Français) *</Label>
                    <Textarea
                      id="question_fr"
                      value={formData.question_fr}
                      onChange={(e) =>
                        setFormData({ ...formData, question_fr: e.target.value })
                      }
                      placeholder="Ex: À quoi ressemble votre routine de prière quotidienne ?"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question_text">Question (English) *</Label>
                    <Textarea
                      id="question_text"
                      value={formData.question_text}
                      onChange={(e) =>
                        setFormData({ ...formData, question_text: e.target.value })
                      }
                      placeholder="Ex: What does your daily prayer routine look like?"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="religion">Religion</SelectItem>
                          <SelectItem value="family">Famille</SelectItem>
                          <SelectItem value="values">Valeurs</SelectItem>
                          <SelectItem value="lifestyle">Style de vie</SelectItem>
                          <SelectItem value="goals">Objectifs</SelectItem>
                          <SelectItem value="relationship">Relations</SelectItem>
                          <SelectItem value="personality">Personnalité</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="culture">Culture</SelectItem>
                          <SelectItem value="fun">Détente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty_level">Niveau</Label>
                      <Select
                        value={formData.difficulty_level}
                        onValueChange={(value) =>
                          setFormData({ ...formData, difficulty_level: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Facile</SelectItem>
                          <SelectItem value="medium">Moyen</SelectItem>
                          <SelectItem value="deep">Profond</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="question_type">Type</Label>
                      <Select
                        value={formData.question_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, question_type: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open_ended">Question ouverte</SelectItem>
                          <SelectItem value="choice">Choix multiples</SelectItem>
                          <SelectItem value="scale">Échelle (1-10)</SelectItem>
                          <SelectItem value="yes_no">Oui/Non</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priorité (1-10)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({ ...formData, priority: parseInt(e.target.value) })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Sous-catégorie</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({ ...formData, subcategory: e.target.value })
                      }
                      placeholder="Ex: prayer, parenting, career"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Ex: prayer, routine, practice"
                      className="mt-1"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
                    className="bg-emerald hover:bg-emerald-dark"
                  >
                    {editingQuestion ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <MessageCircleQuestion className="h-8 w-8 text-emerald" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Actives</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactives</p>
                    <p className="text-3xl font-bold text-gray-400">{stats.inactive}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilisation Moy.</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.avgUsage}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par question ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="religion">Religion</SelectItem>
                <SelectItem value="family">Famille</SelectItem>
                <SelectItem value="values">Valeurs</SelectItem>
                <SelectItem value="lifestyle">Style de vie</SelectItem>
                <SelectItem value="goals">Objectifs</SelectItem>
                <SelectItem value="relationship">Relations</SelectItem>
                <SelectItem value="personality">Personnalité</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="fun">Détente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Questions ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-md">
                        <div className="font-medium">{question.question_fr}</div>
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {question.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(question.category)}>
                          {question.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.difficulty_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{question.priority}</span>/10
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{question.used_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(question.id, question.is_active)
                          }
                        >
                          {question.is_active ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircleQuestion className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Aucune question trouvée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuestions;
