import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  registrationIds: string[];
  subject: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { registrationIds, subject, message }: NotificationRequest = await req.json();

    if (!registrationIds || registrationIds.length === 0) {
      throw new Error('No registration IDs provided');
    }

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch registration details
    const { data: registrations, error: fetchError } = await supabase
      .from('wali_registrations')
      .select('id, full_name, email')
      .in('id', registrationIds);

    if (fetchError) throw fetchError;

    // Send emails
    const emailPromises = registrations.map(async (reg) => {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Mariage Halal <noreply@mariage-halal.com>',
            to: [reg.email],
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Bonjour ${reg.full_name},</h2>
                <div style="margin: 20px 0; line-height: 1.6;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                  Ceci est un message automatique de l'équipe d'administration Wali de Mariage Halal.
                </p>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          console.error(`Failed to send email to ${reg.email}:`, error);
          return { id: reg.id, success: false, error };
        }

        return { id: reg.id, success: true };
      } catch (error) {
        console.error(`Error sending email to ${reg.email}:`, error);
        return { id: reg.id, success: false, error: String(error) };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: registrations.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-bulk-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
