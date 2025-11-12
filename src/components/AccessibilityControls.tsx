import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings } from 'lucide-react';

export default function AccessibilityControls() {
  const { highContrast, toggleHighContrast, textSize, setTextSize } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Accessibility settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-medium text-lg" id="accessibility-heading">
            Accessibility Settings
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast" className="font-medium">
                High Contrast
              </Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={toggleHighContrast}
              aria-describedby="high-contrast-description"
            />
          </div>

          <div>
            <Label className="font-medium mb-2 block">Text Size</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={textSize === 'normal' ? 'default' : 'outline'}
                onClick={() => setTextSize('normal')}
                aria-pressed={textSize === 'normal'}
                className="flex-1"
              >
                Normal
              </Button>
              <Button
                size="sm"
                variant={textSize === 'large' ? 'default' : 'outline'}
                onClick={() => setTextSize('large')}
                aria-pressed={textSize === 'large'}
                className="flex-1"
              >
                Large
              </Button>
              <Button
                size="sm"
                variant={textSize === 'x-large' ? 'default' : 'outline'}
                onClick={() => setTextSize('x-large')}
                aria-pressed={textSize === 'x-large'}
                className="flex-1"
              >
                X-Large
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
