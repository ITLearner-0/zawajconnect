import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileReminderRequest {
  user_id: string;
  missing_fields: string[];
  completion_percentage: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, missing_fields, completion_percentage }: ProfileReminderRequest = await req.json();

    console.log("Sending profile completion reminder to user:", user_id);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${user_id}&select=full_name`,
      {
        headers: {
          "apikey": supabaseKey!,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const profiles = await profileResponse.json();
    const userName = profiles[0]?.full_name || "Cher membre";

    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${user_id}`,
      {
        headers: {
          "apikey": supabaseKey!,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const userData = await userResponse.json();
    const userEmail = userData.email;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    const fieldLabels: Record<string, string> = {
      bio: "Biographie",
      avatar_url: "Photo de profil",
      education: "Niveau d'éducation",
      profession: "Profession",
      interests: "Centres d'intérêt",
      location: "Localisation",
      prayer_frequency: "Fréquence de prière",
      quran_reading: "Lecture du Coran",
      madhab: "Madhab"
    };

    const missingFieldsHtml = missing_fields.map(field => `
      <li style="color: #4A5568; padding: 8px 0; font-size: 15px;">
        <span style="color: #7C3AED; font-weight: 600;">→</span> ${fieldLabels[field] || field}
      </li>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Mariage-Halal <profil@mariage-halal.com>",
      to: [userEmail],
      subject: "✨ Complétez votre profil pour plus de matchs !",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                ✨ Complétez votre profil
              </h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0 0; font-size: 16px;">
                Augmentez vos chances de trouver le bon match
              </p>
            </div>

            <!-- Contenu -->
            <div style="padding: 40px 30px;">
              <p style="color: #2D3748; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Bonjour ${userName},
              </p>

              <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                Votre profil est actuellement complété à <strong style="color: #7C3AED;">${completion_percentage}%</strong>. 
                Un profil complet attire jusqu'à <strong>3 fois plus</strong> de matchs compatibles !
              </p>

              <!-- Barre de progression -->
              <div style="background: #E2E8F0; height: 12px; border-radius: 6px; margin: 25px 0; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #7C3AED 0%, #DB2777 100%); height: 100%; width: ${completion_percentage}%; transition: width 0.3s ease;"></div>
              </div>

              <div style="background: #F7FAFC; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #7C3AED;">
                <h3 style="color: #2D3748; margin: 0 0 15px 0; font-size: 18px;">
                  📝 Champs à compléter :
                </h3>
                <ul style="margin: 0; padding: 0; list-style: none;">
                  ${missingFieldsHtml}
                </ul>
              </div>

              <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%); padding: 25px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #2D3748; font-size: 15px; margin: 0; line-height: 1.6; text-align: center;">
                  <strong style="color: #7C3AED;">💡 Astuce :</strong> Les profils avec une photo attirent 5 fois plus d'attention !
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mariage-halal.com/profile" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #DB2777 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Compléter mon profil
                </a>
              </div>

              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
                Un profil complet et sincère est la clé pour trouver une personne qui vous correspond vraiment.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                © 2025 Mariage-Halal. Tous droits réservés.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Profile reminder sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-profile-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
