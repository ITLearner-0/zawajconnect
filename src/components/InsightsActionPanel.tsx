import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { useInsightsAnalytics, type UseInsightsAnalyticsReturn } from '@/hooks/useInsightsAnalytics';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface InsightsActionPanelProps {
  completionPercentage: number;
  insightsAvailable: boolean;
}

interface NextStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: () => void;
  available: boolean;
}

const InsightsActionPanel: React.FC<InsightsActionPanelProps> = ({
  completionPercentage, 
  insightsAvailable 
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const { trackShare, trackExport, trackAction, getRecommendations }: UseInsightsAnalyticsReturn = useInsightsAnalytics();

  const handleShare = async (): Promise<void> => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
           title: 'Mes Insights de Compatibilité',
           text: 'Découvrez mon profil de compatibilité sur Muslima',
          url: window.location.href
        });
        
        // Tracker le partage
        await trackShare();
        
        toast.success('Insights partagés avec succès !');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        
        // Tracker même si c'est juste le lien copié
        await trackShare();
        
        toast.success('Lien copié dans le presse-papier !');
      }
    } catch (error: unknown) {
      console.error('Erreur lors du partage:', error);
      toast.error('Impossible de partager pour le moment');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      // Créer le PDF avec jsPDF
      const doc = new jsPDF();
      
      // Configuration
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;
      
      // Titre principal
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text('Mes Insights de Compatibilité', margin, yPosition);
      yPosition += 15;
      
      // Date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
      yPosition += 15;
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Score global (si disponible)
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Progression: ${completionPercentage}%`, margin, yPosition);
      yPosition += 10;
      
      // Barre de progression visuelle
      const progressBarWidth = pageWidth - (2 * margin);
      const progressBarHeight = 8;
      doc.setFillColor(229, 231, 235); // Gray background
      doc.rect(margin, yPosition, progressBarWidth, progressBarHeight, 'F');
      doc.setFillColor(16, 185, 129); // Emerald progress
      doc.rect(margin, yPosition, (progressBarWidth * completionPercentage) / 100, progressBarHeight, 'F');
      yPosition += 20;
      
      // Section: Prochaines étapes
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text('Prochaines Étapes Recommandées', margin, yPosition);
      yPosition += 10;
      
      // Recommandations dynamiques
      const recommendations = getRecommendations();
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - (2 * margin));
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 3;
      });
      
      yPosition += 10;
      
      // Section: Actions disponibles
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129);
      doc.text('Actions Disponibles', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      const nextStepsText = [
        '• Améliorer votre profil avec les suggestions',
        '• Découvrir des profils compatibles',
        '• Consulter les guidances islamiques',
        '• Partager vos insights avec votre famille'
      ];
      
      nextStepsText.forEach(text => {
        doc.text(text, margin, yPosition);
        yPosition += 7;
      });
      
      yPosition += 15;
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const footerText = 'Muslima - Plateforme de mariage musulman | muslima.app';
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (pageWidth - footerWidth) / 2, 280);
      
      // Télécharger le PDF
      doc.save('mes-insights-compatibilite.pdf');
      
      // Tracker l'export
      await trackExport();
      
      toast.success('PDF téléchargé avec succès !');
    } catch (error: unknown) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const nextSteps: NextStep[] = [
    {
      icon: TrendingUp,
      title: "Améliorer mon profil",
      description: "Optimisez votre profil selon vos insights",
      action: () => {
        trackAction('improve_profile');
        navigate('/profile');
      },
      available: completionPercentage < 100
    },
    {
      icon: Users,
      title: "Découvrir des profils",
      description: "Trouvez des personnes compatibles",
      action: () => {
        trackAction('browse_profiles');
        navigate('/browse');
      },
      available: insightsAvailable
    },
    {
      icon: BookOpen,
      title: "Guidance islamique",
      description: "Consultez nos conseils islamiques",
      action: () => {
        trackAction('read_guidance');
        navigate('/guidance');
      },
      available: true
    },
    {
      icon: RefreshCw,
      title: "Refaire le test",
      description: "Mettez à jour vos réponses",
      action: () => {
        trackAction('retake_test');
        navigate('/compatibility-test');
      },
      available: insightsAvailable
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleShare}
              disabled={!insightsAvailable || isSharing}
              variant="outline"
              size="sm"
              className="w-full text-xs px-2"
            >
              {isSharing ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Share2 className="h-3 w-3 mr-1" />
              )}
              Partager
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={!insightsAvailable || isExporting}
              variant="outline"
              size="sm"
              className="w-full text-xs px-2"
            >
              {isExporting ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm truncate">{step.title}</h4>
                    {!step.available && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        Bientôt
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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