import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FamilyNotificationCenter from '@/components/FamilyNotificationCenter';
import WaliInvitationTest from '@/components/WaliInvitationTest';
import { Shield, Users, Key, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FamilyAccessPortal = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Accès Non Autorisé</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Vous devez être connecté avec un compte de supervision familiale pour accéder à cette page.
            </p>
            <div className="space-y-2">
              <Link to="/auth">
                <Button className="w-full bg-emerald hover:bg-emerald-dark">
                  Se connecter
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Supervision Familiale</h1>
                <p className="text-muted-foreground">Tableau de bord pour la supervision islamique</p>
              </div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              disabled={loading}
            >
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald" />
                  Personnes Supervisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Ici vous pouvez voir toutes les personnes que vous supervisez et leurs interactions.
                </p>
                <p className="text-sm bg-emerald/10 border border-emerald/20 rounded-lg p-3 text-emerald-dark">
                  <strong>📚 Principe islamique :</strong> La supervision familiale (notamment par le Wali) est essentielle pour maintenir les valeurs islamiques dans les communications pré-maritales.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <FamilyNotificationCenter />
            
            {/* Test Component for Development */}
            <div className="mt-6">
              <WaliInvitationTest />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyAccessPortal;