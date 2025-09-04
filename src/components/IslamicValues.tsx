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
    title: "Love & Compassion",
    description: "Marriage is built on mutual love, respect, and compassion as taught by our beloved Prophet (PBUH).",
    verse: "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts." 
  },
  {
    id: 2,
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    title: "Protection & Chastity",
    description: "We prioritize protecting your privacy and maintaining Islamic principles of modest interaction.",
    verse: "Marriage is half of faith, for it protects you from sins and helps you walk on the path of righteousness."
  },
  {
    id: 3,
    icon: <Users className="w-8 h-8 text-blue-500" />,
    title: "Family Involvement",
    description: "We encourage family participation in the matrimonial process, following Islamic traditions.",
    verse: "When someone whose religion and character you are pleased with proposes to you, then marry him."
  },
  {
    id: 4,
    icon: <Book className="w-8 h-8 text-amber-500" />,
    title: "Islamic Guidance",
    description: "Access authentic Islamic advice on marriage, relationships, and family life from qualified scholars.",
    verse: "The best of people are those who benefit others, and marriage is a means to benefit each other."
  },
  {
    id: 5,
    icon: <Building2 className="w-8 h-8 text-indigo-500" />,
    title: "Faith-Centered Approach",
    description: "Every feature is designed with Islamic principles in mind, helping you find a compatible life partner.",
    verse: "A righteous wife is the best treasure a man can have."
  },
  {
    id: 6,
    icon: <Star className="w-8 h-8 text-purple-500" />,
    title: "Verified Community",
    description: "Our verification process ensures you connect with genuine, practicing Muslims seeking marriage.",
    verse: "Seek a spouse who will help you in this life and the hereafter."
  }
];

const IslamicValues = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-sage/5 to-cream/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 mb-6">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Islamic Foundation</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-sage-700 bg-clip-text text-transparent">
            Built on Islamic Values
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            NikahNoor is more than just a matrimonial platform. We're a community built on the 
            beautiful teachings of Islam, helping Muslims find their perfect match while maintaining 
            the highest standards of faith, respect, and family values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {islamicValues.map((value, index) => (
            <Card 
              key={value.id} 
              className="relative overflow-hidden border-0 shadow-lg card-hover animate-fade-in group bg-card/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-md group-hover:shadow-lg transition-smooth group-hover:animate-float">
                    {value.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-foreground">
                    {value.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {value.description}
                  </p>
                  
                  {value.verse && (
                    <blockquote className="text-sm text-emerald-600 font-medium italic text-center border-t border-emerald-100 pt-4 leading-relaxed animate-fade-in" style={{ animationDelay: `${index * 0.1 + 0.3}s` }}>
                      "{value.verse}"
                    </blockquote>
                  )}
                </div>
              </CardContent>
              
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none" />
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-50 to-sage-50 rounded-2xl p-8 border border-emerald-200">
              <Building2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-700 mb-4">
                "And Allah has made for you from yourselves mates"
              </h3>
              <p className="text-emerald-600 font-medium">
                Quran 16:72 • Join us in following Allah's guidance for marriage
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IslamicValues;