import nodemailer from 'nodemailer';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Sends a 6-digit press verification code to the subscriber's email.
 * If SMTP environment variables are configured, dispatches an actual email via Nodemailer.
 * If SMTP is not set, safely logs to the server output and provides a simulated delivery.
 */
export async function sendVerificationEmail(
  toEmail: string,
  verificationCode: string,
  recipientName?: string
): Promise<SendEmailResult> {
  const host = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || '587', 10);
  const user = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.EMAIL_SERVER_PASS || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || '"DAYMARK Dispatch" <verify@daymark.news>';

  const greetingName = recipientName || toEmail.split('@')[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>DAYMARK Press Verification Code</title>
      </head>
      <body style="font-family: Georgia, 'Times New Roman', serif; background-color: #F8F9FA; color: #111827; margin: 0; padding: 40px 20px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Masthead Header -->
          <tr>
            <td style="padding: 28px 32px; text-align: center; background-color: #0D1B2C; color: #F1F5FA; border-bottom: 3px solid #526BFF;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; font-family: 'Times New Roman', serif;">DAYMARK</h1>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #526BFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Security Desk • Press Verification</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px; font-size: 15px; line-height: 1.6; color: #374151;">
              <p style="margin-top: 0;">Dear <strong>${greetingName}</strong>,</p>
              <p>Welcome to <strong>DAYMARK</strong>. To activate your morning broadsheet subscription and verify your press credentials, please use the 6-digit authentication code below:</p>
              
              <!-- Code Box -->
              <div style="margin: 28px 0; text-align: center;">
                <div style="display: inline-block; padding: 14px 32px; background-color: #F0F4FF; border: 2px dashed #526BFF; border-radius: 6px; font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; color: #1E3A8A;">
                  ${verificationCode}
                </div>
                <p style="margin: 8px 0 0; font-size: 12px; color: #6B7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Code expires in 15 minutes.
                </p>
              </div>

              <p style="font-size: 13px; color: #6B7280;">If you did not request this verification code, you can safely disregard this notice.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center; font-size: 11px; color: #9CA3AF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <p style="margin: 0;">DAYMARK • Your world, clearly delivered.</p>
              <p style="margin: 4px 0 0;">Zero Hallucinations • Deterministic Ranking • Client-Side Sovereignty</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: `Your DAYMARK Verification Code: ${verificationCode}`,
        text: `Your DAYMARK verification code is: ${verificationCode}. It expires in 15 minutes.`,
        html: htmlContent,
      });

      console.log(`Verification email sent to ${toEmail}: messageId=${info.messageId}`);
      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err: any) {
      console.error('SMTP Email dispatch failed, falling back to simulated output:', err.message);
      return { success: true, simulated: true, error: err.message };
    }
  }

  // Simulated delivery for environments without SMTP configured
  console.log('====================================================');
  console.log(`[DAYMARK EMAIL DISPATCH] To: ${toEmail}`);
  console.log(`[DAYMARK VERIFICATION CODE]: >>> ${verificationCode} <<<`);
  console.log('====================================================');

  return { success: true, simulated: true };
}
