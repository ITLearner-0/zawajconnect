import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterRequest {
  user_id: string;
  edition_number: number;
  featured_articles: Array<{
    title: string;
    content: string;
    link: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, edition_number, featured_articles }: NewsletterRequest = await req.json();

    console.log('Sending newsletter to user:', user_id);

    // Get user email from Supabase
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

    // Build articles HTML
    const articlesHtml = featured_articles
      .map(
        (article) => `
      <div style="background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #7C3AED;">
        <h3 style="color: #2D3748; margin: 0 0 10px 0; font-size: 18px;">${article.title}</h3>
        <p style="color: #4A5568; margin: 0 0 15px 0; line-height: 1.6;">${article.content}</p>
        <a href="${article.link}" style="color: #7C3AED; text-decoration: none; font-weight: 600;">Lire la suite →</a>
      </div>
    `
      )
      .join('');

    await sendEmail({
      to: userEmail,
      subject: `📰 Newsletter #${edition_number} - Zawaj-Connect`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header avec gradient -->
            <div style="background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                📰 Newsletter Zawaj-Connect
              </h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">
                Édition #${edition_number}
              </p>
            </div>

            <!-- Contenu principal -->
            <div style="padding: 40px 30px;">
              <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                As-salamu alaykum ${userName} ! 👋
              </p>

              <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                Découvrez les dernières nouveautés et conseils pour votre recherche du bon conjoint.
              </p>

              <h2 style="color: #2D3748; font-size: 22px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #E2E8F0;">
                ✨ À la une ce mois-ci
              </h2>

              ${articlesHtml}

              <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%); padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <p style="color: #2D3748; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                  💡 Conseil du mois
                </p>
                <p style="color: #4A5568; font-size: 14px; margin: 0; line-height: 1.6;">
                  "La patience et la sincérité sont les clés d'une recherche réussie. Restez authentique et ayez confiance en Allah."
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://dgfctwtivkqcfhwqgkya.supabase.co/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Accéder à mon compte
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
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

    console.log('Newsletter sent successfully to:', userEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-newsletter function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
