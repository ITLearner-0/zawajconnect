
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import DemoSection from "@/components/home/DemoSection";
import ResourcesSection from "@/components/home/ResourcesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import Footer from "@/components/home/Footer";
import Divider from "@/components/home/Divider";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-200 to-rose-100 dark:from-rose-900 dark:via-rose-800 dark:to-pink-900 text-foreground">
      <HeroSection />

      <main className="relative bg-gradient-to-b from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950">
        <FeaturesSection />

        <Divider />

        <DemoSection />

        <Divider variant="pink" />

        <ResourcesSection />

        <Divider />

        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
