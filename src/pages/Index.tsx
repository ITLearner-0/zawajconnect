
import CompatibilityTest from "@/components/CompatibilityTest";
import CustomButton from "@/components/CustomButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showTest, setShowTest] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background">
      <div className="container mx-auto px-4 py-12">
        {!showTest ? (
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Find Your Compatible Match
            </h1>
            <p className="text-xl text-gray-600">
              Discover meaningful connections through our Islamic values-based
              compatibility testing
            </p>
            <div className="space-y-4">
              <div className="space-x-4">
                <CustomButton size="lg" onClick={() => setShowTest(true)}>
                  Take Compatibility Test
                </CustomButton>
                <CustomButton
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  Sign In / Sign Up
                </CustomButton>
              </div>
              <p className="text-sm text-gray-500">
                Based on Islamic principles and values
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="p-6 rounded-lg bg-white shadow-md">
                <h3 className="text-lg font-semibold mb-2">Islamic Values</h3>
                <p className="text-gray-600">
                  Our matching system is built on core Islamic principles and
                  values.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white shadow-md">
                <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your privacy is protected with our secure and discreet platform.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white shadow-md">
                <h3 className="text-lg font-semibold mb-2">
                  Meaningful Connections
                </h3>
                <p className="text-gray-600">
                  Focus on what truly matters for a blessed marriage.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <CompatibilityTest />
        )}
      </div>
    </div>
  );
};

export default Index;
