
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [gender, setGender] = useState("");
  const [showWaliFields, setShowWaliFields] = useState(false);
  const [waliName, setWaliName] = useState("");
  const [waliRelationship, setWaliRelationship] = useState("");
  const [waliContact, setWaliContact] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenderChange = (value: string) => {
    setGender(value);
    setShowWaliFields(value === "female");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate required fields
        if (!firstName || !lastName) {
          toast({
            title: "Missing Information",
            description: "Please provide both first and last name.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!gender) {
          toast({
            title: "Missing Information",
            description: "Please select your gender.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // For registration, validate wali information for female users
        if (gender === "female" && (!waliName || !waliRelationship || !waliContact)) {
          toast({
            title: "Wali Information Required",
            description: "As a female user, you must provide complete wali information.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Register the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              gender: gender
            }
          }
        });

        if (error) throw error;

        // If registration successful and user provides gender info, save to profile
        if (data.user) {
          const profileData = {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            gender: gender,
          };

          // Add wali information for female users
          if (gender === "female") {
            profileData.wali_name = waliName;
            profileData.wali_relationship = waliRelationship;
            profileData.wali_contact = waliContact;
          }

          // Create initial profile
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(profileData);

          if (profileError) {
            console.error("Error creating initial profile:", profileError);
            toast({
              title: "Profile Creation Error",
              description: profileError.message,
              variant: "destructive",
            });
          }
        }

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/profile");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12 dark:from-islamic-darkBg dark:to-islamic-darkCard">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <Card className="shadow-lg dark:bg-islamic-darkCard dark:text-white">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {isSignUp
                ? "Sign up to find your compatible match"
                : "Sign in to continue your journey"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={gender} 
                    onValueChange={handleGenderChange}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isSignUp && showWaliFields && (
                <div className="space-y-4 border border-primary/20 rounded-md p-4 bg-primary/5 mt-4 dark:bg-primary/10">
                  <div className="text-sm">
                    <h3 className="font-medium mb-2">Wali Information</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      As a female user, you are required to provide your wali (guardian) information.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waliName">Wali Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="waliName"
                      placeholder="Enter your wali's full name"
                      value={waliName}
                      onChange={(e) => setWaliName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waliRelationship">Relationship <span className="text-red-500">*</span></Label>
                    <Select 
                      value={waliRelationship} 
                      onValueChange={setWaliRelationship}
                    >
                      <SelectTrigger id="waliRelationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="brother">Brother</SelectItem>
                        <SelectItem value="uncle">Uncle</SelectItem>
                        <SelectItem value="grandfather">Grandfather</SelectItem>
                        <SelectItem value="other">Other Male Relative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waliContact">Wali Contact <span className="text-red-500">*</span></Label>
                    <Input
                      id="waliContact"
                      placeholder="Enter your wali's contact number"
                      value={waliContact}
                      onChange={(e) => setWaliContact(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <CustomButton
                type="submit"
                className="w-full"
                disabled={loading}
                isLoading={loading}
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </CustomButton>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
