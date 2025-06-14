
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompatibilityRequest {
  userId: string;
  targetUserIds?: string[];
  batchSize?: number;
}

interface CalculationResult {
  userId: string;
  targetUserId: string;
  score: number;
  categoryScores: Record<string, { score: number; weight: number }>;
  strengths: string[];
  differences: string[];
  dealbreakers?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the session to verify authentication
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { userId, targetUserIds, batchSize = 10 }: CompatibilityRequest = await req.json();

    // Verify the user is calculating for themselves
    if (session.user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to calculate for this user' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Starting compatibility calculation for user: ${userId}`);

    // Fetch user's compatibility results
    const { data: userResults, error: userError } = await supabaseClient
      .from('compatibility_results')
      .select('answers, preferences')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (userError || !userResults) {
      return new Response(
        JSON.stringify({ error: 'User compatibility results not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch target users or all other users if not specified
    let query = supabaseClient
      .from('compatibility_results')
      .select('user_id, answers, preferences')
      .neq('user_id', userId);

    if (targetUserIds && targetUserIds.length > 0) {
      query = query.in('user_id', targetUserIds);
    }

    const { data: otherUsers, error: othersError } = await query.limit(batchSize);

    if (othersError) {
      console.error('Error fetching other users:', othersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch other users' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const results: CalculationResult[] = [];

    // Calculate compatibility for each user
    for (const otherUser of otherUsers || []) {
      try {
        const result = calculateCompatibilityScore(
          userResults.answers,
          userResults.preferences,
          otherUser.answers,
          otherUser.preferences,
          userId,
          otherUser.user_id
        );
        results.push(result);
      } catch (error) {
        console.error(`Error calculating compatibility with user ${otherUser.user_id}:`, error);
      }
    }

    console.log(`Completed compatibility calculation for ${results.length} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        processed: results.length,
        userId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in calculate-compatibility function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateCompatibilityScore(
  myAnswers: any,
  myPreferences: any,
  otherAnswers: any,
  otherPreferences: any,
  myUserId: string,
  otherUserId: string
): CalculationResult {
  let totalCompatibility = 0;
  let totalWeight = 0;
  let categoryScores: Record<string, { score: number; weight: number }> = {};
  let strengths: string[] = [];
  let differences: string[] = [];
  let dealbreakers: string[] = [];

  // Category mapping for Islamic compatibility
  const categoryMap: Record<string, string[]> = {
    'Religious Practice': ['1', '2', '3'],
    'Family Values': ['4', '5', '6'],
    'Lifestyle': ['7', '8', '9'],
    'Education & Career': ['10', '11', '12'],
    'Personal Values': ['13', '14', '15']
  };

  // Calculate category-based compatibility
  for (const [categoryName, questions] of Object.entries(categoryMap)) {
    let categoryScore = 0;
    let categoryWeight = 0;
    
    for (const questionId of questions) {
      const myAnswer = myAnswers[questionId];
      const theirAnswer = otherAnswers[questionId];
      
      if (myAnswer && theirAnswer) {
        const rawDifference = Math.abs(myAnswer.value - theirAnswer.value);
        const compatibility = Math.max(0, 100 - rawDifference);
        const weight = myAnswer.weight || 1;
        
        categoryScore += compatibility * weight;
        categoryWeight += weight;
        
        // Check for dealbreakers
        if (myAnswer.isBreaker && myAnswer.breakerThreshold && theirAnswer.value < myAnswer.breakerThreshold) {
          dealbreakers.push(`Incompatible ${categoryName} values`);
        }
        
        // Identify strengths and differences
        if (compatibility >= 80) {
          strengths.push(`Strong alignment in ${categoryName}`);
        } else if (compatibility < 40) {
          differences.push(`Different perspectives on ${categoryName}`);
        }
      }
    }
    
    if (categoryWeight > 0) {
      const normalizedCategoryScore = (categoryScore / categoryWeight);
      categoryScores[categoryName] = { score: normalizedCategoryScore, weight: categoryWeight };
      totalCompatibility += normalizedCategoryScore * categoryWeight;
      totalWeight += categoryWeight;
    }
  }

  // Calculate final score
  let finalScore = totalWeight > 0 ? (totalCompatibility / totalWeight) : 0;
  
  // Apply Islamic priority bonuses
  const criticalCategories = ['Religious Practice', 'Family Values'];
  let categoryBonus = 0;
  
  criticalCategories.forEach(category => {
    if (categoryScores[category]) {
      const categoryPercentage = categoryScores[category].score;
      if (categoryPercentage >= 90) categoryBonus += 5;
      else if (categoryPercentage >= 80) categoryBonus += 2;
    }
  });
  
  finalScore = Math.min(100, finalScore + categoryBonus);
  
  // Apply dealbreaker penalty
  if (dealbreakers.length > 0) {
    finalScore = Math.max(0, finalScore - 25);
  }

  return {
    userId: myUserId,
    targetUserId: otherUserId,
    score: Math.round(finalScore),
    categoryScores,
    strengths: [...new Set(strengths)],
    differences: [...new Set(differences)],
    dealbreakers: dealbreakers.length > 0 ? [...new Set(dealbreakers)] : undefined
  };
}
