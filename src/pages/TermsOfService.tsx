import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, Heart, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald to-gold bg-clip-text text-transparent">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-muted-foreground text-lg">
            ZawajConnect - Plateforme Matrimoniale Islamique
          </p>
        </div>

        {/* Legal Header Card */}
        <Card className="mb-8 border-emerald/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <p><strong>ZawajConnect</strong></p>
              <p>Email : <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline">contact@zawajconnect.me</a></p>
              <p className="text-muted-foreground mt-4">Dernière mise à jour : 17 octobre 2025</p>
            </div>
          </CardContent>
        </Card>

        {/* Islamic Values Notice */}
        <Card className="mb-8 bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Heart className="h-6 w-6 text-emerald flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Notre Engagement Islamique</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ZawajConnect s'engage à respecter les valeurs islamiques de pudeur (Haya), 
                  respect (Ihtiram) et confiance (Amana). Notre plateforme vise à faciliter 
                  des unions halal et durables dans le respect de la Shariah.
                </p>
                <p className="text-emerald-dark italic mt-3 text-sm">
                  "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté." 
                  <span className="block mt-1">- Sourate Ar-Rum (30:21)</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <div className="space-y-8">
          {/* Article 1 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 1 - Définitions</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Plateforme :</strong> Le site web et l'application ZawajConnect accessible via zawajconnect.me</p>
                <p><strong>Utilisateur :</strong> Toute personne inscrite et utilisant les services de ZawajConnect</p>
                <p><strong>Wali :</strong> Tuteur légal ou familial désigné par l'utilisatrice pour superviser sa démarche matrimoniale</p>
                <p><strong>Contenu :</strong> Toute information, texte, photo, ou donnée partagée sur la plateforme</p>
                <p><strong>Services :</strong> L'ensemble des fonctionnalités offertes par ZawajConnect pour faciliter les rencontres matrimoniales</p>
              </div>
            </CardContent>
          </Card>

          {/* Article 2 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 2 - Objet du Service</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  ZawajConnect est une plateforme matrimoniale en ligne dédiée exclusivement à la 
                  facilitation de rencontres sérieuses dans un objectif de mariage conforme aux 
                  valeurs islamiques.
                </p>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900/30">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    ⚠️ Interdiction Formelle du Dating Casual
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 mt-2">
                    L'utilisation de cette plateforme à des fins de rencontres occasionnelles, 
                    de relations non-matrimoniales ou contraires aux principes islamiques est 
                    strictement interdite et entraînera la suspension immédiate du compte.
                  </p>
                </div>
                <p className="font-medium">Nos objectifs :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Faciliter des unions halal et durables</li>
                  <li>Respecter les valeurs islamiques de pudeur et de respect</li>
                  <li>Impliquer les familles dans le processus matrimonial</li>
                  <li>Créer un environnement sûr et conforme à la Shariah</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Article 3 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 3 - Conditions d'Éligibilité</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Pour utiliser ZawajConnect, vous devez :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li className="font-semibold">Avoir au moins <span className="text-emerald">18 ans révolus</span> (obligation légale)</li>
                  <li>Avoir une intention matrimoniale sérieuse et sincère</li>
                  <li>Vous engager à respecter les valeurs islamiques</li>
                  <li>Accepter le système de supervision familiale (Wali) si vous êtes une femme</li>
                  <li>Ne pas créer de faux profil ou usurper l'identité d'autrui</li>
                </ul>
                <p className="text-sm italic mt-4">
                  La création de compte implique l'acceptation de ces conditions et l'engagement 
                  à n'utiliser la plateforme que dans un objectif matrimonial halal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 4 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 4 - Création et Gestion du Compte</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>4.1 Création du compte</strong></p>
                <p>Lors de votre inscription, vous devez fournir des informations véridiques, exactes et à jour concernant votre identité, âge, situation personnelle et objectifs matrimoniaux.</p>
                
                <p className="mt-4"><strong>4.2 Vérification d'identité</strong></p>
                <p>ZawajConnect propose trois niveaux de vérification :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Basique (65 points) :</strong> Vérification email uniquement</li>
                  <li><strong>Enhanced (85 points) :</strong> Email + Téléphone + Photo (requis pour la messagerie)</li>
                  <li><strong>Ultra (100 points) :</strong> Email + Téléphone + Photo + Pièce d'identité + Validation familiale</li>
                </ul>
                
                <p className="mt-4"><strong>4.3 Responsabilité de l'utilisateur</strong></p>
                <p>Vous êtes responsable de :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>La confidentialité de vos identifiants de connexion</li>
                  <li>Toutes les activités effectuées via votre compte</li>
                  <li>La véracité des informations partagées</li>
                  <li>Informer immédiatement ZawajConnect en cas d'utilisation non autorisée de votre compte</li>
                </ul>

                <p className="mt-4"><strong>4.4 Droit de suspension</strong></p>
                <p>
                  ZawajConnect se réserve le droit de suspendre ou supprimer tout compte en cas de 
                  doute sur l'authenticité des informations, de comportement inapproprié ou de violation 
                  des présentes conditions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 5 - Système Wali */}
          <Card className="border-emerald/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Article 5 - Système Wali (Supervision Familiale)
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Le système Wali est une spécificité unique de ZawajConnect qui distingue 
                  notre plateforme des services de dating classiques.
                </p>
                
                <p><strong>5.1 Obligation pour les utilisatrices musulmanes</strong></p>
                <p>
                  Conformément aux principes islamiques, toute utilisatrice musulmane doit désigner 
                  un Wali (tuteur légal ou familial) pour superviser sa démarche matrimoniale.
                </p>
                
                <p className="mt-4"><strong>5.2 Rôle et responsabilités du Wali</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Approuver ou refuser les matches proposés</li>
                  <li>Superviser les conversations (avec consentement de l'utilisatrice)</li>
                  <li>Protéger l'utilisatrice contre les comportements inappropriés</li>
                  <li>Guider dans les décisions matrimoniales importantes</li>
                  <li>Mettre fin à une relation si nécessaire pour le bien de l'utilisatrice</li>
                </ul>
                
                <p className="mt-4"><strong>5.3 Processus d'invitation et d'acceptation</strong></p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>L'utilisatrice invite son Wali via email sécurisé</li>
                  <li>Le Wali reçoit un lien d'invitation unique et sécurisé</li>
                  <li>Le Wali accepte l'invitation et crée son compte de supervision</li>
                  <li>Le lien de supervision est établi et actif pendant 30 jours</li>
                  <li>Le Wali doit se reconnecter régulièrement pour maintenir son accès</li>
                </ol>
                
                <p className="mt-4"><strong>5.4 Droits du Wali</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Consulter les profils des matches potentiels</li>
                  <li>Voir les conversations (uniquement si l'utilisatrice l'autorise)</li>
                  <li>Approuver ou refuser un match avant la communication</li>
                  <li>Recevoir des notifications en cas de contenu signalé</li>
                  <li>Demander la suspension temporaire du compte de l'utilisatrice</li>
                </ul>
                
                <p className="mt-4"><strong>5.5 Protection de l'utilisatrice</strong></p>
                <div className="p-4 bg-emerald/10 border border-emerald/20 rounded-lg">
                  <p className="font-semibold text-emerald-dark">Clause de Protection</p>
                  <p className="mt-2">
                    Le Wali doit agir dans l'intérêt supérieur de l'utilisatrice, conformément 
                    aux principes islamiques de bienveillance et de protection. Tout abus de 
                    pouvoir ou comportement inapproprié du Wali peut être signalé à ZawajConnect 
                    pour révision.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article 6 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 6 - Conduite des Utilisateurs</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>6.1 Comportements obligatoires</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Communication respectueuse et pudique (Haya)</li>
                  <li>Honnêteté totale dans la présentation de soi</li>
                  <li>Respect du rythme et des limites de chacun</li>
                  <li>Implication de la famille dans le processus</li>
                </ul>
                
                <p className="mt-4"><strong>6.2 Comportements strictement interdits</strong></p>
                <div className="space-y-2 ml-4">
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Contenus immodestes, suggestifs ou contraires à la pudeur islamique</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Demandes de rencontres privées sans supervision familiale</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Partage d'informations personnelles (numéro, adresse) avant approbation du Wali</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Harcèlement, insistance non désirée, manipulation émotionnelle</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Mensonges sur situation matrimoniale, financière ou familiale</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Discrimination basée sur race, origine ethnique ou madhab</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Promotion de contenus non-islamiques (alcool, tabac, etc.)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <span>Usurpation d'identité ou création de faux profils</span>
                  </p>
                </div>

                <p className="mt-4"><strong>6.3 Sanctions graduées</strong></p>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-200">1ère infraction : Avertissement</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                      Email explicatif + notification à la famille (si Wali actif)
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded">
                    <p className="font-semibold text-orange-900 dark:text-orange-200">2ème infraction : Suspension 7 jours</p>
                    <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                      Compte suspendu + notification obligatoire à la famille
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded">
                    <p className="font-semibold text-red-900 dark:text-red-200">3ème infraction : Bannissement définitif</p>
                    <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                      Suppression permanente du compte SANS REMBOURSEMENT
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article 7 */}
          <Card className="border-gold/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 7 - Modération et Sécurité</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  ZawajConnect utilise un système de modération à deux niveaux pour garantir 
                  un environnement sûr et respectueux des valeurs islamiques.
                </p>
                
                <p><strong>7.1 Modération IA en temps réel (95% de précision)</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Analyse automatique de tous les messages avant envoi</li>
                  <li>Détection des contenus inappropriés selon nos règles islamiques</li>
                  <li>Blocage immédiat des messages violant les règles</li>
                  <li>Notification instantanée avec explication claire</li>
                </ul>
                
                <p className="mt-4"><strong>7.2 Modération humaine</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Révision des cas complexes sous 24-48h</li>
                  <li>Décision finale sur les suspensions et bannissements</li>
                  <li>Possibilité de contestation pour les utilisateurs</li>
                  <li>Formation continue sur les valeurs islamiques</li>
                </ul>
                
                <p className="mt-4"><strong>7.3 Transparence</strong></p>
                <p>
                  La raison précise de la modération est toujours communiquée à l'utilisateur, 
                  avec référence à l'article des CGU violé.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 8 - Abonnements */}
          <Card className="border-gold/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 8 - Abonnements et Tarification</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>8.1 Offre Freemium (Gratuite)</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Consultation de 5 profils détaillés par jour</li>
                  <li>Création et personnalisation de profil</li>
                  <li>Système de vérification basique</li>
                </ul>
                <p className="text-sm italic">Limitations : Pas de messagerie, pas de likes, pas de matches</p>
                
                <p className="mt-4"><strong>8.2 Offres Premium (Prix Hors Taxes)</strong></p>
                <div className="grid gap-3 mt-3">
                  <div className="p-4 bg-emerald/5 border border-emerald/20 rounded-lg">
                    <p className="font-semibold text-emerald">Engagement 3 mois</p>
                    <p className="text-2xl font-bold text-foreground mt-1">9.99€/mois HT</p>
                    <p className="text-sm text-muted-foreground">(~11.99€ TTC)</p>
                  </div>
                  <div className="p-4 bg-emerald/5 border border-emerald/20 rounded-lg">
                    <p className="font-semibold text-emerald">Engagement 6 mois - Économie 17%</p>
                    <p className="text-2xl font-bold text-foreground mt-1">8.33€/mois HT</p>
                    <p className="text-sm text-muted-foreground">(~9.99€ TTC)</p>
                  </div>
                  <div className="p-4 bg-gold/5 border border-gold/20 rounded-lg">
                    <p className="font-semibold text-gold">Engagement 12 mois - Économie 33% ⭐</p>
                    <p className="text-2xl font-bold text-foreground mt-1">6.66€/mois HT</p>
                    <p className="text-sm text-muted-foreground">(~7.99€ TTC)</p>
                  </div>
                </div>
                
                <p className="mt-4"><strong>8.3 Modalités de paiement</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Paiement mensuel récurrent via Stripe (sécurisé)</li>
                  <li>Renouvellement automatique jusqu'à fin de l'engagement</li>
                  <li>PAS de renouvellement après la fin de la période d'engagement</li>
                  <li>Annulation possible à tout moment (service actif jusqu'à fin du mois payé)</li>
                </ul>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    Pour les conditions de remboursement détaillées, consultez notre 
                    <Link to="/refund-policy" className="text-blue-600 hover:underline ml-1">Politique de Remboursement</Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article 9 - Remboursement (Résumé) */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 9 - Droit de Rétractation et Remboursement</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  ZawajConnect offre une <strong>garantie satisfait ou remboursé de 7 jours</strong> ainsi qu'un 
                  <strong> droit de rétractation légal de 14 jours</strong> conformément à la loi française sur 
                  la vente à distance.
                </p>
                <p>
                  Pour tous les détails sur les conditions de remboursement, les cas d'exclusion et la 
                  procédure à suivre, veuillez consulter notre 
                  <Link to="/refund-policy" className="text-emerald hover:underline ml-1 font-semibold">
                    Politique de Remboursement complète
                  </Link>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 10 - Propriété Intellectuelle */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 10 - Propriété Intellectuelle</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>10.1 Photos et contenus uploadés</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Vous restez propriétaire de tous les contenus que vous uploadez</li>
                  <li>Vous accordez à ZawajConnect une licence d'utilisation non-exclusive</li>
                  <li>Cette licence permet uniquement l'affichage sur la plateforme</li>
                  <li>Interdiction formelle de réutilisation par d'autres utilisateurs</li>
                </ul>
                
                <p className="mt-4"><strong>10.2 Marque et logo ZawajConnect</strong></p>
                <p>
                  La marque "ZawajConnect", le logo et tous les éléments graphiques sont la 
                  propriété exclusive de ZawajConnect. Leur utilisation sans autorisation écrite 
                  préalable est strictement interdite.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 11 - RGPD */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 11 - Protection des Données Personnelles (RGPD)</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  ZawajConnect est pleinement conforme au Règlement Général sur la Protection des Données 
                  (RGPD - UE 2016/679).
                </p>
                
                <p><strong>11.1 Responsable de traitement</strong></p>
                <p>contact@zawajconnect.me</p>
                
                <p><strong>11.2 Données collectées</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Données d'identité (nom, prénom, date de naissance)</li>
                  <li>Coordonnées (email, téléphone si fourni)</li>
                  <li>Photos et contenus uploadés</li>
                  <li>Données de navigation et cookies</li>
                </ul>
                
                <p><strong>11.3 Finalités du traitement</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mise en relation matrimoniale</li>
                  <li>Vérification d'identité et sécurité</li>
                  <li>Amélioration du service</li>
                  <li>Communication commerciale (avec consentement)</li>
                </ul>
                
                <p><strong>11.4 Durée de conservation</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Compte actif : Durée de l'inscription</li>
                  <li>Compte supprimé : 30 jours (conformité légale)</li>
                  <li>Données de modération : 3 ans (preuve légale)</li>
                </ul>
                
                <p><strong>11.5 Vos droits (RGPD)</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement ("droit à l'oubli")</li>
                  <li>Droit à la portabilité</li>
                  <li>Droit d'opposition au traitement</li>
                  <li>Droit de limitation du traitement</li>
                </ul>
                
                <p><strong>11.6 Exercice de vos droits</strong></p>
                <p>
                  Pour exercer vos droits, envoyez un email à 
                  <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline ml-1">
                    contact@zawajconnect.me
                  </a> avec un justificatif d'identité.
                </p>
                
                <p><strong>11.7 Réclamation</strong></p>
                <p>
                  Vous pouvez saisir la CNIL (Commission Nationale de l'Informatique et des Libertés) 
                  à l'adresse : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald hover:underline">www.cnil.fr</a>
                </p>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                  <p className="text-sm">
                    Pour plus de détails, consultez notre 
                    <Link to="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                      Politique de Confidentialité complète
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article 12 - Limitation de Responsabilité */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 12 - Limitation de Responsabilité</h2>
              <div className="space-y-3 text-muted-foreground">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    ⚠️ ZawajConnect est une plateforme de mise en relation uniquement
                  </p>
                </div>
                
                <p><strong>12.1 Ce que nous ne sommes PAS :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nous ne sommes pas une agence matrimoniale</li>
                  <li>Nous ne garantissons aucun résultat (mariage)</li>
                  <li>Nous ne vérifions pas exhaustivement toutes les informations fournies</li>
                </ul>
                
                <p><strong>12.2 Responsabilité de l'utilisateur :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Vérifier personnellement les informations des autres utilisateurs</li>
                  <li>Impliquer sa famille (Wali) dans la vérification</li>
                  <li>Prendre ses propres décisions matrimoniales</li>
                </ul>
                
                <p><strong>12.3 Exclusions de responsabilité :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fausses informations fournies par un utilisateur</li>
                  <li>Comportements inappropriés d'autres utilisateurs</li>
                  <li>Problèmes techniques indépendants de notre volonté</li>
                  <li>Échec d'une relation matrimoniale</li>
                </ul>
                
                <p><strong>12.4 Notre engagement :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modération active et rigoureuse</li>
                  <li>Vérification d'identité multi-niveaux</li>
                  <li>Support client réactif</li>
                  <li>Amélioration continue de la sécurité</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Article 13 - Résiliation */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 13 - Résiliation et Suppression du Compte</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>13.1 Résiliation par l'utilisateur</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Droit de supprimer votre compte à tout moment</li>
                  <li>Procédure : Paramètres {'>'} Sécurité {'>'} Supprimer mon compte</li>
                  <li>Suppression définitive sous 30 jours (délai légal)</li>
                  <li>Pas de remboursement après 7 jours d'abonnement</li>
                </ul>
                
                <p><strong>13.2 Résiliation par ZawajConnect</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>En cas de violation des CGU</li>
                  <li>En cas de comportement frauduleux</li>
                  <li>En cas de fausses informations répétées</li>
                  <li>SANS REMBOURSEMENT si résiliation pour faute</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Article 14 - Modifications */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 14 - Modification des CGU</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  ZawajConnect se réserve le droit de modifier les présentes CGU à tout moment.
                </p>
                <p><strong>Notification obligatoire :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Notification par email 15 jours avant application</li>
                  <li>Possibilité de refuser : vous devez supprimer votre compte dans les 15 jours</li>
                  <li>Poursuite de l'utilisation = acceptation tacite des nouvelles CGU</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Article 15 - Loi Applicable */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 15 - Loi Applicable et Juridiction</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Droit applicable :</strong> Droit français</p>
                <p><strong>Juridiction compétente :</strong> Tribunaux de Paris</p>
                <p><strong>Médiation :</strong></p>
                <p>
                  En cas de litige, possibilité de recours à un médiateur avant saisine judiciaire.
                  Contact médiateur : 
                  <a href="https://www.economie.gouv.fr/mediation-conso" target="_blank" rel="noopener noreferrer" className="text-emerald hover:underline ml-1">
                    www.economie.gouv.fr/mediation-conso
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article 16 - Contact */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Article 16 - Contact et Réclamations</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Email unique :</strong></p>
                <p>
                  <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline text-lg font-semibold">
                    contact@zawajconnect.me
                  </a>
                </p>
                
                <p><strong>Délai de réponse :</strong> 48-72 heures ouvrables</p>
                
                <p><strong>Procédure de réclamation :</strong></p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Envoyez un email à contact@zawajconnect.me</li>
                  <li>Objet : "Réclamation - [Nature du problème]"</li>
                  <li>Description détaillée de votre réclamation</li>
                  <li>Réponse sous 7 jours ouvrables maximum</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citation Finale */}
        <Card className="mt-12 bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
          <CardContent className="p-8 text-center">
            <p className="text-lg italic text-muted-foreground mb-4">
              "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez 
              en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté. 
              Il y a en cela des preuves pour des gens qui réfléchissent."
            </p>
            <p className="text-emerald font-semibold">- Sourate Ar-Rum (30:21)</p>
            <Separator className="my-6" />
            <p className="text-sm text-muted-foreground">
              Qu'Allah bénisse tous nos utilisateurs dans leur recherche d'une union halal et durable - آمين
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/privacy-policy" className="text-emerald hover:underline">Politique de Confidentialité</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/refund-policy" className="text-emerald hover:underline">Politique de Remboursement</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/community-guidelines" className="text-emerald hover:underline">Charte Communautaire</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/cookie-policy" className="text-emerald hover:underline">Cookies</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
