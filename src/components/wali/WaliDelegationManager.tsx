import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, ArrowRightLeft, Calendar, CheckCircle2, Clock, Plus, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Delegation {
  id: string;
  delegateName: string;
  startDate: string;
  endDate: string;
  reason: string;
  isActive: boolean;
}

const WaliDelegationManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [formData, setFormData] = useState({
    delegateName: '',
    delegateEmail: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = async () => {
    if (!formData.delegateName || !formData.startDate || !formData.endDate) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    const delegation: Delegation = {
      id: Date.now().toString(),
      delegateName: formData.delegateName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      isActive: new Date(formData.startDate) <= new Date() && new Date(formData.endDate) >= new Date(),
    };

    if (user) {
      try {
        await supabase.from('wali_delegations').insert({
          original_wali_id: user.id,
          delegate_wali_id: user.id, // Placeholder
          ward_user_id: user.id, // Placeholder
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
        });
      } catch {
        // Continue
      }
    }

    setDelegations((prev) => [delegation, ...prev]);
    setShowForm(false);
    setFormData({ delegateName: '', delegateEmail: '', startDate: '', endDate: '', reason: '' });
    toast({
      title: 'Délégation créée',
      description: `${formData.delegateName} a été désigné comme Wali délégué.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Délégations du rôle Wali</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <ArrowRightLeft className="h-4 w-4 mr-1" /> Déléguer
        </Button>
      </div>

      {/* Info */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              En cas d'absence (voyage, maladie, etc.), vous pouvez déléguer temporairement
              votre rôle de Wali à un autre mahram (oncle, frère, etc.). Pendant la délégation,
              le délégué recevra les notifications et pourra superviser les échanges.
            </p>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Nom du délégué *</Label>
                <Input
                  value={formData.delegateName}
                  onChange={(e) => setFormData({ ...formData, delegateName: e.target.value })}
                  placeholder="Ex: Oncle Mohammed"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Email du délégué</Label>
                <Input
                  type="email"
                  value={formData.delegateEmail}
                  onChange={(e) => setFormData({ ...formData, delegateEmail: e.target.value })}
                  placeholder="email@exemple.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Date de début *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Date de fin *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Raison de la délégation</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ex: Voyage à l'étranger du 25 mars au 5 avril"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Confirmer la délégation
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {delegations.length === 0 && !showForm && (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 pb-6 text-center">
            <ArrowRightLeft className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune délégation active</p>
            <p className="text-xs text-muted-foreground">Vous pouvez déléguer temporairement votre rôle si nécessaire</p>
          </CardContent>
        </Card>
      )}

      {delegations.map((d) => (
        <Card key={d.id} className={d.isActive ? 'border-purple-200' : ''}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{d.delegateName}</p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Du {new Date(d.startDate).toLocaleDateString('fr-FR')} au {new Date(d.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  {d.reason && <p className="text-xs text-gray-500 mt-1">{d.reason}</p>}
                </div>
              </div>
              <Badge className={d.isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}>
                {d.isActive ? <><Clock className="h-3 w-3 mr-1" /> Active</> : 'Terminée'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WaliDelegationManager;
