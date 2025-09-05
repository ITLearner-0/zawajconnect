import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Download, 
  RefreshCw, 
  BookOpen, 
  Target, 
  TrendingUp,
  Heart,
  Users,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InsightsActionPanelProps {
  completionPercentage: number;
  insightsAvailable: boolean;
}

const InsightsActionPanel: React.FC<InsightsActionPanelProps> = ({ 
  completionPercentage, 
  insightsAvailable 
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mes Insights de Compatibilité - NikahConnect',
          text: 'Découvrez mes insights de compatibilité personnalisés sur NikahConnect',
          url: window.location.origin + '/compatibility-insights'
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + '/compatibility-insights');
        toast({
          title: "Lien copié",
          description: "Le lien vers vos insights a été copié dans le presse-papiers",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de partage",
        description: "Impossible de partager vos insights pour le moment",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export réussi",
        description: "Vos insights ont été exportés en PDF",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter vos insights pour le moment",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const nextSteps = [
    {
      icon: Heart,
      title: "Améliorer votre profil",
      description: "Suivez les suggestions pour optimiser votre compatibilité",
      action: () => navigate('/dashboard'),
      available: insightsAvailable
    },
    {
      icon: Users,
      title: "Découvrir des profils",
      description: "Explorez des partenaires compatibles selon vos insights",
      action: () => navigate('/browse'),
      available: insightsAvailable
    },
    {
      icon: BookOpen,
      title: "Guidance islamique",
      description: "Approfondissez vos connaissances sur le mariage en Islam",
      action: () => navigate('/guidance'),
      available: true
    },
    {
      icon: Calendar,
      title: "Refaire le test",
      description: "Mettez à jour vos réponses pour des insights plus précis",
      action: () => navigate('/compatibility-test'),
      available: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress & Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Profil de compatibilité</span>
              <span className="text-muted-foreground">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            {completionPercentage === 100 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span>Profil complété !</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              disabled={!insightsAvailable || isSharing}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isSharing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              Partager
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={!insightsAvailable || isExporting}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter
            </Button>
          </div>

          {!insightsAvailable && (
            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Complétez le test pour débloquer les actions de partage et d'export
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Étapes Suivantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  step.available 
                    ? 'hover:bg-slate-50 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed bg-slate-25'
                }`}
                onClick={step.available ? step.action : undefined}
              >
                <div className={`p-2 rounded-full ${
                  step.available ? 'bg-primary/10' : 'bg-slate-100'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    step.available ? 'text-primary' : 'text-slate-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    {!step.available && (
                      <Badge variant="secondary" className="text-xs">
                        Bientôt
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsActionPanel;