import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const suspensionSchema = z.object({
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères'),
  suspension_type: z.enum(['temporary', 'permanent', 'warning']),
  severity_level: z.enum(['low', 'medium', 'high', 'critical']),
  expires_at: z.string().optional(),
  notes: z.string().optional(),
});

type SuspensionFormData = z.infer<typeof suspensionSchema>;

interface SuspensionFormProps {
  waliId: string;
  userId: string;
  onSubmit: (data: Partial<SuspensionFormData>) => Promise<void>;
  onCancel: () => void;
}

export const SuspensionForm = ({ waliId, userId, onSubmit, onCancel }: SuspensionFormProps) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SuspensionFormData>({
    resolver: zodResolver(suspensionSchema),
    defaultValues: {
      suspension_type: 'warning',
      severity_level: 'medium',
    },
  });

  const suspensionType = watch('suspension_type');

  const onFormSubmit = async (data: SuspensionFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Suspendre le Wali</CardTitle>
        </div>
        <CardDescription>
          Cette action affectera les permissions et l'accès du Wali
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspension_type">Type de suspension</Label>
            <Select
              value={suspensionType}
              onValueChange={(value) => setValue('suspension_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="temporary">Temporaire</SelectItem>
                <SelectItem value="permanent">Permanente</SelectItem>
              </SelectContent>
            </Select>
            {errors.suspension_type && (
              <p className="text-sm text-destructive">{errors.suspension_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity_level">Niveau de gravité</Label>
            <Select
              defaultValue="medium"
              onValueChange={(value) => setValue('severity_level', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Faible</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="high">Élevé</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
            {errors.severity_level && (
              <p className="text-sm text-destructive">{errors.severity_level.message}</p>
            )}
          </div>

          {suspensionType === 'temporary' && (
            <div className="space-y-2">
              <Label htmlFor="expires_at">Date d'expiration</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                {...register('expires_at')}
              />
              {errors.expires_at && (
                <p className="text-sm text-destructive">{errors.expires_at.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Raison *</Label>
            <Textarea
              id="reason"
              placeholder="Décrivez la raison de la suspension..."
              {...register('reason')}
              rows={4}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              placeholder="Notes internes (optionnel)..."
              {...register('notes')}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? 'Suspension...' : 'Suspendre'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
