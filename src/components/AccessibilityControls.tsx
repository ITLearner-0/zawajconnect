
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibilityContext } from "@/contexts/AccessibilityProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings } from "lucide-react";

export default function AccessibilityControls() {
  const { highContrast, toggleHighContrast, textSize, setTextSize } = useAccessibility();
  const { fontSize, setFontSize, announce } = useAccessibilityContext();

  const handleFontSizeChange = (size: 'normal' | 'large' | 'larger') => {
    setFontSize(size);
    setTextSize(size === 'larger' ? 'x-large' : size);
    announce(`Taille de police changée à ${size === 'normal' ? 'normale' : size === 'large' ? 'grande' : 'très grande'}`);
  };

  const handleContrastToggle = () => {
    toggleHighContrast();
    announce(`Contraste élevé ${!highContrast ? 'activé' : 'désactivé'}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2" 
          aria-label="Paramètres d'accessibilité"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" 
        align="end"
        role="dialog"
        aria-label="Paramètres d'accessibilité"
      >
        <div className="space-y-4">
          <h3 className="font-medium text-lg" id="accessibility-heading">
            Paramètres d'accessibilité
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast" className="font-medium">
                Contraste élevé
              </Label>
              <p className="text-sm text-muted-foreground" id="high-contrast-description">
                Augmente le contraste pour une meilleure visibilité
              </p>
            </div>
            <Switch 
              id="high-contrast" 
              checked={highContrast} 
              onCheckedChange={handleContrastToggle}
              aria-describedby="high-contrast-description"
            />
          </div>
          
          <div>
            <Label className="font-medium mb-2 block">Taille du texte</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Taille du texte">
              <Button 
                size="sm"
                variant={fontSize === "normal" ? "default" : "outline"}
                onClick={() => handleFontSizeChange("normal")}
                role="radio"
                aria-checked={fontSize === "normal"}
                className="flex-1"
              >
                Normale
              </Button>
              <Button 
                size="sm"
                variant={fontSize === "large" ? "default" : "outline"}
                onClick={() => handleFontSizeChange("large")}
                role="radio"
                aria-checked={fontSize === "large"}
                className="flex-1"
              >
                Grande
              </Button>
              <Button 
                size="sm"
                variant={fontSize === "larger" ? "default" : "outline"}
                onClick={() => handleFontSizeChange("larger")}
                role="radio"
                aria-checked={fontSize === "larger"}
                className="flex-1"
              >
                Très grande
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
