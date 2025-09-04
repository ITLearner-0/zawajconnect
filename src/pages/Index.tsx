import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IslamicValues from "@/components/IslamicValues";
import ProcessSection from "@/components/ProcessSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import PrayerTimes from "@/components/PrayerTimes";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <IslamicValues />
      <ProcessSection />
      <CompatibilitySection />
      <section className="py-16 px-4 bg-gradient-to-br from-emerald/5 via-cream/20 to-sage/10">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Horaires de Prière du Jour
              </h2>
              <p className="text-muted-foreground">
                Restez connecté à votre foi pendant votre recherche du partenaire idéal
              </p>
            </div>
            <div className="animate-slide-up">
              <PrayerTimes />
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;