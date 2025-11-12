import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  Shield,
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { AdvancedFiltersService, WaliFilter, FilterConfig } from '@/services/wali/advancedFilters';
import { useToast } from '@/hooks/use-toast';

interface AdvancedFiltersConfigProps {
  wali_id: string;
}

const AdvancedFiltersConfig: React.FC<AdvancedFiltersConfigProps> = ({ wali_id }) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<WaliFilter[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFilter, setEditingFilter] = useState<WaliFilter | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    filter_name: '',
    filter_type: '',
    filter_config: {} as FilterConfig,
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
        title: 'Erreur',
        description: 'Impossible de charger les filtres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFilter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.filter_name || !formData.filter_type) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await AdvancedFiltersService.createFilter({
        wali_id,
        filter_name: formData.filter_name,
        filter_type: formData.filter_type as any,
        filter_config: formData.filter_config,
        is_active: true,
      });

      if (result.success) {
        toast({
          title: 'Filtre créé',
          description: 'Le nouveau filtre a été créé avec succès',
        });
        setShowCreateForm(false);
        resetForm();
        loadFilters();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de la création',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur inattendue s'est produite",
        variant: 'destructive',
      });
    }
  };

  const handleToggleFilter = async (filterId: string, isActive: boolean) => {
    try {
      const result = await AdvancedFiltersService.updateFilter(filterId, { is_active: isActive });
      if (result.success) {
        toast({
          title: isActive ? 'Filtre activé' : 'Filtre désactivé',
          description: 'Le statut du filtre a été mis à jour',
        });
        loadFilters();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le filtre',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      filter_name: '',
      filter_type: '',
      filter_config: {},
    });
    setEditingFilter(null);
  };

  const loadTemplate = (template: Partial<WaliFilter>) => {
    setFormData({
      filter_name: template.filter_name || '',
      filter_type: template.filter_type || '',
      filter_config: template.filter_config || {},
    });
  };

  const updateFilterConfig = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      filter_config: {
        ...prev.filter_config,
        [key]: value,
      },
    }));
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <MessageSquare className="h-4 w-4" />;
      case 'behavior':
        return <Users className="h-4 w-4" />;
      case 'time':
        return <Clock className="h-4 w-4" />;
      case 'contact':
        return <Shield className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  const getFilterTypeLabel = (type: string) => {
    switch (type) {
      case 'content':
        return 'Contenu';
      case 'behavior':
        return 'Comportement';
      case 'time':
        return 'Temporel';
      case 'contact':
        return 'Contact';
      default:
        return type;
    }
  };

  const renderFilterConfigForm = () => {
    switch (formData.filter_type) {
      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <Label>Mots Interdits (séparés par des virgules)</Label>
              <Textarea
                value={formData.filter_config.blocked_words?.join(', ') || ''}
                onChange={(e) =>
                  updateFilterConfig(
                    'blocked_words',
                    e.target.value
                      .split(',')
                      .map((w) => w.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="mot1, mot2, mot3..."
              />
            </div>
            <div>
              <Label>Phrases Interdites (séparées par des virgules)</Label>
              <Textarea
                value={formData.filter_config.blocked_phrases?.join(', ') || ''}
                onChange={(e) =>
                  updateFilterConfig(
                    'blocked_phrases',
                    e.target.value
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="phrase1, phrase2..."
              />
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nombre maximum de messages par heure</Label>
              <Input
                type="number"
                value={formData.filter_config.max_messages_per_hour || ''}
                onChange={(e) =>
                  updateFilterConfig('max_messages_per_hour', parseInt(e.target.value) || 0)
                }
                placeholder="10"
              />
            </div>
            <div>
              <Label>Messages consécutifs maximum</Label>
              <Input
                type="number"
                value={formData.filter_config.max_consecutive_messages || ''}
                onChange={(e) =>
                  updateFilterConfig('max_consecutive_messages', parseInt(e.target.value) || 0)
                }
                placeholder="3"
              />
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heure de début autorisée</Label>
                <Input
                  type="time"
                  value={formData.filter_config.allowed_hours_start || ''}
                  onChange={(e) => updateFilterConfig('allowed_hours_start', e.target.value)}
                />
              </div>
              <div>
                <Label>Heure de fin autorisée</Label>
                <Input
                  type="time"
                  value={formData.filter_config.allowed_hours_end || ''}
                  onChange={(e) => updateFilterConfig('allowed_hours_end', e.target.value)}
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
                onCheckedChange={(checked) => updateFilterConfig('require_wali_approval', checked)}
              />
              <Label>Nécessite l'approbation du wali</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.filter_config.auto_approve_known_contacts || false}
                onCheckedChange={(checked) =>
                  updateFilterConfig('auto_approve_known_contacts', checked)
                }
              />
              <Label>Approuver automatiquement les contacts connus</Label>
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
            Filtres Avancés
          </h2>
          <p className="text-muted-foreground">
            Configurez des filtres automatiques pour la modération
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Filtre
        </Button>
      </div>

      {/* Templates */}
      {!showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Modèles de Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AdvancedFiltersService.getFilterTemplates().map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => {
                    loadTemplate(template);
                    setShowCreateForm(true);
                  }}
                >
                  {getFilterIcon(template.filter_type || '')}
                  <span className="font-medium mt-2">{template.filter_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {getFilterTypeLabel(template.filter_type || '')}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingFilter ? 'Modifier le Filtre' : 'Créer un Nouveau Filtre'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFilter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du Filtre *</Label>
                  <Input
                    value={formData.filter_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, filter_name: e.target.value }))
                    }
                    placeholder="Nom descriptif du filtre"
                  />
                </div>
                <div>
                  <Label>Type de Filtre *</Label>
                  <Select
                    value={formData.filter_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, filter_type: value, filter_config: {} }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Contenu</SelectItem>
                      <SelectItem value="behavior">Comportement</SelectItem>
                      <SelectItem value="time">Temporel</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.filter_type && renderFilterConfigForm()}

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingFilter ? 'Modifier' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Filtres Actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filters.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucun filtre configuré</p>
          ) : (
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFilterIcon(filter.filter_type)}
                      <div>
                        <h3 className="font-medium">{filter.filter_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Type: {getFilterTypeLabel(filter.filter_type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={filter.is_active}
                        onCheckedChange={(checked) => handleToggleFilter(filter.id, checked)}
                      />
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm">
                    <Badge variant={filter.is_active ? 'default' : 'secondary'}>
                      {filter.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFiltersConfig;
