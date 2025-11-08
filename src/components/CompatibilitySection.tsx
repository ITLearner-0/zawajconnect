import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Heart, Users, Star, Calculator, TrendingUp, Shield } from 'lucide-react';

const CompatibilitySection = () => {
  const compatibilityFactors = [
    {
      icon: Heart,
      title: "Valeurs Islamiques",
      description: "Pratique religieuse, secte, importance de la foi",
      weight: 35,
      color: "text-emerald"
    },
    {
      icon: Users,
      title: "Objectifs de Vie",
      description: "Mariage, famille, projets d'avenir",
      weight: 25,
      color: "text-gold"
    },
    {
      icon: Star,
      title: "Compatibilité Sociale",
      description: "Éducation, profession, mode de vie",
      weight: 20,
      color: "text-emerald-light"
    },
    {
      icon: Calculator,
      title: "Préférences Personnelles",
      description: "Âge, localisation, centres d'intérêt",
      weight: 20,
      color: "text-gold-dark"
    }
  ];

  const successStats = [
    { label: "Matches Réussis", value: "87%", icon: TrendingUp },
    { label: "Mariages Célébrés", value: "1,247", icon: Heart },
    { label: "Familles Heureuses", value: "892", icon: Users },
    { label: "Vérifications Actives", value: "100%", icon: Shield }
  ];

  return (
    <section className="py-12 px-4 bg-background border-y border-border">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Algorithme de Compatibilité Islamique
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Notre système avancé analyse plusieurs dimensions pour trouver votre partenaire idéal selon les valeurs islamiques
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Compatibility Factors */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="h-6 w-6 text-primary" />
                  Facteurs de Compatibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {compatibilityFactors.map((factor) => (
                  <div key={factor.title} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <factor.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{factor.title}</h3>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {factor.weight}%
                      </Badge>
                    </div>
                    <Progress 
                      value={factor.weight} 
                      className="h-2 bg-muted"
                    />
                  </div>
                ))}
                
                <div className="bg-muted rounded border border-border p-4 mt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    <strong>100%</strong> des facteurs sont analysés selon les principes islamiques du mariage
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Success Statistics */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Résultats Prouvés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {successStats.map((stat) => (
                    <div 
                      key={stat.label}
                      className="text-center space-y-2 p-4 rounded border border-border bg-muted"
                    >
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                        <stat.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-muted rounded border border-border">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Processus Vérifié & Sécurisé
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Vérification d'identité obligatoire
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Modération des profils par des experts
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      Accompagnement par des conseillers matrimoniaux
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="border border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Comment Ça Fonctionne ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Profil Détaillé",
                    description: "Remplissez votre profil avec vos valeurs islamiques et préférences"
                  },
                  {
                    step: "02",
                    title: "Analyse IA",
                    description: "Notre algorithme analyse votre compatibilité avec d'autres membres"
                  },
                  {
                    step: "03", 
                    title: "Matches Qualifiés",
                    description: "Recevez des suggestions de profils hautement compatibles"
                  },
                  {
                    step: "04",
                    title: "Connexion Halal",
                    description: "Échangez dans un environnement respectueux des valeurs islamiques"
                  }
                ].map((step, index) => (
                  <div 
                    key={step.step}
                    className="text-center space-y-4"
                  >
                    <div className="relative">
                      <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                        <span className="text-xl font-bold text-primary-foreground">{step.step}</span>
                      </div>
                      {index < 3 && (
                        <div className="hidden md:block absolute top-8 left-16 w-full h-0.5 bg-border" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CompatibilitySection;