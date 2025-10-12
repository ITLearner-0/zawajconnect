import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: {
    name: string;
    email: string;
  };
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");
  const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || "Mariage-Halal";

  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFromEmail) {
    throw new Error(
      "SMTP configuration missing. Please configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM_EMAIL in Edge Functions secrets."
    );
  }

  const client = new SMTPClient({
    connection: {
      hostname: smtpHost,
      port: smtpPort,
      tls: smtpPort === 465, // SSL pour port 465
      auth: {
        username: smtpUser,
        password: smtpPassword,
      },
    },
  });

  try {
    await client.send({
      from: options.from?.email || smtpFromEmail,
      fromName: options.from?.name || smtpFromName,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  } finally {
    await client.close();
  }
}
