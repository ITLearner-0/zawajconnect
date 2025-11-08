import { Card, CardContent } from '@/components/ui/card';
import { Building2, Heart, Shield, Users, Book, Star } from 'lucide-react';

interface Value {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  verse?: string;
}

const islamicValues: Value[] = [
  {
    id: 1,
    icon: <Heart className="w-8 h-8 text-rose-500" />,
    title: "Amour & Compassion",
    description: "Le mariage est fondé sur l'amour mutuel, le respect et la compassion comme l'a enseigné notre bien-aimé Prophète ﷺ.",
    verse: "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté."
  },
  {
    id: 2,
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    title: "Protection & Chasteté",
    description: "Nous priorisons la protection de votre intimité et le maintien des principes islamiques d'interaction modeste.",
    verse: "Le mariage représente la moitié de la foi, car il vous protège des péchés et vous aide à marcher sur le chemin de la droiture."
  },
  {
    id: 3,
    icon: <Users className="w-8 h-8 text-blue-500" />,
    title: "Implication Familiale",
    description: "Nous encourageons la participation de la famille dans le processus matrimonial, suivant les traditions islamiques.",
    verse: "Quand quelqu'un dont vous êtes satisfait de la religion et du caractère vous demande en mariage, alors mariez-vous avec lui."
  },
  {
    id: 4,
    icon: <Book className="w-8 h-8 text-amber-500" />,
    title: "Guidance Islamique",
    description: "Accédez aux conseils islamiques authentiques sur le mariage, les relations et la vie familiale de la part d'érudits qualifiés.",
    verse: "Les meilleurs des gens sont ceux qui profitent aux autres, et le mariage est un moyen de se profiter mutuellement."
  },
  {
    id: 5,
    icon: <Building2 className="w-8 h-8 text-indigo-500" />,
    title: "Approche Centrée sur la Foi",
    description: "Chaque fonctionnalité est conçue avec les principes islamiques à l'esprit, vous aidant à trouver un partenaire de vie compatible.",
    verse: "Une épouse vertueuse est le meilleur trésor qu'un homme puisse avoir."
  },
  {
    id: 6,
    icon: <Star className="w-8 h-8 text-purple-500" />,
    title: "Communauté Vérifiée",
    description: "Notre processus de vérification garantit que vous vous connectez avec de véritables musulmans pratiquants cherchant le mariage.",
    verse: "Cherchez un conjoint qui vous aidera dans cette vie et dans l'au-delà."
  }
];

const IslamicValues = () => {
  return (
    <section id="valeurs" className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded border border-border mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Fondation Islamique</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Fondé sur les Valeurs Islamiques
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ZawajConnect est plus qu'une simple plateforme matrimoniale. Nous sommes une communauté construite sur les 
            beaux enseignements de l'Islam, aidant les musulmans à trouver leur partenaire parfait tout en maintenant 
            les plus hauts standards de foi, de respect et de valeurs familiales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {islamicValues.map((value) => (
            <Card 
              key={value.id} 
              className="border border-border bg-card"
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 p-4 rounded-full bg-muted">
                    {value.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {value.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {value.description}
                  </p>
                  
                  {value.verse && (
                    <blockquote className="text-sm text-primary font-medium italic text-center border-t border-border pt-4 leading-relaxed">
                      "{value.verse}"
                    </blockquote>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-muted rounded border border-border p-8">
              <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                "Et Allah a créé pour vous, à partir de vous-mêmes, des conjoints"
              </h3>
              <p className="text-muted-foreground font-medium">
                Coran 16:72 • Rejoignez-nous en suivant les conseils d'Allah pour le mariage
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IslamicValues;