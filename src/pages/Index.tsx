import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IslamicValues from "@/components/IslamicValues";
import ProcessSection from "@/components/ProcessSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <IslamicValues />
      <ProcessSection />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;