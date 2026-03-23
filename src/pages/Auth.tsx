import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserDataContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Heart,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import AuthPreview from '@/components/AuthPreview';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [attemptedSignUp, setAttemptedSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [enablePhoneVerification, setEnablePhoneVerification] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const { isWali, profileComplete, loading: userDataLoading } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isWaliMode = searchParams.get('mode') === 'wali';

  useEffect(() => {
    // Only redirect when user is authenticated and user data is loaded
    if (user && !userDataLoading) {
      // Wali users
      if (isWali) {
        // If profile is incomplete, go to wali onboarding first
        if (!profileComplete) {
          navigate('/wali-onboarding?mode=wali');
        } else {
          // Profile complete, go to family supervision
          navigate('/family-supervision');
        }
      } else {
        // Regular users
        if (!profileComplete) {
          // Profile incomplete, go to regular onboarding
          navigate('/onboarding');
        } else {
          // Profile complete, go to profile page
          navigate('/profile');
        }
      }
    }
  }, [user, userDataLoading, isWali, profileComplete, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      const frenchError = translateAuthError(error.message);
      setError(frenchError);
    }

    setLoading(false);
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setError("Erreur lors de l'envoi de l'email");
    } else {
      toast({
        title: 'Email renvoyé',
        description: 'Un nouvel email de vérification a été envoyé',
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAttemptedSignUp(true);

    // Validation
    if (!fullName.trim()) {
      setError('Le nom complet est requis');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (!acceptTerms || !confirmedAge) {
      setError("Vous devez accepter les Conditions d'Utilisation et confirmer votre âge");
      setLoading(false);
      return;
    }

    // Utiliser directement supabase.auth.signUp avec les métadonnées complètes
    const redirectUrl = `${window.location.origin}/onboarding`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          terms_accepted_at: new Date().toISOString(),
          terms_version: '1.0',
        },
      },
    });

    if (signUpError) {
      const frenchError = translateAuthError(signUpError.message);
      setError(frenchError);
    } else if (data?.user) {
      setEmailVerificationSent(true);
      setSuccess(
        'Inscription réussie ! Un email de vérification a été envoyé à votre adresse. Vérifiez votre boîte mail (y compris les spams) et cliquez sur le lien pour activer votre compte.'
      );

      // Envoyer l'email de bienvenue
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: data.user.id,
            email: data.user.email,
            fullName: fullName,
          },
        });
      } catch (emailError) {
        console.error('Erreur envoi email de bienvenue:', emailError);
      }

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setAcceptTerms(false);
      setConfirmedAge(false);
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!resetEmail) {
      setError('Veuillez saisir votre adresse email');
      setLoading(false);
      return;
    }

    try {
      // Appeler notre edge function personnalisée qui utilise SMTP
      const { error: functionError } = await supabase.functions.invoke(
        'send-password-reset-email',
        {
          body: {
            email: resetEmail,
            redirectUrl: `${window.location.origin}/reset-password`,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte email pour réinitialiser votre mot de passe',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      setError("Erreur lors de l'envoi de l'email. Veuillez réessayer.");
    }

    setLoading(false);
  };

  const translateAuthError = (errorMessage: string) => {
    if (errorMessage.includes('User already registered')) {
      return 'Un compte avec cet email existe déjà';
    }
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Veuillez confirmer votre email avant de vous connecter';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'Adresse email invalide';
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'var(--color-bg-page, #f9f8f5)' }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        {/* Back link */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--color-primary, #1a5c3a)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: 'var(--color-bg-card, #ffffff)',
            border: '1px solid var(--color-border-default, #e0ddd5)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: 'var(--color-primary, #1a5c3a)',
              padding: 24,
              textAlign: 'center',
            }}
          >
            {isWaliMode && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Shield className="h-4 w-4" style={{ color: '#fff' }} />
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                  Mode Supervision Familiale
                </span>
              </div>
            )}
            <div className="flex justify-center mb-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                }}
              >
                {isWaliMode ? (
                  <Shield className="h-6 w-6" style={{ color: '#fff' }} />
                ) : (
                  <Heart className="h-6 w-6 fill-current" style={{ color: '#fff' }} />
                )}
              </div>
            </div>
            <h1
              className="font-arabic"
              style={{
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              ZawajConnect
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                margin: '6px 0 0',
              }}
            >
              {isWaliMode
                ? 'Accédez à votre espace de supervision et guidance islamique'
                : 'Votre plateforme de rencontres islamiques'}
            </p>
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px' }}>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Se connecter</TabsTrigger>
                <TabsTrigger value="signup">S'inscrire</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'var(--color-primary, #1a5c3a)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        (e.target as HTMLButtonElement).style.background =
                          'var(--color-primary-hover, #14482e)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.background =
                        'var(--color-primary, #1a5c3a)';
                    }}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary, #1a5c3a)',
                        cursor: 'pointer',
                        fontSize: 14,
                        textDecoration: 'underline',
                        padding: 4,
                      }}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Votre nom complet"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {enablePhoneVerification && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone (optionnel)</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ajouter votre numéro pour une sécurité renforcée
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="phone-verification"
                        checked={enablePhoneVerification}
                        onCheckedChange={(checked) =>
                          setEnablePhoneVerification(checked === true)
                        }
                      />
                      <Label
                        htmlFor="phone-verification"
                        className="text-sm flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        Vérification par SMS
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      J'accepte les{' '}
                      <Link
                        to="/terms-of-service"
                        target="_blank"
                        style={{ color: 'var(--color-primary, #1a5c3a)' }}
                        className="hover:underline"
                      >
                        Conditions d'Utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link
                        to="/privacy-policy"
                        target="_blank"
                        style={{ color: 'var(--color-primary, #1a5c3a)' }}
                        className="hover:underline"
                      >
                        Politique de Confidentialité
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="age-confirm"
                      checked={confirmedAge}
                      onCheckedChange={(checked) => setConfirmedAge(checked === true)}
                    />
                    <Label htmlFor="age-confirm" className="text-sm">
                      Je confirme avoir au moins <strong>18 ans révolus</strong>
                    </Label>
                  </div>

                  {(!acceptTerms || !confirmedAge) && attemptedSignUp && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-sm">
                        Vous devez accepter les CGU et confirmer votre âge.
                      </p>
                    </div>
                  )}
                  {error && (
                    <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div
                      className="p-3 text-sm rounded-md"
                      style={{
                        color: 'var(--color-primary, #1a5c3a)',
                        background: 'rgba(26,92,58,0.08)',
                        border: '1px solid rgba(26,92,58,0.2)',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5" style={{ color: 'var(--color-primary, #1a5c3a)' }} />
                        <div>
                          {success}
                          {emailVerificationSent && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={resendVerificationEmail}
                                disabled={loading}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-primary, #1a5c3a)',
                                  cursor: 'pointer',
                                  fontSize: 13,
                                  textDecoration: 'underline',
                                  padding: 0,
                                }}
                              >
                                Renvoyer l'email de vérification
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'var(--color-primary, #1a5c3a)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        (e.target as HTMLButtonElement).style.background =
                          'var(--color-primary-hover, #14482e)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.background =
                        'var(--color-primary, #1a5c3a)';
                    }}
                  >
                    {loading ? 'Inscription...' : "S'inscrire"}
                  </button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div
            className="mt-6"
            style={{
              background: 'var(--color-bg-card, #ffffff)',
              border: '1px solid var(--color-border-default, #e0ddd5)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ padding: 24, textAlign: 'center' }}>
              <h2
                className="text-xl font-bold flex items-center justify-center gap-2"
                style={{ color: 'var(--color-primary, #1a5c3a)', margin: 0 }}
              >
                <Mail className="h-5 w-5" />
                Réinitialiser le mot de passe
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Saisissez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Adresse email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setResetEmail('');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'transparent',
                      color: 'var(--color-primary, #1a5c3a)',
                      border: '1px solid var(--color-border-default, #e0ddd5)',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'var(--color-primary, #1a5c3a)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        (e.target as HTMLButtonElement).style.background =
                          'var(--color-primary-hover, #14482e)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.background =
                        'var(--color-primary, #1a5c3a)';
                    }}
                  >
                    {loading ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de
          confidentialité.
        </p>
      </div>
    </div>
  );
};

export default Auth;
