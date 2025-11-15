import { supabase } from '@/integrations/supabase/client';

export interface WaliFilter {
  id: string;
  wali_id: string;
  filter_name: string;
  filter_type: 'content' | 'behavior' | 'time' | 'contact';
  filter_config: FilterConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterConfig {
  // Content filters
  blocked_words?: string[];
  blocked_phrases?: string[];
  required_words?: string[];

  // Behavior filters
  max_messages_per_hour?: number;
  max_consecutive_messages?: number;
  require_response_time_minutes?: number;

  // Time filters
  allowed_hours_start?: string;
  allowed_hours_end?: string;
  blocked_days?: string[];

  // Contact filters
  blocked_contact_methods?: string[];
  require_wali_approval?: boolean;
  auto_approve_known_contacts?: boolean;
}

export interface FilterResult {
  passed: boolean;
  triggered_filters: string[];
  actions: FilterAction[];
  message?: string;
}

export interface FilterAction {
  type: 'block' | 'warn' | 'notify_wali' | 'require_approval' | 'delay';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export class AdvancedFiltersService {
  static async createFilter(
    filterData: Omit<WaliFilter, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (supabase as any).from('wali_filters').insert(filterData as any);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error creating filter:', error);
      return { success: false, error: error.message };
    }
  }

  static async getFilters(wali_id: string): Promise<WaliFilter[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('wali_filters')
        .select('*')
        .eq('wali_id', wali_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as WaliFilter[]) || [];
    } catch (error) {
      console.error('Error fetching filters:', error);
      return [];
    }
  }

  static async updateFilter(
    filterId: string,
    updates: Partial<WaliFilter>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (supabase as any)
        .from('wali_filters')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', filterId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating filter:', error);
      return { success: false, error: error.message };
    }
  }

  static async applyFilters(
    wali_id: string,
    content: string,
    context: {
      sender_id: string;
      recipient_id: string;
      message_count_last_hour: number;
      consecutive_messages: number;
      current_time: Date;
      is_known_contact: boolean;
    }
  ): Promise<FilterResult> {
    try {
      const filters = await this.getFilters(wali_id);
      const triggeredFilters: string[] = [];
      const actions: FilterAction[] = [];

      for (const filter of filters) {
        const result = this.evaluateFilter(filter, content, context);
        if (!result.passed) {
          triggeredFilters.push(filter.filter_name);
          actions.push(...result.actions);
        }
      }

      return {
        passed: triggeredFilters.length === 0,
        triggered_filters: triggeredFilters,
        actions: this.prioritizeActions(actions),
        message: this.generateFilterMessage(triggeredFilters),
      };
    } catch (error) {
      console.error('Error applying filters:', error);
      return {
        passed: true,
        triggered_filters: [],
        actions: [],
      };
    }
  }

  private static evaluateFilter(
    filter: WaliFilter,
    content: string,
    context: any
  ): { passed: boolean; actions: FilterAction[] } {
    const config = filter.filter_config;
    const actions: FilterAction[] = [];

    switch (filter.filter_type) {
      case 'content':
        return this.evaluateContentFilter(config, content, actions);

      case 'behavior':
        return this.evaluateBehaviorFilter(config, context, actions);

      case 'time':
        return this.evaluateTimeFilter(config, context.current_time, actions);

      case 'contact':
        return this.evaluateContactFilter(config, context, actions);

      default:
        return { passed: true, actions: [] };
    }
  }

  private static evaluateContentFilter(
    config: FilterConfig,
    content: string,
    actions: FilterAction[]
  ): { passed: boolean; actions: FilterAction[] } {
    const lowerContent = content.toLowerCase();

    // Check blocked words
    if (config.blocked_words) {
      for (const word of config.blocked_words) {
        if (lowerContent.includes(word.toLowerCase())) {
          actions.push({
            type: 'block',
            message: `Message bloqué: contient le mot interdit "${word}"`,
            severity: 'high',
          });
          return { passed: false, actions };
        }
      }
    }

    // Check blocked phrases
    if (config.blocked_phrases) {
      for (const phrase of config.blocked_phrases) {
        if (lowerContent.includes(phrase.toLowerCase())) {
          actions.push({
            type: 'block',
            message: `Message bloqué: contient la phrase interdite "${phrase}"`,
            severity: 'high',
          });
          return { passed: false, actions };
        }
      }
    }

    // Check required words
    if (config.required_words && config.required_words.length > 0) {
      const hasRequiredWord = config.required_words.some((word) =>
        lowerContent.includes(word.toLowerCase())
      );
      if (!hasRequiredWord) {
        actions.push({
          type: 'warn',
          message: 'Message ne contient pas les mots requis',
          severity: 'medium',
        });
        return { passed: false, actions };
      }
    }

    return { passed: true, actions: [] };
  }

  private static evaluateBehaviorFilter(
    config: FilterConfig,
    context: any,
    actions: FilterAction[]
  ): { passed: boolean; actions: FilterAction[] } {
    // Check message frequency
    if (
      config.max_messages_per_hour &&
      context.message_count_last_hour >= config.max_messages_per_hour
    ) {
      actions.push({
        type: 'block',
        message: `Trop de messages envoyés (${context.message_count_last_hour}/${config.max_messages_per_hour} par heure)`,
        severity: 'high',
      });
      return { passed: false, actions };
    }

    // Check consecutive messages
    if (
      config.max_consecutive_messages &&
      context.consecutive_messages >= config.max_consecutive_messages
    ) {
      actions.push({
        type: 'delay',
        message: `Trop de messages consécutifs, veuillez attendre une réponse`,
        severity: 'medium',
      });
      return { passed: false, actions };
    }

    return { passed: true, actions: [] };
  }

  private static evaluateTimeFilter(
    config: FilterConfig,
    currentTime: Date,
    actions: FilterAction[]
  ): { passed: boolean; actions: FilterAction[] } {
    const currentHour = currentTime.getHours();
    const currentDay = currentTime.toLocaleDateString('fr-FR', { weekday: 'long' });

    // Check allowed hours
    if (config.allowed_hours_start && config.allowed_hours_end) {
      const startParts = config.allowed_hours_start.split(':');
      const endParts = config.allowed_hours_end.split(':');
      const startHour = parseInt(startParts[0] || '0');
      const endHour = parseInt(endParts[0] || '23');

      if (currentHour < startHour || currentHour > endHour) {
        actions.push({
          type: 'block',
          message: `Messages non autorisés à cette heure (${config.allowed_hours_start} - ${config.allowed_hours_end})`,
          severity: 'medium',
        });
        return { passed: false, actions };
      }
    }

    // Check blocked days
    if (config.blocked_days && config.blocked_days.includes(currentDay)) {
      actions.push({
        type: 'block',
        message: `Messages non autorisés le ${currentDay}`,
        severity: 'medium',
      });
      return { passed: false, actions };
    }

    return { passed: true, actions: [] };
  }

  private static evaluateContactFilter(
    config: FilterConfig,
    context: any,
    actions: FilterAction[]
  ): { passed: boolean; actions: FilterAction[] } {
    // Check if wali approval is required
    if (config.require_wali_approval && !context.is_known_contact) {
      actions.push({
        type: 'require_approval',
        message: "Ce contact nécessite l'approbation du wali",
        severity: 'medium',
      });
      return { passed: false, actions };
    }

    return { passed: true, actions: [] };
  }

  private static prioritizeActions(actions: FilterAction[]): FilterAction[] {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return actions.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  }

  private static generateFilterMessage(triggeredFilters: string[]): string {
    if (triggeredFilters.length === 0) return '';
    if (triggeredFilters.length === 1) return `Filtre activé: ${triggeredFilters[0]}`;
    return `Filtres activés: ${triggeredFilters.join(', ')}`;
  }

  // Predefined filter templates
  static getFilterTemplates(): Partial<WaliFilter>[] {
    return [
      {
        filter_name: 'Langage Inapproprié',
        filter_type: 'content',
        filter_config: {
          blocked_words: ['inapproprié', 'vulgaire', 'offensant'],
          blocked_phrases: ['rencontrons en privé', 'sans supervision'],
        },
      },
      {
        filter_name: 'Fréquence de Messages',
        filter_type: 'behavior',
        filter_config: {
          max_messages_per_hour: 10,
          max_consecutive_messages: 3,
        },
      },
      {
        filter_name: 'Heures Appropriées',
        filter_type: 'time',
        filter_config: {
          allowed_hours_start: '08:00',
          allowed_hours_end: '22:00',
          blocked_days: ['vendredi'],
        },
      },
      {
        filter_name: 'Approbation Requise',
        filter_type: 'contact',
        filter_config: {
          require_wali_approval: true,
          auto_approve_known_contacts: true,
        },
      },
    ];
  }
}
