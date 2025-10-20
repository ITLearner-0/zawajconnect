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
  // Get SMTP configuration
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPortStr = Deno.env.get("SMTP_PORT");
  const smtpPort = smtpPortStr ? parseInt(smtpPortStr) : 465;
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL");
  const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || "Zawaj-Connect";

  // Log configuration (without sensitive data)
  console.log("SMTP Configuration check:", {
    hasHost: !!smtpHost,
    host: smtpHost,
    port: smtpPort,
    hasUser: !!smtpUser,
    user: smtpUser,
    hasPassword: !!smtpPassword,
    hasFromEmail: !!smtpFromEmail,
    fromEmail: smtpFromEmail,
    fromName: smtpFromName,
    recipientEmail: options.to
  });

  // Validate required fields
  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFromEmail) {
    const missing = [];
    if (!smtpHost) missing.push("SMTP_HOST");
    if (!smtpUser) missing.push("SMTP_USER");
    if (!smtpPassword) missing.push("SMTP_PASSWORD");
    if (!smtpFromEmail) missing.push("SMTP_FROM_EMAIL");
    
    throw new Error(
      `SMTP configuration missing: ${missing.join(", ")}. Please configure these secrets in Edge Functions settings.`
    );
  }

  if (!options.to || options.to.trim() === "") {
    throw new Error("Recipient email (options.to) is required");
  }

  let client;
  
  try {
    console.log(`Connecting to SMTP server: ${smtpHost}:${smtpPort}`);
    
    client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: smtpPort === 465,
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    console.log(`Sending email to: ${options.to}`);
    
    await client.send({
      from: options.from?.email || smtpFromEmail,
      fromName: options.from?.name || smtpFromName,
      to: options.to,
      subject: options.subject,
      html: options.html,
      contentType: "text/html; charset=utf-8",
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error("Failed to send email. Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw new Error(`Email sending failed: ${error.message}`);
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError.message);
      }
    }
  }
}
