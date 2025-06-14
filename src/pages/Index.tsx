
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CardContent } from "@/components/ui/card"; // Removed Card as IslamicPattern handles it
import FeaturedResources from "@/components/resources/FeaturedResources";
import DemoLink from "@/components/demo/DemoLink";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Star, Users, Shield, BookOpen, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";

const Index = () => {
  return (
    <div className="min-h-screen bg-islamic-solidGreen dark:bg-islamic-darkGreen text-foreground">
      <header className="bg-gradient-to-br from-islamic-teal to-islamic-teal/70 text-white py-20 md:py-28 px-4 text-center relative overflow-hidden dark:from-islamic-darkTeal dark:to-islamic-darkTeal/70">
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          {/* Optional: Add a subtle background pattern here if desired */}
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 z-20">
          <AccessibilityControls />
          <ThemeToggle />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif animate-title-pulse text-shadow-md dark:text-white">Nikah Connect</h1>
          <p className="text-xl md:text-2xl mb-10 text-islamic-cream/90 dark:text-islamic-darkCream/90 max-w-2xl mx-auto">
            A marriage app built on Islamic values, guiding you to a blessed union.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-islamic-gold hover:bg-islamic-brightGold text-islamic-burgundy dark:text-black font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 dark:bg-islamic-darkBrightGold dark:hover:bg-islamic-darkGold"
            >
              <Link to="/auth">Get Started Now</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-islamic-gold text-islamic-gold bg-transparent hover:bg-islamic-gold/10 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 dark:border-islamic-darkGold dark:text-islamic-darkGold dark:hover:bg-islamic-darkGold/10"
            >
              <Link to="/nearby">Browse Matches</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Features Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-islamic-teal dark:text-islamic-darkBrightGold font-serif">
            Find a Spouse the Halal Way
          </h2>
          <p className="text-center text-lg text-islamic-burgundy/80 dark:text-islamic-cream/80 mb-12 max-w-3xl mx-auto">
            Our platform is designed with Islamic principles at its core, ensuring a respectful and meaningful journey to finding your life partner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Wali Supervised", text: "Ensuring Wali supervision for female users, respecting Islamic guidelines.", color: "teal", iconColor: "text-islamic-teal dark:text-islamic-darkBrightGold" },
              { icon: Users, title: "Verified Profiles", text: "Every profile is verified, ensuring you meet genuine individuals.", color: "gold", iconColor: "text-islamic-gold dark:text-islamic-darkGold" },
              { icon: Heart, title: "Compatibility Focus", text: "Our system helps match you with partners sharing your values and goals.", color: "teal", iconColor: "text-islamic-burgundy dark:text-islamic-darkBurgundy" }
            ].map((feature, index) => (
              <IslamicPattern key={index} variant="card" color={feature.color as "teal" | "gold"} className="rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/30">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className={`bg-${feature.color === "teal" ? "islamic-teal" : "islamic-gold"}/10 dark:bg-${feature.color === "teal" ? "islamic-darkTeal" : "islamic-darkGold"}/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-islamic-teal dark:text-islamic-darkBrightGold">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-islamic-cream/80">{feature.text}</p>
                </CardContent>
              </IslamicPattern>
            ))}
          </div>
        </section>

        <IslamicPattern variant="divider" color="gold" className="my-12 md:my-16" />

        {/* Demo Link Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-islamic-teal dark:text-islamic-darkBrightGold font-serif">
            Experience Our Platform
          </h2>
          <div className="max-w-2xl mx-auto">
            <IslamicPattern variant="card" color="teal" className="rounded-xl shadow-xl dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/30">
              <CardContent className="p-6 md:p-8">
                <DemoLink className="mt-4" />
                <p className="text-center text-muted-foreground mt-6 dark:text-islamic-cream/80">
                  Try our messaging and video chat features with interactive dummy profiles.
                </p>
              </CardContent>
            </IslamicPattern>
          </div>
        </section>

        <IslamicPattern variant="divider" color="teal" className="my-12 md:my-16" />

        {/* Resources Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-islamic-teal dark:text-islamic-darkBrightGold font-serif">
            Islamic Marriage Resources
          </h2>
          <p className="text-center text-lg text-islamic-burgundy/80 dark:text-islamic-cream/80 mb-12 max-w-3xl mx-auto">
            Explore curated resources to help you prepare for a successful Islamic marriage.
          </p>
          <FeaturedResources />
          <div className="text-center mt-10">
            <Button 
              asChild 
              variant="outline" 
              className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold/10 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 dark:border-islamic-darkGold dark:text-islamic-darkGold dark:hover:bg-islamic-darkGold/10"
              size="lg"
            >
              <Link to="/resources">
                <BookOpen className="mr-2 h-5 w-5" />
                View All Resources
              </Link>
            </Button>
          </div>
        </section>

        <IslamicPattern variant="divider" color="gold" className="my-12 md:my-16" />

        {/* Testimonials Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-islamic-teal dark:text-islamic-darkBrightGold font-serif">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { quote: "Alhamdulillah, I found my husband through this app. The wali supervision feature gave my family peace of mind.", author: "Fatima S., Chicago" },
              { quote: "This platform helped me find someone who truly shares my values and vision for an Islamic household.", author: "Ahmed K., London" }
            ].map((testimonial, index) => (
              <IslamicPattern key={index} variant="card" color={index % 2 === 0 ? "teal" : "gold"} className="rounded-xl shadow-xl dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/30">
                <CardContent className="p-6 md:p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold fill-current" />
                    ))}
                  </div>
                  <blockquote className="italic text-gray-700 dark:text-islamic-cream/90 text-lg text-center">
                    "{testimonial.quote}"
                  </blockquote>
                  <p className="mt-6 font-medium text-islamic-teal dark:text-islamic-darkBrightGold text-center">&mdash; {testimonial.author}</p>
                </CardContent>
              </IslamicPattern>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-islamic-teal/90 text-white py-12 px-4 relative overflow-hidden dark:bg-islamic-darkTeal/90">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-islamic-cream/90 dark:text-islamic-darkCream/90">
            &copy; {new Date().getFullYear()} Nikah Connect. All rights reserved.
          </p>
          <p className="text-sm text-islamic-cream/70 dark:text-islamic-darkCream/70 mt-2">
            Guiding you towards a blessed and fulfilling marriage.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

