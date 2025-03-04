
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { resourceCategories, islamicResources, getResourcesByCategory, getResourceById } from '@/data/islamicResources';
import { IslamicResource } from '@/types/resources';
import { BookHeart, MessageSquare, Scale, HeartHandshake, Home, Calendar, Clock, Tags, User, Bookmark, ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const iconMap: Record<string, React.ReactNode> = {
  "book-heart": <BookHeart className="h-5 w-5" />,
  "message-square": <MessageSquare className="h-5 w-5" />,
  "scale": <Scale className="h-5 w-5" />,
  "heart-handshake": <HeartHandshake className="h-5 w-5" />,
  "home": <Home className="h-5 w-5" />
};

const Resources: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // If resourceId is provided, show single resource view
  if (resourceId) {
    const resource = getResourceById(resourceId);
    
    if (!resource) {
      return (
        <div className="container mx-auto py-12 px-4">
          <Card>
            <CardContent className="pt-6">
              <p>Resource not found.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/resources')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to resources
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Button variant="outline" className="mb-6" onClick={() => navigate('/resources')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to resources
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{
                resourceCategories.find(c => c.id === resource.category)?.name || 'Uncategorized'
              }</Badge>
              <Badge variant="secondary">{resource.contentType}</Badge>
            </div>
            <CardTitle className="text-3xl">{resource.title}</CardTitle>
            <CardDescription className="text-lg">{resource.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
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
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-line">{resource.content}</p>
              </div>
            ) : resource.url ? (
              <div className="my-6">
                <Button variant="outline" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    View Resource <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : null}
            
            <Separator className="my-6" />
            
            <div className="flex flex-wrap gap-2 mt-4">
              {resource.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Resource listing view
  const filteredResources = activeCategory === "all" 
    ? islamicResources 
    : getResourcesByCategory(activeCategory);
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Islamic Marriage Resources</h1>
      <p className="text-muted-foreground mb-8">
        Guides, articles, and resources to help you prepare for marriage in accordance with Islamic principles
      </p>
      
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          {resourceCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
              {iconMap[category.icon]}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {islamicResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </TabsContent>
        
        {resourceCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getResourcesByCategory(category.id).map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const ResourceCard: React.FC<{ resource: IslamicResource }> = ({ resource }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">
            {resourceCategories.find(c => c.id === resource.category)?.name || 'Uncategorized'}
          </Badge>
          <Badge variant="secondary">{resource.contentType}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
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
        <Button asChild className="w-full">
          <Link to={`/resources/${resource.id}`}>
            Read More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Resources;
