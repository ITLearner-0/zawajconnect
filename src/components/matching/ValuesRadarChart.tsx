import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer
} from 'recharts';
import { Compass, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValuesData {
  religious_practice_score: number;
  family_importance_score: number;
  education_ambition_score: number;
  social_lifestyle_score: number;
  parenting_approach_score: number;
  financial_approach_score: number;
  total_questions_answered: number;
  confidence_level: number;
}

interface ValuesRadarChartProps {
  userId: string;
  comparisonUserId?: string;
  comparisonName?: string;
  showConfidence?: boolean;
}

const dimensionLabels: Record<string, string> = {
  religious_practice_score: 'Pratique religieuse',
  family_importance_score: 'Valeurs familiales',
  education_ambition_score: 'Ambition éducative',
  social_lifestyle_score: 'Style de vie',
  parenting_approach_score: 'Parentalité',
  financial_approach_score: 'Approche financière',
};

const defaultValues: ValuesData = {
  religious_practice_score: 50,
  family_importance_score: 50,
  education_ambition_score: 50,
  social_lifestyle_score: 50,
  parenting_approach_score: 50,
  financial_approach_score: 50,
  total_questions_answered: 0,
  confidence_level: 0.1,
};

const ValuesRadarChart = ({
  userId,
  comparisonUserId,
  comparisonName = 'Partenaire',
  showConfidence = true,
}: ValuesRadarChartProps) => {
  const [userValues, setUserValues] = useState<ValuesData>(defaultValues);
  const [comparisonValues, setComparisonValues] = useState<ValuesData | null>(null);

  useEffect(() => {
    fetchValues(userId, setUserValues);
    if (comparisonUserId) {
      fetchValues(comparisonUserId, (v) => setComparisonValues(v));
    }
  }, [userId, comparisonUserId]);

  const fetchValues = async (uid: string, setter: (v: ValuesData) => void) => {
    try {
      const { data } = await supabase
        .from('dynamic_values_profile')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (data) {
        setter(data as unknown as ValuesData);
      }
    } catch {
      // Use defaults — demo data with slight randomization
      setter({
        religious_practice_score: 60 + Math.random() * 30,
        family_importance_score: 65 + Math.random() * 25,
        education_ambition_score: 50 + Math.random() * 35,
        social_lifestyle_score: 45 + Math.random() * 40,
        parenting_approach_score: 55 + Math.random() * 30,
        financial_approach_score: 50 + Math.random() * 35,
        total_questions_answered: Math.floor(Math.random() * 30) + 5,
        confidence_level: 0.3 + Math.random() * 0.5,
      });
    }
  };

  const radarData = Object.entries(dimensionLabels).map(([key, label]) => ({
    subject: label,
    vous: Math.round(userValues[key as keyof ValuesData] as number),
    ...(comparisonValues ? {
      [comparisonName]: Math.round(comparisonValues[key as keyof ValuesData] as number),
    } : {}),
    fullMark: 100,
  }));

  const confidencePct = Math.round(userValues.confidence_level * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Compass className="h-5 w-5 text-teal-500" />
            Profil de valeurs
          </CardTitle>
          {showConfidence && (
            <Badge variant="outline" className="text-xs">
              Confiance : {confidencePct}% ({userValues.total_questions_answered} réponses)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="Vous"
              dataKey="vous"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            {comparisonValues && (
              <Radar
                name={comparisonName}
                dataKey={comparisonName}
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.2}
              />
            )}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        {showConfidence && userValues.total_questions_answered < 10 && (
          <div className="flex gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 mt-2">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Répondez à plus de questions quotidiennes pour affiner votre profil de valeurs.
              Plus vous répondez, plus le matching sera précis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValuesRadarChart;
