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
    <section className="py-20 px-4 bg-gradient-to-br from-sage/10 via-cream/30 to-emerald/5">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Algorithme de Compatibilité Islamique
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Notre système avancé analyse plusieurs dimensions pour trouver votre partenaire idéal selon les valeurs islamiques
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Compatibility Factors */}
            <Card className="animate-slide-up card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Heart className="h-6 w-6 text-emerald" />
                  Facteurs de Compatibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {compatibilityFactors.map((factor, index) => (
                  <div key={factor.title} className="space-y-3" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-emerald/10 to-gold/10 flex items-center justify-center`}>
                          <factor.icon className={`h-5 w-5 ${factor.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{factor.title}</h3>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                        {factor.weight}%
                      </Badge>
                    </div>
                    <Progress 
                      value={factor.weight} 
                      className="h-2 bg-sage/20"
                    />
                  </div>
                ))}
                
                <div className="bg-gradient-to-r from-emerald/5 to-gold/5 rounded-lg p-4 mt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    <strong>100%</strong> des facteurs sont analysés selon les principes islamiques du mariage
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Success Statistics */}
            <Card className="animate-slide-up card-hover" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6 text-gold" />
                  Résultats Prouvés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {successStats.map((stat, index) => (
                    <div 
                      key={stat.label}
                      className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-br from-cream/30 to-sage/10 hover:scale-105 transition-transform"
                      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    >
                      <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-emerald/10 to-gold/10 rounded-lg border border-emerald/20">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald" />
                    Processus Vérifié & Sécurisé
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald rounded-full" />
                      Vérification d'identité obligatoire
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-gold rounded-full" />
                      Modération des profils par des experts
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald-light rounded-full" />
                      Accompagnement par des conseillers matrimoniaux
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="animate-fade-in card-hover" style={{ animationDelay: '0.4s' }}>
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
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="relative">
                      <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto">
                        <span className="text-xl font-bold text-white">{step.step}</span>
                      </div>
                      {index < 3 && (
                        <div className="hidden md:block absolute top-8 left-16 w-full h-0.5 bg-gradient-to-r from-emerald/30 to-gold/30" />
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