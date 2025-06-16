
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle, HelpCircle, Mail, Phone, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message envoyé",
      description: "Votre demande a été envoyée. Nous vous répondrons sous 24h.",
    });
    setContactForm({ name: '', email: '', subject: '', category: '', message: '' });
  };

  const faqs = [
    {
      question: "Comment fonctionne le système de correspondance ?",
      answer: "Notre système utilise un algorithme basé sur la compatibilité religieuse, les valeurs partagées et les préférences personnelles pour vous proposer des correspondances pertinentes."
    },
    {
      question: "Qu'est-ce que la supervision Wali ?",
      answer: "La supervision Wali permet à votre tuteur religieux de superviser vos conversations et de vous accompagner dans votre recherche conformément aux principes islamiques."
    },
    {
      question: "Comment puis-je vérifier mon profil ?",
      answer: "Vous pouvez vérifier votre profil en confirmant votre email, votre numéro de téléphone et en soumettant une pièce d'identité dans la section vérification de votre profil."
    },
    {
      question: "Les conversations sont-elles privées ?",
      answer: "Oui, toutes les conversations sont chiffrées. Seuls vous et votre correspondant (ainsi que le Wali si activé) pouvez voir les messages."
    },
    {
      question: "Comment signaler un comportement inapproprié ?",
      answer: "Utilisez le bouton de signalement dans les conversations ou contactez notre équipe de modération via cette page de support."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-rose-800 dark:text-rose-200 mb-6">
          Centre d'aide et support
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Contact rapide */}
          <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-medium">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-rose-50 dark:bg-rose-800 rounded-lg">
                <Mail className="h-5 w-5 text-rose-600" />
                <div>
                  <p className="font-medium text-rose-800 dark:text-rose-200">Email</p>
                  <p className="text-sm text-rose-600 dark:text-rose-300">support@halalmatch.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-rose-50 dark:bg-rose-800 rounded-lg">
                <Phone className="h-5 w-5 text-rose-600" />
                <div>
                  <p className="font-medium text-rose-800 dark:text-rose-200">Téléphone</p>
                  <p className="text-sm text-rose-600 dark:text-rose-300">+33 1 23 45 67 89</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-rose-50 dark:bg-rose-800 rounded-lg">
                <Book className="h-5 w-5 text-rose-600" />
                <div>
                  <p className="font-medium text-rose-800 dark:text-rose-200">Heures d'ouverture</p>
                  <p className="text-sm text-rose-600 dark:text-rose-300">Lun-Ven: 9h-18h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de contact */}
          <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Nous contacter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={contactForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Problème technique</SelectItem>
                      <SelectItem value="account">Compte utilisateur</SelectItem>
                      <SelectItem value="billing">Facturation</SelectItem>
                      <SelectItem value="report">Signalement</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
                >
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <HelpCircle className="mr-2 h-5 w-5" />
              Questions fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-rose-600 dark:text-rose-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
