import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Users, FileText, Clock, Mail, Phone } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Politique de Confidentialité</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Votre confidentialité et la protection de vos données personnelles sont notre priorité
            absolue
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Dernière mise à jour : 4 septembre 2024
          </div>
        </div>

        {/* Islamic Values Notice */}
        <Card className="mb-8 bg-gradient-to-r from-gold/10 to-emerald/10 border-gold/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-3">Engagement Islamique</h3>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous engageons à protéger votre vie privée conformément aux principes islamiques
              de respect, d'honnêteté et de protection de l'intimité (Hikmah). Vos informations
              personnelles sont traitées comme une Amana (dépôt de confiance) que nous devons
              préserver.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald" />
                1. Collecte des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Informations que nous collectons :
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Informations personnelles : nom, âge, localisation, profession, éducation</li>
                  <li>
                    Préférences religieuses : madhab, pratique religieuse, importance de la foi
                  </li>
                  <li>Photos de profil (respectant les directives islamiques de pudeur)</li>
                  <li>Préférences de recherche et critères de compatibilité</li>
                  <li>Historique d'activité sur la plateforme (visites, likes, messages)</li>
                  <li>
                    Données de vérification (email, téléphone, documents d'identité optionnels)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Comment nous collectons ces données :
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Lors de votre inscription et création de profil</li>
                  <li>Quand vous utilisez notre plateforme et ses fonctionnalités</li>
                  <li>Via vos interactions avec d'autres utilisateurs</li>
                  <li>Par le biais des processus de vérification</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                2. Utilisation des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nous utilisons vos données personnelles uniquement pour :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Créer et maintenir votre profil matrimonial</li>
                <li>Vous proposer des matches compatibles selon vos critères islamiques</li>
                <li>Faciliter la communication respectueuse entre utilisateurs</li>
                <li>Vérifier l'authenticité des profils et maintenir la sécurité</li>
                <li>Améliorer nos services et l'algorithme de compatibilité</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
                <li>Respecter nos obligations légales et réglementaires</li>
              </ul>
              <div className="bg-emerald/5 rounded-lg p-4 border border-emerald/20">
                <p className="text-emerald-dark font-medium text-sm">
                  <strong>Engagement :</strong> Nous ne vendons jamais vos données et ne les
                  utilisons jamais à des fins commerciales non liées au mariage halal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                3. Partage des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Qui peut voir vos informations :
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    <strong>Autres utilisateurs :</strong> Selon vos paramètres de confidentialité
                  </li>
                  <li>
                    <strong>Votre famille :</strong> Si vous activez l'implication familiale
                  </li>
                  <li>
                    <strong>Notre équipe :</strong> Uniquement pour la modération et le support
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Nous ne partageons JAMAIS vos données avec :
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Des entreprises publicitaires ou de marketing</li>
                  <li>Des courtiers en données</li>
                  <li>Des plateformes de médias sociaux externes</li>
                  <li>Des tiers non autorisés</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                4. Sécurité des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nous protégeons vos données avec des mesures de sécurité de niveau bancaire :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Chiffrement des données sensibles en base</li>
                <li>Authentification à deux facteurs disponible</li>
                <li>Surveillance continue contre les intrusions</li>
                <li>Accès limité et contrôlé par notre équipe</li>
                <li>Audits de sécurité réguliers</li>
                <li>Sauvegades sécurisées et redondantes</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                5. Vos Droits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Conformément au RGPD et à nos valeurs islamiques de justice, vous avez le droit de :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Accéder à vos données personnelles</li>
                  <li>Corriger des informations inexactes</li>
                  <li>Demander la suppression de vos données</li>
                  <li>Limiter le traitement de vos données</li>
                </ul>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Exporter vos données (portabilité)</li>
                  <li>Retirer votre consentement</li>
                  <li>Déposer une réclamation</li>
                  <li>Contrôler vos paramètres de confidentialité</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                6. Conservation des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  <strong>Profils actifs :</strong> Tant que votre compte est actif
                </li>
                <li>
                  <strong>Profils supprimés :</strong> 30 jours puis suppression définitive
                </li>
                <li>
                  <strong>Messages :</strong> Conservés selon vos paramètres (1 an maximum)
                </li>
                <li>
                  <strong>Données de sécurité :</strong> 2 ans pour la protection de la communauté
                </li>
                <li>
                  <strong>Données légales :</strong> Selon les obligations légales applicables
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                7. Cookies et Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Nous utilisons des cookies et technologies similaires pour :
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Maintenir votre session connectée</li>
                <li>Mémoriser vos préférences</li>
                <li>Améliorer votre expérience utilisateur</li>
                <li>Analyser l'utilisation de la plateforme (anonymisé)</li>
                <li>Prévenir la fraude et assurer la sécurité</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Vous pouvez contrôler les cookies via les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gradient-to-r from-emerald/5 to-gold/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald" />
                8. Nous Contacter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Pour toute question concernant cette politique de confidentialité ou vos données
                personnelles :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-emerald" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">privacy@zawajconnect.fr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-emerald" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="border-gold/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Modifications de cette Politique
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier cette politique de confidentialité. Toute
                modification importante vous sera notifiée par email et via la plateforme. Nous vous
                encourageons à consulter régulièrement cette page.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Islamic Closing */}
        <Card className="mt-8 bg-gradient-to-r from-gold/10 to-emerald/10 border-gold/20">
          <CardContent className="p-6 text-center">
            <p className="text-emerald-dark font-medium mb-2">
              "Et Allah sait mieux ce qui vous convient"
            </p>
            <p className="text-sm text-muted-foreground">
              Qu'Allah bénisse votre recherche et protège vos informations - آمين
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
