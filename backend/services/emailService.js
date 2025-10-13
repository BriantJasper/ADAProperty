const nodemailer = require('nodemailer');

// Create transporter from environment, fallback to console-only
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return null;
}

const transporter = createTransporter();

async function sendOtpEmail(to, otp) {
  const from = process.env.FROM_EMAIL || 'no-reply@adaproperty.local';
  const subject = 'Kode OTP Reset Password - ADAProperty';
  const text = `Kode OTP Anda: ${otp}. Berlaku selama 10 menit.`;
  const html = `<p>Kode OTP Anda: <strong>${otp}</strong></p><p>Berlaku selama 10 menit.</p>`;

  if (!transporter) {
    console.log('[EmailService] SMTP tidak dikonfigurasi. OTP:', otp, 'To:', to);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    return { success: true };
  } catch (error) {
    console.error('Gagal mengirim email OTP:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOtpEmail };