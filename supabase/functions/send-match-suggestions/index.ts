import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchSuggestionsRequest {
  user_id: string;
  suggestions: Array<{
    name: string;
    age: number;
    location: string;
    compatibility_score: number;
    profile_id: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, suggestions }: MatchSuggestionsRequest = await req.json();

    console.log('Sending match suggestions to user:', user_id);

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

    const suggestionsHtml = suggestions
      .slice(0, 3)
      .map(
        (suggestion, index) => `
      <div style="background: white; padding: 25px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div>
            <h3 style="color: #2D3748; margin: 0 0 5px 0; font-size: 18px; font-weight: 600;">
              Profil ${index + 1}
            </h3>
            <p style="color: #718096; margin: 0; font-size: 14px;">
              ${suggestion.age} ans · ${suggestion.location}
            </p>
          </div>
          <div style="background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
            ${suggestion.compatibility_score}% compatible
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%); padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="color: #4A5568; margin: 0; font-size: 14px; line-height: 1.5;">
            Ce profil correspond à vos préférences et partage vos valeurs islamiques.
          </p>
        </div>
        
        <a href="https://dgfctwtivkqcfhwqgkya.supabase.co/profile/${suggestion.profile_id}" style="display: inline-block; color: #7C3AED; text-decoration: none; font-weight: 600; font-size: 14px;">
          Voir le profil →
        </a>
      </div>
    `
      )
      .join('');

    await sendEmail({
      to: userEmail,
      subject: `💝 ${suggestions.length} nouveaux profils compatibles vous attendent !`,
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
                💝 Nouvelles suggestions
              </h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">
                ${suggestions.length} profils compatibles pour vous
              </p>
            </div>

            <!-- Contenu -->
            <div style="padding: 40px 30px; background: #F7FAFC;">
              <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                As-salamu alaykum ${userName} ! 🌟
              </p>

              <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                Nous avons trouvé <strong style="color: #7C3AED;">${suggestions.length} nouveaux profils</strong> qui correspondent à vos critères et partagent vos valeurs.
              </p>

              <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%); padding: 20px; margin: 25px 0; border-radius: 8px; text-align: center;">
                <p style="color: #2D3748; font-size: 15px; margin: 0; font-weight: 600;">
                  ⚡ Les profils populaires partent vite !
                </p>
                <p style="color: #4A5568; font-size: 14px; margin: 5px 0 0 0;">
                  Ne manquez pas ces opportunités
                </p>
              </div>

              ${suggestionsHtml}

              ${
                suggestions.length > 3
                  ? `
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #E2E8F0;">
                <p style="color: #4A5568; font-size: 15px; margin: 0 0 10px 0;">
                  <strong style="color: #7C3AED;">+${suggestions.length - 3} autres profils</strong> vous attendent
                </p>
                <a href="https://dgfctwtivkqcfhwqgkya.supabase.co/matches" style="color: #7C3AED; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Voir tous les profils →
                </a>
              </div>
              `
                  : ''
              }

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://dgfctwtivkqcfhwqgkya.supabase.co/matches" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Découvrir les profils
                </a>
              </div>

              <div style="background: white; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #7C3AED;">
                <p style="color: #2D3748; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">
                  💡 Conseil du jour
                </p>
                <p style="color: #4A5568; font-size: 14px; margin: 0; line-height: 1.5;">
                  Prenez le temps de lire attentivement les profils et posez des questions pertinentes pour mieux connaître la personne.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: white; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                © 2025 Zawaj-Connect. Tous droits réservés.
              </p>
              <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
                Ces suggestions sont basées sur vos préférences et votre profil.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Match suggestions sent successfully to:', userEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-match-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
