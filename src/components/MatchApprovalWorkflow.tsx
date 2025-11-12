import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Shield } from 'lucide-react';
import { useMatchApproval } from '@/hooks/useMatchApproval';
import { MatchApprovalData, ApprovalDecision } from '@/types/match-approval';
import MatchApprovalCard from '@/components/MatchApprovalCard';
import ApprovalDecisionDialog from '@/components/ApprovalDecisionDialog';

const MatchApprovalWorkflow: React.FC = () => {
  const { matches, loading, processingId, processApprovalDecision } = useMatchApproval();
  const [selectedMatch, setSelectedMatch] = useState<MatchApprovalData | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [decision, setDecision] = useState<ApprovalDecision>({
    approved: false,
    notes: '',
    conditions: [],
    meetingRequired: false
  });

  const openApprovalDialog = (match: MatchApprovalData, approved: boolean) => {
    setSelectedMatch(match);
    setDecision({ 
      approved, 
      notes: '', 
      conditions: [], 
      meetingRequired: false 
    });
    setShowApprovalDialog(true);
  };

  const handleConfirmDecision = async () => {
    if (!selectedMatch) return;

    const success = await processApprovalDecision(selectedMatch, decision);
    if (success) {
      setShowApprovalDialog(false);
      setSelectedMatch(null);
      setDecision({ approved: false, notes: '', conditions: [], meetingRequired: false });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des matches à approuver...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Approbation des Matches</h1>
          <p className="text-muted-foreground">
            Validez les matches selon les valeurs familiales islamiques
          </p>
        </div>
      </div>

      {/* Matches en attente */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun match en attente</h3>
              <p className="text-muted-foreground">
                Tous les matches ont été traités ou aucun nouveau match n'a été créé
              </p>
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <MatchApprovalCard
              key={match.id}
              match={match}
              onApprove={(match) => openApprovalDialog(match, true)}
              onReject={(match) => openApprovalDialog(match, false)}
            />
          ))
        )}
      </div>

      {/* Dialog d'approbation/refus */}
      <ApprovalDecisionDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        decision={decision}
        onDecisionChange={setDecision}
        onConfirm={handleConfirmDecision}
        isLoading={processingId === selectedMatch?.id}
      />
    </div>
  );
};

export default MatchApprovalWorkflow;