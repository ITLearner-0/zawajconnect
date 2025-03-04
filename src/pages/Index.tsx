
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import FeaturedResources from "@/components/resources/FeaturedResources";
import DemoLink from "@/components/demo/DemoLink";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Finding Your Muslim Spouse</h1>
        <p className="text-xl mb-8">A marriage app built on Islamic values</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/nearby">Browse Matches</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Find a spouse the halal way
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Wali Supervised</h3>
                <p>
                  Our platform ensures Wali supervision for all female users,
                  respecting Islamic guidelines for marriage.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Verified Profiles</h3>
                <p>
                  Every profile is verified to ensure you're meeting genuine
                  individuals looking for marriage.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">
                  Compatibility Testing
                </h3>
                <p>
                  Our unique compatibility system helps match you with potential
                  spouses who share your values and life goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demo Link */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Try Our Features
          </h2>
          <DemoLink className="mt-4" />
          <p className="text-center text-muted-foreground mt-4">
            Experience our messaging and video chat features with dummy profiles
          </p>
        </section>

        {/* Resources Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Islamic Marriage Resources
          </h2>
          <FeaturedResources />
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/resources">View All Resources</Link>
            </Button>
          </div>
        </section>

        {/* Testimonials or Stats */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <blockquote className="italic">
                  "Alhamdulillah, I found my husband through this app. The wali
                  supervision feature gave my family peace of mind."
                </blockquote>
                <p className="mt-4 font-medium">Fatima S., Chicago</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <blockquote className="italic">
                  "This platform helped me find someone who truly shares my
                  values and vision for an Islamic household."
                </blockquote>
                <p className="mt-4 font-medium">Ahmed K., London</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Islamic Marriage App. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
