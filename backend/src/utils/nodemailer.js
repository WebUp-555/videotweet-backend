import nodemailer from "nodemailer";

// ✅ Use ONLY these env vars (be consistent!)
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ SMTP_USER / SMTP_PASS missing. Emails will fail.");
}

// ✅ Create transporter (Render-friendly)
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,

  // ✅ IMPORTANT:
  // 587 => secure:false (STARTTLS)
  // 465 => secure:true  (SSL)
  secure: SMTP_PORT === 465,
  requireTLS: SMTP_PORT === 587,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS, // ✅ Gmail App Password
  },

  // ✅ Render needs higher timeouts
  connectionTimeout: 30000,
  socketTimeout: 30000,
  greetingTimeout: 30000,

  // ✅ Helps cloud platforms with TLS handshake issues
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ Verify SMTP once (logs actual reason)
transporter
  .verify()
  .then(() => console.log("✅ SMTP Ready"))
  .catch((err) => console.error("❌ SMTP Verify Failed:", err.message));

// ✅ Generic email sender
export const sendEmail = async ({ to, subject, html }) => {
  if (!to) throw new Error("Recipient email is required");
  if (!subject) throw new Error("Email subject is required");
  if (!html) throw new Error("Email HTML is required");

  const from = process.env.EMAIL_FROM || SMTP_USER;

  try {
    const info = await transporter.sendMail({ from, to, subject, html });

    console.log("✅ Email sent:", {
      to,
      messageId: info.messageId,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error("❌ Mailer Error:", {
      message: error.message,
      code: error.code,
    });
    throw error;
  }
};

// ✅ OTP email sender (verification + reset)
export const sendVerificationCode = async (
  email,
  code,
  username,
  type = "verification"
) => {
  let subject = "";
  let html = "";

  if (type === "verification") {
    subject = "Verify Your Email Address";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome, ${username} 👋</h2>
        <p style="color: #666; font-size: 16px;">
          Use this OTP to verify your email:
        </p>
        <div style="background:#f5f5f5; padding:20px; border-radius:10px; text-align:center;">
          <h1 style="letter-spacing: 6px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #999; font-size: 14px;">Expires in 10 minutes.</p>
      </div>
    `;
  } else if (type === "reset") {
    subject = "Password Reset Code";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #666; font-size: 16px;">Hi ${username},</p>
        <p style="color: #666; font-size: 16px;">
          Use this OTP to reset your password:
        </p>
        <div style="background:#f5f5f5; padding:20px; border-radius:10px; text-align:center;">
          <h1 style="letter-spacing: 6px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #999; font-size: 14px;">Expires in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">
          If you didn’t request this, ignore this email.
        </p>
      </div>
    `;
  } else {
    throw new Error("Invalid type. Use 'verification' or 'reset'");
  }

  return sendEmail({
    to: email,
    subject,
    html,
  });
};
