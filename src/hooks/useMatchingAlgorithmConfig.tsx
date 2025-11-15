import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlgorithmWeights {
  religious: number;
  values: number;
  lifestyle: number;
  personality: number;
  family: number;
}

export interface AlgorithmThresholds {
  minCompatibility: number;
  dealbreakerThreshold: number;
  strongMatchThreshold: number;
}

export interface AlgorithmFilters {
  requireVerified: boolean;
  maxDistance: number | null;
  ageRange: [number, number] | null;
}

export interface MatchingAlgorithmConfig {
  id?: string;
  config_name: string;
  config_version: string;
  weights: AlgorithmWeights;
  thresholds: AlgorithmThresholds;
  filters: AlgorithmFilters;
  is_active: boolean;
  created_by?: string;
}

export function useMatchingAlgorithmConfig() {
  const [configs, setConfigs] = useState<MatchingAlgorithmConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<MatchingAlgorithmConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matching_algorithm_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedConfigs = data.map((config) => ({
        ...config,
        weights: config.weights as unknown as AlgorithmWeights,
        thresholds: config.thresholds as unknown as AlgorithmThresholds,
        filters: config.filters as unknown as AlgorithmFilters,
        is_active: config.is_active ?? false,
      })) as MatchingAlgorithmConfig[];

      setConfigs(typedConfigs);

      const active = typedConfigs.find((c) => c.is_active);
      setActiveConfig(active || null);
    } catch (error: any) {
      toast({
        title: 'Erreur de chargement',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: MatchingAlgorithmConfig) => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // If setting as active, deactivate all others first
      if (config.is_active) {
        await supabase
          .from('matching_algorithm_config')
          .update({
            is_active: false,
            deactivated_at: new Date().toISOString(),
          })
          .neq('id', config.id || '');
      }

      const configData = {
        config_name: config.config_name,
        config_version: config.config_version,
        weights: config.weights as any,
        thresholds: config.thresholds as any,
        filters: config.filters as any,
        is_active: config.is_active,
        created_by: user.id,
        ...(config.is_active && { activated_at: new Date().toISOString() }),
      };

      if (config.id) {
        const { error } = await supabase
          .from('matching_algorithm_config')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('matching_algorithm_config').insert(configData);

        if (error) throw error;
      }

      toast({
        title: 'Configuration sauvegardée',
        description: "L'algorithme de matching a été mis à jour",
      });

      await loadConfigs();
    } catch (error: any) {
      toast({
        title: 'Erreur de sauvegarde',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const activateConfig = async (configId: string) => {
    try {
      setSaving(true);

      // Deactivate all configs
      await supabase
        .from('matching_algorithm_config')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
        })
        .neq('id', configId);

      // Activate selected config
      const { error } = await supabase
        .from('matching_algorithm_config')
        .update({
          is_active: true,
          activated_at: new Date().toISOString(),
        })
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: 'Configuration activée',
        description: 'Cette configuration est maintenant active',
      });

      await loadConfigs();
    } catch (error: any) {
      toast({
        title: "Erreur d'activation",
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('matching_algorithm_config')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: 'Configuration supprimée',
        description: 'La configuration a été supprimée avec succès',
      });

      await loadConfigs();
    } catch (error: any) {
      toast({
        title: 'Erreur de suppression',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    configs,
    activeConfig,
    loading,
    saving,
    saveConfig,
    activateConfig,
    deleteConfig,
    refreshConfigs: loadConfigs,
  };
}
