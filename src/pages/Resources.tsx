import React from 'react';
import { useParams } from 'react-router-dom';
import { getResourceById } from '@/data/islamicResources';
import ResourceDetail from '@/components/resources/ResourceDetail';
import ResourceList from '@/components/resources/ResourceList';
import FaqSection from '@/components/resources/FaqSection';
import CourtshipGuides from '@/components/resources/CourtshipGuides';
import { matrimonialFaqs, courtshipGuides } from '@/data/islamicResourcesExtended';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourcesHeader from '@/components/resources/ResourcesHeader';

const Resources: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();

  // If resourceId is provided, show single resource view
  if (resourceId) {
    const resource = getResourceById(resourceId);
    return <ResourceDetail resource={resource} />;
  }

  // Enhanced resource center view with tabs
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
      <ResourcesHeader />

      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-200 font-serif">
            Centre de Ressources Islamiques
          </h1>
          <p className="text-xl text-rose-600 dark:text-rose-300 max-w-3xl mx-auto">
            Ressources complètes pour un mariage islamique réussi : articles, guides pratiques et
            réponses à vos questions
          </p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border border-rose-200 dark:border-rose-700">
            <TabsTrigger
              value="articles"
              className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200"
            >
              Articles & Livres
            </TabsTrigger>
            <TabsTrigger
              value="guides"
              className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200"
            >
              Guides Pratiques
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 dark:data-[state=active]:bg-rose-800 dark:data-[state=active]:text-rose-200"
            >
              FAQ Fiqh
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <ResourceList />
          </TabsContent>

          <TabsContent value="guides">
            <CourtshipGuides guides={courtshipGuides} />
          </TabsContent>

          <TabsContent value="faq">
            <FaqSection faqs={matrimonialFaqs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
