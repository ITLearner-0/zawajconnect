import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, ArrowLeft, Eye, EyeOff, Mail, Shield, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import AuthPreview from '@/components/AuthPreview';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [enablePhoneVerification, setEnablePhoneVerification] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/enhanced-profile');
    }
  }, [user, navigate]);

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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/enhanced-profile`
      }
    });
    
    if (error) {
      setError('Erreur lors de la connexion avec Google');
    }
    setLoading(false);
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    if (error) {
      setError('Erreur lors de l\'envoi de l\'email');
    } else {
      toast({
        title: "Email renvoyé",
        description: "Un nouvel email de vérification a été envoyé",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
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
    
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      setLoading(false);
      return;
    }
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      // Translate common Supabase errors to French
      const frenchError = translateAuthError(error.message);
      setError(frenchError);
    } else {
      setEmailVerificationSent(true);
      setSuccess('Inscription réussie ! Un email de vérification a été envoyé à votre adresse. Vérifiez votre boîte mail (y compris les spams) et cliquez sur le lien pour activer votre compte.');
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setAcceptTerms(false);
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
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      setError(translateAuthError(error.message));
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte email pour réinitialiser votre mot de passe",
      });
      setShowForgotPassword(false);
      setResetEmail('');
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
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          {/* Auth Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
              <Link to="/" className="flex items-center gap-2 text-emerald hover:text-emerald-dark transition-colors animate-fade-in">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </div>

            <Card className="border-border/50 shadow-soft bg-card/95 backdrop-blur-sm animate-fade-in">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center animate-float">
                    <Heart className="h-6 w-6 text-primary-foreground fill-current" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Bienvenue sur ZawajConnect
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Votre plateforme de rencontres islamiques
                </CardDescription>
              </CardHeader>
          
          <CardContent className="animate-slide-up">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="transition-smooth">Se connecter</TabsTrigger>
                <TabsTrigger value="signup" className="transition-smooth">S'inscrire</TabsTrigger>
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
                      className="focus:ring-emerald"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="focus:ring-emerald pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuer avec Google
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-emerald hover:text-emerald-dark"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Mot de passe oublié ?
                    </Button>
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
                      className="focus:ring-emerald"
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
                      className="focus:ring-emerald"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="focus:ring-emerald pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="focus:ring-emerald pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                           className="focus:ring-emerald pl-10"
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
                         onCheckedChange={(checked) => setEnablePhoneVerification(checked === true)}
                       />
                       <Label htmlFor="phone-verification" className="text-sm flex items-center gap-1">
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
                       <Link to="/privacy" className="text-emerald hover:underline">
                         conditions d'utilisation
                       </Link>{' '}
                       et la{' '}
                       <Link to="/privacy" className="text-emerald hover:underline">
                         politique de confidentialité
                       </Link>
                     </Label>
                   </div>
                  {error && (
                    <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                   {success && (
                     <div className="p-3 text-sm text-emerald-dark bg-emerald/10 border border-emerald/20 rounded-md">
                       <div className="flex items-start gap-2">
                         <CheckCircle className="h-4 w-4 mt-0.5 text-emerald" />
                         <div>
                           {success}
                           {emailVerificationSent && (
                             <div className="mt-2">
                               <Button
                                 type="button"
                                 variant="link"
                                 size="sm"
                                 className="text-emerald hover:text-emerald-dark p-0 h-auto"
                                 onClick={resendVerificationEmail}
                                 disabled={loading}
                               >
                                 Renvoyer l'email de vérification
                               </Button>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   )}
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? 'Inscription...' : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <Card className="border-border/50 shadow-soft bg-card/95 backdrop-blur-sm mt-6 animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-emerald" />
                Réinitialiser le mot de passe
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Saisissez votre email pour recevoir un lien de réinitialisation
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    className="focus:ring-emerald"
                  />
                </div>
                
                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setResetEmail('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
            <p className="text-center text-sm text-muted-foreground mt-4">
              En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>

          {/* Preview Section */}
          <div className="hidden lg:block w-full">
            <AuthPreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;