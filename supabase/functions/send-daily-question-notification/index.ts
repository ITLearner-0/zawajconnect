import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyQuestionNotificationRequest {
  scheduled_date?: string; // Optional, defaults to today
  test_mode?: boolean; // If true, only sends to test users
  test_emails?: string[]; // Emails to send to in test mode
}

interface DailyQuestion {
  id: string;
  question_text: string;
  question_fr: string;
  category: string;
  subcategory: string;
  difficulty_level: string;
}

interface User {
  user_id: string;
  email: string;
  full_name: string;
  preferred_language: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let logId: string | null = null;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body (optional)
    const body: DailyQuestionNotificationRequest = req.method === 'POST'
      ? await req.json()
      : {};

    const scheduledDate = body.scheduled_date || new Date().toISOString().split('T')[0];
    const testMode = body.test_mode || false;
    const testEmails = body.test_emails || [];

    console.log('Sending daily question notification for date:', scheduledDate);
    console.log('Test mode:', testMode);

    // Start cron job log
    const { data: logData, error: logError } = await supabase.rpc('start_cron_job_log', {
      p_job_name: 'send-daily-question-notification',
      p_job_type: 'edge_function',
      p_metadata: { scheduled_date: scheduledDate, test_mode: testMode }
    });

    if (!logError && logData) {
      logId = logData;
      console.log('Cron job log started with ID:', logId);
    }

    // Get today's question from the schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('daily_question_schedule')
      .select(`
        id,
        scheduled_date,
        is_sent,
        question_id,
        daily_questions (
          id,
          question_text,
          question_fr,
          category,
          subcategory,
          difficulty_level
        )
      `)
      .eq('scheduled_date', scheduledDate)
      .single();

    if (scheduleError || !scheduleData) {
      console.error('No question scheduled for date:', scheduledDate);
      return new Response(
        JSON.stringify({
          error: 'No question scheduled for this date',
          date: scheduledDate,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const question = scheduleData.daily_questions as unknown as DailyQuestion;

    console.log('Found scheduled question:', {
      id: question.id,
      category: question.category,
      difficulty: question.difficulty_level,
    });

    // Get users to notify
    let users: User[] = [];

    if (testMode && testEmails.length > 0) {
      // Test mode: send only to specified emails
      console.log('Test mode: sending to specified emails only');
      users = testEmails.map((email, index) => ({
        user_id: `test-${index}`,
        email,
        full_name: 'Test User',
        preferred_language: 'fr',
      }));
    } else {
      // Production mode: get all eligible users
      const { data: usersData, error: usersError } = await supabase.rpc(
        'get_users_for_daily_notification'
      );

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error('Failed to fetch users for notification');
      }

      users = usersData || [];
    }

    console.log(`Found ${users.length} users to notify`);

    if (users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users to notify',
          users_notified: 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send emails to all users
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        const questionText =
          user.preferred_language === 'ar' || user.preferred_language === 'en'
            ? question.question_text
            : question.question_fr;

        const categoryEmoji = getCategoryEmoji(question.category);
        const difficultyColor = getDifficultyColor(question.difficulty_level);

        await sendEmail({
          to: user.email,
          subject: `${categoryEmoji} Question du Jour - ${scheduledDate}`,
          html: generateEmailHTML(
            user.full_name,
            questionText,
            question.category,
            question.subcategory,
            question.difficulty_level,
            categoryEmoji,
            difficultyColor
          ),
        });

        successCount++;
        console.log(`Email sent successfully to: ${user.email}`);
      } catch (error: any) {
        failureCount++;
        const errorMsg = `Failed to send to ${user.email}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Mark question as sent (only in production mode)
    if (!testMode) {
      const { error: updateError } = await supabase.rpc(
        'mark_daily_question_sent',
        { p_scheduled_date: scheduledDate }
      );

      if (updateError) {
        console.error('Failed to mark question as sent:', updateError);
      }
    }

    console.log(`Notification complete. Success: ${successCount}, Failures: ${failureCount}`);

    // Complete cron job log
    if (logId) {
      await supabase.rpc('complete_cron_job_log', {
        p_log_id: logId,
        p_status: failureCount > 0 ? 'error' : 'success',
        p_error_message: failureCount > 0 ? `${failureCount} failures out of ${users.length} users` : null,
        p_metadata: {
          users_notified: successCount,
          failures: failureCount,
          total_users: users.length,
          test_mode: testMode,
        }
      });
      console.log('Cron job log completed');
    }

    return new Response(
      JSON.stringify({
        success: true,
        users_notified: successCount,
        failures: failureCount,
        total_users: users.length,
        errors: errors.length > 0 ? errors : undefined,
        test_mode: testMode,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-daily-question-notification function:', error);

    // Complete cron job log with error
    if (logId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.rpc('complete_cron_job_log', {
            p_log_id: logId,
            p_status: 'error',
            p_error_message: error.message,
            p_error_stack: error.stack,
          });
          console.log('Cron job log completed with error');
        }
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

// Helper function to get emoji for category
function getCategoryEmoji(category: string): string {
  const emojiMap: { [key: string]: string } = {
    religion: '🕌',
    family: '👨‍👩‍👧‍👦',
    values: '💎',
    lifestyle: '🌟',
    goals: '🎯',
    relationships: '💝',
    personality: '🧠',
    finance: '💰',
    culture: '🌍',
    fun: '🎉',
  };
  return emojiMap[category.toLowerCase()] || '❓';
}

// Helper function to get color for difficulty
function getDifficultyColor(difficulty: string): string {
  const colorMap: { [key: string]: string } = {
    easy: '#10B981', // Green
    medium: '#F59E0B', // Orange
    deep: '#8B5CF6', // Purple
  };
  return colorMap[difficulty.toLowerCase()] || '#6366F1';
}

// Generate HTML email template
function generateEmailHTML(
  userName: string,
  questionText: string,
  category: string,
  subcategory: string,
  difficulty: string,
  emoji: string,
  difficultyColor: string
): string {
  const difficultyLabel =
    difficulty === 'easy'
      ? 'Facile'
      : difficulty === 'medium'
      ? 'Moyenne'
      : 'Profonde';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #F7FAFC;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">
            ${emoji} Question du Jour
          </h1>
          <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">
            ${category} • ${subcategory}
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; background: white;">
          <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Salam ${userName} ! 🌟
          </p>

          <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
            Voici votre question quotidienne pour réfléchir et mieux vous connaître :
          </p>

          <!-- Question Card -->
          <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(219, 39, 119, 0.08) 100%); padding: 30px; margin: 20px 0; border-radius: 12px; border-left: 4px solid ${difficultyColor};">
            <div style="margin-bottom: 15px;">
              <span style="display: inline-block; background: ${difficultyColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                ${difficultyLabel}
              </span>
            </div>
            <p style="color: #1A202C; font-size: 20px; line-height: 1.6; margin: 0; font-weight: 600;">
              ${questionText}
            </p>
          </div>

          <div style="background: #F7FAFC; padding: 25px; margin: 30px 0; border-radius: 8px; border: 1px solid #E2E8F0;">
            <p style="color: #2D3748; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">
              💡 Pourquoi répondre ?
            </p>
            <ul style="color: #4A5568; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Construisez votre profil émotionnel et spirituel</li>
              <li>Aidez les matchs à mieux vous comprendre</li>
              <li>Débloquez des badges de progression</li>
              <li>Découvrez les réponses de vos matchs compatibles</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/daily-question" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
              Répondre maintenant ✨
            </a>
          </div>

          <div style="background: rgba(124, 58, 237, 0.05); padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
            <p style="color: #2D3748; font-size: 14px; margin: 0; line-height: 1.6;">
              <strong>🔥 Maintenez votre série !</strong><br>
              <span style="color: #4A5568;">Répondez chaque jour pour débloquer des badges exclusifs</span>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="color: #718096; font-size: 13px; margin: 0 0 15px 0;">
            © 2025 Zawaj-Connect. Tous droits réservés.
          </p>
          <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
            Vous recevez cet email car vous êtes inscrit sur Zawaj-Connect.
          </p>
          <p style="color: #A0AEC0; font-size: 12px; margin: 10px 0 0 0;">
            <a href="#" style="color: #7C3AED; text-decoration: none;">Gérer mes préférences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
