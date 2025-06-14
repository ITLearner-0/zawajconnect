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
import ResourcesHeader from '@/components/resources/ResourcesHeader';

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
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
          <ResourcesHeader />
          <div className="container mx-auto py-12 px-4">
            <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
              <CardContent className="pt-6">
                <p className="text-rose-700 dark:text-rose-300">Resource not found.</p>
                <Button variant="outline" className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-800" onClick={() => navigate('/resources')}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to resources
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
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to resources
          </Button>
          
          <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30">{
                  resourceCategories.find(c => c.id === resource.category)?.name || 'Uncategorized'
                }</Badge>
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
                      View Resource <ExternalLink className="ml-2 h-4 w-4" />
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
  }
  
  // Resource listing view
  const filteredResources = activeCategory === "all" 
    ? islamicResources 
    : getResourcesByCategory(activeCategory);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
      <ResourcesHeader />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2 text-rose-800 dark:text-rose-200">Islamic Marriage Resources</h1>
        <p className="text-rose-600 dark:text-rose-300 mb-8">
          Guides, articles, and resources to help you prepare for marriage in accordance with Islamic principles
        </p>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="mb-4 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border border-rose-200 dark:border-rose-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200">All Resources</TabsTrigger>
            {resourceCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200">
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
    </div>
  );
};

const ResourceCard: React.FC<{ resource: IslamicResource }> = ({ resource }) => {
  return (
    <Card className="h-full flex flex-col bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border border-rose-200 dark:border-rose-700 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="border-rose-300 text-rose-600 bg-rose-50 dark:border-rose-600 dark:text-rose-300 dark:bg-rose-900/30">
            {resourceCategories.find(c => c.id === resource.category)?.name || 'Uncategorized'}
          </Badge>
          <Badge variant="secondary" className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 text-rose-700 dark:text-rose-200">{resource.contentType}</Badge>
        </div>
        <CardTitle className="line-clamp-2 text-rose-800 dark:text-rose-200">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-rose-600 dark:text-rose-300">{resource.description}</CardHeader>
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
        <Button asChild className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white">
          <Link to={`/resources/${resource.id}`}>
            Read More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Resources;
