import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, BookOpen, Video, FileText, Book } from 'lucide-react';
import { getFeaturedResources } from '@/data/islamicResources';
import { resourceCategories } from '@/data/islamicResources';

const FeaturedResources: React.FC = () => {
  const featuredResources = getFeaturedResources();

  if (featuredResources.length === 0) {
    return null;
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'book':
        return <Book className="h-4 w-4" />;
      case 'guide':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuredResources.map((resource) => (
        <Card
          key={resource.id}
          className="group h-full flex flex-col bg-white dark:bg-rose-900/50 border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden"
        >
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start mb-3">
              <Badge
                variant="outline"
                className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30 font-medium"
              >
                {resourceCategories.find((c) => c.id === resource.category)?.name ||
                  'Uncategorized'}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 text-rose-700 dark:text-rose-200 border-0 flex items-center gap-1 font-medium"
              >
                {getContentIcon(resource.contentType)}
                {resource.contentType}
              </Badge>
            </div>
            <CardTitle className="line-clamp-2 text-xl font-bold text-rose-800 dark:text-rose-200 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors duration-300">
              {resource.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 text-rose-600 dark:text-rose-300 leading-relaxed">
              {resource.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow pt-0">
            <div className="flex items-center justify-between text-sm text-rose-500 dark:text-rose-400">
              {resource.author && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{resource.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0 pb-6">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              <Link
                to={`/resources/${resource.id}`}
                className="flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Lire Plus
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FeaturedResources;
