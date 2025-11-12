import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
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
              <Cookie className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald to-gold bg-clip-text text-transparent">
            Politique de Cookies
          </h1>
          <p className="text-muted-foreground text-lg">
            Conformité RGPD - Transparence sur l'utilisation des cookies
          </p>
        </div>

        <Card className="mb-8 border-emerald/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <p>
                <strong>ZawajConnect</strong>
              </p>
              <p>
                Email :{' '}
                <a href="mailto:contact@zawajconnect.me" className="text-emerald hover:underline">
                  contact@zawajconnect.me
                </a>
              </p>
              <p className="text-muted-foreground mt-4">Dernière mise à jour : 17 octobre 2025</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">1. Qu'est-ce qu'un Cookie ?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur,
                smartphone, tablette) lors de votre visite sur notre site. Il permet de mémoriser
                vos préférences et d'améliorer votre expérience utilisateur.
              </p>
            </CardContent>
          </Card>

          {/* Section 2 - Types de Cookies */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">2. Types de Cookies Utilisés</h2>

              <div className="space-y-6">
                {/* Essentiels */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    2.1 - Cookies Essentiels (Obligatoires)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ces cookies sont nécessaires au fonctionnement de la plateforme et ne peuvent
                    pas être désactivés.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left font-semibold">Cookie</th>
                          <th className="p-3 text-left font-semibold">Durée</th>
                          <th className="p-3 text-left font-semibold">Fonction</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">sb-auth-token</td>
                          <td className="p-3">Session</td>
                          <td className="p-3">Authentification Supabase</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">csrf_token</td>
                          <td className="p-3">Session</td>
                          <td className="p-3">Protection contre attaques CSRF</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">session_id</td>
                          <td className="p-3">Session</td>
                          <td className="p-3">Gestion de la session utilisateur</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Préférence */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    2.2 - Cookies de Préférence (Optionnels)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ces cookies mémorisent vos choix et préférences.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left font-semibold">Cookie</th>
                          <th className="p-3 text-left font-semibold">Durée</th>
                          <th className="p-3 text-left font-semibold">Fonction</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">language</td>
                          <td className="p-3">1 an</td>
                          <td className="p-3">Langue sélectionnée</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">theme</td>
                          <td className="p-3">1 an</td>
                          <td className="p-3">Mode clair/sombre</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">privacy_settings</td>
                          <td className="p-3">1 an</td>
                          <td className="p-3">Paramètres de confidentialité</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Analytiques */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    2.3 - Cookies Analytiques (Avec Consentement)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ces cookies nous aident à améliorer la plateforme.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 text-left font-semibold">Cookie</th>
                          <th className="p-3 text-left font-semibold">Durée</th>
                          <th className="p-3 text-left font-semibold">Fonction</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">_ga</td>
                          <td className="p-3">13 mois</td>
                          <td className="p-3">Google Analytics (si activé)</td>
                        </tr>
                        <tr className="border-t border-border">
                          <td className="p-3 font-mono text-xs">supabase_analytics</td>
                          <td className="p-3">13 mois</td>
                          <td className="p-3">Statistiques d'utilisation</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tiers */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    2.4 - Cookies Tiers
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nous utilisons des services tiers qui déposent leurs propres cookies :
                  </p>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                    <li>
                      <strong>Stripe (Paiements) :</strong> Cookies de sécurité et de détection de
                      fraude (obligatoires)
                    </li>
                    <li>
                      <strong>Google Meet (Visioconférence) :</strong> Cookies de session (si vous
                      utilisez les réunions familiales)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 - Gestion */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">3. Gestion de Vos Cookies</h2>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    3.1 - Via Notre Banner de Consentement
                  </h3>
                  <p className="mb-3">
                    À votre première visite, un banner apparaît vous proposant :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>✅ Accepter tous les cookies</li>
                    <li>❌ Refuser les cookies optionnels</li>
                    <li>⚙️ Personnaliser vos choix</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">3.2 - Via Votre Navigateur</h3>
                  <p className="mb-3">
                    Vous pouvez bloquer ou supprimer les cookies via les paramètres de votre
                    navigateur :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Chrome :</strong> Paramètres {'>'} Confidentialité et sécurité {'>'}{' '}
                      Cookies
                    </li>
                    <li>
                      <strong>Firefox :</strong> Paramètres {'>'} Vie privée et sécurité {'>'}{' '}
                      Cookies
                    </li>
                    <li>
                      <strong>Safari :</strong> Préférences {'>'} Confidentialité {'>'} Gérer les
                      cookies
                    </li>
                  </ul>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg mt-3">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      ⚠️ <strong>Attention :</strong> Bloquer les cookies essentiels empêchera
                      l'utilisation de la plateforme.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 - Durées */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">4. Durée de Conservation</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>
                  <strong>Cookies de session :</strong> Jusqu'à déconnexion
                </li>
                <li>
                  <strong>Cookies de préférence :</strong> 1 an
                </li>
                <li>
                  <strong>Cookies analytiques :</strong> 13 mois maximum (conformité RGPD)
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5 - Vie Privée */}
          <Card className="bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">5. Cookies et Vie Privée</h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>Nous ne vendons jamais vos données personnelles</li>
                <li>Les cookies sont utilisés uniquement pour améliorer votre expérience</li>
                <li>Conformité totale au RGPD (Règlement Général sur la Protection des Données)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 6 - Modification */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-emerald">
                6. Modification de la Politique
              </h2>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
                <li>Mise à jour possible à tout moment pour refléter nos pratiques</li>
                <li>Notification par banner si changements majeurs</li>
                <li>Date de dernière mise à jour toujours visible</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7 - Contact */}
          <Card className="border-gold/30">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4 text-emerald">7. Contact</h2>
              <p className="text-muted-foreground mb-4">
                Pour toute question sur notre utilisation des cookies :
              </p>
              <a
                href="mailto:contact@zawajconnect.me"
                className="text-emerald hover:underline text-lg font-semibold"
              >
                contact@zawajconnect.me
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/30">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Votre confiance est notre priorité. Nous nous engageons à protéger votre vie privée
              conformément aux principes islamiques d'Amana (confiance) et de respect.
            </p>
            <Separator className="my-6" />
            <p className="text-sm text-muted-foreground">
              Qu'Allah bénisse notre communauté - بارك الله فيكم
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/terms-of-service" className="text-emerald hover:underline">
            Conditions d'Utilisation
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/privacy-policy" className="text-emerald hover:underline">
            Politique de Confidentialité
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/refund-policy" className="text-emerald hover:underline">
            Remboursement
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/community-guidelines" className="text-emerald hover:underline">
            Charte Communautaire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
