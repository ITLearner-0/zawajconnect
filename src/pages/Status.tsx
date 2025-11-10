import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Database, Server, GitBranch } from "lucide-react";

interface HealthCheck {
  name: string;
  status: "success" | "error" | "warning" | "checking";
  message: string;
  responseTime?: number;
}

const Status = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthChecks = async () => {
    setIsChecking(true);
    const newChecks: HealthCheck[] = [];

    // 1. Vérifier la connexion Supabase
    const supabaseStart = Date.now();
    try {
      const { error } = await supabase.auth.getSession();
      const responseTime = Date.now() - supabaseStart;
      
      if (error) {
        newChecks.push({
          name: "Connexion Supabase",
          status: "error",
          message: `Erreur: ${error.message}`,
          responseTime,
        });
      } else {
        newChecks.push({
          name: "Connexion Supabase",
          status: "success",
          message: "Connecté et opérationnel",
          responseTime,
        });
      }
    } catch (error) {
      newChecks.push({
        name: "Connexion Supabase",
        status: "error",
        message: `Impossible de se connecter: ${error}`,
      });
    }

    // 2. Vérifier l'authentification
    try {
      const { data: { session } } = await supabase.auth.getSession();
      newChecks.push({
        name: "Service d'authentification",
        status: "success",
        message: session ? "Session active" : "Service disponible (non connecté)",
      });
    } catch (error) {
      newChecks.push({
        name: "Service d'authentification",
        status: "error",
        message: `Erreur auth: ${error}`,
      });
    }

    // 3. Vérifier l'API REST Supabase
    try {
      const response = await fetch(`https://dgfctwtivkqcfhwqgkya.supabase.co/rest/v1/`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw'
        }
      });
      newChecks.push({
        name: "API REST Supabase",
        status: response.ok ? "success" : "warning",
        message: response.ok ? "API REST opérationnelle" : `HTTP ${response.status}`,
      });
    } catch (error) {
      newChecks.push({
        name: "API REST Supabase",
        status: "error",
        message: `Erreur API: ${error}`,
      });
    }

    // 4. Vérifier le Storage
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        newChecks.push({
          name: "Supabase Storage",
          status: "warning",
          message: `Erreur storage: ${error.message}`,
        });
      } else {
        newChecks.push({
          name: "Supabase Storage",
          status: "success",
          message: `${data?.length || 0} bucket(s) disponible(s)`,
        });
      }
    } catch (error) {
      newChecks.push({
        name: "Supabase Storage",
        status: "error",
        message: `Erreur: ${error}`,
      });
    }

    setChecks(newChecks);
    setLastCheck(new Date());
    setIsChecking(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "checking":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: HealthCheck["status"]) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-500">Opérationnel</Badge>;
      case "error":
        return <Badge variant="destructive">Erreur</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-500">Avertissement</Badge>;
      case "checking":
        return <Badge variant="outline">Vérification...</Badge>;
    }
  };

  const overallStatus = checks.length === 0 
    ? "checking" 
    : checks.every(c => c.status === "success") 
    ? "success" 
    : checks.some(c => c.status === "error") 
    ? "error" 
    : "warning";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Server className="h-8 w-8" />
                  Statut du Système
                </CardTitle>
                <CardDescription className="mt-2">
                  Surveillance de la santé de l'application ZawajConnect
                </CardDescription>
              </div>
              {getStatusBadge(overallStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {lastCheck && (
                  <p>Dernière vérification: {lastCheck.toLocaleString('fr-FR')}</p>
                )}
              </div>
              <Button
                onClick={runHealthChecks}
                disabled={isChecking}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vérifications de santé */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Vérifications de Santé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Vérification en cours...</p>
                </div>
              ) : (
                checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{check.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {check.message}
                        </p>
                      </div>
                    </div>
                    {check.responseTime && (
                      <Badge variant="outline" className="ml-2">
                        {check.responseTime}ms
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations de version */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Informations de Build
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">v1.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Environnement</p>
                <p className="font-medium">Production</p>
              </div>
              <div>
                <p className="text-muted-foreground">Projet Supabase</p>
                <p className="font-mono text-xs">dgfctwtivkqcfhwqgkya</p>
              </div>
              <div>
                <p className="text-muted-foreground">Déploiement</p>
                <p className="font-medium">Hostinger</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Cette page permet de vérifier l'état de santé de l'application après chaque déploiement.
              <br />
              Pour signaler un problème, contactez l'équipe technique.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Status;
