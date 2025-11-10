import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Mail, Eye, MousePointerClick, DollarSign } from "lucide-react";

interface ABTestAnalytics {
  id: string | null;
  test_name: string | null;
  variant_name: string | null;
  subject_line: string | null;
  offer_percentage: number | null;
  email_tone: string | null;
  traffic_allocation: number | null;
  total_sent: number | null;
  total_opened: number | null;
  total_clicked: number | null;
  total_renewed: number | null;
  total_revenue: number | null;
  open_rate: number | null;
  click_rate: number | null;
  conversion_rate: number | null;
  revenue_per_email: number | null;
  is_active: boolean | null;
}

interface ABTestResultsProps {
  analytics: ABTestAnalytics[];
  isLoading: boolean;
  reminderType: string;
}

export function ABTestResults({ analytics, isLoading, reminderType }: ABTestResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Aucune variante de test A/B configurée pour ce type de rappel.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Créez une nouvelle variante pour commencer à optimiser vos emails.
        </p>
      </Card>
    );
  }

  // Find winner (highest conversion rate)
  const winner = analytics.reduce((prev, current) => 
    ((current.conversion_rate || 0) > (prev.conversion_rate || 0)) ? current : prev
  );

  return (
    <div className="space-y-4">
      {analytics.map((variant) => {
        const isWinner = variant.id === winner.id && (variant.total_sent || 0) > 0;
        
        return (
          <Card key={variant.id} className={`p-6 ${isWinner ? 'border-green-500 border-2' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{variant.variant_name || 'N/A'}</h3>
                  {isWinner && (
                    <Badge className="bg-green-500">
                      🏆 Meilleur Taux
                    </Badge>
                  )}
                  {!variant.is_active && (
                    <Badge variant="secondary">Inactif</Badge>
                  )}
                  <Badge variant="outline">{variant.email_tone || 'N/A'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{variant.subject_line || 'N/A'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>Offre: <strong>-{variant.offer_percentage || 0}%</strong></span>
                  <span>Traffic: <strong>{variant.traffic_allocation || 0}%</strong></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Envoyés</span>
                </div>
                <p className="text-2xl font-bold">{variant.total_sent || 0}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>Ouvertures</span>
                </div>
                <p className="text-2xl font-bold">{variant.open_rate || 0}%</p>
                <p className="text-xs text-muted-foreground">{variant.total_opened || 0} ouv.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MousePointerClick className="h-4 w-4 text-green-500" />
                  <span>Clics</span>
                </div>
                <p className="text-2xl font-bold">{variant.click_rate || 0}%</p>
                <p className="text-xs text-muted-foreground">{variant.total_clicked || 0} clics</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span>Conversion</span>
                </div>
                <p className="text-2xl font-bold">{variant.conversion_rate || 0}%</p>
                <p className="text-xs text-muted-foreground">{variant.total_renewed || 0} renouv.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <span>Revenus</span>
                </div>
                <p className="text-2xl font-bold">{variant.total_revenue?.toFixed(0) || 0}€</p>
                <p className="text-xs text-muted-foreground">{variant.revenue_per_email?.toFixed(2) || 0}€/email</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Taux d'ouverture</span>
                <span className="font-medium">{variant.open_rate || 0}%</span>
              </div>
              <Progress value={variant.open_rate || 0} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Taux de clic</span>
                <span className="font-medium">{variant.click_rate || 0}%</span>
              </div>
              <Progress value={variant.click_rate || 0} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Taux de conversion</span>
                <span className="font-medium">{variant.conversion_rate || 0}%</span>
              </div>
              <Progress value={variant.conversion_rate || 0} className="h-2" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
