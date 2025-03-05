
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import FeaturedResources from "@/components/resources/FeaturedResources";
import DemoLink from "@/components/demo/DemoLink";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Star, Users, Shield, BookOpen, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";

const Index = () => {
  return (
    <div className="min-h-screen bg-islamic-solidGreen dark:bg-islamic-darkGreen">
      <header className="bg-gradient-to-r from-islamic-teal to-islamic-teal/90 text-white py-16 px-4 text-center relative overflow-hidden dark:from-islamic-darkTeal dark:to-islamic-darkTeal/90">
        {/* Controls positioned in top right corner */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <AccessibilityControls />
          <ThemeToggle />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-white dark:text-white">Nikah Connect</h1>
          <p className="text-xl mb-8 text-white dark:text-white">A marriage app built on Islamic values</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-islamic-brightGold hover:bg-islamic-brightGold/90 text-islamic-burgundy font-medium dark:bg-islamic-darkBrightGold dark:hover:bg-islamic-darkBrightGold/90 dark:text-black">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white bg-white/80 text-islamic-burgundy hover:bg-white/90 hover:text-islamic-burgundy font-medium dark:bg-white/90 dark:border-white dark:text-islamic-burgundy dark:hover:bg-white">
              <Link to="/nearby">Browse Matches</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2 text-islamic-teal font-serif dark:text-white">
            Find a spouse the halal way
          </h2>
          <p className="text-center text-islamic-burgundy/80 mb-10 max-w-3xl mx-auto dark:text-white dark:text-opacity-90">
            Our platform is designed with Islamic principles at its core, ensuring a respectful and meaningful journey to finding your life partner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <IslamicPattern variant="card" color="teal" className="transform transition-transform hover:scale-105 dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/50">
              <CardContent className="pt-6">
                <div className="bg-islamic-teal/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto dark:bg-islamic-darkTeal/30">
                  <Shield className="h-6 w-6 text-islamic-teal dark:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-islamic-teal dark:text-islamic-darkBrightGold">Wali Supervised</h3>
                <p className="text-center text-gray-600 dark:text-white">
                  Our platform ensures Wali supervision for all female users,
                  respecting Islamic guidelines for marriage.
                </p>
              </CardContent>
            </IslamicPattern>
            
            <IslamicPattern variant="card" color="gold" className="transform transition-transform hover:scale-105 dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/50">
              <CardContent className="pt-6">
                <div className="bg-islamic-brightGold/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto dark:bg-islamic-darkBrightGold/30">
                  <Users className="h-6 w-6 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-islamic-teal dark:text-islamic-darkBrightGold">Verified Profiles</h3>
                <p className="text-center text-gray-600 dark:text-white">
                  Every profile is verified to ensure you're meeting genuine
                  individuals looking for marriage.
                </p>
              </CardContent>
            </IslamicPattern>
            
            <IslamicPattern variant="card" color="teal" className="transform transition-transform hover:scale-105 dark:bg-islamic-darkCard/80 dark:border-islamic-darkBrightGold/50">
              <CardContent className="pt-6">
                <div className="bg-islamic-burgundy/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto dark:bg-islamic-darkBurgundy/30">
                  <Heart className="h-6 w-6 text-islamic-burgundy dark:text-islamic-darkBurgundy" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-islamic-teal dark:text-islamic-darkBrightGold">
                  Compatibility Testing
                </h3>
                <p className="text-center text-gray-600 dark:text-white">
                  Our unique compatibility system helps match you with potential
                  spouses who share your values and life goals.
                </p>
              </CardContent>
            </IslamicPattern>
          </div>
        </section>

        <IslamicPattern variant="divider" color="gold" />

        {/* Demo Link */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-islamic-teal font-serif dark:text-white">
            Try Our Features
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-islamic-darkCard/80 dark:border dark:border-islamic-darkBrightGold/40 rounded-xl shadow-md p-6">
              <DemoLink className="mt-4" />
              <p className="text-center text-muted-foreground mt-4 dark:text-white dark:text-opacity-80">
                Experience our messaging and video chat features with dummy profiles
              </p>
            </div>
          </div>
        </section>

        <IslamicPattern variant="divider" color="teal" />

        {/* Resources Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2 text-islamic-teal font-serif dark:text-white">
            Islamic Marriage Resources
          </h2>
          <p className="text-center text-islamic-burgundy/80 mb-10 max-w-3xl mx-auto dark:text-white dark:text-opacity-90">
            Explore our curated collection of resources to help you prepare for a successful Islamic marriage.
          </p>
          <FeaturedResources />
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-islamic-teal text-islamic-teal hover:bg-islamic-teal/10 dark:border-islamic-darkBrightGold dark:text-islamic-darkBrightGold dark:hover:bg-islamic-darkBrightGold/20">
              <Link to="/resources">
                <BookOpen className="mr-2 h-4 w-4" />
                View All Resources
              </Link>
            </Button>
          </div>
        </section>

        <IslamicPattern variant="divider" color="gold" />

        {/* Testimonials or Stats */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-islamic-teal font-serif dark:text-white">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-islamic-darkCard/80 dark:border dark:border-islamic-darkBrightGold/40 rounded-xl shadow-md p-6">
              <div className="flex justify-center mb-4">
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
              </div>
              <blockquote className="italic text-gray-700 dark:text-white">
                "Alhamdulillah, I found my husband through this app. The wali
                supervision feature gave my family peace of mind."
              </blockquote>
              <p className="mt-4 font-medium text-islamic-teal dark:text-islamic-darkBrightGold">Fatima S., Chicago</p>
            </div>
            <div className="bg-white dark:bg-islamic-darkCard/80 dark:border dark:border-islamic-darkBrightGold/40 rounded-xl shadow-md p-6">
              <div className="flex justify-center mb-4">
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
                <Star className="h-5 w-5 text-islamic-brightGold dark:text-islamic-darkBrightGold" />
              </div>
              <blockquote className="italic text-gray-700 dark:text-white">
                "This platform helped me find someone who truly shares my
                values and vision for an Islamic household."
              </blockquote>
              <p className="mt-4 font-medium text-islamic-teal dark:text-islamic-darkBrightGold">Ahmed K., London</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-islamic-teal/95 text-white py-12 px-4 relative overflow-hidden dark:bg-islamic-darkTeal">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-islamic-cream/90 dark:text-white">
            &copy; {new Date().getFullYear()} Islamic Marriage App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
