import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend API
 * @param {Object} options 
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email Error] RESEND_API_KEY not configured in environment');
    return null;
  }

  try {
    console.log(`[Email] Attempting to send via Resend to: ${to} | Subject: ${subject}`);
    
    // In Resend, the 'from' must be a verified domain or 'onboarding@resend.dev' for sandbox
    const fromAddress = process.env.SMTP_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.SMTP_FROM_NAME || 'Snippo Booking';

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: [to],
      subject: subject,
      html: html,
      text: text || "This email requires HTML viewing",
    });

    if (error) {
      console.error('[Resend Error]', error);
      return null;
    }

    console.log(`[Email Sent] Success! ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('[Email Error] Unexpected failure:', error.message);
    return null;
  }
};
