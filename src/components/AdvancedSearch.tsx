import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  ageRange: [number, number];
  location: string;
  education: string;
  profession: string;
  sect: string;
  madhab: string;
  prayerFrequency: string;
  hijabPreference: string;
  interests: string[];
  verifiedOnly: boolean;
  withPhoto: boolean;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

const AdvancedSearch = ({ onSearch, onReset }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [18, 50],
    location: '',
    education: '',
    profession: '',
    sect: '',
    madhab: '',
    prayerFrequency: '',
    hijabPreference: '',
    interests: [],
    verifiedOnly: false,
    withPhoto: false
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const interests = [
    'Lecture du Coran', 'Voyages', 'Sport', 'Cuisine', 'Art', 'Musique',
    'Technologie', 'Nature', 'Photographie', 'Écriture', 'Bénévolat'
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      ageRange: [18, 50],
      location: '',
      education: '',
      profession: '',
      sect: '',
      madhab: '',
      prayerFrequency: '',
      hijabPreference: '',
      interests: [],
      verifiedOnly: false,
      withPhoto: false
    });
    onReset();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-emerald" />
            Recherche Avancée
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? 'Réduire' : 'Étendre'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.verifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            className={filters.verifiedOnly ? "bg-emerald hover:bg-emerald-dark" : ""}
          >
            Profils Vérifiés
          </Button>
          <Button
            variant={filters.withPhoto ? "default" : "outline"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, withPhoto: !prev.withPhoto }))}
            className={filters.withPhoto ? "bg-emerald hover:bg-emerald-dark" : ""}
          >
            Avec Photo
          </Button>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>Âge: {filters.ageRange[0]} - {filters.ageRange[1]} ans</Label>
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value as [number, number] }))}
            min={18}
            max={65}
            step={1}
            className="w-full"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            placeholder="Ville, région..."
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        {isExpanded && (
          <>
            {/* Education & Profession */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Éducation</Label>
                <Select 
                  value={filters.education} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, education: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau d'éducation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous niveaux</SelectItem>
                    <SelectItem value="high_school">Lycée</SelectItem>
                    <SelectItem value="bachelor">Licence</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">Doctorat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profession</Label>
                <Input
                  placeholder="Profession..."
                  value={filters.profession}
                  onChange={(e) => setFilters(prev => ({ ...prev, profession: e.target.value }))}
                />
              </div>
            </div>

            {/* Islamic Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secte</Label>
                <Select 
                  value={filters.sect} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sect: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Secte islamique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="sunni">Sunnite</SelectItem>
                    <SelectItem value="shia">Chiite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Madhab</Label>
                <Select 
                  value={filters.madhab} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, madhab: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="École juridique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="hanafi">Hanafite</SelectItem>
                    <SelectItem value="maliki">Malékite</SelectItem>
                    <SelectItem value="shafii">Chaféite</SelectItem>
                    <SelectItem value="hanbali">Hanbalite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fréquence de Prière</Label>
                <Select 
                  value={filters.prayerFrequency} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, prayerFrequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    <SelectItem value="5_times">5 fois par jour</SelectItem>
                    <SelectItem value="often">Souvent</SelectItem>
                    <SelectItem value="sometimes">Parfois</SelectItem>
                    <SelectItem value="rarely">Rarement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Préférence Hijab</Label>
                <Select 
                  value={filters.hijabPreference} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, hijabPreference: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Préférence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune préférence</SelectItem>
                    <SelectItem value="always">Toujours</SelectItem>
                    <SelectItem value="sometimes">Parfois</SelectItem>
                    <SelectItem value="never">Jamais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label>Centres d'intérêt</Label>
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                  <div key={interest} className="flex items-center space-x-1">
                    <Checkbox
                      id={interest}
                      checked={filters.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    />
                    <Label 
                      htmlFor={interest} 
                      className="text-sm cursor-pointer"
                    >
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.interests.map(interest => (
                    <Badge 
                      key={interest} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {interest}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleInterestChange(interest, false)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSearch}
            className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground"
          >
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-emerald text-emerald hover:bg-emerald hover:text-white"
          >
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;