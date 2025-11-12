import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { generateSignedTrackingUrl } from './tracking-security.ts';

interface ABTestVariant {
  ab_test_id: string;
  variant_name: string;
  subject_line: string;
  offer_percentage: number;
  promo_code: string;
  email_tone: string;
  cta_text: string;
}

interface EmailData {
  userName: string;
  expirationDate: Date;
  planType: string;
  daysUntilExpiry: number;
  subscriptionId: string;
  userId: string;
}

export async function selectABVariant(
  supabaseAdmin: any,
  reminderType: '7days' | '3days' | '1day'
): Promise<ABTestVariant | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc('select_ab_test_variant', {
      p_reminder_type: reminderType
    });

    if (error) {
      console.error('Error selecting A/B variant:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to select A/B variant:', error);
    return null;
  }
}

export async function trackEmailSent(
  supabaseAdmin: any,
  abTestId: string,
  emailData: EmailData
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_ab_test_results')
      .insert({
        ab_test_id: abTestId,
        user_id: emailData.userId,
        subscription_id: emailData.subscriptionId,
        days_until_expiry: emailData.daysUntilExpiry,
        sent_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error tracking email sent:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Failed to track email:', error);
    return null;
  }
}

export async function generateEmailHTML(
  variant: ABTestVariant,
  emailData: EmailData,
  trackingId: string
): Promise<string> {
  const { userName, expirationDate, planType, daysUntilExpiry } = emailData;
  const { offer_percentage, promo_code, email_tone, cta_text } = variant;

  // Generate signed tracking URLs with HMAC
  const baseUrl = 'https://dgfctwtivkqcfhwqgkya.supabase.co/functions/v1/track-email-event';
  const trackingPixelUrl = await generateSignedTrackingUrl(baseUrl, trackingId, emailData.userId, 'opened');
  
  // Pixel de tracking pour les ouvertures d'email avec signature HMAC
  const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

  // URL avec tracking des clics (le tracking ID sera validé côté serveur lors du POST)
  const ctaUrl = `https://mariage-halal.com/settings?renew=true&code=${promo_code}&urgent=${daysUntilExpiry === 7 ? '7days' : daysUntilExpiry === 3 ? '3days' : 'lastday'}&track=${trackingId}`;

  const urgencyColors = {
    friendly: { primary: '#f59e0b', secondary: '#d97706' },
    urgent: { primary: '#f97316', secondary: '#ea580c' },
    professional: { primary: '#3b82f6', secondary: '#2563eb' },
    dramatic: { primary: '#dc2626', secondary: '#991b1b' }
  };

  const colors = urgencyColors[email_tone as keyof typeof urgencyColors] || urgencyColors.friendly;

  const countdownDisplay = daysUntilExpiry === 7 
    ? '<div class="countdown-number">7</div><div class="countdown-label">Jours</div>'
    : daysUntilExpiry === 3
    ? '<div class="countdown-number">3</div><div class="countdown-label">Jours</div><div class="countdown-item"><div class="countdown-number">72</div><div class="countdown-label">Heures</div></div>'
    : '<div class="countdown-number">1</div><div class="countdown-label">Jour</div><div class="countdown-item"><div class="countdown-number">24</div><div class="countdown-label">Heures</div></div>';

  const urgencyMessage = email_tone === 'dramatic' 
    ? '🔴 ALERTE MAXIMALE 🔴'
    : email_tone === 'urgent'
    ? '⚠️ ACTION REQUISE ⚠️'
    : email_tone === 'professional'
    ? '📋 Rappel Important'
    : '⏰ Notification';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .urgency-banner {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            animation: ${email_tone === 'dramatic' ? 'shake 0.5s infinite' : 'pulse 2s infinite'};
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .countdown {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
          }
          .countdown-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 3px solid ${colors.primary};
          }
          .countdown-number {
            font-size: 48px;
            font-weight: bold;
            color: ${colors.primary};
            line-height: 1;
          }
          .countdown-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
            text-transform: uppercase;
          }
          .offer-box {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
          }
          .promo-code {
            background: white;
            color: #10b981;
            padding: 15px 30px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            margin: 15px 0;
            border: 3px dashed #10b981;
            display: inline-block;
          }
          .button {
            display: inline-block;
            background: ${colors.primary};
            color: white;
            padding: 18px 45px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.3);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${urgencyMessage}</h1>
          <p>Votre abonnement expire ${daysUntilExpiry === 1 ? 'demain' : `dans ${daysUntilExpiry} jours`}</p>
        </div>
        <div class="content">
          <p>Bonjour ${userName},</p>
          
          <div class="urgency-banner">
            ${daysUntilExpiry === 1 ? '🚨 DERNIÈRE CHANCE - EXPIRATION DEMAIN 🚨' : 
              daysUntilExpiry === 3 ? '⏰ PLUS QUE 3 JOURS ⏰' : 
              '⏰ VOTRE ABONNEMENT EXPIRE DANS 7 JOURS ⏰'}
          </div>
          
          <div class="countdown">
            <div class="countdown-item">
              ${countdownDisplay}
            </div>
          </div>
          
          <p style="text-align: center; font-size: 17px;">
            Votre abonnement <strong>${planType}</strong> expire le 
            <strong style="color: ${colors.primary};">${expirationDate.toLocaleDateString('fr-FR', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</strong>
          </p>
          
          <div class="offer-box">
            <h2 style="margin-top: 0;">🎁 Offre Exclusive de Renouvellement</h2>
            <p style="font-size: 18px;">
              Renouvelez maintenant et bénéficiez de
            </p>
            <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
              -${offer_percentage}% DE RÉDUCTION
            </div>
            <p>Code promo :</p>
            <div class="promo-code">${promo_code}</div>
            <p style="font-size: 14px; opacity: 0.9;">
              ⏰ Offre valable jusqu'au ${expirationDate.toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <center>
            <a href="${ctaUrl}" class="button">
              ${cta_text}
            </a>
          </center>
          
          <p style="margin-top: 30px;">
            Qu'Allah facilite votre recherche,<br>
            <strong>L'équipe Mariage Halal</strong>
          </p>
        </div>
        <div class="footer">
          <p><strong>Besoin d'aide ?</strong> support@mariage-halal.com</p>
        </div>
        ${trackingPixel}
      </body>
    </html>
  `;
}
