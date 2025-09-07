import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIslamicModeration } from '@/hooks/useIslamicModeration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ModerationDemo: React.FC = () => {
  const { user } = useAuth();
  const { moderateContent, isChecking } = useIslamicModeration();
  const { toast } = useToast();
  const [testMessage, setTestMessage] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const testMessages = [
    "Assalamu alaikum, comment allez-vous ?",
    "Tu es vraiment stupide !",
    "J'aimerais vous connaître mieux respectueusement",
    "Salut ma belle, tu veux qu'on se voit ce soir ?",
    "Je cherche une épouse pieuse pour fonder une famille islamique",
    "Vous mentez constamment dans vos messages"
  ];

  const handleTest = async (message: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour tester la modération",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await moderateContent(message, user.id, 'test');
      setResults(prev => [{ message, result, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Error testing moderation:', error);
    }
  };

  const getResultColor = (action: string) => {
    switch (action) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'warned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'escalated': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultIcon = (action: string) => {
    switch (action) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'warned': return <AlertTriangle className="h-4 w-4" />;
      case 'blocked': return <Shield className="h-4 w-4" />;
      case 'escalated': return <BookOpen className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'approved': return 'Approuvé ✅';
      case 'warned': return 'Avertissement ⚠️';
      case 'blocked': return 'Bloqué 🚫';
      case 'escalated': return 'Escaladé 📋';
      default: return action;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald" />
            Démo - Modération Islamique IA
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Testez notre système de modération intelligent basé sur les valeurs islamiques
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Message Test */}
          <div>
            <label className="text-sm font-medium mb-2 block">Testez votre propre message :</label>
            <div className="flex gap-2">
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Écrivez un message pour tester la modération..."
                className="flex-1"
                rows={2}
              />
              <Button
                onClick={() => handleTest(testMessage)}
                disabled={!testMessage.trim() || isChecking}
                className="bg-emerald hover:bg-emerald-dark"
              >
                {isChecking ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Tester'
                )}
              </Button>
            </div>
          </div>

          {/* Predefined Test Messages */}
          <div>
            <label className="text-sm font-medium mb-2 block">Messages de test prédéfinis :</label>
            <div className="grid gap-2">
              {testMessages.map((message, index) => (
                <div key={index} className="flex items-center gap-2">
                  <p className="flex-1 text-sm p-2 bg-muted rounded border">
                    "{message}"
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(message)}
                    disabled={isChecking}
                  >
                    Tester
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de Modération</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((item, index) => (
                <Card key={index} className={`${getResultColor(item.result.action)} border`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Message */}
                      <div>
                        <p className="text-sm font-medium">Message testé :</p>
                        <p className="text-sm italic">"{item.message}"</p>
                      </div>

                      {/* Result */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getResultIcon(item.result.action)}
                          <span className="font-medium">{getActionText(item.result.action)}</span>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(item.result.confidence * 100)}% confiance
                        </Badge>
                      </div>

                      {/* Reason */}
                      <div>
                        <p className="text-sm font-medium">Raison :</p>
                        <p className="text-sm">{item.result.reason}</p>
                      </div>

                      {/* Rules Triggered */}
                      {item.result.rulesTriggered && item.result.rulesTriggered.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Règles déclenchées :</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.result.rulesTriggered.map((rule: string, ruleIndex: number) => (
                              <Badge key={ruleIndex} variant="outline" className="text-xs">
                                {rule}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestion */}
                      {item.result.suggestion && item.result.suggestion !== item.message && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded border border-emerald-200 dark:border-emerald-800">
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Version suggérée :
                          </p>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            "{item.result.suggestion}"
                          </p>
                        </div>
                      )}

                      {/* Islamic Guidance */}
                      {item.result.islamicGuidance && (
                        <div className="bg-gold-50 dark:bg-gold-900/20 p-3 rounded border border-gold-200 dark:border-gold-800">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gold-700 dark:text-gold-300">
                                Guidance islamique :
                              </p>
                              <p className="text-sm text-gold-600 dark:text-gold-400">
                                {item.result.islamicGuidance}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground">
                        Testé le : {new Date(item.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModerationDemo;