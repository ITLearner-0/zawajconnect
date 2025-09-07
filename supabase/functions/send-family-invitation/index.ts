import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FamilyInvitationRequest {
  fullName: string;
  email: string;
  relationship: string;
  isWali: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { fullName, email, relationship, isWali }: FamilyInvitationRequest = await req.json();

    // Create family invitation
    const { data: invitationToken, error: invitationError } = await supabase
      .rpc('create_family_invitation', {
        p_user_id: user.id,
        p_full_name: fullName,
        p_email: email,
        p_relationship: relationship,
        p_is_wali: isWali
      });

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    // Get user profile for invitation email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const inviterName = profile?.full_name || 'Un membre de famille';
    const invitationUrl = `${supabaseUrl.replace('supabase.co', 'lovable.app')}/auth?invitation=${invitationToken}`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "NikahConnect <onboarding@resend.dev>",
      to: [email],
      subject: "Invitation à superviser sur NikahConnect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">🕌 Invitation à NikahConnect</h2>
          
          <p>Assalamu Alaikum ${fullName},</p>
          
          <p>${inviterName} vous invite à devenir ${isWali ? 'tuteur (Wali)' : 'membre de famille'} sur NikahConnect pour superviser leurs interactions selon les principes islamiques.</p>
          
          <div style="background-color: #f0f9f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Votre rôle :</strong> ${relationship}</p>
            ${isWali ? '<p><strong>✅ Vous aurez le statut de Wali (tuteur)</strong></p>' : ''}
            <p>Vous pourrez :</p>
            <ul>
              <li>📋 Superviser les conversations</li>
              <li>👁️ Consulter les profils des correspondants</li>
              <li>🛡️ Recevoir des alertes de modération</li>
              <li>💬 Participer aux discussions si nécessaire</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Accepter l'invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Cette invitation expire dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            NikahConnect - Plateforme de rencontres islamiques avec supervision familiale
          </p>
        </div>
      `,
    });

    console.log("Family invitation sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      invitationToken,
      message: "Invitation envoyée avec succès" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-family-invitation function:", error);
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