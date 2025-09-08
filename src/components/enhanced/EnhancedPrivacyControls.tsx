import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  MessageCircle, 
  Users, 
  Heart, 
  Clock,
  Lock,
  Globe,
  UserCheck,
  Bell,
  Camera,
  Info
} from 'lucide-react';

interface EnhancedPrivacySettings {
  // Basic privacy
  profile_visibility: string;
  photo_visibility: string;
  contact_visibility: string;
  last_seen_visibility: string;
  allow_messages_from: string;
  allow_profile_views: boolean;
  allow_family_involvement: boolean;
  
  // Enhanced privacy controls
  location_sharing: string;
  online_status_visibility: string;
  message_read_receipts: boolean;
  typing_indicators: boolean;
  allow_screenshots: boolean;
  content_sharing_outside: boolean;
  
  // Islamic-specific privacy
  family_approval_required: boolean;
  wali_involvement_level: string;
  conversation_monitoring: string;
  islamic_content_filtering: boolean;
  modesty_guidelines_strict: boolean;
  
  // Advanced controls
  block_non_islamic_content: boolean;
  require_verified_users: boolean;
  auto_delete_messages: string;
  privacy_score_threshold: number;
  
  // Notification preferences
  family_notification_types: string[];
  privacy_alerts: boolean;
  interaction_summaries: boolean;
}

interface EnhancedPrivacyControlsProps {
  onComplete?: (settings: EnhancedPrivacySettings) => void;
  embedded?: boolean;
}

const EnhancedPrivacyControls = ({ onComplete, embedded = false }: EnhancedPrivacyControlsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<EnhancedPrivacySettings>({
    profile_visibility: 'public',
    photo_visibility: 'matches_only',
    contact_visibility: 'matches_only',
    last_seen_visibility: 'matches_only',
    allow_messages_from: 'matches_only',
    allow_profile_views: true,
    allow_family_involvement: false,
    location_sharing: 'never',
    online_status_visibility: 'matches_only',
    message_read_receipts: true,
    typing_indicators: true,
    allow_screenshots: false,
    content_sharing_outside: false,
    family_approval_required: false,
    wali_involvement_level: 'none',
    conversation_monitoring: 'family_only',
    islamic_content_filtering: true,
    modesty_guidelines_strict: true,
    block_non_islamic_content: false,
    require_verified_users: false,
    auto_delete_messages: 'never',
    privacy_score_threshold: 70,
    family_notification_types: [],
    privacy_alerts: true,
    interaction_summaries: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSection, setCurrentSection] = useState('basic');

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos paramètres de confidentialité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres de confidentialité ont été mis à jour",
      });

      if (onComplete) {
        onComplete(settings);
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos paramètres",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof EnhancedPrivacySettings>(
    key: K, 
    value: EnhancedPrivacySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getPrivacyScore = () => {
    let score = 0;
    const weights = {
      photo_visibility: settings.photo_visibility === 'private' ? 20 : settings.photo_visibility === 'matches_only' ? 15 : 5,
      family_involvement: settings.allow_family_involvement ? 15 : 0,
      islamic_filtering: settings.islamic_content_filtering ? 15 : 0,
      modesty_guidelines: settings.modesty_guidelines_strict ? 10 : 5,
      verified_users: settings.require_verified_users ? 15 : 0,
      message_control: settings.allow_messages_from === 'family_supervised' ? 20 : settings.allow_messages_from === 'matches_only' ? 10 : 0
    };
    
    score = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    return Math.min(score, 100);
  };

  const sections = [
    { 
      id: 'basic', 
      title: 'Visibilité de Base', 
      icon: Eye,
      description: 'Contrôles de visibilité essentiels'
    },
    { 
      id: 'islamic', 
      title: 'Valeurs Islamiques', 
      icon: Heart,
      description: 'Paramètres selon les principes islamiques'
    },
    { 
      id: 'family', 
      title: 'Supervision Familiale', 
      icon: Users,
      description: 'Implication et approbation familiale'
    },
    { 
      id: 'advanced', 
      title: 'Contrôles Avancés', 
      icon: Shield,
      description: 'Sécurité et confidentialité renforcées'
    },
    { 
      id: 'notifications', 
      title: 'Notifications', 
      icon: Bell,
      description: 'Alertes et notifications de confidentialité'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des paramètres...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSectionData = sections.find(s => s.id === currentSection);
  const SectionIcon = currentSectionData?.icon || Shield;
  const privacyScore = getPrivacyScore();

  return (
    <div className={embedded ? 'space-y-6' : 'min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4'}>
      <div className={`container mx-auto ${embedded ? 'max-w-full' : 'max-w-4xl'}`}>
        <Card className={embedded ? '' : 'shadow-lg'}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                <SectionIcon className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Contrôles de Confidentialité Avancés</CardTitle>
            <p className="text-muted-foreground mb-4">
              {currentSectionData?.description || 'Paramètres de confidentialité détaillés'}
            </p>
            
            {/* Privacy Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald" />
                  Score de Confidentialité
                </span>
                <Badge variant={privacyScore >= 80 ? 'default' : privacyScore >= 60 ? 'secondary' : 'destructive'}>
                  {privacyScore}/100
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    privacyScore >= 80 ? 'bg-gradient-to-r from-emerald to-emerald-light' : 
                    privacyScore >= 60 ? 'bg-gradient-to-r from-gold to-gold-light' : 
                    'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${privacyScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {privacyScore >= 80 ? 'Excellente protection' : 
                 privacyScore >= 60 ? 'Protection correcte' : 
                 'Protection à améliorer'}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {sections.map(section => {
                const Icon = section.icon;
                
                return (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSection(section.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{section.title}</span>
                  </Button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {currentSection === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald" />
                        Visibilité du Profil
                      </Label>
                      <Select 
                        value={settings.profile_visibility} 
                        onValueChange={(value) => updateSetting('profile_visibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div>
                              <div className="font-medium">Public</div>
                              <div className="text-xs text-muted-foreground">Visible par tous</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="matches_only">
                            <div>
                              <div className="font-medium">Matches uniquement</div>
                              <div className="text-xs text-muted-foreground">Seulement vos matches</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="family_approved">
                            <div>
                              <div className="font-medium">Approuvé par la famille</div>
                              <div className="text-xs text-muted-foreground">Avec accord familial</div>
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div>
                              <div className="font-medium">Privé</div>
                              <div className="text-xs text-muted-foreground">Uniquement vous</div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gold" />
                        Visibilité des Photos
                      </Label>
                      <Select 
                        value={settings.photo_visibility} 
                        onValueChange={(value) => updateSetting('photo_visibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="matches_only">Matches seulement</SelectItem>
                          <SelectItem value="family_approved">Approuvé famille</SelectItem>
                          <SelectItem value="private">Privé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-sage" />
                        Statut En Ligne
                      </Label>
                      <Select 
                        value={settings.online_status_visibility} 
                        onValueChange={(value) => updateSetting('online_status_visibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Tous</SelectItem>
                          <SelectItem value="matches_only">Matches seulement</SelectItem>
                          <SelectItem value="family_only">Famille seulement</SelectItem>
                          <SelectItem value="nobody">Personne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald" />
                        Messages de
                      </Label>
                      <Select 
                        value={settings.allow_messages_from} 
                        onValueChange={(value) => updateSetting('allow_messages_from', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Tout le monde</SelectItem>
                          <SelectItem value="matches_only">Matches uniquement</SelectItem>
                          <SelectItem value="family_supervised">Supervisé par famille</SelectItem>
                          <SelectItem value="none">Personne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-emerald" />
                        <div>
                          <Label className="text-base font-medium">Accusés de réception</Label>
                          <p className="text-sm text-muted-foreground">
                            Afficher quand vous avez lu les messages
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.message_read_receipts}
                        onCheckedChange={(checked) => updateSetting('message_read_receipts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gold" />
                        <div>
                          <Label className="text-base font-medium">Indicateurs de frappe</Label>
                          <p className="text-sm text-muted-foreground">
                            Montrer quand vous tapez un message
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.typing_indicators}
                        onCheckedChange={(checked) => updateSetting('typing_indicators', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 'islamic' && (
                <div className="space-y-6">
                  <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="h-5 w-5 text-gold" />
                        Paramètres selon les Valeurs Islamiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-emerald" />
                          <div>
                            <Label className="text-base font-medium">Filtrage de Contenu Islamique</Label>
                            <p className="text-sm text-muted-foreground">
                              Filtrer automatiquement le contenu non-islamique
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.islamic_content_filtering}
                          onCheckedChange={(checked) => updateSetting('islamic_content_filtering', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gold" />
                          <div>
                            <Label className="text-base font-medium">Directives de Modestie Strictes</Label>
                            <p className="text-sm text-muted-foreground">
                              Appliquer les principes islamiques de modestie
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.modesty_guidelines_strict}
                          onCheckedChange={(checked) => updateSetting('modesty_guidelines_strict', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-emerald" />
                          <div>
                            <Label className="text-base font-medium">Bloquer Contenu Non-Islamique</Label>
                            <p className="text-sm text-muted-foreground">
                              Bloquer complètement le contenu contraire aux valeurs islamiques
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.block_non_islamic_content}
                          onCheckedChange={(checked) => updateSetting('block_non_islamic_content', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gold" />
                          <div>
                            <Label className="text-base font-medium">Utilisateurs Vérifiés Uniquement</Label>
                            <p className="text-sm text-muted-foreground">
                              Interaction seulement avec des profils vérifiés
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.require_verified_users}
                          onCheckedChange={(checked) => updateSetting('require_verified_users', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentSection === 'family' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald" />
                        Niveau d'Implication du Wali
                      </Label>
                      <Select 
                        value={settings.wali_involvement_level} 
                        onValueChange={(value) => updateSetting('wali_involvement_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          <SelectItem value="notification_only">Notifications seulement</SelectItem>
                          <SelectItem value="approval_required">Approbation requise</SelectItem>
                          <SelectItem value="full_supervision">Supervision complète</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gold" />
                        Surveillance des Conversations
                      </Label>
                      <Select 
                        value={settings.conversation_monitoring} 
                        onValueChange={(value) => updateSetting('conversation_monitoring', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          <SelectItem value="family_only">Famille seulement</SelectItem>
                          <SelectItem value="inappropriate_content">Contenu inapproprié</SelectItem>
                          <SelectItem value="all_messages">Tous les messages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald" />
                        <div>
                          <Label className="text-base font-medium">Approbation Familiale Requise</Label>
                          <p className="text-sm text-muted-foreground">
                            Exiger l'accord de la famille pour les matches
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.family_approval_required}
                        onCheckedChange={(checked) => updateSetting('family_approval_required', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gold" />
                        <div>
                          <Label className="text-base font-medium">Supervision Familiale Active</Label>
                          <p className="text-sm text-muted-foreground">
                            Permettre à la famille de superviser les interactions
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allow_family_involvement}
                        onCheckedChange={(checked) => updateSetting('allow_family_involvement', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation and Save */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection);
                  if (currentIndex > 0) {
                    setCurrentSection(sections[currentIndex - 1].id);
                  }
                }}
                disabled={sections.findIndex(s => s.id === currentSection) === 0}
              >
                Section Précédente
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={savePrivacySettings}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                
                {sections.findIndex(s => s.id === currentSection) < sections.length - 1 ? (
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentSection);
                      setCurrentSection(sections[currentIndex + 1].id);
                    }}
                  >
                    Section Suivante
                  </Button>
                ) : (
                  <Button
                    onClick={savePrivacySettings}
                    disabled={saving}
                    className="bg-emerald hover:bg-emerald-dark"
                  >
                    {saving ? 'Finalisation...' : 'Terminer'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedPrivacyControls;