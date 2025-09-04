import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais. Barakallahu fikom.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 px-4 bg-gradient-to-br from-cream via-sage/10 to-emerald/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-white">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Contactez-nous
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Une question, un conseil ou besoin d'aide ? Notre équipe dédiée est là pour vous accompagner 
            dans votre recherche du partenaire idéal selon les valeurs islamiques.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-slide-up">
          {/* Contact Form */}
          <Card className="shadow-elegant border-sage/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground flex items-center justify-center space-x-2">
                <Send className="h-6 w-6 text-emerald" />
                <span>Envoyez-nous un message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Votre nom complet"
                      required
                      className="border-sage/30 focus:border-emerald"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="border-sage/30 focus:border-emerald"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Sujet *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Objet de votre message"
                    required
                    className="border-sage/30 focus:border-emerald"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Décrivez votre demande ou question..."
                    rows={5}
                    required
                    className="border-sage/30 focus:border-emerald resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium py-3 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Envoi en cours...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Envoyer le message</span>
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-emerald/5 rounded-lg border border-emerald/20">
                <p className="text-sm text-emerald-dark text-center">
                  <strong>Temps de réponse :</strong> Nous nous engageons à vous répondre sous 24h, 
                  insha'Allah. Pour les demandes urgentes, n'hésitez pas à nous appeler.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-elegant border-sage/20">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">contact@nikahconnect.fr</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Support général et questions techniques
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Téléphone</h3>
                    <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lun-Ven: 9h-18h | Sam: 9h-12h
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Adresse</h3>
                    <p className="text-muted-foreground">Paris, France</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rendez-vous sur demande uniquement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Support Islamique
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Notre équipe comprend l'importance des valeurs islamiques dans le processus 
                    de mariage. Nous sommes là pour vous guider avec respect et bienveillance.
                  </p>
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-emerald-dark font-medium text-sm">
                      "Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Coran 30:21</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-16 text-center animate-fade-in">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Questions fréquentes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 text-left border-sage/30 hover:border-emerald">
              <div>
                <div className="font-medium text-foreground">Comment s'inscrire ?</div>
                <div className="text-sm text-muted-foreground mt-1">Guide d'inscription</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left border-sage/30 hover:border-emerald">
              <div>
                <div className="font-medium text-foreground">Sécurité & Confidentialité</div>
                <div className="text-sm text-muted-foreground mt-1">Vos données protégées</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left border-sage/30 hover:border-emerald">
              <div>
                <div className="font-medium text-foreground">Processus de matching</div>
                <div className="text-sm text-muted-foreground mt-1">Comment ça marche</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left border-sage/30 hover:border-emerald">
              <div>
                <div className="font-medium text-foreground">Rôle de la famille</div>
                <div className="text-sm text-muted-foreground mt-1">Implication familiale</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;