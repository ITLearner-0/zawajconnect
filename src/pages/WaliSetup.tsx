import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import WaliSignUpForm from '@/components/auth/WaliSignUpForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WaliSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleWaliSignUp = async (data: any) => {
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/wali`;

      // Process managed user emails
      const managedEmails = data.managedUserEmails
        ? data.managedUserEmails
            .split(',')
            .map((email: string) => email.trim())
            .filter(Boolean)
        : [];

      // Sign up the wali user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/wali`,
          data: {
            user_type: 'wali',
            first_name: data.firstName,
            last_name: data.lastName,
            relationship_type: data.relationshipType,
            contact_phone: data.contactPhone,
            managed_user_emails: managedEmails,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        toast.success('Compte Wali créé avec succès', {
          description: 'Veuillez vérifier votre email pour activer votre compte.',
        });

        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Wali signup error:', error);
      toast.error('Registration Failed', {
        description: error.message || 'Please try again',
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
            Inscription en tant que Wali (Tuteur)
          </h2>
          <p className="text-muted-foreground">
            Créez votre compte pour superviser et guider les conversations matrimoniales islamiques
          </p>
        </div>

        <WaliSignUpForm loading={loading} onSubmit={handleWaliSignUp} />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <button onClick={() => navigate('/auth')} className="text-primary hover:underline">
              Connectez-vous ici
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default WaliSetup;
