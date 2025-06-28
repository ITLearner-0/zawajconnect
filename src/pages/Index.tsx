
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import EnhancedHeroSection from '@/components/home/EnhancedHeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ResourcesSection from '@/components/home/ResourcesSection';
import Footer from '@/components/home/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement..." centered />;
  }

  // Si l'utilisateur est connecté, afficher la navigation et une version simplifiée de la page
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-primary">
              Bienvenue sur Nikah Connect
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vous êtes maintenant connecté(e). Utilisez la navigation ci-dessus pour accéder aux différentes fonctionnalités.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Mon Profil</h3>
                <p className="text-muted-foreground">
                  Complétez et gérez votre profil personnel
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Compatibilité</h3>
                <p className="text-muted-foreground">
                  Découvrez vos compatibilités basées sur les valeurs islamiques
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="text-xl font-semibold mb-3">Messages</h3>
                <p className="text-muted-foreground">
                  Communiquez de manière respectueuse et supervisée
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher la page d'accueil normale
  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <ResourcesSection />
      <Footer />
    </div>
  );
};

export default Index;
