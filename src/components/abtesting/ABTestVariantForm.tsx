import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ABTestVariantFormProps {
  reminderType: '7days' | '3days' | '1day';
  onSuccess?: () => void;
}

interface FormData {
  test_name: string;
  variant_name: string;
  subject_line: string;
  offer_percentage: number;
  promo_code: string;
  email_tone: 'friendly' | 'urgent' | 'professional' | 'dramatic';
  cta_text: string;
  traffic_allocation: number;
  notes: string;
}

export function ABTestVariantForm({ reminderType, onSuccess }: ABTestVariantFormProps) {
  const queryClient = useQueryClient();
  const [trafficAllocation, setTrafficAllocation] = useState(50);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      traffic_allocation: 50,
      email_tone: 'friendly',
    },
  });

  const createVariant = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('email_ab_tests').insert({
        test_name: data.test_name,
        reminder_type: reminderType,
        variant_name: data.variant_name,
        subject_line: data.subject_line,
        offer_percentage: data.offer_percentage,
        promo_code: data.promo_code,
        email_tone: data.email_tone,
        cta_text: data.cta_text,
        traffic_allocation: data.traffic_allocation,
        notes: data.notes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Variante créée avec succès!');
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    createVariant.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="test_name">Nom du Test</Label>
          <Input
            id="test_name"
            {...register('test_name', { required: true })}
            placeholder="ex: test_urgence_v1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variant_name">Nom de la Variante</Label>
          <Input
            id="variant_name"
            {...register('variant_name', { required: true })}
            placeholder="ex: control, variant_a"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="subject_line">Sujet de l'Email</Label>
          <Input
            id="subject_line"
            {...register('subject_line', { required: true })}
            placeholder="⏰ Votre abonnement expire dans {X} jours"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer_percentage">Pourcentage de Réduction</Label>
          <Input
            id="offer_percentage"
            type="number"
            {...register('offer_percentage', { required: true, min: 0, max: 100 })}
            placeholder="15"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promo_code">Code Promo</Label>
          <Input
            id="promo_code"
            {...register('promo_code', { required: true })}
            placeholder="RENOUVELLEMENT15"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_tone">Ton de l'Email</Label>
          <Select
            onValueChange={(value) => setValue('email_tone', value as any)}
            defaultValue="friendly"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Amical</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="professional">Professionnel</SelectItem>
              <SelectItem value="dramatic">Dramatique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta_text">Texte du Bouton CTA</Label>
          <Input
            id="cta_text"
            {...register('cta_text', { required: true })}
            placeholder="🎁 Renouveler Maintenant"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="traffic_allocation">Allocation du Trafic: {trafficAllocation}%</Label>
          <Slider
            id="traffic_allocation"
            min={0}
            max={100}
            step={5}
            value={[trafficAllocation]}
            onValueChange={(vals) => {
              const value = vals[0] ?? 50;
              setTrafficAllocation(value);
              setValue('traffic_allocation', value);
            }}
          />
          <p className="text-sm text-muted-foreground">
            Pourcentage d'utilisateurs qui recevront cette variante
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Description de la variante, hypothèse testée, etc."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" disabled={createVariant.isPending}>
          {createVariant.isPending ? 'Création...' : 'Créer la Variante'}
        </Button>
      </div>
    </form>
  );
}
