import Hero from "@/components/Hero";
import IslamicValues from "@/components/IslamicValues";
import ProcessSection from "@/components/ProcessSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import PrayerTimes from "@/components/PrayerTimes";
import QiblaDirection from "@/components/QiblaDirection";
import IslamicCalendar from "@/components/IslamicCalendar";
import IslamicReminders from "@/components/IslamicReminders";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <IslamicValues />
      <ProcessSection />
      <CompatibilitySection />
      <section className="py-12 px-4 bg-background border-y border-border">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Outils Islamiques du Quotidien
              </h2>
              <p className="text-muted-foreground">
                Restez connecté à votre foi pendant votre recherche du partenaire idéal
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <PrayerTimes />
              </div>
              <div>
                <QiblaDirection />
              </div>
              <div>
                <IslamicCalendar />
              </div>
            </div>
          </div>
        </div>
      </section>
      <IslamicReminders />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;