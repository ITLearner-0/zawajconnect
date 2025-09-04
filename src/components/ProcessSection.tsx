import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, UserPlus, Search, Heart, MessageCircle, Users } from 'lucide-react';

interface ProcessStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    icon: <UserPlus className="w-8 h-8 text-emerald-500" />,
    title: "Create Your Profile",
    description: "Set up your detailed profile with Islamic preferences and family information.",
    details: [
      "Add your Islamic practices and preferences",
      "Upload verified photos with privacy controls",
      "Include family background and expectations",
      "Set your matrimonial preferences"
    ]
  },
  {
    id: 2,
    icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
    title: "Get Verified",
    description: "Complete our multi-step verification process for a trusted community.",
    details: [
      "Verify your identity documents",
      "Confirm your phone and email",
      "Family verification (optional)",
      "Increase your profile credibility"
    ]
  },
  {
    id: 3,
    icon: <Search className="w-8 h-8 text-purple-500" />,
    title: "Browse & Search",
    description: "Use our advanced filters to find compatible matches based on Islamic criteria.",
    details: [
      "Filter by Islamic practices and sect",
      "Location and education preferences",
      "Family background matching",
      "Lifestyle and value alignment"
    ]
  },
  {
    id: 4,
    icon: <Heart className="w-8 h-8 text-rose-500" />,
    title: "Express Interest",
    description: "Show interest in profiles that align with your preferences respectfully.",
    details: [
      "Send respectful interest notifications",
      "View who's interested in you", 
      "Mutual matches unlock communication",
      "Family can also express interest"
    ]
  },
  {
    id: 5,
    icon: <MessageCircle className="w-8 h-8 text-amber-500" />,
    title: "Communicate Respectfully",
    description: "Start meaningful conversations with your matches in a monitored environment.",
    details: [
      "Islamic guidelines for communication",
      "Family member can join conversations",
      "Report inappropriate behavior",
      "Focus on getting to know each other"
    ]
  },
  {
    id: 6,
    icon: <Users className="w-8 h-8 text-indigo-500" />,
    title: "Meet Families",
    description: "Involve families in the process leading to a blessed union, In Sha Allah.",
    details: [
      "Arrange family introductions",
      "Traditional matrimonial meetings",
      "Islamic marriage counseling",
      "Wedding planning assistance"
    ]
  }
];

const ProcessSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-cream/10 via-background to-sage/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-sage-700 bg-clip-text text-transparent">
            Your Journey to Marriage
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Follow our Islamic approach to finding your life partner. Every step is designed 
            with respect, privacy, and Islamic values at its core.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {processSteps.map((step, index) => (
            <Card key={step.id} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-emerald-500 to-sage-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.id}
                </div>

                {/* Icon */}
                <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-md group-hover:shadow-lg transition-shadow duration-300 w-fit">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Details */}
                <ul className="space-y-2 mb-6">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Connection Line (for larger screens) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden xl:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-px bg-gradient-to-r from-emerald-300 to-sage-400"></div>
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-emerald-400 rounded-full"></div>
                  </div>
                )}
              </CardContent>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-50 to-sage-50 rounded-2xl p-8 border border-emerald-200 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-emerald-700 mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-emerald-600 mb-6">
              Join thousands of Muslims who have found their life partners through our platform.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-sage-600 hover:from-emerald-700 hover:to-sage-700 text-white px-8 py-3"
            >
              Create Your Profile Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;