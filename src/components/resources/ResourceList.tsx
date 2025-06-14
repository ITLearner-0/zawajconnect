
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookHeart, MessageSquare, Scale, HeartHandshake, Home } from 'lucide-react';
import { resourceCategories, islamicResources, getResourcesByCategory } from '@/data/islamicResources';
import ResourceCard from './ResourceCard';
import ResourcesHeader from './ResourcesHeader';

const iconMap: Record<string, React.ReactNode> = {
  "book-heart": <BookHeart className="h-5 w-5" />,
  "message-square": <MessageSquare className="h-5 w-5" />,
  "scale": <Scale className="h-5 w-5" />,
  "heart-handshake": <HeartHandshake className="h-5 w-5" />,
  "home": <Home className="h-5 w-5" />
};

const ResourceList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
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

export default ResourceList;
