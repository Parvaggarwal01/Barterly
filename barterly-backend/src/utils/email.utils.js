import nodemailer from "nodemailer";

/**
 * Create reusable transporter object using SMTP
 */
const createTransporter = () => {
  // Debug logging (remove in production)
  console.log("🔧 SMTP Configuration:");
  console.log("  Host:", process.env.SMTP_HOST);
  console.log("  Port:", process.env.SMTP_PORT);
  console.log("  User:", process.env.SMTP_USER);
  console.log("  Pass length:", process.env.SMTP_PASS?.length || 0, "chars");
  console.log(
    "  Pass (masked):",
    process.env.SMTP_PASS ? "***" + process.env.SMTP_PASS.slice(-4) : "NOT SET",
  );

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email verification with OTP
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} otp - 6-digit OTP code
 */
export const sendVerificationEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.FROM_EMAIL || "noreply@barterly.com",
    to: email,
    subject: "Verify Your Email - Barterly",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            line-height: 1.6;
            color: #181710;
            background: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #FFFBF0;
            border: 4px solid #181710;
            box-shadow: 8px 8px 0px 0px #181710;
          }
          .header {
            background: #ffde5c;
            color: #181710;
            padding: 30px;
            border-bottom: 4px solid #181710;
            text-align: center;
          }
          .header h1 {
            font-size: 32px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .content {
            background: #FFFBF0;
            padding: 40px 30px;
          }
          .content p {
            margin-bottom: 16px;
            font-size: 16px;
            line-height: 1.6;
          }
          .otp-box {
            background: white;
            border: 4px solid #181710;
            box-shadow: 4px 4px 0px 0px #181710;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            margin-bottom: 15px;
          }
          .otp-code {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #181710;
            font-family: 'Plus Jakarta Sans', monospace;
            background: #ffde5c;
            padding: 20px;
            border: 3px solid #181710;
            display: inline-block;
          }
          .warning {
            background: #fff3cd;
            border: 3px solid #181710;
            box-shadow: 3px 3px 0px 0px #181710;
            padding: 20px;
            margin: 25px 0;
          }
          .warning strong {
            display: block;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .warning p {
            margin: 0;
            font-size: 14px;
          }
          .footer {
            background: #181710;
            color: #ffde5c;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .footer p { margin: 0; }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #181710;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ VERIFY EMAIL</h1>
          </div>
          <div class="content">
            <p><strong>Hi ${name},</strong></p>
            <p>Thank you for registering with <strong>Barterly</strong>. To complete your registration, please verify your email address using the OTP code below:</p>
            <div class="otp-box">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            <div class="warning">
              <strong>⚠️ Security Notice</strong>
              <p>This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            </div>
            <p>If you didn't create an account with Barterly, please ignore this email.</p>
            <div class="signature">
              <p><strong>The Barterly Team</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BARTERLY • All Rights Reserved</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send password reset email with OTP
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} otp - 6-digit OTP code
 */
export const sendPasswordResetEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.FROM_EMAIL || "noreply@barterly.com",
    to: email,
    subject: "Password Reset Request - Barterly",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            line-height: 1.6;
            color: #181710;
            background: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #FFFBF0;
            border: 4px solid #181710;
            box-shadow: 8px 8px 0px 0px #181710;
          }
          .header {
            background: #f472b6;
            color: #181710;
            padding: 30px;
            border-bottom: 4px solid #181710;
            text-align: center;
          }
          .header h1 {
            font-size: 32px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .content {
            background: #FFFBF0;
            padding: 40px 30px;
          }
          .content p {
            margin-bottom: 16px;
            font-size: 16px;
            line-height: 1.6;
          }
          .otp-box {
            background: white;
            border: 4px solid #181710;
            box-shadow: 4px 4px 0px 0px #181710;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            margin-bottom: 15px;
          }
          .otp-code {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #181710;
            font-family: 'Plus Jakarta Sans', monospace;
            background: #f472b6;
            padding: 20px;
            border: 3px solid #181710;
            display: inline-block;
          }
          .warning {
            background: #fff3cd;
            border: 3px solid #181710;
            box-shadow: 3px 3px 0px 0px #181710;
            padding: 20px;
            margin: 25px 0;
          }
          .warning strong {
            display: block;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .warning p {
            margin: 0;
            font-size: 14px;
          }
          .footer {
            background: #181710;
            color: #ffde5c;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .footer p { margin: 0; }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #181710;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 PASSWORD RESET</h1>
          </div>
          <div class="content">
            <p><strong>Hi ${name},</strong></p>
            <p>We received a request to reset your password for your <strong>Barterly</strong> account. Use the OTP code below to reset your password:</p>
            <div class="otp-box">
              <div class="otp-label">Your Reset Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            <div class="warning">
              <strong>⚠️ Security Notice</strong>
              <p>This OTP will expire in <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email and ensure your account is secure.</p>
            </div>
            <div class="signature">
              <p><strong>The Barterly Team</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BARTERLY • All Rights Reserved</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Send welcome email after verification
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 */
export const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.FROM_EMAIL || "noreply@barterly.com",
    to: email,
    subject: "Welcome to Barterly!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            line-height: 1.6;
            color: #181710;
            background: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #FFFBF0;
            border: 4px solid #181710;
            box-shadow: 8px 8px 0px 0px #181710;
          }
          .header {
            background: #a3e635;
            color: #181710;
            padding: 30px;
            border-bottom: 4px solid #181710;
            text-align: center;
          }
          .header h1 {
            font-size: 32px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .content {
            background: #FFFBF0;
            padding: 40px 30px;
          }
          .content p {
            margin-bottom: 16px;
            font-size: 16px;
            line-height: 1.6;
          }
          .features {
            background: white;
            border: 3px solid #181710;
            box-shadow: 4px 4px 0px 0px #181710;
            padding: 25px;
            margin: 25px 0;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            padding: 12px 0;
            border-bottom: 2px solid #f0f0f0;
            font-weight: 600;
            font-size: 15px;
            position: relative;
            padding-left: 30px;
          }
          .features li:last-child {
            border-bottom: none;
          }
          .features li:before {
            content: "★";
            position: absolute;
            left: 0;
            color: #ffde5c;
            font-size: 20px;
            font-weight: 800;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: #ffde5c;
            color: #181710;
            text-decoration: none;
            border: 3px solid #181710;
            box-shadow: 4px 4px 0px 0px #181710;
            font-weight: 800;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            background: #181710;
            color: #ffde5c;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .footer p { margin: 0; }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #181710;
            font-weight: 700;
          }
          .celebration {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 WELCOME!</h1>
          </div>
          <div class="content">
            <p><strong>Hi ${name},</strong></p>
            <div class="celebration">✓</div>
            <p style="text-align: center; font-size: 18px; font-weight: 700;">Your email has been successfully verified!</p>
            <p style="text-align: center;">You're now ready to start bartering skills with our community.</p>

            <div class="features">
              <p style="margin-bottom: 20px; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px;">Here's What You Can Do Next:</p>
              <ul>
                <li>Complete your profile and add your skills</li>
                <li>Browse skills offered by other users</li>
                <li>Send barter requests to connect with others</li>
                <li>Build your reputation through successful barters</li>
              </ul>
            </div>

            <div class="button-container">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>

            <p style="text-align: center; font-size: 14px; color: #666;">If you have any questions, feel free to reach out to our support team.</p>

            <div class="signature">
              <p style="font-size: 18px; margin-bottom: 5px;">Happy Bartering! 🚀</p>
              <p><strong>The Barterly Team</strong></p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BARTERLY • All Rights Reserved</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error for welcome email, it's not critical
  }
};
