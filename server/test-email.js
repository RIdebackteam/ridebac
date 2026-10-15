// Quick test — run with: node test-email.js <your-email@example.com>
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = process.argv[2];
if (!testEmail) {
  console.error('Usage: node test-email.js your@email.com');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

async function test() {
  console.log('📧 Sending test email to:', testEmail);
  console.log('   Using BREVO_USER:', process.env.BREVO_USER);
  try {
    const info = await transporter.sendMail({
      from: `"RideBack" <${process.env.BREVO_USER}>`,
      to: testEmail,
      subject: 'RideBack — Test Email ✅',
      html: `<h2>It works!</h2><p>Your OTP email is configured correctly. 🎉</p><p><b>Test OTP: 123456</b></p>`,
    });
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    console.log('   Check your inbox at:', testEmail);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    console.error('   Full error:', err);
  }
}

test();
