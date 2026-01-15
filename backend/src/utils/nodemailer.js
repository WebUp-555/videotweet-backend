import nodemailer from "nodemailer";

const getTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  // Fallback for development: JSON transport (no real emails sent)
  return nodemailer.createTransport({ jsonTransport: true });
};

const transporter = getTransport();

export const sendEmail = async (to, subject, html) => {
  const from = process.env.EMAIL_FROM || "no-reply@example.com";
  const info = await transporter.sendMail({ from, to, subject, html });
  if (process.env.NODE_ENV !== "production") {
    // Log email content in dev to help testing
    try {
      const preview = typeof info.message === 'string' ? info.message : JSON.stringify(info);
      console.log("[Mailer] Sent mail:", preview);
    } catch {}
  }
  return info;
};

export const sendVerificationCode = async (email, code, username, type = "verification") => {
  let subject, html;

  if (type === "verification") {
    subject = "Verify Your Email Address";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome, ${username}!</h2>
        <p style="color: #666; font-size: 16px;">Thank you for registering. Please verify your email address using the code below:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 0;">${code}</p>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Our Platform. All rights reserved.</p>
      </div>
    `;
  } else if (type === "reset") {
    subject = "Reset Your Password";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">Hi ${username},</p>
        <p style="color: #666; font-size: 16px;">We received a request to reset your password. Use the code below to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 5px; margin: 0;">${code}</p>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;"><strong>Security Note:</strong> If you didn't request this, please ignore this email. Your account is secure.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2026 Our Platform. All rights reserved.</p>
      </div>
    `;
  } else {
    throw new Error("Invalid email type. Use 'verification' or 'reset'");
  }

  return await sendEmail(email, subject, html);
};
