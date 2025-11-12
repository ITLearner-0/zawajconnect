import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyAdminRequest {
  alert_id: string;
  wali_user_id: string;
  alert_type: string;
  risk_level: string;
  pattern_detected: string;
  details: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error('Authentication failed');

    const {
      alert_id,
      wali_user_id,
      alert_type,
      risk_level,
      pattern_detected,
      details,
    }: NotifyAdminRequest = await req.json();

    console.log(`🚨 Alerte admin créée: ${alert_type} pour Wali ${wali_user_id}`);

    // Récupérer les infos du Wali
    const { data: waliProfile } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', wali_user_id)
      .single();

    const waliName = waliProfile
      ? `${waliProfile.first_name} ${waliProfile.last_name}`
      : 'Wali inconnu';

    // Récupérer tous les admins
    const { data: admins } = await supabaseClient
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'admin');

    console.log(`📧 ${admins?.length || 0} admins à notifier`);

    // Créer des notifications pour chaque admin
    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        title: `⚠️ Alerte Sécurité: ${alert_type}`,
        message: `Comportement suspect détecté pour ${waliName}: ${pattern_detected}`,
        type: 'security_alert',
        metadata: {
          alert_id,
          wali_user_id,
          risk_level,
          alert_type,
          pattern_detected,
          details,
        },
      }));

      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Erreur création notifications:', notifError);
      } else {
        console.log(`✅ ${notifications.length} notifications créées`);
      }
    }

    // Marquer l'alerte comme notifiée
    await supabaseClient
      .from('wali_admin_alerts')
      .update({ admin_notified: true, admin_notified_at: new Date().toISOString() })
      .eq('id', alert_id);

    // Logger l'action
    await supabaseClient.from('wali_action_audit').insert({
      wali_user_id,
      action_type: 'admin_alert_sent',
      action_details: {
        alert_id,
        alert_type,
        risk_level,
        pattern_detected,
        admins_notified: admins?.length || 0,
      },
      success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        admins_notified: admins?.length || 0,
        alert_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Erreur fonction notify-admin-alert:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
