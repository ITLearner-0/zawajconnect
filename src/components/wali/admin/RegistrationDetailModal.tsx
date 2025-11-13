import { useState } from 'react';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
} from 'lucide-react';
import { RegistrationStatusBadge } from '../registration/RegistrationStatusBadge';
import { useAuth } from '@/hooks/useAuth';

interface RegistrationDetailModalProps {
  registration: WaliRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string, reviewedBy: string) => Promise<boolean>;
  onReject: (id: string, reviewedBy: string, reason: string) => Promise<boolean>;
  onUpdateNotes: (id: string, notes: string) => Promise<boolean>;
}

export const RegistrationDetailModal = ({
  registration,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onUpdateNotes,
}: RegistrationDetailModalProps) => {
  const { user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNotes, setVerificationNotes] = useState(
    registration?.verification_notes || ''
  );
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!registration) return null;

  const handleApprove = async () => {
    if (!user) return;
    setIsProcessing(true);
    const success = await onApprove(registration.id, user.id);
    if (success) {
      onOpenChange(false);
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!user || !rejectionReason.trim()) return;
    setIsProcessing(true);
    const success = await onReject(registration.id, user.id, rejectionReason);
    if (success) {
      setRejectionReason('');
      setShowRejectForm(false);
      onOpenChange(false);
    }
    setIsProcessing(false);
  };

  const handleSaveNotes = async () => {
    setIsProcessing(true);
    await onUpdateNotes(registration.id, verificationNotes);
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Détails de l'inscription Wali
            </DialogTitle>
            <RegistrationStatusBadge status={registration.status} />
          </div>
          <DialogDescription>
            Vérifiez les informations et les documents du candidat Wali
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations Personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Nom complet</Label>
                  <p className="font-medium">{registration.full_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <p className="font-medium">{registration.email}</p>
                  </div>
                </div>
                {registration.phone && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <p className="font-medium">{registration.phone}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Date de soumission</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <p className="font-medium">
                      {new Date(registration.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Relationship Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Relation avec les membres</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{registration.relationship_to_user}</p>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents de Vérification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registration.id_document_url && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Pièce d'identité</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={registration.id_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Voir
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={registration.id_document_url} download>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
                {registration.proof_of_relationship_url && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <Label>Preuve de relation</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <a
                          href={registration.proof_of_relationship_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Voir
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={registration.proof_of_relationship_url} download>
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Verification Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes">Notes de vérification (internes)</Label>
              <Textarea
                id="notes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Ajoutez des notes sur la vérification de cette inscription..."
                rows={4}
              />
              <Button
                onClick={handleSaveNotes}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                Enregistrer les notes
              </Button>
            </div>

            {registration.rejection_reason && (
              <>
                <Separator />
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <Label className="text-destructive">Raison du rejet</Label>
                  <p className="text-sm mt-2">{registration.rejection_reason}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {registration.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t">
            {!showRejectForm ? (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </>
            ) : (
              <div className="flex-1 space-y-3">
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Raison du rejet (obligatoire)..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    Confirmer le rejet
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    disabled={isProcessing}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
