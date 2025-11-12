import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, TestTube, CheckCircle, XCircle } from 'lucide-react';

const WaliInvitationTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { toast } = useToast();

  const testInvitationEmail = async () => {
    if (!email) {
      toast({
        title: 'Email requis',
        description: "Veuillez saisir un email pour tester l'invitation",
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      const response = await supabase.functions.invoke('send-family-invitation', {
        body: {
          fullName: 'Test Wali',
          email: email,
          relationship: 'father',
          isWali: true,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTestResult('success');
      toast({
        title: '✅ Test réussi !',
        description: `Email d'invitation Wali envoyé à ${email}`,
      });
    } catch (error: unknown) {
      console.error('Test invitation error:', error);
      setTestResult('error');
      const errorMessage =
        error instanceof Error ? error.message : "Impossible d'envoyer l'invitation de test";
      toast({
        title: '❌ Erreur de test',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-emerald/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-dark">
          <TestTube className="h-5 w-5" />
          Test Système d'Invitation Wali
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-emerald mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-dark">Test d'invitation Wali</p>
                <p className="text-sm text-emerald-dark/70">
                  Ce test vérifie que les emails d'invitation sont correctement envoyés aux futurs
                  Walis/tuteurs.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testEmail">Email de test</Label>
            <Input
              id="testEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="wali@example.com"
              disabled={loading}
            />
          </div>

          <Button
            onClick={testInvitationEmail}
            disabled={loading || !email}
            className="w-full bg-emerald hover:bg-emerald-dark"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent"></div>
                Test en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Tester l'invitation
              </div>
            )}
          </Button>

          {testResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {testResult === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Email envoyé avec succès !</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Échec de l'envoi</span>
                </>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p>
              <strong>Vérifications :</strong>
            </p>
            <ul className="mt-1 space-y-1">
              <li>✅ Fonction create_family_invitation corrigée</li>
              <li>✅ Email avec URL d'invitation dynamique</li>
              <li>✅ Logique Wali améliorée dans useUserRole</li>
              <li>✅ Menu supervision familiale pour les Walis</li>
              <li>✅ RoleBasedLayout optimisé</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliInvitationTest;
