import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationApprovedRequest {
  user_id: string;
  verification_type: 'email' | 'phone' | 'id';
  verification_score: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, verification_type, verification_score }: VerificationApprovedRequest = await req.json();

    // Get user email and profile
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData.user) {
      throw new Error("User not found");
    }

    const userEmail = userData.user.email;
    if (!userEmail) {
      throw new Error("User email not found");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user_id)
      .maybeSingle();

    const userName = profile?.full_name || "Cher(e) membre";

    // Verification type labels
    const verificationLabels: Record<string, string> = {
      email: "Email",
      phone: "Téléphone",
      id: "Document d'identité"
    };

    const verificationLabel = verificationLabels[verification_type] || verification_type;

    // Benefits based on verification type
    const benefits = verification_type === 'id' 
      ? [
          "✅ Accès à toutes les fonctionnalités premium",
          "✅ Profil marqué comme vérifié avec badge",
          "✅ Priorité dans les suggestions de profils",
          "✅ Accès illimité aux conversations",
          "✅ Possibilité d'inviter des membres de famille"
        ]
      : [
          "✅ Accès amélioré aux profils",
          "✅ Meilleure visibilité dans les recherches",
          "✅ Confiance accrue des autres membres"
        ];

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .verification-badge {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              color: white;
              font-size: 24px;
              font-weight: bold;
              box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
            }
            .score-display {
              background: #f0fdf4;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #059669;
              text-align: center;
              margin: 20px 0;
            }
            .benefits-list {
              background: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .benefits-list ul {
              margin: 10px 0;
              padding-left: 0;
              list-style: none;
            }
            .benefits-list li {
              padding: 8px 0;
              font-size: 16px;
              line-height: 1.8;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              border-radius: 0 0 10px 10px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #059669;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 18px;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">🎉 Félicitations !</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Votre vérification est approuvée</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Assalamu alaykum ${userName},</p>
            
            <div class="verification-badge">
              ✅ ${verificationLabel} Vérifié${verification_type === 'id' ? '(e)' : ''}
            </div>
            
            <p style="font-size: 16px;">
              Excellente nouvelle ! Votre <strong>${verificationLabel.toLowerCase()}</strong> a été vérifié${verification_type === 'email' ? '' : '(e)'} avec succès. 
              Votre profil bénéficie maintenant d'une crédibilité accrue auprès des autres membres.
            </p>
            
            <div class="score-display">
              <h3 style="margin: 0 0 10px 0; color: #059669;">Score de vérification</h3>
              <p style="margin: 0; font-size: 36px; font-weight: bold; color: #059669;">
                ${verification_score}/100
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
                ${verification_score >= 85 ? '🏆 Profil hautement vérifié' : 
                  verification_score >= 60 ? '⭐ Profil vérifié' : 
                  '📈 En cours de vérification'}
              </p>
            </div>
            
            <div class="divider"></div>
            
            <div class="benefits-list">
              <h3 style="margin: 0 0 15px 0; color: #92400e;">🎁 Avantages débloqués :</h3>
              <ul>
                ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
            
            ${verification_type !== 'id' ? `
              <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>💡 Conseil :</strong> Complétez la vérification de votre identité pour débloquer tous les avantages 
                  et atteindre un score de 100/100.
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}" class="button">
                Accéder à mon profil
              </a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6b7280;">
              <strong>Prochaines étapes :</strong><br>
              1. Complétez votre profil à 100%<br>
              2. ${verification_type === 'id' ? 'Commencez à parcourir les profils compatibles' : 'Vérifiez votre identité pour plus d\'avantages'}<br>
              3. Invitez un Wali pour une supervision familiale (optionnel)
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              Qu'Allah facilite votre recherche d'un mariage béni 🤲
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Cet email a été envoyé automatiquement suite à la validation de votre vérification
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: userEmail,
      subject: `🎉 ${verificationLabel} vérifié${verification_type === 'email' ? '' : '(e)'} avec succès !`,
      html: emailHtml,
    });

    console.log("Verification approved email sent successfully to:", userEmail);

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending verification approved email:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
