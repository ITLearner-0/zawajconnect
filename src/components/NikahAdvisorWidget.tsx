import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, X, ChevronRight, MessageCircle } from 'lucide-react';

const NikahAdvisorWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          title="Demander conseil"
        >
          <Moon className="h-6 w-6" />
        </button>
      )}

      {/* Mini overlay */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80">
          <Card className="shadow-2xl border-emerald-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <Moon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Assistant Nikah</p>
                    <p className="text-xs text-muted-foreground">Conseiller islamique</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                  setIsOpen(false);
                  setIsDismissed(true);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Besoin de conseil sur votre démarche matrimoniale ? L'assistant est basé sur le Coran et la Sunnah.
              </p>

              <div className="space-y-2">
                {[
                  "Comment choisir le bon conjoint ?",
                  "Préparer une rencontre (khitba)",
                  "Comprendre l'Istikhara",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => navigate('/nikah-advisor')}
                    className="w-full text-left text-xs p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="h-3 w-3 flex-shrink-0" />
                    {q}
                  </button>
                ))}
              </div>

              <Button
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                size="sm"
                onClick={() => navigate('/nikah-advisor')}
              >
                Ouvrir l'assistant <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default NikahAdvisorWidget;
