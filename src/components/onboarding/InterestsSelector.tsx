import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Heart, Book, Music, Camera, Plane, Code, Palette, Trophy, Coffee, Gamepad2 } from 'lucide-react';

interface InterestsSelectorProps {
  interests: string[];
  onInterestsChange: (interests: string[]) => void;
  className?: string;
}

const InterestsSelector = ({ interests, onInterestsChange, className = "" }: InterestsSelectorProps) => {
  const [newInterest, setNewInterest] = useState('');

  const suggestedInterests = [
    { name: "Lecture", icon: <Book className="w-3 h-3" /> },
    { name: "Voyage", icon: <Plane className="w-3 h-3" /> },
    { name: "Cuisine", icon: <Coffee className="w-3 h-3" /> },
    { name: "Sport", icon: <Trophy className="w-3 h-3" /> },
    { name: "Musique", icon: <Music className="w-3 h-3" /> },
    { name: "Photographie", icon: <Camera className="w-3 h-3" /> },
    { name: "Art", icon: <Palette className="w-3 h-3" /> },
    { name: "Technologie", icon: <Code className="w-3 h-3" /> },
    { name: "Jeux", icon: <Gamepad2 className="w-3 h-3" /> },
    { name: "Nature", icon: <Heart className="w-3 h-3" /> }
  ];

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
      onInterestsChange([...interests, trimmed]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    onInterestsChange(interests.filter(interest => interest !== interestToRemove));
  };

  const addSuggestedInterest = (interest: string) => {
    if (!interests.includes(interest) && interests.length < 10) {
      onInterestsChange([...interests, interest]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selected Interests */}
      {interests.length > 0 && (
        <div className="space-y-3">
          <Label>Vos centres d'intérêt ({interests.length}/10)</Label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center space-x-1 py-1 px-3 animate-scale-in hover:bg-muted cursor-pointer"
              >
                <span>{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Interest */}
      <div className="space-y-2">
        <Label htmlFor="newInterest">Ajouter un centre d'intérêt</Label>
        <div className="flex space-x-2">
          <Input
            id="newInterest"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Randonnée, Cuisine halal..."
            className="flex-1"
            maxLength={30}
            disabled={interests.length >= 10}
          />
          <Button 
            type="button"
            onClick={addInterest}
            disabled={!newInterest.trim() || interests.includes(newInterest.trim()) || interests.length >= 10}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {interests.length >= 10 && (
          <p className="text-xs text-muted-foreground">
            Maximum 10 centres d'intérêt atteint
          </p>
        )}
      </div>

      {/* Suggested Interests */}
      <div className="space-y-3">
        <Label>Suggestions populaires</Label>
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suggestedInterests
                .filter(suggested => !interests.includes(suggested.name))
                .map((suggested, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => addSuggestedInterest(suggested.name)}
                    disabled={interests.length >= 10}
                    className="justify-start text-xs h-8 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {suggested.icon}
                    <span className="ml-1">{suggested.name}</span>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicator */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {interests.length === 0 && "Ajoutez au moins 3 centres d'intérêt pour de meilleurs matches"}
          {interests.length > 0 && interests.length < 3 && `Plus ${3 - interests.length} centre(s) d'intérêt recommandé(s)`}
          {interests.length >= 3 && interests.length < 5 && "Bon début ! Vous pouvez en ajouter d'autres"}
          {interests.length >= 5 && "Excellent ! Votre profil sera très attractif"}
        </p>
      </div>
    </div>
  );
};

export default InterestsSelector;