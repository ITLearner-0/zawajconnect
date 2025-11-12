import { useState, useEffect } from 'react';
import { setupRLSPolicies, checkRLSPolicies } from '@/utils/database/rls';
import { useToast } from '@/hooks/use-toast';

export const useRLSSetup = () => {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAndSetupRLS = async () => {
      try {
        setIsLoading(true);

        // Check if policies are already set up
        const policiesExist = await checkRLSPolicies();

        if (!policiesExist) {
          // Setup RLS policies if they don't exist
          const setupSuccess = await setupRLSPolicies();
          setIsSetup(setupSuccess);

          if (setupSuccess) {
            toast({
              title: 'Security policies configured',
              description: 'Database security has been properly configured.',
            });
          }
        } else {
          setIsSetup(true);
        }
      } catch (error) {
        console.error('Error checking or setting up RLS:', error);
        setIsSetup(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndSetupRLS();
  }, [toast]);

  return { isSetup, isLoading };
};
