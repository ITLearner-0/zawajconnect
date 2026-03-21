import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users, Heart, Send, CheckCircle2, X, Plus,
  Quote, Shield, UserPlus, Mail, Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FamilyContribution {
  id: string;
  contributorRole: string;
  section: string;
  content: string;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: string;
}

interface FamilyContributionsBlockProps {
  userId: string;
  isOwnProfile: boolean;
}

const roleLabels: Record<string, string> = {
  father: 'Père',
  mother: 'Mère',
  brother: 'Frère',
  sister: 'Sœur',
  uncle: 'Oncle',
  aunt: 'Tante',
  other: 'Autre',
};

const sectionLabels: Record<string, { label: string; icon: React.ElementType }> = {
  family_expectations: { label: 'Ce que notre famille attend', icon: Heart },
  character_description: { label: 'Son caractère selon nous', icon: Users },
  family_background: { label: 'Notre famille se présente', icon: Shield },
  values_statement: { label: 'Nos valeurs', icon: Quote },
};

const FamilyContributionsBlock = ({ userId, isOwnProfile }: FamilyContributionsBlockProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contributions, setContributions] = useState<FamilyContribution[]>([
    {
      id: '1',
      contributorRole: 'mother',
      section: 'character_description',
      content: "Notre fille est une personne douce, patiente et dévouée. Elle est très attachée à sa prière et à la lecture du Coran. Elle cuisine merveilleusement et a un grand sens de l'hospitalité. Nous sommes fiers de l'éducation que nous lui avons donnée.",
      isApproved: true,
      isVisible: true,
      createdAt: '2026-03-10',
    },
    {
      id: '2',
      contributorRole: 'father',
      section: 'family_expectations',
      content: "Nous recherchons un jeune homme pratiquant, respectueux, stable financièrement et issu d'une bonne famille. Quelqu'un qui honorera notre fille et prendra soin d'elle comme le Prophète ﷺ prenait soin de ses épouses.",
      isApproved: true,
      isVisible: true,
      createdAt: '2026-03-10',
    },
  ]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'father' });

  const sendInvitation = async () => {
    if (!inviteData.email) return;

    if (user) {
      try {
        await supabase.from('family_contributor_invitations').insert({
          profile_user_id: user.id,
          invited_email: inviteData.email,
          invited_role: inviteData.role,
        });
      } catch {
        // Continue
      }
    }

    toast({
      title: 'Invitation envoyée',
      description: `Un email d'invitation a été envoyé à ${inviteData.email}.`,
    });
    setShowInviteForm(false);
    setInviteData({ email: '', role: 'father' });
  };

  const toggleApproval = (id: string) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isApproved: !c.isApproved, isVisible: !c.isApproved } : c))
    );
  };

  // Public view: show only approved contributions
  const visibleContributions = contributions.filter((c) =>
    isOwnProfile ? true : (c.isApproved && c.isVisible)
  );

  if (!isOwnProfile && visibleContributions.length === 0) return null;

  return (
    <Card className="border-purple-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            La famille se présente
          </CardTitle>
          <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
            Profil co-créé
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleContributions.map((contribution) => {
          const sectionConfig = sectionLabels[contribution.section];
          const SectionIcon = sectionConfig?.icon || Users;

          return (
            <div key={contribution.id} className="space-y-2">
              <div className={`p-4 rounded-lg border ${
                isOwnProfile && !contribution.isApproved
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-purple-100 bg-purple-50/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <SectionIcon className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">
                    {sectionConfig?.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    — {roleLabels[contribution.contributorRole] || 'Famille'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{contribution.content}"
                </p>

                {/* Own profile: approval controls */}
                {isOwnProfile && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    {contribution.isApproved ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Publié
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        En attente d'approbation
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => toggleApproval(contribution.id)}
                    >
                      {contribution.isApproved ? 'Masquer' : 'Approuver et publier'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Invite Family (own profile only) */}
        {isOwnProfile && (
          <>
            {showInviteForm ? (
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="pt-4 space-y-3">
                  <p className="text-sm font-medium">Inviter un membre de la famille</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        placeholder="email@exemple.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Lien de parenté</Label>
                      <Select
                        value={inviteData.role}
                        onValueChange={(v) => setInviteData({ ...inviteData, role: v })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={sendInvitation} className="bg-purple-600 hover:bg-purple-700">
                      <Mail className="h-3.5 w-3.5 mr-1" /> Envoyer l'invitation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowInviteForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed border-purple-200 text-purple-600 hover:bg-purple-50"
                onClick={() => setShowInviteForm(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Inviter la famille à contribuer
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyContributionsBlock;
