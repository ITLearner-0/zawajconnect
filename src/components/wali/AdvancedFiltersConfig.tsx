
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Filter, 
  Plus, 
  Trash2, 
  Settings, 
  MessageSquare,
  Clock,
  Users,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { AdvancedFiltersService, WaliFilter, FilterConfig } from '@/services/wali/advancedFilters';
import { useToast } from '@/hooks/use-toast';

interface AdvancedFiltersConfigProps {
  wali_id: string;
}

const AdvancedFiltersConfig: React.FC<AdvancedFiltersConfigProps> = ({
  wali_id
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<WaliFilter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<WaliFilter | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    filter_name: '',
    filter_type: '',
    filter_config: {} as FilterConfig
  });

  useEffect(() => {
    loadFilters();
  }, [wali_id]);

  const loadFilters = async () => {
    setLoading(true);
    try {
      const filtersList = await AdvancedFiltersService.getFilters(wali_id);
      setFilters(filtersList);
    } catch (error) {
      console.error('Error loading filters:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les filtres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.filter_name || !formData.filter_type) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await AdvancedFiltersService.createFilter({
        wali_id,
        filter_name: formData.filter_name,
        filter_type: formData.filter_type as any,
        filter_config: formData.filter_config,
        is_active: true
      });

      if (result.success) {
        toast({
          title: "Filtre créé",
          description: "Le filtre a été créé avec succès",
        });
        setShowCreateForm(false);
        loadFilters();
        resetForm();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const handleToggleFilter = async (filter: WaliFilter) => {
    try {
      const result = await AdvancedFiltersService.updateFilter(filter.id, {
        is_active: !filter.is_active
      });

      if (result.success) {
        setFilters(prev => prev.map(f => 
          f.id === filter.id ? { ...f, is_active: !f.is_active } : f
        ));
        toast({
          title: "Filtre mis à jour",
          description: `Filtre ${filter.is_active ? 'désactivé' : 'activé'}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le filtre",
        variant: "destructive"
      });
    }
  };

  const loadTemplate = (template: Partial<WaliFilter>) => {
    setFormData({
      filter_name: template.filter_name || '',
      filter_type: template.filter_type || '',
      filter_config: template.filter_config || {}
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      filter_name: '',
      filter_type: '',
      filter_config: {}
    });
  };

  const updateConfigField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      filter_config: {
        ...prev.filter_config,
        [field]: value
      }
    }));
  };

  const addToArrayField = (field: string, value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      filter_config: {
        ...prev.filter_config,
        [field]: [...(prev.filter_config[field as keyof FilterConfig] as string[] || []), value]
      }
    }));
  };

  const removeFromArrayField = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      filter_config: {
        ...prev.filter_config,
        [field]: (prev.filter_config[field as keyof FilterConfig] as string[] || []).filter((_, i) => i !== index)
      }
    }));
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'content': return <MessageSquare className="h-4 w-4" />;
      case 'behavior': return <Users className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'contact': return <Shield className="h-4 w-4" />;
      default: return <Filter className="h-4 w-4" />;
    }
  };

  const renderConfigForm = () => {
    switch (formData.filter_type) {
      case 'content':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mots Interdits</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un mot interdit"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArrayField('blocked_words', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button type="button" size="sm">Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(formData.filter_config.blocked_words || []).map((word, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFromArrayField('blocked_words', index)}>
                    {word} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phrases Interdites</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une phrase interdite"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArrayField('blocked_phrases', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button type="button" size="sm">Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(formData.filter_config.blocked_phrases || []).map((phrase, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFromArrayField('blocked_phrases', index)}>
                    {phrase} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Messages Maximum par Heure</Label>
              <Input
                type="number"
                value={formData.filter_config.max_messages_per_hour || ''}
                onChange={(e) => updateConfigField('max_messages_per_hour', parseInt(e.target.value))}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label>Messages Consécutifs Maximum</Label>
              <Input
                type="number"
                value={formData.filter_config.max_consecutive_messages || ''}
                onChange={(e) => updateConfigField('max_consecutive_messages', parseInt(e.target.value))}
                placeholder="3"
              />
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de Début</Label>
                <Input
                  type="time"
                  value={formData.filter_config.allowed_hours_start || ''}
                  onChange={(e) => updateConfigField('allowed_hours_start', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de Fin</Label>
                <Input
                  type="time"
                  value={formData.filter_config.allowed_hours_end || ''}
                  onChange={(e) => updateConfigField('allowed_hours_end', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.filter_config.require_wali_approval || false}
                onCheckedChange={(checked) => updateConfigField('require_wali_approval', checked)}
              />
              <Label>Approbation Wali Requise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.filter_config.auto_approve_known_contacts || false}
                onCheckedChange={(checked) => updateConfigField('auto_approve_known_contacts', checked)}
              />
              <Label>Approuver Automatiquement les Contacts Connus</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des filtres...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Filter className="h-6 w-6" />
            Filtres Avancés de Gestion
          </h2>
          <p className="text-muted-foreground">Configurez des filtres personnalisés pour la supervision</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Filtre
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Filtres Actifs</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="create" disabled={!showCreateForm}>Créer</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filters.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Aucun Filtre Configuré</h3>
                <p className="text-muted-foreground mb-4">
                  Créez des filtres personnalisés pour automatiser la supervision
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Créer Votre Premier Filtre
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filters.map((filter) => (
                <Card key={filter.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFilterIcon(filter.filter_type)}
                        <div>
                          <h3 className="font-medium">{filter.filter_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            Filtre {filter.filter_type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={filter.is_active ? "default" : "secondary"}>
                          {filter.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Switch
                          checked={filter.is_active}
                          onCheckedChange={() => handleToggleFilter(filter)}
                        />
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {AdvancedFiltersService.getFilterTemplates().map((template, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFilterIcon(template.filter_type || '')}
                      <div>
                        <h3 className="font-medium">{template.filter_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          Modèle de filtre {template.filter_type}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => loadTemplate(template)} size="sm">
                      Utiliser ce Modèle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {showCreateForm && (
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Créer un Nouveau Filtre</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFilter} className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Les filtres s'appliquent automatiquement à toutes les conversations supervisées.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Nom du Filtre *</Label>
                    <Input
                      value={formData.filter_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, filter_name: e.target.value }))}
                      placeholder="Nom descriptif du filtre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de Filtre *</Label>
                    <Select value={formData.filter_type} onValueChange={(value) => setFormData(prev => ({ ...prev, filter_type: value, filter_config: {} }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Filtrage de Contenu</SelectItem>
                        <SelectItem value="behavior">Comportement Utilisateur</SelectItem>
                        <SelectItem value="time">Restrictions Temporelles</SelectItem>
                        <SelectItem value="contact">Gestion des Contacts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {renderConfigForm()}

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); resetForm(); }}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      Créer le Filtre
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdvancedFiltersConfig;
