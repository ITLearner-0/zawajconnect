import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FamilyContribution {
  quote: string;
  author: string;
  relationship: string;
}

export interface FamilyContributionsData {
  contribution: FamilyContribution | undefined;
  criteria: string[];
}

export const useFamilyContributions = (userId: string | null) => {
  const [data, setData] = useState<FamilyContributionsData>({
    contribution: undefined,
    criteria: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
      try {
        const { data: contributions, error } = await (supabase as any)
          .from('family_profile_contributions')
          .select('*')
          .eq('profile_user_id', userId)
          .eq('is_approved_by_member', true)
          .eq('is_visible_publicly', true)
          .order('created_at', { ascending: false });

        if (error || !contributions || contributions.length === 0) {
          setLoading(false);
          return;
        }

        // Find the first character_description or values_statement for the quote
        const quoteEntry = contributions.find(
          (c: any) => c.section === 'character_description' || c.section === 'values_statement'
        );

        // Collect criteria from family_expectations
        const criteriaEntries = contributions.filter(
          (c: any) => c.section === 'family_expectations'
        );
        const criteria = criteriaEntries.map((c: any) => c.content).filter(Boolean);

        const ROLE_LABELS: Record<string, string> = {
          father: 'Le père',
          mother: 'La mère',
          brother: 'Le frère',
          sister: 'La sœur',
          uncle: "L'oncle",
          aunt: 'La tante',
          other: 'Un proche',
        };

        setData({
          contribution: quoteEntry
            ? {
                quote: quoteEntry.content,
                author: ROLE_LABELS[quoteEntry.contributor_role] || quoteEntry.contributor_role,
                relationship: quoteEntry.contributor_role,
              }
            : undefined,
          criteria,
        });
      } catch (err) {
        console.error('Error fetching family contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  return { familyData: data, loading };
};
