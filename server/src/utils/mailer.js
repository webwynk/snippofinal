import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const smtpPort = parseInt(process.env.SMTP_PORT || '465');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // SSL on 465, STARTTLS on 587
  auth: {
    type: 'login',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
  logger: true,
  debug: true
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[SMTP Verify Error]', error);
  } else {
    console.log('[SMTP Verify Success] Server is ready to take our messages');
  }
});

/**
 * Send an email
 * @param {Object} options 
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.error('[Email Error] SMTP credentials not configured in environment');
    return null;
  }

  try {
    console.log(`[Email] Attempting to send to: ${to} | Subject: ${subject}`);
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Snippo Booking'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      text: text || "This email requires HTML viewing",
      html,
    });
    console.log(`[Email Sent] Success! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email Error] Failed to send email:', error.message);
    if (error.response) console.error('[SMTP Response]', error.response);
    return null;
  }
};
