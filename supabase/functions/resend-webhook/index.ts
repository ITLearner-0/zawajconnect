import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

interface ResendWebhookEvent {
  type:
    | 'email.sent'
    | 'email.delivered'
    | 'email.delivery_delayed'
    | 'email.complained'
    | 'email.bounced'
    | 'email.opened'
    | 'email.clicked';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounced_at?: string;
    opened_at?: string;
    clicked_at?: string;
    delivered_at?: string;
    bounce?: {
      type: string;
      message: string;
    };
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

const verifyWebhookSignature = async (
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> => {
  try {
    // Resend utilise Svix pour les webhooks
    // Le format de vérification est: timestamp.payload
    const signedContent = `${timestamp}.${payload}`;

    // Encoder le secret et le contenu
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedContent);

    // Importer la clé pour HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Créer la signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);

    // Convertir en base64
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = btoa(String.fromCharCode(...signatureArray));

    // Comparer les signatures (Svix utilise plusieurs signatures séparées par des espaces)
    const signatures = signature.split(' ');
    return signatures.some((sig) => {
      // Format: v1,signature_base64
      const parts = sig.split(',');
      if (parts.length !== 2) return false;
      const signatureValue = parts[1];
      return signatureValue === expectedSignature;
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la signature:', error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('RESEND_WEBHOOK_SECRET not configured');
    }

    // Récupérer les headers de vérification Svix
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing Svix headers');
      return new Response(JSON.stringify({ error: 'Missing webhook verification headers' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Lire le body
    const body = await req.text();

    // Vérifier la signature
    const isValid = await verifyWebhookSignature(body, svixSignature, svixTimestamp, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parser l'événement
    const event: ResendWebhookEvent = JSON.parse(body);
    console.log(`📨 Webhook Resend reçu: ${event.type} pour email ${event.data.email_id}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Trouver l'email dans l'historique par resend_email_id
    const { data: emailRecord, error: findError } = await supabaseClient
      .from('wali_email_history')
      .select('*')
      .eq('resend_email_id', event.data.email_id)
      .single();

    if (findError || !emailRecord) {
      console.log(`⚠️ Email ${event.data.email_id} non trouvé dans l'historique`);
      // Ce n'est pas une erreur critique, peut-être un email non lié aux Walis
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email not tracked in wali_email_history',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour selon le type d'événement
    let updateData: any = {};

    switch (event.type) {
      case 'email.sent':
        updateData = {
          delivery_status: 'sent',
        };
        break;

      case 'email.delivered':
        updateData = {
          delivery_status: 'delivered',
          delivered_at: event.data.delivered_at || new Date().toISOString(),
        };
        break;

      case 'email.opened':
        updateData = {
          opened_at: event.data.opened_at || new Date().toISOString(),
        };
        // Ne pas changer le delivery_status si déjà delivered
        if (emailRecord.delivery_status === 'sent') {
          updateData.delivery_status = 'delivered';
        }
        break;

      case 'email.clicked':
        updateData = {
          clicked_at: event.data.clicked_at || new Date().toISOString(),
        };
        // Ne pas changer le delivery_status si déjà delivered
        if (emailRecord.delivery_status === 'sent') {
          updateData.delivery_status = 'delivered';
        }
        break;

      case 'email.bounced':
        updateData = {
          delivery_status: 'bounced',
          error_message: event.data.bounce
            ? `${event.data.bounce.type}: ${event.data.bounce.message}`
            : 'Email bounced',
        };
        break;

      case 'email.complained':
        // Marquer comme failed si spam complaint
        updateData = {
          delivery_status: 'failed',
          error_message: 'Spam complaint received',
        };
        break;

      case 'email.delivery_delayed':
        // Ne rien faire pour l'instant, garder le statut actuel
        console.log(`📬 Livraison retardée pour ${event.data.email_id}`);
        return new Response(JSON.stringify({ success: true, message: 'Delivery delayed noted' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        console.log(`⚠️ Type d'événement non géré: ${event.type}`);
        return new Response(JSON.stringify({ success: true, message: 'Event type not handled' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Mettre à jour l'enregistrement
    const { error: updateError } = await supabaseClient
      .from('wali_email_history')
      .update(updateData)
      .eq('id', emailRecord.id);

    if (updateError) {
      console.error('Erreur mise à jour email history:', updateError);
      throw updateError;
    }

    console.log(`✅ Email ${event.data.email_id} mis à jour: ${event.type}`);

    // Logger dans l'audit si c'est un bounce ou complaint
    if (event.type === 'email.bounced' || event.type === 'email.complained') {
      await supabaseClient.from('wali_action_audit').insert({
        wali_user_id: emailRecord.wali_user_id,
        action_type: event.type === 'email.bounced' ? 'email_bounced' : 'email_complaint',
        action_details: {
          email_id: event.data.email_id,
          event_type: event.type,
          bounce_info: event.data.bounce,
          original_subject: event.data.subject,
        },
        success: false,
        risk_level: 'low',
        suspicious_pattern: 'Email delivery issue',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_type: event.type,
        email_id: event.data.email_id,
        updated: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur webhook Resend:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
