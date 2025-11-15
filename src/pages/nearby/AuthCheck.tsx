import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useRLSSetup } from '@/hooks/useRLSSetup';
import CustomButton from '@/components/CustomButton';
import { Card, CardContent } from '@/components/ui/card';
import { TestTube, User } from 'lucide-react';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
  const { isSetup: rlsSetup, isLoading: rlsLoading } = useRLSSetup();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompatibilityTest, setHasCompatibilityTest] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status and compatibility test
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'You need to sign in to view matches near you.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Check if user has taken compatibility test
      const { data, error } = await (supabase as any)
        .from('compatibility_results')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (error) {
        console.error('Error checking compatibility results:', error);
        return;
      }

      setHasCompatibilityTest(data && data.length > 0);
    };

    checkAuth();
  }, [navigate, toast]);

  if (isAuthenticated === false) {
    return null; // Will redirect to auth page
  }

  if (isAuthenticated === null || rlsLoading || hasCompatibilityTest === null) {
    // Loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rlsSetup === false) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col gap-4">
        <div className="text-xl font-bold text-red-500">Database Security Issue</div>
        <p className="text-center max-w-md">
          There was a problem setting up database security. Please contact the administrator.
        </p>
        <CustomButton onClick={() => navigate('/')}>Return to Home</CustomButton>
      </div>
    );
  }

  // Show compatibility test requirement if not completed
  if (!hasCompatibilityTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <TestTube className="h-16 w-16 text-rose-600 dark:text-rose-300" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-200 mb-2">
                  Compatibility Test Required
                </h2>
                <p className="text-rose-600 dark:text-rose-300 text-sm">
                  To view profiles with compatibility percentages and find meaningful matches, you
                  need to complete the compatibility test first.
                </p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/50 p-4 rounded-lg border border-rose-200 dark:border-rose-700">
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  This test helps us match you with people who share similar Islamic values and life
                  goals.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <CustomButton
                  onClick={() => navigate('/compatibility')}
                  variant="gold"
                  className="w-full flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Take Compatibility Test
                </CustomButton>

                <CustomButton
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Back to Profile
                </CustomButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthCheck;
