
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, ChevronLeft, ExternalLink } from 'lucide-react';
import { IslamicResource } from '@/types/resources';
import { resourceCategories } from '@/data/islamicResources';
import ResourcesHeader from '@/components/resources/ResourcesHeader';

interface ResourceDetailProps {
  resource: IslamicResource | undefined;
}

const ResourceDetail: React.FC<ResourceDetailProps> = ({ resource }) => {
  const navigate = useNavigate();

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <ResourcesHeader />
        <div className="container mx-auto py-12 px-4">
          <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
            <CardContent className="pt-6">
              <p className="text-rose-700 dark:text-rose-300">Ressource non trouvée.</p>
              <Button variant="outline" className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-800" onClick={() => navigate('/resources')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux ressources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
      <ResourcesHeader />
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Button variant="outline" className="mb-6 border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-800" onClick={() => navigate('/resources')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux ressources
        </Button>
        
        <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30">
                {resourceCategories.find(c => c.id === resource.category)?.name || 'Non catégorisé'}
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 text-rose-700 dark:text-rose-200">{resource.contentType}</Badge>
            </div>
            <CardTitle className="text-3xl text-rose-800 dark:text-rose-200">{resource.title}</CardTitle>
            <CardDescription className="text-lg text-rose-600 dark:text-rose-300">{resource.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-rose-500 dark:text-rose-400 mb-6">
              {resource.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{resource.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {resource.imageUrl && (
              <div className="rounded-md overflow-hidden mb-6">
                <img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            {resource.content ? (
              <div className="prose prose-slate max-w-none text-rose-700 dark:text-rose-300">
                <p className="whitespace-pre-line">{resource.content}</p>
              </div>
            ) : resource.url ? (
              <div className="my-6">
                <Button variant="outline" asChild className="border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-800">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    Voir la Ressource <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : null}
            
            <Separator className="my-6 bg-rose-200 dark:bg-rose-700" />
            
            <div className="flex flex-wrap gap-2 mt-4">
              {resource.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 text-rose-700 dark:text-rose-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourceDetail;
