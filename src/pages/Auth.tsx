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
import { Heart, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
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
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
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
      setSuccess('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
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
                  Bienvenue sur NikahConnect
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
                      {success}
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