
import EnhancedHeroSection from "@/components/home/EnhancedHeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import DemoSection from "@/components/home/DemoSection";
import ResourcesSection from "@/components/home/ResourcesSection";
import EnhancedTestimonialsSection from "@/components/home/EnhancedTestimonialsSection";
import TrustBadges from "@/components/home/TrustBadges";
import Footer from "@/components/home/Footer";
import Divider from "@/components/home/Divider";
import SectionTransition from "@/components/home/SectionTransition";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-200 to-rose-100 dark:from-rose-900 dark:via-rose-800 dark:to-pink-900 text-foreground">
      <EnhancedHeroSection />

      <main className="relative bg-gradient-to-b from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950">
        {/* Trust Badges Section */}
        <SectionTransition id="trust" delay={100}>
          <section className="py-16 md:py-20 px-4">
            <div className="max-w-7xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-12 text-rose-800 dark:text-rose-200">
                Pourquoi Nous Faire Confiance ?
              </h3>
              <TrustBadges />
            </div>
          </section>
        </SectionTransition>

        <Divider />

        <SectionTransition id="features" delay={200}>
          <FeaturesSection />
        </SectionTransition>

        <Divider />

        <SectionTransition id="demo" delay={300}>
          <DemoSection />
        </SectionTransition>

        <Divider variant="pink" />

        <SectionTransition id="resources" delay={400}>
          <ResourcesSection />
        </SectionTransition>

        <Divider />

        <SectionTransition id="testimonials" delay={500}>
          <EnhancedTestimonialsSection />
        </SectionTransition>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
