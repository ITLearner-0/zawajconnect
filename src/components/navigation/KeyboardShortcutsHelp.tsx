import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const KeyboardShortcutsHelp = () => {
  const [open, setOpen] = useState(false);
  const { shortcuts, getShortcutsByCategory } = useKeyboardShortcuts();

  const formatShortcut = (shortcut: any) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.metaKey) keys.push('⌘');
    keys.push(shortcut.key.toUpperCase());
    return keys;
  };

  const categories = ['Navigation', 'Actions'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          <span className="hidden lg:inline">Raccourcis</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis Clavier
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map(category => {
            const categoryShortcuts = getShortcutsByCategory(category);
            
            if (categoryShortcuts.length === 0) return null;
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                      >
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {formatShortcut(shortcut).map((key, keyIndex) => (
                            <Badge
                              key={keyIndex}
                              variant="outline"
                              className={cn(
                                "px-2 py-1 text-xs font-mono",
                                "bg-background border-border"
                              )}
                            >
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Navigation Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-foreground">
                    Ouvrir la navigation rapide
                  </span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="px-2 py-1 text-xs font-mono bg-background border-border">
                      ⌘
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1 text-xs font-mono bg-background border-border">
                      K
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Conseils :</p>
                <ul className="space-y-1">
                  <li>• Les raccourcis ne fonctionnent pas dans les champs de saisie</li>
                  <li>• Utilisez Échap pour fermer les modales</li>
                  <li>• Utilisez ⌘K pour la navigation rapide</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;