import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DocumentVerification as DocumentVerificationType } from '@/types/documents';

interface DocumentVerificationProps {
  userId: string;
  verifications: DocumentVerificationType[];
  onVerificationSubmitted: () => void;
}

const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  userId,
  verifications,
  onVerificationSubmitted,
}) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const documentTypes = [
    { value: 'id_card', label: "Carte d'identité" },
    { value: 'passport', label: 'Passeport' },
    { value: 'driver_license', label: 'Permis de conduire' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocumentType) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Le fichier ne doit pas dépasser 5 MB',
        variant: 'destructive',
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Type de fichier non supporté',
        description: 'Seuls les fichiers JPG, PNG, WebP et PDF sont acceptés',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // In a real implementation, you would upload to storage first
      // For now, we'll simulate with a placeholder URL
      const documentUrl = `documents/${userId ?? 'anonymous'}/${Date.now()}_${file.name}`;

      const { error } = await supabase.from('document_verifications' as any).insert({
        user_id: userId,
        document_type: selectedDocumentType,
        document_url: documentUrl,
      });

      if (error) throw error;

      // Update profile verification status
      await supabase
        .from('profiles' as any)
        .update({
          document_verification_status: 'pending',
          document_verification_type: selectedDocumentType,
          document_verification_submitted_at: new Date().toISOString(),
        } as any)
        .eq('id', userId);

      toast({
        title: 'Document soumis',
        description: 'Votre document a été soumis pour vérification',
      });

      setSelectedDocumentType('');
      onVerificationSubmitted();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la soumission du document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Vérification d'identité par document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {verifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Documents soumis</h4>
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {documentTypes.find((t) => t.value === verification.document_type)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Soumis le{' '}
                    {verification?.submitted_at
                      ? new Date(verification.submitted_at).toLocaleDateString('fr-FR')
                      : 'Date inconnue'}
                  </p>
                  {verification.reviewer_notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Note: {verification.reviewer_notes}
                    </p>
                  )}
                </div>
                {getStatusBadge(verification.status)}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium">Soumettre un nouveau document</h4>

          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de document" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Document (max 5 MB)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedDocumentType || uploading}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Téléchargement...' : 'Choisir un fichier'}
            </Button>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Assurez-vous que votre document est lisible et que toutes
              les informations sont visibles. Les documents flous ou partiellement cachés seront
              rejetés.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVerification;
