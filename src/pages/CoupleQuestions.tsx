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
      <div className="container mx-auto py-6 px-4 space-y-6 max-w-3xl" style={{ backgroundColor: 'var(--color-bg-page)' }}>
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
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-2" style={{ backgroundColor: 'var(--color-primary)' }}>
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Questions du Couple
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="max-w-xl mx-auto">
          100 questions essentielles avant le mariage. Répondez chacun de votre côté,
          les réponses ne se révèlent que quand les deux ont répondu.
        </p>
      </div>

      {/* Overall Progress */}
      <Card style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Progression globale</span>
            <Badge variant="secondary" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              {totalAnswered}/100 questions
            </Badge>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
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
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'var(--color-bg-card)', border: '2px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[category.color]} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{category.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 mt-1" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-text-muted)' }}>{answered}/10 questions</span>
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {progress === 100 && (
                  <Badge className="mt-3" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
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
    <Card className="transition-all duration-300" style={isAnswered ? { backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-lg)' } : { backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
      <CardHeader className="cursor-pointer pb-3" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{
              backgroundColor: isAnswered ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
              color: isAnswered ? '#fff' : 'var(--color-text-muted)'
            }}>
              {isAnswered ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </div>
            <div>
              <CardTitle className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{question.question}</CardTitle>
              {isAnswered && !isActive && (
                <p className="text-sm mt-1" style={{ color: 'var(--color-primary)' }}>Votre réponse : {answer}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isAnswered && (
              <Badge variant="outline" style={{ borderColor: 'var(--color-success-border)', color: 'var(--color-success)' }}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Répondu
              </Badge>
            )}
            {isAnswered && !partnerAnswered && (
              <Badge variant="outline" style={{ borderColor: 'var(--color-warning-border)', color: 'var(--color-warning)' }}>
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
                  className="justify-start h-auto py-3 px-4 text-left"
                  style={answer === option ? { backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' } : { borderRadius: 'var(--radius-md)' }}
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
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
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
            <Card style={{ backgroundColor: 'var(--color-accent-light)', border: '1px solid var(--color-accent-border)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Réponse du partenaire :</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {question.type === 'choice' && question.options
                    ? question.options[Math.floor(Math.random() * question.options.length)]
                    : "Réponse similaire à la vôtre, masha'Allah !"}
                </p>
                <Badge className="mt-2" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
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
