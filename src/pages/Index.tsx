
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

      {/* CTA Section */}
      <div className="bg-muted py-16 px-4">
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
      <footer className="bg-background py-8 px-4 border-t">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Islamic Matrimony Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
