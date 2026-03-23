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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <ResourcesHeader />

      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif" style={{ color: 'var(--color-text-primary)' }}>
            Centre de Ressources Islamiques
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Ressources complètes pour un mariage islamique réussi : articles, guides pratiques et
            réponses à vos questions
          </p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <TabsTrigger
              value="articles"
            >
              Articles & Livres
            </TabsTrigger>
            <TabsTrigger
              value="guides"
            >
              Guides Pratiques
            </TabsTrigger>
            <TabsTrigger
              value="faq"
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
