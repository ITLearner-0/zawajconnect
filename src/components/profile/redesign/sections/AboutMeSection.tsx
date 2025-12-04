import { useState } from 'react';
import { FileText, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ProfileSection, { SectionContent, SectionText, EmptyState } from '../ProfileSection';
import { DatabaseProfile } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AboutMeSectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  onUpdate?: (updatedProfile: Partial<DatabaseProfile>) => void;
}

/**
 * AboutMeSection Component
 *
 * Displays and allows editing of the "About Me" section of a profile.
 * Features:
 * - View mode: Display the about me text
 * - Edit mode: Inline editing with textarea
 * - Character count
 * - Save/Cancel actions
 * - Empty state for new profiles
 */
const AboutMeSection = ({ profile, isOwnProfile, onUpdate }: AboutMeSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [aboutText, setAboutText] = useState(profile.about_me || '');
  const [isSaving, setIsSaving] = useState(false);

  const MAX_LENGTH = 1000;
  const hasContent = profile.about_me && profile.about_me.trim().length > 0;

  const handleSave = async () => {
    if (aboutText.trim().length === 0) {
      toast({
        title: 'Erreur',
        description: 'La description ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    if (aboutText.length > MAX_LENGTH) {
      toast({
        title: 'Erreur',
        description: `La description ne peut pas dépasser ${MAX_LENGTH} caractères`,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ about_me: aboutText.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Votre description a été mise à jour',
      });

      setIsEditing(false);

      if (onUpdate) {
        onUpdate({ about_me: aboutText.trim() });
      }
    } catch (error) {
      console.error('Error updating about me:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour votre description',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setAboutText(profile.about_me || '');
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // Actions for the section header
  const actions = isOwnProfile && !isEditing ? (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleStartEdit}
      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
    >
      <Edit2 className="h-4 w-4 mr-1" />
      Modifier
    </Button>
  ) : null;

  // Badge showing character count in edit mode
  const badge = isEditing ? (
    <Badge variant="outline" className={aboutText.length > MAX_LENGTH ? 'border-rose-500 text-rose-700' : ''}>
      {aboutText.length}/{MAX_LENGTH}
    </Badge>
  ) : null;

  return (
    <ProfileSection
      icon={FileText}
      title="À Propos de Moi"
      accentColor="rose"
      defaultOpen={true}
      actions={actions}
      badge={badge}
      collapsible={!isEditing}
    >
      <SectionContent>
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <Textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Parlez de vous, de vos passions, de ce que vous recherchez dans un partenaire..."
              className="min-h-[200px] resize-none"
              maxLength={MAX_LENGTH}
              autoFocus
            />

            <div className="text-sm text-gray-600 space-y-2">
              <p>💡 <strong>Conseils :</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Soyez authentique et sincère</li>
                <li>Mentionnez vos valeurs et ce qui est important pour vous</li>
                <li>Parlez de vos centres d'intérêt et passions</li>
                <li>Décrivez le type de relation que vous recherchez</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving || aboutText.length > MAX_LENGTH}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        ) : hasContent ? (
          // View Mode with content
          <SectionText>{profile.about_me}</SectionText>
        ) : isOwnProfile ? (
          // Empty state for own profile
          <EmptyState
            icon={FileText}
            title="Parlez de vous"
            description="Ajoutez une description pour que les autres utilisateurs puissent mieux vous connaître. Une bonne description augmente vos chances de match de 60% !"
            action={{
              label: 'Ajouter une description',
              onClick: handleStartEdit,
            }}
          />
        ) : (
          // Empty state for other profiles
          <SectionText className="text-gray-500 italic">
            Aucune description disponible
          </SectionText>
        )}
      </SectionContent>
    </ProfileSection>
  );
};

export default AboutMeSection;
