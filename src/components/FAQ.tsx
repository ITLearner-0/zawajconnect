import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  HelpCircle,
  Shield,
  Heart,
  Users,
  MessageCircle,
  Star,
  CheckCircle,
} from 'lucide-react';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'Inscription et Profil',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-emerald/10 text-emerald border-emerald/20',
      questions: [
        {
          question: 'Comment créer un compte sur ZawajConnect ?',
          answer:
            "Pour créer un compte, cliquez sur 'S'inscrire' et remplissez le formulaire avec vos informations personnelles. Vous devrez confirmer votre email et compléter votre profil avec vos préférences islamiques. Notre processus respecte la confidentialité et les valeurs islamiques.",
        },
        {
          question: 'Quelles informations dois-je inclure dans mon profil ?',
          answer:
            'Votre profil doit inclure vos informations de base (âge, localisation, profession), vos préférences religieuses (madhab, fréquence de prière, importance de la religion), et vos attentes pour le mariage. Plus votre profil est complet, meilleures seront vos compatibilités.',
        },
        {
          question: "Puis-je modifier mon profil après l'inscription ?",
          answer:
            'Oui, vous pouvez modifier votre profil à tout moment depuis votre tableau de bord. Nous encourageons les utilisateurs à tenir leur profil à jour pour améliorer la qualité des matches.',
        },
        {
          question: 'Comment ajouter des photos à mon profil ?',
          answer:
            "Vous pouvez ajouter jusqu'à 6 photos depuis la section 'Mon Profil'. Les photos doivent respecter les directives islamiques de pudeur. Notre équipe de modération vérifie toutes les photos avant publication.",
        },
      ],
    },
    {
      title: 'Recherche et Matching',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-gold/10 text-gold-dark border-gold/20',
      questions: [
        {
          question: "Comment fonctionne l'algorithme de matching ?",
          answer:
            'Notre algorithme prend en compte vos préférences religieuses, votre localisation, votre âge, vos intérêts, et vos valeurs islamiques. Plus vous remplissez votre profil, plus les suggestions seront précises et compatibles avec vos attentes.',
        },
        {
          question: 'Puis-je filtrer les résultats de recherche ?',
          answer:
            "Oui, notre recherche avancée permet de filtrer par âge, localisation, niveau d'éducation, profession, pratique religieuse, madhab, et bien d'autres critères islamiques importants pour votre décision.",
        },
        {
          question: 'Que signifie le pourcentage de compatibilité ?',
          answer:
            'Le pourcentage indique la compatibilité basée sur vos réponses communes aux questions religieuses et personnelles. Un pourcentage élevé suggère une meilleure harmonie potentielle selon les critères islamiques.',
        },
        {
          question: "Comment exprimer mon intérêt pour quelqu'un ?",
          answer:
            "Vous pouvez 'aimer' un profil pour exprimer votre intérêt. Si la personne vous 'aime' en retour, cela crée un 'match' et vous pourrez commencer à communiquer de manière respectueuse.",
        },
      ],
    },
    {
      title: 'Communication et Sécurité',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-emerald/10 text-emerald-dark border-emerald/20',
      questions: [
        {
          question: "Comment puis-je contacter quelqu'un qui m'intéresse ?",
          answer:
            'Après un match mutuel, vous pouvez envoyer des messages via notre système de chat sécurisé. Nous encourageons des conversations respectueuses qui restent dans les limites islamiques.',
        },
        {
          question: 'Les conversations sont-elles privées et sécurisées ?',
          answer:
            "Oui, toutes les conversations sont chiffrées et privées. Cependant, nous encourageons la présence d'un mahram (tuteur) lors des conversations importantes, conformément aux enseignements islamiques.",
        },
        {
          question: 'Puis-je organiser un appel vidéo ?',
          answer:
            "Oui, notre fonction d'appel vidéo respecte les valeurs islamiques. Nous recommandons fortement la présence d'un membre de famille lors de ces appels pour maintenir la pudeur et les bonnes pratiques islamiques.",
        },
        {
          question: 'Comment signaler un comportement inapproprié ?',
          answer:
            "Vous pouvez signaler tout comportement inapproprié en utilisant le bouton 'Signaler' sur le profil de la personne. Notre équipe examine tous les signalements dans les 24 heures et prend les mesures appropriées.",
        },
      ],
    },
    {
      title: 'Famille et Wali',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-rose/10 text-rose-dark border-rose/20',
      questions: [
        {
          question: 'Comment impliquer ma famille dans le processus ?',
          answer:
            "Vous pouvez ajouter des membres de famille dans la section 'Famille'. Ils pourront voir votre profil et vous conseiller. Vous contrôlez entièrement le niveau d'accès que vous leur accordez.",
        },
        {
          question: 'Quel est le rôle du wali (tuteur) ?',
          answer:
            "Selon l'Islam, le wali joue un rôle important dans le mariage. Sur notre plateforme, vous pouvez désigner un wali qui peut vous guider et participer aux décisions importantes concernant vos prétendants.",
        },
        {
          question: 'Ma famille peut-elle voir mes conversations ?',
          answer:
            'Non, vos conversations restent privées. Cependant, vous pouvez choisir de partager certaines informations avec votre famille ou les inviter à participer aux discussions importantes.',
        },
        {
          question: "Comment les membres de famille peuvent-ils m'aider ?",
          answer:
            'Ils peuvent vous donner des conseils, vous aider à évaluer la compatibilité avec un prétendant, et participer aux rencontres familiales. Leur sagesse et expérience sont précieuses dans ce processus important.',
        },
      ],
    },
    {
      title: 'Vérification et Sécurité',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green/10 text-green-dark border-green/20',
      questions: [
        {
          question: "Qu'est-ce que la vérification de profil ?",
          answer:
            "La vérification confirme l'authenticité de votre profil grâce à la vérification d'email, de téléphone, et optionnellement de pièce d'identité. Les profils vérifiés inspirent plus confiance et reçoivent plus de réponses.",
        },
        {
          question: "Comment obtenir le badge 'Vérifié' ?",
          answer:
            "Complétez la vérification de votre email et téléphone, ajoutez des photos claires de vous, et soumettez une pièce d'identité si vous le souhaitez. Notre équipe examine les demandes sous 48h.",
        },
        {
          question: 'Mes informations personnelles sont-elles protégées ?',
          answer:
            'Absolument. Nous utilisons un chiffrement de niveau bancaire pour protéger vos données. Vos informations ne sont jamais partagées avec des tiers sans votre consentement explicite.',
        },
        {
          question: 'Puis-je contrôler qui voit mon profil ?',
          answer:
            'Oui, vous avez un contrôle total via les paramètres de confidentialité. Vous pouvez choisir qui peut voir votre profil, vos photos, et vos informations de contact selon vos préférences.',
        },
      ],
    },
  ];

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Questions Fréquentes</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez des réponses à vos questions sur ZawajConnect et le processus de mariage
            islamique
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les questions fréquentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-emerald" />
              </div>
              <div className="text-2xl font-bold text-foreground">1000+</div>
              <div className="text-sm text-muted-foreground">Utilisateurs Actifs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-gold" />
              </div>
              <div className="text-2xl font-bold text-foreground">250+</div>
              <div className="text-sm text-muted-foreground">Mariages Réussis</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Sécurisé</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-gold fill-current" />
              </div>
              <div className="text-2xl font-bold text-foreground">4.8/5</div>
              <div className="text-sm text-muted-foreground">Note Moyenne</div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                      {category.icon}
                    </div>
                    <span>{category.title}</span>
                    <Badge className={category.color}>
                      {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left hover:text-emerald transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier votre recherche ou parcourez toutes les catégories
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-gradient-to-r from-emerald/5 to-gold/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Notre équipe de support est là pour vous aider. Nous nous engageons à répondre à
              toutes vos questions dans les 24 heures, insha'Allah.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald hover:bg-emerald-dark text-white rounded-lg font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactez-nous
              </a>
              <a
                href="mailto:contact@zawajconnect.fr"
                className="inline-flex items-center justify-center px-6 py-3 border border-emerald text-emerald hover:bg-emerald hover:text-white rounded-lg font-medium transition-colors"
              >
                Envoyer un Email
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Islamic Reminder */}
        <Card className="mt-8 bg-gradient-to-r from-gold/10 to-emerald/10 border-gold/20">
          <CardContent className="p-6 text-center">
            <p className="text-emerald-dark font-medium mb-2">
              "Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez
              en tranquillité avec elles"
            </p>
            <p className="text-sm text-muted-foreground">
              Coran 30:21 - Qu'Allah bénisse votre recherche du partenaire idéal
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;
