// Secure environment configuration
export const getSecureEnvironmentConfig = () => {
  // Check for required environment variables
  const requiredVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  // Validate all required variables are present
  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    supabaseUrl: requiredVars.VITE_SUPABASE_URL,
    supabaseAnonKey: requiredVars.VITE_SUPABASE_ANON_KEY,
    mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN || '', // Optional, should be moved to env
  };
};

// Validate environment on app start
export const validateEnvironment = () => {
  try {
    getSecureEnvironmentConfig();
    console.log('✅ Environment variables validated');
    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    return false;
  }
};
