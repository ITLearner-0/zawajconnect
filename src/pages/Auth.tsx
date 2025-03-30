
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
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleGenderChange = (value: string) => {
    setGender(value);
    setShowWaliFields(value === "female");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Auth form submitted", { isSignUp, email, firstName, lastName, gender });
    
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate required fields
        if (!firstName || !lastName) {
          console.log("Missing name fields");
          toast({
            title: "Missing Information",
            description: "Please provide both first and last name.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!gender) {
          console.log("Missing gender");
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
          console.log("Missing wali information");
          toast({
            title: "Wali Information Required",
            description: "As a female user, you must provide complete wali information.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!email || !password) {
          console.log("Missing email or password");
          toast({
            title: "Missing Information",
            description: "Please provide both email and password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log("Starting signup process with:", { email, firstName, lastName, gender });
        
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

        if (error) {
          console.error("Signup error:", error);
          toast({
            title: "Registration Error",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        console.log("Signup successful, user data:", data);

        // If registration successful and user provides gender info, save to profile
        if (data.user) {
          console.log("Creating profile for user:", data.user.id);
          
          // Create complete profile data with all required fields
          const profileData = {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            gender: gender,
            birth_date: new Date().toISOString().split('T')[0], // Default to current date
            location: "Not specified", // Default value
            prayer_frequency: "Not specified", // Default value
            religious_practice_level: "Not specified", // Default value
            about_me: "", // Empty string for optional fields
            education_level: "",
            occupation: "",
            is_visible: true,
            privacy_settings: {
              profileVisibilityLevel: 1,
              showAge: true,
              showLocation: true,
              showOccupation: true,
              allowNonMatchMessages: true
            },
            email_verified: false,
            phone_verified: false,
            id_verified: false,
            wali_verified: false
          };

          // Add wali information for female users
          if (gender === "female") {
            profileData["wali_name"] = waliName;
            profileData["wali_relationship"] = waliRelationship;
            profileData["wali_contact"] = waliContact;
          } else {
            // For males, set wali fields to null
            profileData["wali_name"] = null;
            profileData["wali_relationship"] = null;
            profileData["wali_contact"] = null;
          }

          console.log("Inserting profile data:", profileData);

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
          } else {
            console.log("Profile created successfully");
          }
        }

        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
      } else {
        // Login flow
        console.log("Starting login process with:", email);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error("Login error:", error);
          toast({
            title: "Login Error",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        console.log("Login successful, redirecting to profile");
        navigate("/profile");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
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
        <div className="flex justify-between mb-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <Card className="shadow-lg dark:bg-islamic-darkCard dark:text-white">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">
              {isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {isSignUp
                ? t("auth.signUpToFind")
                : t("auth.signInToContinue")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                      <Input
                        id="firstName"
                        placeholder={t("auth.firstNamePlaceholder")}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                      <Input
                        id="lastName"
                        placeholder={t("auth.lastNamePlaceholder")}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="gender">{t("auth.gender")}</Label>
                  <Select 
                    value={gender} 
                    onValueChange={handleGenderChange}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder={t("auth.genderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("auth.male")}</SelectItem>
                      <SelectItem value="female">{t("auth.female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isSignUp && showWaliFields && (
                <div className="space-y-4 border border-primary/20 rounded-md p-4 bg-primary/5 mt-4 dark:bg-primary/10">
                  <div className="text-sm">
                    <h3 className="font-medium mb-2">{t("auth.waliInformation")}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t("auth.waliRequired")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waliName">{t("auth.waliName")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="waliName"
                      placeholder={t("auth.waliNamePlaceholder")}
                      value={waliName}
                      onChange={(e) => setWaliName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waliRelationship">{t("auth.relationship")} <span className="text-red-500">*</span></Label>
                    <Select 
                      value={waliRelationship} 
                      onValueChange={setWaliRelationship}
                    >
                      <SelectTrigger id="waliRelationship">
                        <SelectValue placeholder={t("auth.relationshipPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">{t("auth.father")}</SelectItem>
                        <SelectItem value="brother">{t("auth.brother")}</SelectItem>
                        <SelectItem value="uncle">{t("auth.uncle")}</SelectItem>
                        <SelectItem value="grandfather">{t("auth.grandfather")}</SelectItem>
                        <SelectItem value="other">{t("auth.otherMaleRelative")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waliContact">{t("auth.waliContact")} <span className="text-red-500">*</span></Label>
                    <Input
                      id="waliContact"
                      placeholder={t("auth.waliContactPlaceholder")}
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
                variant="gold"
              >
                {isSignUp ? t("auth.createAccount") : t("auth.signIn")}
              </CustomButton>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp
                    ? t("auth.alreadyHaveAccount")
                    : t("auth.dontHaveAccount")}
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
