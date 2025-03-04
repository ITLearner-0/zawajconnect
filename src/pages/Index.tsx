
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FeaturedResources from '@/components/resources/FeaturedResources';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Match with Islamic Values
          </h1>
          <p className="text-xl mb-8">
            Connect with like-minded Muslims in a safe, respectful environment
            guided by Islamic principles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
              onClick={() => navigate('/nearby')}
            >
              Explore Matches
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Find Your Partner with Faith and Trust
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Islamic Values First</h3>
              <p>
                Our platform prioritizes Islamic principles and values in the
                matchmaking process, ensuring compatibility in faith.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Wali Supervision</h3>
              <p>
                Optional wali supervision feature allows family involvement in
                the process, following traditional Islamic courtship.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">AI Monitoring</h3>
              <p>
                Advanced AI ensures all interactions remain halal and
                appropriate, maintaining a respectful environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Prepare for Marriage with Islamic Guidance
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto">
            Explore our curated resources to help you prepare for marriage according to Islamic teachings. 
            Articles, guides, and expert advice to help you navigate your journey.
          </p>
          
          <FeaturedResources />
          
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/resources')} size="lg">
              Browse All Resources
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-background py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Match?</h2>
          <p className="text-xl mb-8">
            Join thousands of Muslims who have found their perfect partner
            through our platform.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
          >
            Create Your Profile
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Islamic Matrimony</h3>
              <p className="text-sm text-muted-foreground">
                Finding your spouse the halal way.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/')}>Home</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/nearby')}>Find Matches</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/resources')}>Marriage Resources</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/resources')}>Articles</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/resources')}>Guides</Button></li>
                <li><Button variant="link" className="p-0 h-auto" onClick={() => navigate('/resources')}>Videos</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Button variant="link" className="p-0 h-auto">Privacy Policy</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Terms of Service</Button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Islamic Matrimony Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
