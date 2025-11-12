import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Clock, User, Star, BookOpen, Heart, Users, Shield } from 'lucide-react';
import { IslamicResource } from '@/types/resources';

interface CourtshipGuidesProps {
  guides: IslamicResource[];
}

const CourtshipGuides: React.FC<CourtshipGuidesProps> = ({ guides }) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Heart className="h-4 w-4" />;
      case 'intermediate':
        return <Users className="h-4 w-4" />;
      case 'advanced':
        return <Shield className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-rose-800 dark:text-rose-200 mb-4">
          Guides de Rencontre Islamique
        </h2>
        <p className="text-rose-600 dark:text-rose-300 max-w-2xl mx-auto">
          Guides pratiques pour une approche islamique de la rencontre et des fiançailles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Card
            key={guide.id}
            className="group h-full flex flex-col bg-white dark:bg-rose-900/50 border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-3">
                <Badge
                  className={`${getDifficultyColor(guide.difficulty)} font-medium flex items-center gap-1`}
                >
                  {getDifficultyIcon(guide.difficulty)}
                  {guide.difficulty === 'beginner' && 'Débutant'}
                  {guide.difficulty === 'intermediate' && 'Intermédiaire'}
                  {guide.difficulty === 'advanced' && 'Avancé'}
                  {!guide.difficulty && 'Guide'}
                </Badge>
                {guide.readingTime && (
                  <Badge
                    variant="outline"
                    className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {guide.readingTime} min
                  </Badge>
                )}
              </div>

              <CardTitle className="line-clamp-2 text-xl font-bold text-rose-800 dark:text-rose-200 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors duration-300">
                {guide.title}
              </CardTitle>

              <CardDescription className="line-clamp-3 text-rose-600 dark:text-rose-300 leading-relaxed">
                {guide.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow space-y-4">
              {/* Progress bar for guides with steps */}
              {guide.contentType === 'guide' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-rose-600 dark:text-rose-300">Progression</span>
                    <span className="text-rose-500 dark:text-rose-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              )}

              {/* Author and metadata */}
              <div className="flex items-center justify-between text-sm text-rose-500 dark:text-rose-400">
                {guide.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{guide.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-current" />
                  <span>4.8</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {guide.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 text-rose-700 dark:text-rose-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Link
                  to={`/resources/${guide.id}`}
                  className="flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Commencer le Guide
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourtshipGuides;
