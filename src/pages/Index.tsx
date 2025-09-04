import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IslamicValues from "@/components/IslamicValues";
import ProcessSection from "@/components/ProcessSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import IslamicQuotes from "@/components/IslamicQuotes";
import SuccessStories from "@/components/SuccessStories";
import PrayerTimes from "@/components/PrayerTimes";
import QiblaDirection from "@/components/QiblaDirection";
import IslamicCalendar from "@/components/IslamicCalendar";
import Testimonials from "@/components/Testimonials";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <IslamicValues />
      <ProcessSection />
      <CompatibilitySection />
      <IslamicQuotes />
      <SuccessStories />
      <section className="py-16 px-4 bg-gradient-to-br from-emerald/5 via-cream/20 to-sage/10">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Outils Islamiques du Quotidien
              </h2>
              <p className="text-muted-foreground">
                Restez connecté à votre foi pendant votre recherche du partenaire idéal
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
              <div className="animate-fade-in">
                <PrayerTimes />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <QiblaDirection />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <IslamicCalendar />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;