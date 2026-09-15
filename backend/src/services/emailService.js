const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '2525');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    });
  }
  return transporter;
}

/**
 * Send an email (with safe mock logging fallback)
 */
async function sendEmail({ to, subject, html, text }) {
  const mailer = getTransporter();
  const from = process.env.FROM_EMAIL || 'NearHire <noreply@nearhire.com>';

  if (!mailer) {
    logger.info(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html: html || text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return false;
  }
}

module.exports = {
  sendEmail,
};
