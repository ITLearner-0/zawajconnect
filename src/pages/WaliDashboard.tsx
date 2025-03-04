
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import WaliDashboardComponent from '@/components/wali/WaliDashboard';
import { Toaster } from '@/components/ui/toaster';
import { setupModerationTables, updateProfileSchema } from '@/utils/databaseUtils';

const WaliDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize required database tables and schemas
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Setup moderation tables if they don't exist
        await setupModerationTables();
        
        // Update profile schema with necessary fields
        await updateProfileSchema();
        
        setIsInitializing(false);
      } catch (err) {
        console.error("Error initializing database:", err);
        setIsInitializing(false);
      }
    };
    
    initializeDatabase();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        navigate('/auth');
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  if (isInitializing || isAuthenticated === null) {
    // Loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    return null; // Will redirect to auth page
  }
  
  return (
    <>
      <WaliDashboardComponent />
      <Toaster />
    </>
  );
};

export default WaliDashboard;
