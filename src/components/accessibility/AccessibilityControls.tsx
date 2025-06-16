
import React from "react";
import { useAccessibility } from "./AccessibilityProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, Type, Zap, Globe } from "lucide-react";

export const AccessibilityControls: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    theme,
    setTheme,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
    language,
    setLanguage
  } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Paramètres d'accessibilité"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Accessibilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Font Size */}
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Taille du texte
              </Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petit</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Grand</SelectItem>
                  <SelectItem value="x-large">Très grand</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label className="font-medium">Thème</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="high-contrast">Contraste élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast" className="font-medium">
                  Contraste élevé
                </Label>
                <p className="text-sm text-muted-foreground">
                  Améliore la visibilité du texte
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduce-motion" className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Réduire les animations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Limite les mouvements sur la page
                </p>
              </div>
              <Switch
                id="reduce-motion"
                checked={reduceMotion}
                onCheckedChange={toggleReduceMotion}
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Langue
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default AccessibilityControls;
