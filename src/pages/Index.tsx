
import React, { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTranslation } from "react-i18next";

// Lazy load components to improve initial load time
const EnhancedHeroSection = React.lazy(() => import("@/components/home/EnhancedHeroSection"));
const FeaturesSection = React.lazy(() => import("@/components/home/FeaturesSection"));
const DemoSection = React.lazy(() => import("@/components/home/DemoSection"));
const ResourcesSection = React.lazy(() => import("@/components/home/ResourcesSection"));
const EnhancedTestimonialsSection = React.lazy(() => import("@/components/home/EnhancedTestimonialsSection"));
const TrustBadges = React.lazy(() => import("@/components/home/TrustBadges"));
const Footer = React.lazy(() => import("@/components/home/Footer"));
const Divider = React.lazy(() => import("@/components/home/Divider"));
const SectionTransition = React.lazy(() => import("@/components/home/SectionTransition"));
const PerformanceMonitor = React.lazy(() => import("@/components/ui/PerformanceMonitor"));
const PerformanceWidget = React.lazy(() => import("@/components/monitoring/PerformanceWidget"));

const Index = () => {
  const { t } = useTranslation();
  
  console.log("Index page rendering");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-200 to-rose-100 dark:from-rose-900 dark:via-rose-800 dark:to-pink-900 text-foreground">
      <Suspense fallback={<LoadingSpinner size="lg" text="Chargement de la page..." centered />}>
        <EnhancedHeroSection />
      </Suspense>

      <main className="relative bg-gradient-to-b from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950">
        {/* Trust Badges Section */}
        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <SectionTransition id="trust" delay={100}>
            <section className="py-16 md:py-20 px-4">
              <div className="max-w-7xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-12 text-rose-800 dark:text-rose-200">
                  {t('home.trustBadges.title', 'Faites-nous confiance')}
                </h3>
                <TrustBadges />
              </div>
            </section>
          </SectionTransition>
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <Divider />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <SectionTransition id="features" delay={200}>
            <FeaturesSection />
          </SectionTransition>
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <Divider />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <SectionTransition id="demo" delay={300}>
            <DemoSection />
          </SectionTransition>
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <Divider variant="pink" />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <SectionTransition id="resources" delay={400}>
            <ResourcesSection />
          </SectionTransition>
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <Divider />
        </Suspense>

        <Suspense fallback={<LoadingSpinner size="md" centered />}>
          <SectionTransition id="testimonials" delay={500}>
            <EnhancedTestimonialsSection />
          </SectionTransition>
        </Suspense>
      </main>

      <Suspense fallback={<LoadingSpinner size="md" centered />}>
        <Footer />
      </Suspense>
      
      <Suspense fallback={null}>
        <PerformanceMonitor />
        <PerformanceWidget />
      </Suspense>
    </div>
  );
};

export default Index;
