import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordStrength {
  score: number;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

export const PasswordSecurityPanel = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzePassword = (password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    };

    const feedback: string[] = [];
    let score = 0;

    if (requirements.length) {
      score += 20;
    } else {
      feedback.push('Use at least 12 characters');
    }

    if (requirements.uppercase) {
      score += 15;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (requirements.lowercase) {
      score += 15;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (requirements.numbers) {
      score += 20;
    } else {
      feedback.push('Include numbers');
    }

    if (requirements.symbols) {
      score += 30;
    } else {
      feedback.push('Include special characters (!@#$%^&*)');
    }

    // Bonus points for extra length
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    return { score, feedback, requirements };
  };

  useEffect(() => {
    if (newPassword) {
      setStrength(analyzePassword(newPassword));
    } else {
      setStrength(null);
    }
  }, [newPassword]);

  const handlePasswordUpdate = async () => {
    if (!newPassword || !currentPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both current and new passwords.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (!strength || strength.score < 70) {
      toast({
        title: "Password Too Weak",
        description: "Please create a stronger password following the requirements.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStrength(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password. Please try again.";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return 'Very Strong';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Password Security
          </CardTitle>
          <CardDescription>
            Update your password to ensure maximum account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Leaked password protection is currently disabled in your Supabase project. 
              Please enable it in the Supabase dashboard under Authentication → Settings → Password Protection.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {strength && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Strength</span>
                  <span className={`text-sm font-medium ${getStrengthColor(strength.score)}`}>
                    {getStrengthLabel(strength.score)}
                  </span>
                </div>
                <Progress value={strength.score} className="h-2" />
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {Object.entries(strength.requirements).map(([key, met]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {met ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={met ? 'text-emerald-700' : 'text-red-700'}>
                        {key === 'length' && '12+ characters'}
                        {key === 'uppercase' && 'Uppercase (A-Z)'}
                        {key === 'lowercase' && 'Lowercase (a-z)'}
                        {key === 'numbers' && 'Numbers (0-9)'}
                        {key === 'symbols' && 'Symbols (!@#$)'}
                      </span>
                    </div>
                  ))}
                </div>

                {strength.feedback.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-700 mb-1">Suggestions:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                      {strength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>

            <Button 
              onClick={handlePasswordUpdate}
              disabled={loading || !strength || strength.score < 70}
              className="w-full"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Use a unique password</p>
                <p className="text-muted-foreground">Don't reuse passwords from other accounts</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Enable two-factor authentication</p>
                <p className="text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Regular password updates</p>
                <p className="text-muted-foreground">Change your password every 6-12 months</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordSecurityPanel;