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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar } from 'lucide-react';
import { IslamicResource } from '@/types/resources';
import { resourceCategories } from '@/data/islamicResources';

interface ResourceCardProps {
  resource: IslamicResource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <Card className="h-full flex flex-col bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant="outline"
            className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30"
          >
            {resourceCategories.find((c) => c.id === resource.category)?.name || 'Non catégorisé'}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 text-rose-700 dark:text-rose-200"
          >
            {resource.contentType}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-rose-800 dark:text-rose-200">
          {resource.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-rose-600 dark:text-rose-300">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-sm text-rose-500 dark:text-rose-400 mb-4">
          {resource.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="truncate">{resource.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="h-4 w-4" />
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
        >
          <Link to={`/resources/${resource.id}`}>Lire Plus</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
