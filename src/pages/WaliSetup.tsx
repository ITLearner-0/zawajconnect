
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import WaliSignUpForm from "@/components/auth/WaliSignUpForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WaliSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWaliSignUp = async (data: any) => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/wali`;
      
      // Process managed user emails
      const managedEmails = data.managedUserEmails 
        ? data.managedUserEmails.split(',').map((email: string) => email.trim()).filter(Boolean)
        : [];

      // Sign up the wali user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            user_type: 'wali', // This triggers the wali profile creation
            first_name: data.firstName,
            last_name: data.lastName,
            relationship_type: data.relationshipType,
            contact_phone: data.contactPhone,
            managed_user_emails: managedEmails
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Store registration information
        const { error: regError } = await supabase
          .from('wali_registrations')
          .insert({
            email: data.email,
            password_hash: 'handled_by_auth', // Placeholder since auth handles passwords
            first_name: data.firstName,
            last_name: data.lastName,
            relationship_type: data.relationshipType,
            contact_phone: data.contactPhone,
            managed_user_emails: managedEmails,
            verification_status: 'pending'
          });

        if (regError) {
          console.error('Registration storage error:', regError);
        }

        toast.success("Wali Account Created Successfully", {
          description: "Please check your email to verify your account before signing in."
        });

        navigate('/auth');
      }
    } catch (error: any) {
      console.error("Wali signup error:", error);
      toast.error("Registration Failed", {
        description: error.message || "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout isSignUp={true}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Register as a Wali (Guardian)
          </h2>
          <p className="text-muted-foreground">
            Create your account to supervise and guide Muslim matrimonial conversations
          </p>
        </div>
        
        <WaliSignUpForm loading={loading} onSubmit={handleWaliSignUp} />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default WaliSetup;
