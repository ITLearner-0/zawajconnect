
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRLSSetup } from "@/hooks/useRLSSetup";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
  const { isSetup: rlsSetup, isLoading: rlsLoading } = useRLSSetup();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You need to sign in to view matches near you.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      
      // Check if user has taken compatibility test
      const { data, error } = await supabase
        .from('compatibility_results')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (error) {
        console.error("Error checking compatibility results:", error);
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Compatibility Test",
          description: "Take the compatibility test to see how well you match with others",
          action: (
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => navigate("/compatibility")}
            >
              Take Test
            </CustomButton>
          ),
        });
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (isAuthenticated === false) {
    return null; // Will redirect to auth page
  }

  if (isAuthenticated === null || rlsLoading) {
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
        <CustomButton onClick={() => navigate("/")}>
          Return to Home
        </CustomButton>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthCheck;
