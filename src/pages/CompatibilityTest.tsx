import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import CompatibilityQuestionnaire from '@/components/CompatibilityQuestionnaire';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CompatibilityTest = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <Header />
      <main className="pt-20">
        <CompatibilityQuestionnaire 
          onComplete={() => {
            window.location.href = '/dashboard';
          }} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default CompatibilityTest;