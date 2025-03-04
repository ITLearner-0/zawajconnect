
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import FeaturedResources from "@/components/resources/FeaturedResources";
import DemoLink from "@/components/demo/DemoLink";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Star, Users, Shield, BookOpen, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-islamic-cream to-background">
      <header className="bg-gradient-to-r from-islamic-teal to-islamic-teal/90 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">Finding Your Muslim Spouse</h1>
          <p className="text-xl mb-8 text-islamic-cream">A marriage app built on Islamic values</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-islamic-gold hover:bg-islamic-gold/90 text-islamic-burgundy font-medium">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link to="/nearby">Browse Matches</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2 text-islamic-teal font-serif">
            Find a spouse the halal way
          </h2>
          <p className="text-center text-islamic-burgundy/80 mb-10 max-w-3xl mx-auto">
            Our platform is designed with Islamic principles at its core, ensuring a respectful and meaningful journey to finding your life partner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <IslamicPattern variant="card" color="teal" className="transform transition-transform hover:scale-105">
              <CardContent className="pt-6">
                <div className="bg-islamic-teal/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-islamic-teal" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-islamic-teal">Wali Supervised</h3>
                <p className="text-center text-gray-600">
                  Our platform ensures Wali supervision for all female users,
                  respecting Islamic guidelines for marriage.
                </p>
              </CardContent>
            </IslamicPattern>
            <IslamicPattern variant="card" color="teal" className="transform transition-transform hover:scale-105">
              <CardContent className="pt-6">
                <div className="bg-islamic-gold/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-islamic-gold" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-islamic-teal">Verified Profiles</h3>
                <p className="text-center text-gray-600">
                  Every profile is verified to ensure you're meeting genuine
                  individuals looking for marriage.
                </p>
              </CardContent>
            </IslamicPattern>
            <IslamicPattern variant="card" color="teal" className="transform transition-transform hover:scale-105">
              <CardContent className="pt-6">
                <div className="bg-islamic-burgundy/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-6 w-6 text-islamic-burgundy" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center text-islamic-teal">
                  Compatibility Testing
                </h3>
                <p className="text-center text-gray-600">
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
          <h2 className="text-3xl font-bold text-center mb-10 text-islamic-teal font-serif">
            Try Our Features
          </h2>
          <div className="max-w-2xl mx-auto">
            <IslamicPattern variant="gradient" className="p-6">
              <DemoLink className="mt-4" />
              <p className="text-center text-muted-foreground mt-4">
                Experience our messaging and video chat features with dummy profiles
              </p>
            </IslamicPattern>
          </div>
        </section>

        <IslamicPattern variant="divider" color="teal" />

        {/* Resources Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2 text-islamic-teal font-serif">
            Islamic Marriage Resources
          </h2>
          <p className="text-center text-islamic-burgundy/80 mb-10 max-w-3xl mx-auto">
            Explore our curated collection of resources to help you prepare for a successful Islamic marriage.
          </p>
          <FeaturedResources />
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-islamic-teal text-islamic-teal hover:bg-islamic-teal/10">
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
          <h2 className="text-3xl font-bold text-center mb-10 text-islamic-teal font-serif">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <IslamicPattern variant="card" color="gold" className="bg-gradient-to-br from-white to-islamic-cream/30">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                </div>
                <blockquote className="italic text-gray-700">
                  "Alhamdulillah, I found my husband through this app. The wali
                  supervision feature gave my family peace of mind."
                </blockquote>
                <p className="mt-4 font-medium text-islamic-teal">Fatima S., Chicago</p>
              </CardContent>
            </IslamicPattern>
            <IslamicPattern variant="card" color="gold" className="bg-gradient-to-br from-white to-islamic-cream/30">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                  <Star className="h-5 w-5 text-islamic-gold" />
                </div>
                <blockquote className="italic text-gray-700">
                  "This platform helped me find someone who truly shares my
                  values and vision for an Islamic household."
                </blockquote>
                <p className="mt-4 font-medium text-islamic-teal">Ahmed K., London</p>
              </CardContent>
            </IslamicPattern>
          </div>
        </section>
      </main>

      <footer className="bg-islamic-teal/95 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/islamic-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-islamic-cream/90">
            &copy; {new Date().getFullYear()} Islamic Marriage App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
