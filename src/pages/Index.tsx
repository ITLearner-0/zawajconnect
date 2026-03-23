import Hero from '@/components/Hero';
import IslamicValues from '@/components/IslamicValues';
import ProcessSection from '@/components/ProcessSection';
import CompatibilitySection from '@/components/CompatibilitySection';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaDirection from '@/components/QiblaDirection';
import IslamicCalendar from '@/components/IslamicCalendar';
import IslamicReminders from '@/components/IslamicReminders';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <Hero />
      <IslamicValues />
      <ProcessSection />
      <CompatibilitySection />
      <section className="py-12 px-4" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 animate-fade-in">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Outils Islamiques du Quotidien
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
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
      <IslamicReminders />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
