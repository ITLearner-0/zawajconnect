import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, AlertCircle } from 'lucide-react';

interface EndConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, details: string, courtesyMessage: string) => void;
  loading?: boolean;
}

const END_REASONS = [
  { value: 'incompatibilite_religieuse', label: 'Incompatibilité religieuse' },
  { value: 'valeurs_familiales', label: 'Différences de valeurs familiales' },
  { value: 'situation_personnelle', label: 'Situation personnelle qui a changé' },
  { value: 'besoin_reflexion', label: 'Besoin de réflexion supplémentaire' },
  { value: 'conseil_famille', label: 'Conseil de la famille' },
  { value: 'autre', label: 'Autre raison' },
];

export const EndConversationDialog: React.FC<EndConversationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [courtesyMessage, setCourtesyMessage] = useState('');
  const [errors, setErrors] = useState<{ details?: string }>({});

  const handleConfirm = () => {
    const newErrors: { details?: string } = {};

    if (!reason) {
      newErrors.details = 'Veuillez sélectionner une raison';
    }
    if (details.trim().length < 20) {
      newErrors.details = 'Veuillez fournir au moins 20 caractères de détails';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(reason, details.trim(), courtesyMessage.trim());
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setCourtesyMessage('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Mettre fin à l'échange
          </DialogTitle>
          <DialogDescription>
            Cette action mettra fin à vos échanges avec cette personne. Vous ne pourrez plus
            communiquer ensemble et ne serez plus proposés l'un à l'autre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Raison de la clôture */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison de la clôture *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                {END_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Détails obligatoires */}
          <div className="space-y-2">
            <Label htmlFor="details">Détails de la raison * (minimum 20 caractères)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Veuillez expliquer de manière bienveillante les raisons de cette décision..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/500 caractères
            </p>
            {errors.details && (
              <p className="text-xs text-destructive">{errors.details}</p>
            )}
          </div>

          {/* Message de courtoisie optionnel */}
          <div className="space-y-2">
            <Label htmlFor="courtesy">Message de courtoisie (optionnel)</Label>
            <Textarea
              id="courtesy"
              value={courtesyMessage}
              onChange={(e) => setCourtesyMessage(e.target.value)}
              placeholder="Un mot bienveillant pour l'autre personne..."
              className="min-h-[80px]"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {courtesyMessage.length}/300 caractères
            </p>
          </div>

          {/* Message islamique automatique */}
          <Alert className="border-primary/20 bg-primary/5">
            <Heart className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Message automatique qui sera ajouté :</strong>
              <p className="mt-2 italic text-muted-foreground">
                "🤲 Qu'Allah vous guide vers ce qui est meilleur pour vous et facilite votre
                chemin vers un mariage béni. Que cette recherche sincère soit acceptée et que
                vous trouviez la quiétude du cœur. Ameen."
              </p>
            </AlertDescription>
          </Alert>

          {/* Avertissement */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cette action est définitive. Après la clôture, vous ne pourrez plus communiquer
              avec cette personne et elle ne vous sera plus proposée dans les résultats de
              recherche.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading || !reason || details.trim().length < 20}
          >
            {loading ? 'Clôture en cours...' : 'Confirmer la clôture'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
