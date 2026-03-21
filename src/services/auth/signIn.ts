import { supabase } from '@/integrations/supabase/client';
import { SignInData } from '@/types/auth';
import { toast } from 'sonner';

export const signIn = async (data: SignInData, t: (key: string) => string) => {
  const { email, password } = data;

  try {
    // Login process started

    const { data: sessionData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);

      // Handle specific error cases - removed CAPTCHA bypass recommendation
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect', {
          description: 'Veuillez vérifier vos identifiants',
        });
      } else if (error.message.includes('captcha verification process failed')) {
        toast.error('Erreur de vérification CAPTCHA', {
          description:
            'Trop de tentatives de connexion. Veuillez attendre quelques minutes et réessayer.',
          duration: 6000,
        });
      } else if (error.message.includes('Email not confirmed')) {
        // Offer to resend confirmation email
        const resendConfirmation = async () => {
          try {
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth`,
              },
            });

            if (resendError) {
              toast.error("Erreur lors de l'envoi", {
                description: resendError.message,
              });
            } else {
              toast.success('Email de confirmation renvoyé', {
                description: 'Vérifiez votre boîte mail et cliquez sur le lien de confirmation',
              });
            }
          } catch (error) {
            console.error('Resend error:', error);
          }
        };

        toast.error('Email non confirmé', {
          description:
            "Votre email n'est pas encore confirmé. Cliquez ici pour renvoyer l'email de confirmation.",
          action: {
            label: 'Renvoyer',
            onClick: resendConfirmation,
          },
          duration: 10000,
        });
      } else if (error.message.includes('Too many requests')) {
        toast.error('Trop de tentatives', {
          description: 'Veuillez attendre quelques minutes avant de réessayer',
        });
      } else {
        toast.error('Erreur de connexion', {
          description: 'Échec de la connexion. Veuillez réessayer.',
          duration: 5000,
        });
      }

      return false;
    }

    if (sessionData?.session && sessionData?.user) {
      // Login successful

      toast.success('Connexion réussie', {
        description: 'Bienvenue !',
      });
      return true;
    } else {
      // Login failed - no session or user data
      toast.error('Échec de la connexion', {
        description: 'Aucune session créée',
      });
      return false;
    }
  } catch (error: any) {
    console.error('Authentication error:', error);
    toast.error('Erreur inattendue', {
      description: 'Veuillez réessayer ou contacter le support',
    });
    return false;
  }
};
