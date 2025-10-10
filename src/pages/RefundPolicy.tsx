import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
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
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald to-gold bg-clip-text text-transparent">
            Politique de Remboursement
          </h1>
          <p className="text-muted-foreground text-lg">
            Transparence et Justice dans nos Engagements
          </p>
        </div>

        {/* Legal Header Card */}
        <Card className="mb-8 border-emerald/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <p><strong>ZawajConnect</strong></p>
              <p>Auto-entrepreneur - Responsable : <strong>A.K.</strong></p>
              <p>SIRET : 522 317 767 00039</p>
              <p>Siège social : 91 Rue du Faubourg Saint-Honoré, 75008 Paris 08</p>
              <p>Email : <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline">contact@zawajconnect.me</a></p>
              <p className="text-muted-foreground mt-4">Dernière mise à jour : 17 octobre 2025</p>
            </div>
          </CardContent>
        </Card>

        {/* Principe Général */}
        <Card className="mb-8 bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald">Principe Général</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Chez ZawajConnect, votre satisfaction est notre priorité absolue. Nous nous engageons 
              à une transparence totale sur nos conditions de remboursement, conformément aux principes 
              islamiques de justice (Adl) et de compassion (Rahma).
            </p>
            <div className="p-4 bg-emerald/10 border border-emerald/20 rounded-lg">
              <p className="text-sm italic text-emerald-dark">
                "Et si le débiteur est dans la gêne, accordez-lui un sursis jusqu'à ce qu'il soit dans l'aisance. 
                Mais il est mieux pour vous de faire preuve de charité, si vous saviez !"
                <span className="block mt-2">- Sourate Al-Baqara (2:280)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 - Garantie 7 jours */}
          <Card className="border-gold/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-gold to-emerald rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald">Garantie Satisfait ou Remboursé - 7 Jours</h2>
                  <p className="text-sm text-muted-foreground">Notre engagement prioritaire envers vous</p>
                </div>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="font-semibold text-lg text-foreground mb-2">
                    ✅ Remboursement intégral dans les 7 premiers jours
                  </p>
                  <p>
                    Si vous demandez un remboursement dans les <strong>7 premiers jours</strong> suivant 
                    votre paiement initial, vous recevrez un <strong>remboursement intégral à 100%</strong>, 
                    sans aucune justification demandée.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-foreground">Procédure simple et rapide :</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Envoyez un email à <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline font-semibold">contact@zawajconnect.me</a></li>
                    <li>Objet : "Demande de remboursement - [Votre User ID ou email d'inscription]"</li>
                    <li>Indiquez la raison (optionnel mais apprécié pour améliorer notre service)</li>
                    <li>Nous traitons votre demande sous 2-3 jours ouvrables</li>
                    <li>Remboursement effectif sous 5-7 jours ouvrables (selon votre banque)</li>
                  </ol>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded">
                    <p className="text-sm">
                      <Clock className="h-4 w-4 inline mr-2" />
                      <strong>Délai de traitement :</strong>
                    </p>
                    <ul className="text-sm ml-6 mt-2 space-y-1">
                      <li>• Examen de la demande : 2-3 jours ouvrables</li>
                      <li>• Remboursement effectif : 5-7 jours ouvrables après acceptation</li>
                      <li>• Notification par email à chaque étape du processus</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 - Droit de Rétractation 14 jours */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Droit de Rétractation Légal (14 jours)</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Conformément au Code de la consommation français (vente à distance), vous disposez 
                  d'un délai de <strong>14 jours</strong> pour exercer votre droit de rétractation.
                </p>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    ⚠️ Clause Importante
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 text-sm">
                    Ce droit s'applique uniquement si le service n'a pas été utilisé de manière substantielle. 
                    Si vous avez consulté <strong>plus de 20 profils</strong> ou envoyé des messages, 
                    le service est considéré comme "utilisé" et le droit de rétractation ne s'applique plus.
                  </p>
                </div>

                <p className="text-sm">
                  Dans ce cas, la <strong>Garantie Satisfait ou Remboursé de 7 jours</strong> (Section 1) 
                  reste votre meilleure option.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 - Remboursement Prorata */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Remboursement Prorata (Cas Exceptionnels)</h2>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-semibold text-foreground">Situations éligibles :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Problème technique majeur</strong> imputable à ZawajConnect (panne de service {'>'}48h)
                  </li>
                  <li>
                    <strong>Suspension injustifiée</strong> de votre compte (après vérification par nos équipes)
                  </li>
                  <li>
                    <strong>Fonctionnalité premium non accessible</strong> pendant plus de 7 jours consécutifs
                  </li>
                </ul>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Calcul du remboursement prorata</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Le remboursement est calculé proportionnellement au temps restant de votre abonnement.
                  </p>
                  <div className="mt-3 p-3 bg-white dark:bg-blue-950/40 rounded">
                    <p className="text-sm font-mono">
                      <strong>Exemple :</strong><br/>
                      Abonnement 3 mois à 9.99€/mois<br/>
                      Utilisé 1 mois → Remboursement : 2 × 9.99€ = <strong>19.98€</strong>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 - Cas d'Exclusion */}
          <Card className="border-red-200 dark:border-red-900/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Cas où le Remboursement N'est PAS Possible</h2>
                  <p className="text-sm text-muted-foreground">Pour prévenir les abus et garantir l'équité</p>
                </div>
              </div>
              
              <div className="space-y-3 text-muted-foreground">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Après les 7 premiers jours d'abonnement actif</p>
                      <p className="text-sm">Une fois la période de garantie écoulée, aucun remboursement n'est possible sauf cas exceptionnels (Section 3)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Utilisation intensive du service</p>
                      <p className="text-sm">Si vous avez consulté plus de 20 profils détaillés ou envoyé des messages</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Violation des Conditions d'Utilisation</p>
                      <ul className="text-sm list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Comportement inapproprié ou contraire aux valeurs islamiques</li>
                        <li>Contenus immodestes ou suggestifs</li>
                        <li>Harcèlement d'autres utilisateurs</li>
                        <li>Fausses informations ou usurpation d'identité</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Bannissement pour non-respect des règles de modération</p>
                      <p className="text-sm">Si votre compte a été banni pour violation grave de notre Charte Communautaire</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Abonnements de plus d'un mois déjà utilisés</p>
                      <p className="text-sm">Seule la période restante peut être éligible au remboursement prorata (Section 3)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-foreground">Demande de remboursement frauduleuse</p>
                      <p className="text-sm">Toute tentative de fraude entraîne le rejet de la demande et le bannissement du compte</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 - Procédure Détaillée */}
          <Card className="border-emerald/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-emerald">Procédure de Demande de Remboursement</h2>
                  <p className="text-sm text-muted-foreground">Suivez ces étapes simples</p>
                </div>
              </div>
              
              <div className="space-y-4 text-muted-foreground">
                <div className="p-4 bg-emerald/5 border border-emerald/20 rounded-lg">
                  <p className="font-semibold text-foreground mb-3">Pour toute demande de remboursement :</p>
                  <ol className="list-decimal list-inside space-y-3 ml-2">
                    <li>
                      <strong>Envoyez un email à :</strong> 
                      <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline ml-2 font-semibold">
                        contact@zawajconnect.me
                      </a>
                    </li>
                    <li>
                      <strong>Objet :</strong> "Demande de remboursement - [Votre User ID ou email d'inscription]"
                    </li>
                    <li>
                      <strong>Informations à fournir :</strong>
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Nom complet</li>
                        <li>Email d'inscription</li>
                        <li>Date du paiement</li>
                        <li>Montant payé</li>
                        <li>Raison du remboursement (optionnel mais apprécié)</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Pièce jointe :</strong> Copie de la confirmation de paiement Stripe (si disponible)
                    </li>
                  </ol>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    📧 Traitement de votre demande
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Nous examinerons votre demande sous 2-3 jours ouvrables. Vous recevrez un email de confirmation avec :
                  </p>
                  <ul className="text-sm mt-2 space-y-1 ml-4">
                    <li>✓ Acceptation ou refus motivé de la demande</li>
                    <li>✓ Délai de remboursement (5-7 jours si accepté)</li>
                    <li>✓ Numéro de suivi de la demande</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 - Annulation Abonnement */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Annulation d'Abonnement (Sans Remboursement)</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Vous pouvez <strong>annuler votre abonnement à tout moment</strong> via le portail de gestion Stripe.
                </p>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    ⚠️ Important à savoir
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
                    <li>• Votre service reste <strong>actif jusqu'à la fin du mois en cours</strong></li>
                    <li>• <strong>Pas de remboursement</strong> pour le mois déjà payé</li>
                    <li>• <strong>Pas de renouvellement</strong> après la fin de votre engagement (3, 6 ou 12 mois)</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="font-semibold text-foreground mb-2">Procédure d'annulation :</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Connectez-vous à votre compte ZawajConnect</li>
                    <li>Allez dans : Paramètres {'>'}  Premium {'>'} Gérer mon abonnement</li>
                    <li>Cliquez sur "Annuler l'abonnement"</li>
                    <li>Confirmez votre décision</li>
                    <li>Vous recevrez un email de confirmation</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7 - Problèmes Techniques */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Remboursements en Cas de Problème Technique</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Nous nous engageons à maintenir un service de qualité. En cas de problème technique majeur 
                  imputable à ZawajConnect :
                </p>
                
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Panne de service {'>'}48h :</strong> Remboursement automatique proportionnel
                  </li>
                  <li>
                    <strong>Fonctionnalité premium indisponible {'>'}7 jours :</strong> Remboursement partiel
                  </li>
                  <li>
                    <strong>Notification proactive :</strong> Nous vous contactons en cas de problème majeur
                  </li>
                </ul>

                <p className="text-sm italic">
                  Notre équipe technique surveille la plateforme 24/7 pour garantir une disponibilité optimale.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8 - Protection Anti-Abus */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Protection contre les Abus</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Pour garantir l'équité envers tous nos utilisateurs, nous avons mis en place un système 
                  de détection des demandes frauduleuses.
                </p>
                
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                  <p className="font-semibold text-red-900 dark:text-red-200 mb-2">
                    ⚠️ Limitation Anti-Abus
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Maximum <strong>2 remboursements</strong> par utilisateur sur une période de 12 mois. 
                    En cas d'abus répété (tentatives frauduleuses, fausses déclarations), le compte sera 
                    <strong> banni de façon permanente sans remboursement</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 9 - Conformité Stripe */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">Conformité et Sécurité Stripe</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Tous les remboursements sont traités via <strong>Stripe</strong>, notre processeur de paiement 
                  sécurisé et certifié PCI-DSS.
                </p>
                
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Le remboursement apparaîtra sur votre relevé bancaire sous "ZawajConnect - Remboursement"</li>
                  <li>Délai bancaire : 5-10 jours selon votre établissement bancaire</li>
                  <li>Aucune information bancaire n'est stockée sur nos serveurs</li>
                  <li>Traçabilité complète de toutes les transactions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citation Finale */}
        <Card className="mt-12 bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
          <CardContent className="p-8 text-center">
            <p className="text-lg italic text-muted-foreground mb-4">
              "Et si le débiteur est dans la gêne, accordez-lui un sursis jusqu'à ce qu'il soit dans l'aisance. 
              Mais il est mieux pour vous de faire preuve de charité, si vous saviez !"
            </p>
            <p className="text-emerald font-semibold mb-6">- Sourate Al-Baqara (2:280)</p>
            <Separator className="my-6" />
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Engagement ZawajConnect</p>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Nous nous engageons à traiter chaque demande de remboursement avec justice (Adl) et compassion (Rahma), 
                conformément aux valeurs islamiques qui fondent notre plateforme.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact rapide */}
        <Card className="mt-8 border-gold/30">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-emerald mx-auto mb-4" />
            <p className="font-semibold text-lg mb-2">Une question sur les remboursements ?</p>
            <a 
              href="mailto:contact@zawajconnect.me" 
              className="text-emerald hover:underline text-lg font-semibold"
            >
              contact@zawajconnect.me
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              Réponse sous 48-72h ouvrables
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/terms-of-service" className="text-emerald hover:underline">Conditions d'Utilisation</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/privacy-policy" className="text-emerald hover:underline">Politique de Confidentialité</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/community-guidelines" className="text-emerald hover:underline">Charte Communautaire</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/cookie-policy" className="text-emerald hover:underline">Cookies</Link>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
