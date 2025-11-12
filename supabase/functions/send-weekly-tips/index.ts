import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeeklyTipsRequest {
  user_id: string;
  week_number: number;
  tips: Array<{
    title: string;
    content: string;
    icon: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, week_number, tips }: WeeklyTipsRequest = await req.json();

    console.log('Sending weekly tips to user:', user_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${user_id}&select=full_name`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const profiles = await profileResponse.json();
    const userName = profiles[0]?.full_name || 'Cher membre';

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      throw new Error('User email not found');
    }

    const tipsHtml = tips
      .map(
        (tip) => `
      <div style="background: white; padding: 25px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 28px; margin-right: 12px;">${tip.icon}</span>
          <h3 style="color: #2D3748; margin: 0; font-size: 18px; font-weight: 600;">${tip.title}</h3>
        </div>
        <p style="color: #4A5568; margin: 0; line-height: 1.6; font-size: 15px;">${tip.content}</p>
      </div>
    `
      )
      .join('');

    await sendEmail({
      to: userEmail,
      subject: `💡 Conseils de la semaine #${week_number} - Zawaj-Connect`,
      html: `
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
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                💡 Conseils de la semaine
              </h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">
                Semaine #${week_number}
              </p>
            </div>

            <!-- Contenu -->
            <div style="padding: 40px 30px; background: #F7FAFC;">
              <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Salam ${userName} ! 🌟
              </p>

              <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                Voici vos conseils personnalisés pour cette semaine afin de vous accompagner dans votre recherche.
              </p>

              ${tipsHtml}

              <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%); padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <p style="color: #2D3748; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                  🤲 Citation de la semaine
                </p>
                <p style="color: #4A5568; font-size: 14px; margin: 0; line-height: 1.6; font-style: italic;">
                  "Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles" - Sourate Ar-Rum (30:21)
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://dgfctwtivkqcfhwqgkya.supabase.co/guidance" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Plus de conseils
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: white; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                © 2025 Zawaj-Connect. Tous droits réservés.
              </p>
              <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
                Vous recevez cet email car vous êtes inscrit sur Zawaj-Connect.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Weekly tips sent successfully to:', userEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-weekly-tips function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
