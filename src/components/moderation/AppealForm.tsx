import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Scale, 
  FileText, 
  Upload, 
  Info, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { AppealSystem, AppealSubmission } from '@/services/moderation/appealSystem';
import { useToast } from '@/hooks/use-toast';

interface AppealFormProps {
  moderationActionId: string;
  originalAction: {
    type: string;
    reason: string;
    date: string;
  };
  onAppealSubmitted: () => void;
  onCancel: () => void;
}

const AppealForm: React.FC<AppealFormProps> = ({
  moderationActionId,
  originalAction,
  onAppealSubmitted,
  onCancel
}) => {
  const { toast } = useToast();
  const [appealReason, setAppealReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [currentEvidence, setCurrentEvidence] = useState('');
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const guidelines = AppealSystem.getAppealGuidelines();

  const handleAddEvidence = () => {
    if (currentEvidence.trim()) {
      setEvidence([...evidence, currentEvidence.trim()]);
      setCurrentEvidence('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!appealReason.trim() || !selectedReason || !hasReadGuidelines) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires et accepter les conditions.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const submission: AppealSubmission = {
      moderationActionId,
      appealReason: `${selectedReason}: ${appealReason}`,
      evidence: evidence.length > 0 ? evidence : undefined,
      additionalContext: additionalContext.trim() || undefined
    };

    try {
      const result = await AppealSystem.submitAppeal(submission, 'current-user-id'); // Replace with actual user ID
      
      if (result.success) {
        toast({
          title: "Appel soumis",
          description: "Votre appel a été soumis avec succès. Vous recevrez une notification lors de la révision.",
        });
        onAppealSubmitted();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la soumission de l'appel",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur technique s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Original Action Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Action de Modération Contestée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Type:</strong> {originalAction.type}</div>
            <div><strong>Motif:</strong> {originalAction.reason}</div>
            <div><strong>Date:</strong> {originalAction.date}</div>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Directives d'Appel
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuidelines(!showGuidelines)}
            >
              {showGuidelines ? 'Masquer' : 'Afficher'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showGuidelines && (
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Motifs Valides:</h4>
              <ul className="text-sm space-y-1">
                {guidelines.validReasons.map((reason, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Types de Preuves:</h4>
              <ul className="text-sm space-y-1">
                {guidelines.evidenceTypes.map((type, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-blue-600" />
                    {type}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Conseils:</h4>
              <ul className="text-sm space-y-1">
                {guidelines.tips.map((tip, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Info className="h-3 w-3 text-purple-600" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Appeal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-600" />
            Formulaire d'Appel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason-select">Motif de l'Appel *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un motif" />
              </SelectTrigger>
              <SelectContent>
                {guidelines.validReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detailed Explanation */}
          <div className="space-y-2">
            <Label htmlFor="appeal-reason">Explication Détaillée *</Label>
            <Textarea
              id="appeal-reason"
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="Expliquez en détail pourquoi vous contestez cette action..."
              rows={4}
            />
            <div className="text-xs text-muted-foreground">
              {appealReason.length}/1000 caractères
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <Label>Preuves à l'Appui (Optionnel)</Label>
            <div className="flex gap-2">
              <Textarea
                value={currentEvidence}
                onChange={(e) => setCurrentEvidence(e.target.value)}
                placeholder="Décrivez une preuve ou un élément de contexte..."
                rows={2}
              />
              <Button
                type="button"
                onClick={handleAddEvidence}
                disabled={!currentEvidence.trim()}
                size="sm"
              >
                Ajouter
              </Button>
            </div>
            
            {evidence.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Preuves Ajoutées:</Label>
                {evidence.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div className="flex-1 text-sm">{item}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEvidence(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additional-context">Contexte Additionnel (Optionnel)</Label>
            <Textarea
              id="additional-context"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Ajoutez tout contexte supplémentaire qui pourrait être pertinent..."
              rows={3}
            />
          </div>

          {/* Acknowledgment */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="guidelines-read"
              checked={hasReadGuidelines}
              onCheckedChange={(checked) => setHasReadGuidelines(checked === true)}
            />
            <Label htmlFor="guidelines-read" className="text-sm">
              J'ai lu et compris les directives d'appel et je certifie que les informations fournies sont exactes.
            </Label>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Les appels sont généralement traités sous 3-5 jours ouvrables. 
              Vous recevrez une notification par email du résultat.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !hasReadGuidelines}
        >
          {isSubmitting ? 'Soumission...' : 'Soumettre l\'Appel'}
        </Button>
      </div>
    </div>
  );
};

export default AppealForm;
