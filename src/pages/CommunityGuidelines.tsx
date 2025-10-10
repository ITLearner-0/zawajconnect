import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, Heart, AlertTriangle, CheckCircle, Flag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald to-gold bg-clip-text text-transparent">
            Charte de la Communauté
          </h1>
          <p className="text-muted-foreground text-lg">
            Ensemble, créons un espace respectueux et conforme aux valeurs islamiques
          </p>
        </div>

        <Card className="mb-8 border-emerald/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <p><strong>ZawajConnect</strong></p>
              <p>Auto-entrepreneur - Responsable : <strong>A.K.</strong></p>
              <p>Email : <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline">contact@zawajconnect.me</a></p>
              <p className="text-muted-foreground mt-4">Dernière mise à jour : 17 octobre 2025</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1 - Objectif */}
          <Card className="bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Notre Objectif</h2>
              <p className="text-muted-foreground leading-relaxed">
                Créer un espace sûr, respectueux et conforme aux valeurs islamiques pour faciliter 
                des unions matrimoniales halal et durables. Notre communauté est fondée sur les principes 
                de pudeur (Haya), respect (Ihtiram), honnêteté (Sidq) et confiance (Amana).
              </p>
            </CardContent>
          </Card>

          {/* Section 2 - Comportements Encouragés */}
          <Card className="border-emerald/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="h-8 w-8 text-emerald flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-emerald">Comportements Encouragés</h2>
                  <p className="text-sm text-muted-foreground">Ce que nous valorisons</p>
                </div>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Honnêteté totale (Sidq)</strong> dans la présentation de soi</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Respect mutuel</strong> dans tous les échanges</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Communication pudique</strong> et appropriée</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Transparence</strong> sur vos intentions matrimoniales</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Implication familiale (Wali)</strong> dès le début du processus</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Patience</strong> et respect du rythme de chacun</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">✅</span>
                  <p><strong>Prière de consultation (Istikharah)</strong> avant les décisions importantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 - Comportements Interdits */}
          <Card className="border-red-200 dark:border-red-900/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Comportements Strictement Interdits</h2>
                  <p className="text-sm text-muted-foreground">Violations entraînant des sanctions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground mb-2">3.1 - Contenus Inappropriés</p>
                  <div className="space-y-2 ml-4 text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Photos ou messages immodestes/suggestifs</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Demandes de photos inappropriées</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Langage vulgaire ou grossier</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Références à l'alcool, drogues, ou activités haram</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">3.2 - Comportements Contraires à la Sécurité</p>
                  <div className="space-y-2 ml-4 text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Partage d'informations personnelles (numéro, adresse) avant approbation familiale</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Demandes de rencontres privées sans supervision Wali</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Pression pour accélérer le processus de mariage</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Demandes d'argent ou de cadeaux</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">3.3 - Comportements Frauduleux</p>
                  <div className="space-y-2 ml-4 text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Faux profils ou usurpation d'identité</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Mensonges sur situation matrimoniale (déjà marié, divorcé non déclaré)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Fausses informations financières ou professionnelles</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">3.4 - Harcèlement et Discrimination</p>
                  <div className="space-y-2 ml-4 text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Insistance après un refus clair</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Messages répétés non désirés</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">❌</span>
                      <span>Discrimination basée sur race, origine ethnique ou madhab</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 - Système de Modération */}
          <Card className="border-gold/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Shield className="h-8 w-8 text-emerald flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-emerald">Système de Modération 🛡️</h2>
                  <p className="text-sm text-muted-foreground">Protection active 24/7</p>
                </div>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-2">4.1 - Modération IA en Temps Réel</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Analyse automatique de tous les messages avant envoi</li>
                    <li>Détection des contenus inappropriés avec 95% de précision</li>
                    <li>Blocage immédiat si règle violée</li>
                    <li>Notification instantanée avec explication claire</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">4.2 - Modération Humaine</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Révision des cas complexes sous 24-48h</li>
                    <li>Décision finale sur les suspensions/bannissements</li>
                    <li>Possibilité de contestation pour les utilisateurs</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">4.3 - Système de Signalement</p>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                    <ul className="text-sm space-y-2">
                      <li><Flag className="h-4 w-4 inline mr-2 text-blue-600" />Bouton "Signaler" sur chaque profil et message</li>
                      <li><Shield className="h-4 w-4 inline mr-2 text-blue-600" />Confidentialité absolue : L'utilisateur signalé ne saura jamais qui l'a signalé</li>
                      <li><Clock className="h-4 w-4 inline mr-2 text-blue-600" />Délai de traitement : 24-48h</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 - Sanctions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Sanctions Graduées ⚠️</h2>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Niveau 1 : Avertissement</p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 ml-4">
                    <li>• 1ère violation mineure</li>
                    <li>• Email explicatif envoyé</li>
                    <li>• Notification à la famille (si supervision activée)</li>
                    <li>• Aucune sanction si correction immédiate</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-lg">
                  <p className="font-semibold text-orange-900 dark:text-orange-200 mb-2">Niveau 2 : Suspension Temporaire (7 jours)</p>
                  <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1 ml-4">
                    <li>• 2ème violation ou violation modérée</li>
                    <li>• Compte suspendu pendant 7 jours</li>
                    <li>• Email détaillant la raison</li>
                    <li>• Notification obligatoire à la famille (si Wali)</li>
                    <li>• Possibilité de contestation sous 48h</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                  <p className="font-semibold text-red-900 dark:text-red-200 mb-2">Niveau 3 : Bannissement Définitif</p>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 ml-4">
                    <li>• 3ème violation ou violation grave</li>
                    <li>• Suppression immédiate du compte</li>
                    <li>• PAS DE REMBOURSEMENT (clause CGU)</li>
                    <li>• Notification à la famille</li>
                    <li>• Blocage permanent de l'email et de l'appareil</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-100 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-900/50 rounded-lg">
                  <p className="font-semibold text-red-900 dark:text-red-200 mb-2">🚨 Violations Graves (Bannissement Immédiat)</p>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 ml-4">
                    <li>• Harcèlement sexuel</li>
                    <li>• Partage de contenus pornographiques</li>
                    <li>• Menaces ou intimidation</li>
                    <li>• Escroquerie financière</li>
                    <li>• Usurpation d'identité grave</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 - Droit de Recours */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Droit de Recours ⚖️</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Vous pouvez contester toute sanction en respectant la procédure suivante :</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>
                    <strong>Délai :</strong> Contestation possible sous <strong>48 heures</strong> après réception de la sanction
                  </li>
                  <li>
                    <strong>Email :</strong> <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline">contact@zawajconnect.me</a>
                  </li>
                  <li>
                    <strong>Objet :</strong> "Contestation - [Type de sanction]"
                  </li>
                  <li>
                    <strong>Réponse :</strong> Sous 72h ouvrables
                  </li>
                  <li>
                    <strong>Révision :</strong> Examen impartial par un modérateur senior
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 - Confidentialité */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Protection de Votre Vie Privée 🔒</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>Toutes les modérations sont confidentielles</li>
                <li>Aucun utilisateur ne saura qui l'a signalé</li>
                <li>Données de modération conservées 3 ans (obligation légale)</li>
                <li>Accès restreint aux modérateurs certifiés uniquement</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8 - Conseils de Sécurité */}
          <Card className="bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Conseils de Sécurité 💡</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Impliquez votre Wali dès le début</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Vérifiez les informations via votre famille</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Ne partagez jamais d'informations bancaires</span>
                  </p>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Prenez votre temps (pas de précipitation)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Faites Istikharah avant décisions importantes</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span>Signalez tout comportement suspect</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citation Finale */}
        <Card className="mt-12 bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
          <CardContent className="p-8 text-center">
            <p className="text-lg italic text-muted-foreground mb-4">
              "Ne vous moquez pas les uns des autres, et ne vous dénigrez pas. Ô vous qui croyez ! 
              Évitez de trop conjecturer [sur autrui] car une partie des conjectures est péché."
            </p>
            <p className="text-emerald font-semibold">- Sourate Al-Hujurat (49:11-12)</p>
            <Separator className="my-6" />
            <p className="text-sm text-muted-foreground">
              Ensemble, construisons une communauté respectueuse et bénie - إن شاء الله
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/terms-of-service" className="text-emerald hover:underline">Conditions d'Utilisation</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/privacy-policy" className="text-emerald hover:underline">Politique de Confidentialité</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/refund-policy" className="text-emerald hover:underline">Remboursement</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/cookie-policy" className="text-emerald hover:underline">Cookies</Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;
