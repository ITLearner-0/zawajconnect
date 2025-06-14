
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import CompatibilityTest from "@/components/CompatibilityTest";

const Compatibility = () => {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-12" role="main" aria-labelledby="compatibility-heading">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 id="compatibility-heading" className="text-3xl font-bold text-rose-800 dark:text-rose-200 mb-4">
              Compatibility Test
            </h1>
            <p className="text-rose-600 dark:text-rose-300 max-w-2xl mx-auto">
              Complete this test to help us find your most compatible matches based on your Islamic values and life goals.
            </p>
          </div>
          
          <CompatibilityTest />
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default Compatibility;
