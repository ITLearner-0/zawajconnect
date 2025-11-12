import { X, ArrowRight, ArrowLeft, HelpCircle, Keyboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface KeyboardShortcutsPanelProps {
  show: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
}

export const KeyboardShortcutsPanel = ({
  show,
  onClose,
  currentStep,
  totalSteps,
}: KeyboardShortcutsPanelProps) => {
  if (!show) return null;

  const shortcuts = [
    {
      keys: ['Ctrl', '→'],
      macKeys: ['⌘', '→'],
      description: 'Étape suivante',
      icon: ArrowRight,
      disabled: currentStep >= totalSteps,
    },
    {
      keys: ['Ctrl', '←'],
      macKeys: ['⌘', '←'],
      description: 'Étape précédente',
      icon: ArrowLeft,
      disabled: currentStep <= 1,
    },
    {
      keys: ['Tab'],
      description: 'Naviguer entre les champs',
      icon: Keyboard,
    },
    {
      keys: ['?'],
      description: 'Afficher/masquer cette aide',
      icon: HelpCircle,
    },
    {
      keys: ['Esc'],
      description: 'Fermer cette aide',
      icon: X,
    },
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>Raccourcis clavier</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            const keys = isMac && shortcut.macKeys ? shortcut.macKeys : shortcut.keys;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  shortcut.disabled ? 'bg-muted/30 opacity-50' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      shortcut.disabled ? 'bg-muted' : 'bg-primary/10'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        shortcut.disabled ? 'text-muted-foreground' : 'text-primary'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm ${
                      shortcut.disabled ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {shortcut.description}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {keys.map((key, keyIndex) => (
                    <Badge
                      key={keyIndex}
                      variant="outline"
                      className={`font-mono text-xs px-2 py-1 ${
                        shortcut.disabled
                          ? 'bg-muted border-muted-foreground/20'
                          : 'bg-background border-primary/30'
                      }`}
                    >
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Étape {currentStep} sur {totalSteps}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
