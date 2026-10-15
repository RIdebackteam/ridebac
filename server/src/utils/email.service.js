/**
 * email.service.js
 * Sends transactional emails via Brevo HTTP API (port 443 — works on Render free tier).
 * SMTP port 587 is blocked on Render free instances, so we use the REST API instead.
 *
 * Setup:
 *  1. Go to https://app.brevo.com → Settings → API Keys
 *  2. Generate a new API key
 *  3. Add to Render env: BREVO_API_KEY=xkeysib-...
 *  4. Add to Render env: BREVO_USER=b5215b001@smtp-brevo.com (used as sender)
 */

const https = require('https');

// ─── Send via Brevo HTTP API ───────────────────────────────────────────────────
function sendBrevoEmail({ to, toName, subject, html }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: { name: 'RideBack', email: process.env.BREVO_USER },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}


// ─── HTML OTP Email Template ───────────────────────────────────────────────────
function buildOTPEmail({ name, otp, type = 'verify' }) {
  const subjects = {
    verify:   'Verify your RideBack account',
    resend:   'Your new RideBack OTP code',
    reset:    'Reset your RideBack password',
    login:    'Your RideBack login OTP',
  };

  const headings = {
    verify:   '✅ Verify Your Account',
    resend:   '🔄 New OTP Code',
    reset:    '🔐 Password Reset',
    login:    '👋 Login Verification',
  };

  const messages = {
    verify:   'Thanks for signing up! Use the code below to verify your account.',
    resend:   'Here is your new verification code. The previous one has expired.',
    reset:    'We received a request to reset your password. Use this code to proceed.',
    login:    'Use this code to complete your login.',
  };

  const subject = subjects[type] || subjects.verify;
  const heading = headings[type] || headings.verify;
  const message = messages[type] || messages.verify;

  // Split OTP into individual digits for the nice box display
  const otpDigits = String(otp).split('').map(d =>
    `<td style="width:48px;height:56px;text-align:center;vertical-align:middle;background:#1e293b;border:2px solid #4f46e5;border-radius:10px;font-size:28px;font-weight:900;color:#ffffff;font-family:monospace;padding:0 4px;">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#10b981);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">🚗</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">RideBack</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Travel Together. Save Together.</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#1e293b;padding:40px;border-left:1px solid #334155;border-right:1px solid #334155;">

            <h2 style="margin:0 0 8px;color:#f8fafc;font-size:20px;font-weight:700;">${heading}</h2>
            <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
              Hi <strong style="color:#e2e8f0;">${name}</strong>, ${message}
            </p>

            <!-- OTP Boxes -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>${otpDigits}</tr>
            </table>

            <!-- Expiry notice -->
            <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:14px 20px;margin-bottom:28px;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:13px;">
                ⏰ This code expires in <strong style="color:#f59e0b;">10 minutes</strong>
              </p>
            </div>

            <!-- Security warning -->
            <div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.2);border-radius:10px;padding:14px 20px;">
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                🔒 <strong style="color:#f87171;">Never share this code</strong> with anyone, including RideBack support. We will never ask for your OTP.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0f172a;border:1px solid #1e293b;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;color:#475569;font-size:12px;">
              If you didn't request this, please ignore this email.
            </p>
            <p style="margin:0;color:#334155;font-size:11px;">
              © ${new Date().getFullYear()} RideBack · India's trusted carpooling platform
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

// ─── Send OTP Email ───────────────────────────────────────────────────────────
async function sendOTPEmail({ name, email, otp, type = 'verify' }) {
  // Fallback if no API key configured
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_USER) {
    console.log(`[OTP] ${type.toUpperCase()} OTP for ${email}: ${otp}  ← (Set BREVO_API_KEY + BREVO_USER in env)`);
    return { sent: false, reason: 'No Brevo API key configured' };
  }

  const { subject, html } = buildOTPEmail({ name, otp, type });

  try {
    await sendBrevoEmail({ to: email, toName: name, subject, html });
    console.log(`[Email] ✅ OTP email sent to ${email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[Email] ❌ Failed to send to ${email}:`, err.message);
    console.log(`[OTP] Fallback — ${type} OTP for ${email}: ${otp}`);
    return { sent: false, reason: err.message };
  }
}

module.exports = { sendOTPEmail };

