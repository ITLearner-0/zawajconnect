import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const today = new Date().toISOString().split('T')[0];

    // Get or create user_levels record
    const { data: userLevel, error: levelError } = await supabaseClient
      .from('user_levels')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (levelError && levelError.code !== 'PGRST116') {
      throw levelError;
    }

    if (!userLevel) {
      // Create initial record
      const { data: newLevel, error: createError } = await supabaseClient
        .from('user_levels')
        .insert({
          user_id: user.id,
          current_level: 'bronze',
          total_xp: 0,
          level_progress: 0,
          current_streak: 1,
          longest_streak: 1,
          last_login_date: today,
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({
          success: true,
          streak: 1,
          isNewStreak: true,
          message: 'Login streak started!',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lastLoginDate = userLevel.last_login_date;
    const currentStreak = userLevel.current_streak || 0;
    const longestStreak = userLevel.longest_streak || 0;

    // Check if already logged in today
    if (lastLoginDate === today) {
      return new Response(
        JSON.stringify({
          success: true,
          streak: currentStreak,
          alreadyLoggedToday: true,
          message: 'Already logged in today',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new streak
    const lastLoginDateObj = new Date(lastLoginDate);
    const todayObj = new Date(today);
    const daysDiff = Math.floor(
      (todayObj.getTime() - lastLoginDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = currentStreak;
    let streakBroken = false;

    if (daysDiff === 1) {
      // Consecutive day
      newStreak = currentStreak + 1;
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
      streakBroken = true;
    }

    const newLongestStreak = Math.max(longestStreak, newStreak);

    // Update user_levels
    const { error: updateError } = await supabaseClient
      .from('user_levels')
      .update({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_login_date: today,
      })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Award streak badges
    const badgesToAward = [];
    if (newStreak === 7) badgesToAward.push('streak_7');
    if (newStreak === 30) badgesToAward.push('streak_30');
    if (newStreak === 100) badgesToAward.push('streak_100');
    if (newStreak === 365) badgesToAward.push('streak_365');

    for (const badgeId of badgesToAward) {
      try {
        await supabaseClient.functions.invoke('award-badge', {
          body: { badge_id: badgeId, progress_value: newStreak },
        });
      } catch (error) {
        console.error(`Failed to award badge ${badgeId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        streak: newStreak,
        longestStreak: newLongestStreak,
        streakBroken,
        badgesAwarded: badgesToAward,
        message: streakBroken ? 'Streak reset to 1' : `Login streak: ${newStreak} days!`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-daily-login:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
