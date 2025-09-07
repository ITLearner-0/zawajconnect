import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, Edit, Eye, Trash2, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ModerationRule {
  id: string;
  rule_name: string;
  rule_description: string;
  keywords: any; // Use any for JSON type from Supabase
  severity: 'low' | 'medium' | 'high';
  action: 'warn' | 'block' | 'escalate';
  islamic_value: 'respect' | 'modesty' | 'truthfulness' | 'no_vulgarity' | 'kindness';
  is_active: boolean;
  created_at: string;
}

interface ModerationLog {
  id: string;
  user_id: string;
  content_analyzed: string;
  action_taken: string;
  confidence_score: number;
  rules_triggered: any; // Use any for JSON type from Supabase
  created_at: string;
  human_reviewed: boolean;
}

const IslamicModerationPanel: React.FC = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<ModerationRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New rule form state
  const [newRule, setNewRule] = useState<{
    rule_name: string;
    rule_description: string;
    keywords: string;
    severity: 'low' | 'medium' | 'high';
    action: 'warn' | 'block' | 'escalate';
    islamic_value: 'respect' | 'modesty' | 'truthfulness' | 'no_vulgarity' | 'kindness';
  }>({
    rule_name: '',
    rule_description: '',
    keywords: '',
    severity: 'medium',
    action: 'warn',
    islamic_value: 'respect'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load moderation rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('islamic_moderation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      // Load recent moderation logs
      const { data: logsData, error: logsError } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setRules(rulesData?.map(rule => ({
        ...rule,
        keywords: Array.isArray(rule.keywords) ? rule.keywords : [],
        severity: rule.severity as 'low' | 'medium' | 'high',
        action: rule.action as 'warn' | 'block' | 'escalate',
        islamic_value: rule.islamic_value as 'respect' | 'modesty' | 'truthfulness' | 'no_vulgarity' | 'kindness'
      })) || []);
      setLogs(logsData?.map(log => ({
        ...log,
        rules_triggered: Array.isArray(log.rules_triggered) ? log.rules_triggered : []
      })) || []);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de modération",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async () => {
    try {
      const keywordsArray = newRule.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const ruleData = {
        rule_name: newRule.rule_name,
        rule_description: newRule.rule_description,
        keywords: keywordsArray,
        severity: newRule.severity,
        action: newRule.action,
        islamic_value: newRule.islamic_value,
        is_active: true
      };

      let error;
      if (editingRule) {
        const result = await supabase
          .from('islamic_moderation_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('islamic_moderation_rules')
          .insert(ruleData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Succès",
        description: editingRule ? "Règle modifiée avec succès" : "Nouvelle règle créée avec succès"
      });

      setNewRule({
        rule_name: '',
        rule_description: '',
        keywords: '',
        severity: 'medium',
        action: 'warn',
        islamic_value: 'respect'
      });
      setEditingRule(null);
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la règle",
        variant: "destructive"
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('islamic_moderation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Règle ${isActive ? 'activée' : 'désactivée'}`
      });

      loadData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la règle",
        variant: "destructive"
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return;

    try {
      const { error } = await supabase
        .from('islamic_moderation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Règle supprimée avec succès"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la règle",
        variant: "destructive"
      });
    }
  };

  const startEdit = (rule: ModerationRule) => {
    setEditingRule(rule);
    setNewRule({
      rule_name: rule.rule_name,
      rule_description: rule.rule_description,
      keywords: Array.isArray(rule.keywords) ? rule.keywords.join(', ') : '',
      severity: rule.severity,
      action: rule.action,
      islamic_value: rule.islamic_value
    });
    setIsDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'warn': return 'bg-blue-100 text-blue-800';
      case 'block': return 'bg-red-100 text-red-800';
      case 'escalate': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIslamicValueEmoji = (value: string) => {
    switch (value) {
      case 'respect': return '🤝';
      case 'modesty': return '🕊️';
      case 'truthfulness': return '✨';
      case 'no_vulgarity': return '🚫';
      case 'kindness': return '💚';
      default: return '📜';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald" />
          <h2 className="text-2xl font-bold">Modération Islamique</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald hover:bg-emerald-dark">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Règle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Modifier la Règle' : 'Nouvelle Règle de Modération'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Nom de la règle</label>
                <Input
                  value={newRule.rule_name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, rule_name: e.target.value }))}
                  placeholder="Ex: Détection de vulgarité"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newRule.rule_description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, rule_description: e.target.value }))}
                  placeholder="Description détaillée de la règle..."
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Mots-clés (séparés par des virgules)</label>
                <Input
                  value={newRule.keywords}
                  onChange={(e) => setNewRule(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="vulgar, inappropriate, offensive"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Valeur islamique</label>
                <Select 
                  value={newRule.islamic_value} 
                  onValueChange={(value: any) => setNewRule(prev => ({ ...prev, islamic_value: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="respect">🤝 Respect</SelectItem>
                    <SelectItem value="modesty">🕊️ Pudeur</SelectItem>
                    <SelectItem value="truthfulness">✨ Véracité</SelectItem>
                    <SelectItem value="no_vulgarity">🚫 Non-vulgarité</SelectItem>
                    <SelectItem value="kindness">💚 Gentillesse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Sévérité</label>
                <Select 
                  value={newRule.severity} 
                  onValueChange={(value: any) => setNewRule(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium">Action</label>
                <Select 
                  value={newRule.action} 
                  onValueChange={(value: any) => setNewRule(prev => ({ ...prev, action: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warn">Avertir</SelectItem>
                    <SelectItem value="block">Bloquer</SelectItem>
                    <SelectItem value="escalate">Escalader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingRule(null);
                setNewRule({
                  rule_name: '',
                  rule_description: '',
                  keywords: '',
                  severity: 'medium',
                  action: 'warn',
                  islamic_value: 'respect'
                });
              }}>
                Annuler
              </Button>
              <Button onClick={saveRule} className="bg-emerald hover:bg-emerald-dark">
                {editingRule ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Règles de Modération</TabsTrigger>
          <TabsTrigger value="logs">Journaux d'Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Règles de Modération Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Règle</TableHead>
                    <TableHead>Valeur Islamique</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.rule_name}</p>
                          <p className="text-sm text-muted-foreground">{rule.rule_description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getIslamicValueEmoji(rule.islamic_value)}</span>
                          <span className="capitalize">{rule.islamic_value}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(rule.action)}>
                          {rule.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(rule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteRule(rule.id)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Journaux de Modération Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead>Règles Déclenchées</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate">{log.content_analyzed}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action_taken)}>
                          {log.action_taken}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Math.round(log.confidence_score * 100)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {log.rules_triggered.map((rule, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {rule}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IslamicModerationPanel;