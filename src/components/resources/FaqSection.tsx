
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Scale, Heart } from "lucide-react";
import { FaqItem } from '@/types/resources';

interface FaqSectionProps {
  faqs: FaqItem[];
}

const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Toutes les questions', icon: BookOpen },
    { id: 'marriage-contract', name: 'Contrat de mariage', icon: Scale },
    { id: 'courtship', name: 'Fréquentation', icon: Heart },
    { id: 'family', name: 'Vie familiale', icon: BookOpen }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const IconComponent = ({ iconName }: { iconName: any }) => {
    const Icon = iconName;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-rose-800 dark:text-rose-200 mb-4">
          FAQ Fiqh Matrimonial
        </h2>
        <p className="text-rose-600 dark:text-rose-300 max-w-2xl mx-auto">
          Questions fréquentes sur le mariage en Islam avec des réponses basées sur les sources authentiques
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 h-4 w-4" />
          <Input
            placeholder="Rechercher dans les FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-rose-200 focus:border-rose-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-800 dark:text-rose-200'
              }`}
            >
              <IconComponent iconName={category.icon} />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      <Card className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
            <Scale className="h-5 w-5" />
            Questions et Réponses ({filteredFaqs.length})
          </CardTitle>
          <CardDescription className="text-rose-600 dark:text-rose-300">
            Basées sur le Coran, la Sunna et les avis des savants reconnus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} className="border border-rose-200 dark:border-rose-700 rounded-lg px-4">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="space-y-2">
                    <h3 className="font-medium text-rose-800 dark:text-rose-200">
                      {faq.question}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {faq.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs border-rose-300 text-rose-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    <div className="prose prose-rose max-w-none text-rose-700 dark:text-rose-300">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                    </div>
                    
                    {faq.references && faq.references.length > 0 && (
                      <div className="border-t border-rose-200 dark:border-rose-700 pt-4">
                        <h4 className="font-medium text-rose-800 dark:text-rose-200 mb-2">Références :</h4>
                        <ul className="text-sm text-rose-600 dark:text-rose-300 space-y-1">
                          {faq.references.map((ref, index) => (
                            <li key={index}>• {ref}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-rose-500 dark:text-rose-400 border-t border-rose-200 dark:border-rose-700 pt-2">
                      {faq.author && <span>Par {faq.author}</span>}
                      <span>Mis à jour le {new Date(faq.lastUpdated).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-rose-600 dark:text-rose-300">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune question trouvée correspondant à votre recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaqSection;
