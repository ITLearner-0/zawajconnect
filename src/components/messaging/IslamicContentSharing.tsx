import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, Send, Star } from 'lucide-react';

interface IslamicContent {
  id: string;
  type: 'quran' | 'hadith';
  arabic: string;
  translation: string;
  reference: string;
  category?: string;
}

interface IslamicContentSharingProps {
  onShareContent: (content: IslamicContent) => void;
}

const SAMPLE_VERSES: IslamicContent[] = [
  {
    id: '1',
    type: 'quran',
    arabic:
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translation:
      "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté.",
    reference: 'Sourate Ar-Rum (30:21)',
    category: 'Mariage',
  },
  {
    id: '2',
    type: 'hadith',
    arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي',
    translation:
      "Le meilleur d'entre vous est celui qui se comporte le mieux avec sa famille, et je suis le meilleur d'entre vous avec ma famille.",
    reference: 'Rapporté par At-Tirmidhi',
    category: 'Famille',
  },
];

const IslamicContentSharing: React.FC<IslamicContentSharingProps> = ({ onShareContent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customContent, setCustomContent] = useState<{
    arabic: string;
    translation: string;
    reference: string;
    type: 'quran' | 'hadith';
  }>({
    arabic: '',
    translation: '',
    reference: '',
    type: 'quran',
  });
  const [favorites] = useState<string[]>([]);

  const filteredContent = SAMPLE_VERSES.filter(
    (content) =>
      content.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShareCustom = () => {
    if (customContent.arabic && customContent.translation && customContent.reference) {
      const content: IslamicContent = {
        id: Date.now().toString(),
        ...customContent,
      };
      onShareContent(content);
      setCustomContent({ arabic: '', translation: '', reference: '', type: 'quran' });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-1" />
          Partager
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Partager du Contenu Islamique
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Parcourir</TabsTrigger>
            <TabsTrigger value="custom">Personnel</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Rechercher des versets ou hadiths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredContent.map((content) => (
                <Card key={content.id} className="cursor-pointer hover:bg-accent">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{content.reference}</CardTitle>
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {content.type === 'quran' ? 'Coran' : 'Hadith'}
                        </span>
                        {favorites.includes(content.id) && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-right font-arabic text-lg">{content.arabic}</p>
                      <p className="text-sm text-muted-foreground italic">{content.translation}</p>
                      <div className="flex justify-between items-center">
                        {content.category && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {content.category}
                          </span>
                        )}
                        <Button size="sm" onClick={() => onShareContent(content)}>
                          <Send className="h-3 w-3 mr-1" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Tabs
                  value={customContent.type}
                  onValueChange={(value: 'quran' | 'hadith') =>
                    setCustomContent((prev) => ({ ...prev, type: value }))
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quran">Coran</TabsTrigger>
                    <TabsTrigger value="hadith">Hadith</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="text-sm font-medium">Texte Arabe</label>
                <Textarea
                  placeholder="النص العربي..."
                  value={customContent.arabic}
                  onChange={(e) =>
                    setCustomContent((prev) => ({ ...prev, arabic: e.target.value }))
                  }
                  className="text-right font-arabic"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Traduction</label>
                <Textarea
                  placeholder="Traduction française..."
                  value={customContent.translation}
                  onChange={(e) =>
                    setCustomContent((prev) => ({ ...prev, translation: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Référence</label>
                <Input
                  placeholder="Ex: Sourate Al-Baqarah (2:185)"
                  value={customContent.reference}
                  onChange={(e) =>
                    setCustomContent((prev) => ({ ...prev, reference: e.target.value }))
                  }
                />
              </div>

              <Button
                onClick={handleShareCustom}
                disabled={
                  !customContent.arabic || !customContent.translation || !customContent.reference
                }
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Partager le Contenu
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun favori pour le moment</p>
              <p className="text-sm">Ajoutez des versets et hadiths à vos favoris</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IslamicContentSharing;
