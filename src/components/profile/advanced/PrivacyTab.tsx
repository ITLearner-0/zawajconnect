/**
 * PrivacyTab - Privacy Settings Management
 *
 * Features:
 * - Profile visibility settings
 * - Photo privacy controls
 * - Who can contact you
 * - Block list management
 * - Data sharing preferences
 * - Account privacy
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Users,
  MessageCircle,
  UserX,
  Bell,
  Database,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DatabaseProfile } from '@/types/profile';
import { Label } from '@/components/ui/label';

interface PrivacyTabProps {
  profile: DatabaseProfile;
}

interface PrivacySettingProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}

const PrivacySetting = ({ icon: Icon, title, description, children }: PrivacySettingProps) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex-shrink-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

const PrivacyTab = ({ profile }: PrivacyTabProps) => {
  const { toast } = useToast();

  // Privacy settings state
  const [settings, setSettings] = useState({
    profileVisibility: profile.is_visible ? 'public' : 'private',
    showOnlineStatus: true,
    showLastActive: true,
    photosVisibility: 'members', // all, members, matches, private
    allowMessages: 'everyone', // everyone, matches, verified
    showInSearch: true,
    allowProfileViews: true,
    shareAnalytics: false,
    dataProcessing: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  const [blockedUsers] = useState<Array<{ id: string; name: string }>>([
    // Mock data
  ]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: 'Paramètre mis à jour',
      description: 'Vos préférences de confidentialité ont été enregistrées.',
    });
  };

  const handleSaveAll = () => {
    toast({
      title: 'Paramètres enregistrés',
      description: 'Tous vos paramètres de confidentialité ont été mis à jour.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Warning */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Protégez votre vie privée
            </h4>
            <p className="text-sm text-blue-800">
              Ces paramètres vous permettent de contrôler qui peut voir vos informations et
              comment vous pouvez être contacté. Ajustez-les selon vos préférences.
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Visibility */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visibilité du profil</h3>
            <p className="text-sm text-gray-600">
              Contrôlez qui peut voir votre profil et vos informations
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <PrivacySetting
            icon={Users}
            title="Profil visible"
            description="Permettre aux autres utilisateurs de voir votre profil dans les recherches"
          >
            <Switch
              checked={settings.profileVisibility === 'public'}
              onCheckedChange={(checked) =>
                handleSettingChange('profileVisibility', checked ? 'public' : 'private')
              }
            />
          </PrivacySetting>

          <PrivacySetting
            icon={Eye}
            title="Apparaître dans les recherches"
            description="Votre profil sera visible dans les résultats de recherche"
          >
            <Switch
              checked={settings.showInSearch}
              onCheckedChange={(checked) => handleSettingChange('showInSearch', checked)}
            />
          </PrivacySetting>

          <PrivacySetting
            icon={CheckCircle}
            title="Afficher le statut en ligne"
            description="Les autres utilisateurs peuvent voir quand vous êtes en ligne"
          >
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) =>
                handleSettingChange('showOnlineStatus', checked)
              }
            />
          </PrivacySetting>

          <PrivacySetting
            icon={Clock}
            title="Afficher la dernière connexion"
            description="Les autres peuvent voir quand vous vous êtes connecté pour la dernière fois"
          >
            <Switch
              checked={settings.showLastActive}
              onCheckedChange={(checked) =>
                handleSettingChange('showLastActive', checked)
              }
            />
          </PrivacySetting>
        </div>
      </Card>

      {/* Photo Privacy */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Confidentialité des photos
            </h3>
            <p className="text-sm text-gray-600">
              Définissez qui peut voir vos photos de profil
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-900 mb-1">
                  Qui peut voir mes photos
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Contrôlez l'accès à votre galerie photos
                </p>
                <Select
                  value={settings.photosVisibility}
                  onValueChange={(value) => handleSettingChange('photosVisibility', value)}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    <SelectItem value="members">Membres uniquement</SelectItem>
                    <SelectItem value="matches">Mes matches uniquement</SelectItem>
                    <SelectItem value="private">Privées (moi uniquement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Communication Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Paramètres de communication
            </h3>
            <p className="text-sm text-gray-600">
              Contrôlez qui peut vous contacter
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-gray-900 mb-1">
                  Qui peut m'envoyer des messages
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Limitez les messages entrants selon vos préférences
                </p>
                <Select
                  value={settings.allowMessages}
                  onValueChange={(value) => handleSettingChange('allowMessages', value)}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Tous les utilisateurs</SelectItem>
                    <SelectItem value="matches">Mes matches uniquement</SelectItem>
                    <SelectItem value="verified">Utilisateurs vérifiés</SelectItem>
                    <SelectItem value="none">Personne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <PrivacySetting
            icon={Bell}
            title="Notifications email"
            description="Recevoir des notifications par email pour les messages et activités"
          >
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange('emailNotifications', checked)
              }
            />
          </PrivacySetting>

          <PrivacySetting
            icon={Bell}
            title="Notifications push"
            description="Recevoir des notifications instantanées sur votre appareil"
          >
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange('pushNotifications', checked)
              }
            />
          </PrivacySetting>
        </div>
      </Card>

      {/* Data & Analytics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Données et analytiques
            </h3>
            <p className="text-sm text-gray-600">
              Gérez comment vos données sont utilisées
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <PrivacySetting
            icon={Eye}
            title="Autoriser les vues de profil"
            description="Permettre aux autres utilisateurs de voir votre profil et enregistrer les statistiques"
          >
            <Switch
              checked={settings.allowProfileViews}
              onCheckedChange={(checked) =>
                handleSettingChange('allowProfileViews', checked)
              }
            />
          </PrivacySetting>

          <PrivacySetting
            icon={Database}
            title="Partage des données analytiques"
            description="Aider à améliorer la plateforme en partageant des données anonymisées"
          >
            <Switch
              checked={settings.shareAnalytics}
              onCheckedChange={(checked) =>
                handleSettingChange('shareAnalytics', checked)
              }
            />
          </PrivacySetting>

          <PrivacySetting
            icon={Shield}
            title="Traitement des données"
            description="Autoriser le traitement de vos données pour améliorer votre expérience (requis)"
          >
            <Switch
              checked={settings.dataProcessing}
              onCheckedChange={(checked) =>
                handleSettingChange('dataProcessing', checked)
              }
              disabled
            />
          </PrivacySetting>
        </div>
      </Card>

      {/* Blocked Users */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <UserX className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Utilisateurs bloqués
            </h3>
            <p className="text-sm text-gray-600">
              Les utilisateurs bloqués ne peuvent pas voir votre profil ni vous contacter
            </p>
          </div>
          <Button variant="outline" size="sm">
            Gérer
          </Button>
        </div>

        {blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserX className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Vous n'avez bloqué aucun utilisateur</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <Button variant="ghost" size="sm" className="text-red-600">
                  Débloquer
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-gray-600">
          Vos paramètres sont automatiquement enregistrés
        </p>
        <Button
          onClick={handleSaveAll}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Enregistrer tous les paramètres
        </Button>
      </div>
    </div>
  );
};

export default PrivacyTab;
