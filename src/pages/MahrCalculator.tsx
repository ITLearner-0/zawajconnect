import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator, FileText, Sparkles, BookOpen, Scale, Gift,
  CheckCircle2, Download, Printer, ChevronRight, Heart,
  DollarSign, Info
} from 'lucide-react';

interface MahrDetails {
  type: 'immediate' | 'deferred' | 'both';
  immediateAmount: string;
  deferredAmount: string;
  currency: string;
  inKind: string;
}

interface ContractClause {
  id: string;
  label: string;
  description: string;
  selected: boolean;
  category: 'rights' | 'conditions' | 'financial';
}

const mahrExamples = [
  { region: 'Maghreb (Maroc, Algérie, Tunisie)', range: '1 000 - 10 000 €', note: 'Varie selon la région et la famille' },
  { region: 'Moyen-Orient (Égypte, Jordanie)', range: '5 000 - 30 000 €', note: 'Mahr avancé + différé courant' },
  { region: 'Golfe (Arabie Saoudite, EAU)', range: '10 000 - 100 000+ €', note: 'Tendance à la modération encouragée' },
  { region: 'Asie du Sud (Pakistan, Inde)', range: '500 - 5 000 €', note: 'Sunnah : mahr modeste recommandé' },
  { region: 'Afrique de l\'Ouest', range: '200 - 3 000 €', note: 'Inclut souvent des biens en nature' },
  { region: 'Europe / Amérique', range: '1 000 - 15 000 €', note: 'Très variable selon les communautés' },
];

const defaultClauses: ContractClause[] = [
  { id: 'education', label: 'Droit aux études', description: "L'épouse conserve le droit de poursuivre ses études après le mariage", selected: true, category: 'rights' },
  { id: 'work', label: 'Droit au travail', description: "L'épouse a le droit de travailler avec accord mutuel", selected: true, category: 'rights' },
  { id: 'housing', label: 'Logement indépendant', description: "Le couple vivra dans un logement indépendant des familles", selected: false, category: 'conditions' },
  { id: 'travel', label: 'Droit de visite familiale', description: "L'épouse peut rendre visite à sa famille régulièrement", selected: true, category: 'rights' },
  { id: 'no-polygamy', label: 'Clause de monogamie', description: "L'époux s'engage à ne pas prendre de seconde épouse sans consentement", selected: false, category: 'conditions' },
  { id: 'mahr-deferred', label: 'Mahr différé', description: "Une partie du mahr est différée et due en cas de divorce", selected: true, category: 'financial' },
  { id: 'maintenance', label: 'Nafaqa (entretien)', description: "L'époux s'engage à assurer l'entretien complet du foyer", selected: true, category: 'financial' },
  { id: 'dispute', label: 'Médiation islamique', description: "En cas de conflit, recours à un médiateur islamique avant toute procédure", selected: true, category: 'conditions' },
];

const MahrCalculator = () => {
  const [mahr, setMahr] = useState<MahrDetails>({
    type: 'both',
    immediateAmount: '5000',
    deferredAmount: '3000',
    currency: 'EUR',
    inKind: '',
  });
  const [clauses, setClauses] = useState(defaultClauses);
  const [witnesses, setWitnesses] = useState({ witness1: '', witness2: '', wali: '', imam: '' });

  const toggleClause = (id: string) => {
    setClauses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const totalMahr = (parseInt(mahr.immediateAmount) || 0) + (parseInt(mahr.deferredAmount) || 0);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white mb-2">
          <Scale className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
          Mahr & Contrat de Mariage
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Calculez le mahr, personnalisez votre contrat de mariage (nikah) et générez un document complet.
        </p>
      </div>

      {/* Islamic Reminder */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <BookOpen className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 italic">
                « Le meilleur mariage est celui qui est le plus facile (en termes de mahr). »
              </p>
              <p className="text-xs text-amber-600 mt-1">— Hadith rapporté par Ahmad</p>
              <p className="text-xs text-amber-600 mt-1">
                Le mahr est un droit de l'épouse. Il peut être de l'argent, des biens, ou même l'enseignement du Coran.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="calculator">Calculateur</TabsTrigger>
          <TabsTrigger value="contract">Contrat</TabsTrigger>
          <TabsTrigger value="reference">Références</TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-500" />
                Calculer le Mahr
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Type de Mahr</Label>
                <Select value={mahr.type} onValueChange={(v) => setMahr({ ...mahr, type: v as MahrDetails['type'] })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Mahr avancé (Mu'ajjal) uniquement</SelectItem>
                    <SelectItem value="deferred">Mahr différé (Mu'akhkhar) uniquement</SelectItem>
                    <SelectItem value="both">Avancé + Différé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(mahr.type === 'immediate' || mahr.type === 'both') && (
                  <div>
                    <Label className="text-sm font-medium">Mahr avancé (payé au mariage)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={mahr.immediateAmount}
                        onChange={(e) => setMahr({ ...mahr, immediateAmount: e.target.value })}
                        placeholder="Montant"
                      />
                      <Select value={mahr.currency} onValueChange={(v) => setMahr({ ...mahr, currency: v })}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">€</SelectItem>
                          <SelectItem value="USD">$</SelectItem>
                          <SelectItem value="GBP">£</SelectItem>
                          <SelectItem value="MAD">MAD</SelectItem>
                          <SelectItem value="SAR">SAR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {(mahr.type === 'deferred' || mahr.type === 'both') && (
                  <div>
                    <Label className="text-sm font-medium">Mahr différé (en cas de divorce)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={mahr.deferredAmount}
                        onChange={(e) => setMahr({ ...mahr, deferredAmount: e.target.value })}
                        placeholder="Montant"
                      />
                      <span className="flex items-center text-sm text-muted-foreground">{mahr.currency}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Mahr en nature (optionnel)</Label>
                <Input
                  value={mahr.inKind}
                  onChange={(e) => setMahr({ ...mahr, inKind: e.target.value })}
                  placeholder="Ex: bijoux en or, voyage Omra, enseignement du Coran..."
                  className="mt-1"
                />
              </div>

              {/* Summary */}
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Mahr total</p>
                    <p className="text-3xl font-bold text-amber-700">
                      {totalMahr.toLocaleString()} {mahr.currency === 'EUR' ? '€' : mahr.currency}
                    </p>
                    {mahr.type === 'both' && (
                      <div className="flex gap-4 justify-center mt-2">
                        <span className="text-sm text-emerald-600">
                          Avancé: {parseInt(mahr.immediateAmount || '0').toLocaleString()} €
                        </span>
                        <span className="text-sm text-blue-600">
                          Différé: {parseInt(mahr.deferredAmount || '0').toLocaleString()} €
                        </span>
                      </div>
                    )}
                    {mahr.inKind && (
                      <p className="text-sm text-amber-600 mt-1">+ {mahr.inKind}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Tab */}
        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Clauses du contrat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sélectionnez les clauses à inclure dans votre contrat de mariage. Toutes sont conformes au droit islamique.
              </p>
              {['rights', 'conditions', 'financial'].map((cat) => (
                <div key={cat}>
                  <h4 className="text-sm font-semibold mt-4 mb-2 capitalize">
                    {cat === 'rights' ? '📋 Droits' : cat === 'conditions' ? '📝 Conditions' : '💰 Financier'}
                  </h4>
                  {clauses.filter((c) => c.category === cat).map((clause) => (
                    <div
                      key={clause.id}
                      className={`flex items-start gap-3 p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                        clause.selected ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => toggleClause(clause.id)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        clause.selected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
                      }`}>
                        {clause.selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{clause.label}</p>
                        <p className="text-xs text-muted-foreground">{clause.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Witnesses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Témoins et officiant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Wali (tuteur de l'épouse)</Label>
                  <Input
                    value={witnesses.wali}
                    onChange={(e) => setWitnesses({ ...witnesses, wali: e.target.value })}
                    placeholder="Nom complet"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Imam / Officiant</Label>
                  <Input
                    value={witnesses.imam}
                    onChange={(e) => setWitnesses({ ...witnesses, imam: e.target.value })}
                    placeholder="Nom complet"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Témoin 1</Label>
                  <Input
                    value={witnesses.witness1}
                    onChange={(e) => setWitnesses({ ...witnesses, witness1: e.target.value })}
                    placeholder="Nom complet"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Témoin 2</Label>
                  <Input
                    value={witnesses.witness2}
                    onChange={(e) => setWitnesses({ ...witnesses, witness2: e.target.value })}
                    placeholder="Nom complet"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
              <Download className="h-4 w-4 mr-2" /> Télécharger le contrat (PDF)
            </Button>
            <Button variant="outline" className="border-amber-300 text-amber-600">
              <Printer className="h-4 w-4 mr-2" /> Imprimer
            </Button>
          </div>
        </TabsContent>

        {/* Reference Tab */}
        <TabsContent value="reference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" />
                Références du Mahr par région
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mahrExamples.map((ex) => (
                  <div key={ex.region} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">{ex.region}</p>
                      <p className="text-xs text-muted-foreground">{ex.note}</p>
                    </div>
                    <Badge variant="outline" className="font-medium">{ex.range}</Badge>
                  </div>
                ))}
              </div>

              <Card className="mt-4 border-emerald-200 bg-emerald-50">
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-2">
                    <Info className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Le mahr de Fatima رضي الله عنها</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Le mahr de Fatima, fille du Prophète ﷺ, était une cotte de mailles (armure) de Ali رضي الله عنه.
                        Cela montre que le mahr peut être modeste et de toute nature.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MahrCalculator;
