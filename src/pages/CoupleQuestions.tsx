import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Wallet, Baby, Home, Moon, Users, MessageCircle, Target, Heart, Plane, Shield,
  ArrowLeft, Lock, CheckCircle2, ChevronRight, Sparkles
} from 'lucide-react';
import { categories, questions, type CoupleQuestion } from '@/data/coupleQuestions';

const iconMap: Record<string, React.ElementType> = {
  Wallet, Baby, Home, Moon, Users, MessageCircle, Target, Heart, Plane, Shield,
};

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500 to-emerald-600',
  pink: 'from-pink-500 to-pink-600',
  blue: 'from-blue-500 to-blue-600',
  amber: 'from-amber-500 to-amber-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  indigo: 'from-indigo-500 to-indigo-600',
  rose: 'from-rose-500 to-rose-600',
};

const CoupleQuestions = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const getQuestionsForCategory = (categoryId: string) =>
    questions.filter((q) => q.category === categoryId);

  const getCategoryProgress = (categoryId: string) => {
    const catQuestions = getQuestionsForCategory(categoryId);
    const answered = catQuestions.filter((q) => answers[q.id]).length;
    return Math.round((answered / catQuestions.length) * 100);
  };

  const totalAnswered = Object.keys(answers).length;
  const totalProgress = Math.round((totalAnswered / 100) * 100);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (selectedCategory) {
    const category = categories.find((c) => c.id === selectedCategory)!;
    const catQuestions = getQuestionsForCategory(selectedCategory);
    const Icon = iconMap[category.icon] || Heart;

    return (
      <div className="container mx-auto py-6 px-4 space-y-6 max-w-3xl">
        <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour aux catégories
        </Button>

        <div className={`rounded-2xl bg-gradient-to-r ${colorMap[category.color]} p-6 text-white`}>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <p className="text-white/80">{category.description}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{catQuestions.filter((q) => answers[q.id]).length}/{catQuestions.length} questions</span>
              <span>{getCategoryProgress(selectedCategory)}%</span>
            </div>
            <Progress value={getCategoryProgress(selectedCategory)} className="h-2 bg-white/30" />
          </div>
        </div>

        <div className="space-y-4">
          {catQuestions.map((q, index) => (
            <QuestionItem
              key={q.id}
              question={q}
              index={index}
              answer={answers[q.id]}
              isActive={activeQuestion === q.id}
              onToggle={() => setActiveQuestion(activeQuestion === q.id ? null : q.id)}
              onAnswer={(answer) => handleAnswer(q.id, answer)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white mb-2">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Questions du Couple
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          100 questions essentielles avant le mariage. Répondez chacun de votre côté,
          les réponses ne se révèlent que quand les deux ont répondu.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Progression globale</span>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {totalAnswered}/100 questions
            </Badge>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {totalProgress < 25 && "Commencez votre parcours de découverte mutuelle !"}
            {totalProgress >= 25 && totalProgress < 50 && "Beau début ! Continuez à explorer vos compatibilités."}
            {totalProgress >= 50 && totalProgress < 75 && "Plus de la moitié ! Vous vous connaissez de mieux en mieux."}
            {totalProgress >= 75 && totalProgress < 100 && "Presque terminé ! Vous êtes sur la bonne voie."}
            {totalProgress === 100 && "Félicitations ! Vous avez complété toutes les questions. Masha'Allah !"}
          </p>
        </CardContent>
      </Card>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Heart;
          const progress = getCategoryProgress(category.id);
          const answered = getQuestionsForCategory(category.id).filter((q) => answers[q.id]).length;

          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-300"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[category.color]} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{answered}/10 questions</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {progress === 100 && (
                  <Badge className="mt-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Complété
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const QuestionItem = ({
  question,
  index,
  answer,
  isActive,
  onToggle,
  onAnswer,
}: {
  question: CoupleQuestion;
  index: number;
  answer?: string;
  isActive: boolean;
  onToggle: () => void;
  onAnswer: (answer: string) => void;
}) => {
  const isAnswered = !!answer;
  const partnerAnswered = Math.random() > 0.5; // Mock

  return (
    <Card className={`transition-all duration-300 ${isAnswered ? 'border-emerald-300 bg-emerald-50/50' : ''}`}>
      <CardHeader className="cursor-pointer pb-3" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isAnswered ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {isAnswered ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </div>
            <div>
              <CardTitle className="text-base leading-relaxed">{question.question}</CardTitle>
              {isAnswered && !isActive && (
                <p className="text-sm text-emerald-600 mt-1">Votre réponse : {answer}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isAnswered && (
              <Badge variant="outline" className="border-emerald-300 text-emerald-600">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Répondu
              </Badge>
            )}
            {isAnswered && !partnerAnswered && (
              <Badge variant="outline" className="border-amber-300 text-amber-600">
                <Lock className="h-3 w-3 mr-1" /> En attente
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {isActive && (
        <CardContent className="pt-0 space-y-3">
          {question.type === 'choice' && question.options && (
            <div className="grid gap-2">
              {question.options.map((option) => (
                <Button
                  key={option}
                  variant={answer === option ? 'default' : 'outline'}
                  className={`justify-start h-auto py-3 px-4 text-left ${
                    answer === option ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                  }`}
                  onClick={() => onAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
          {(question.type === 'text' || question.type === 'scale') && (
            <div className="space-y-2">
              <Textarea
                placeholder="Écrivez votre réponse..."
                defaultValue={answer || ''}
                onBlur={(e) => {
                  if (e.target.value) onAnswer(e.target.value);
                }}
                className="min-h-[100px]"
              />
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={(e) => {
                  const textarea = (e.target as HTMLElement).closest('.space-y-2')?.querySelector('textarea');
                  if (textarea?.value) onAnswer(textarea.value);
                }}
              >
                Valider
              </Button>
            </div>
          )}

          {isAnswered && partnerAnswered && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Réponse du partenaire :</p>
                <p className="text-sm text-blue-700">
                  {question.type === 'choice' && question.options
                    ? question.options[Math.floor(Math.random() * question.options.length)]
                    : "Réponse similaire à la vôtre, masha'Allah !"}
                </p>
                <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-3 w-3 mr-1" /> Compatible
                </Badge>
              </CardContent>
            </Card>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CoupleQuestions;
