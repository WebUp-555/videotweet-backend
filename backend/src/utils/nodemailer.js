import nodemailer from "nodemailer";

// --- SMTP ENV CONFIG (Render + Local) ---
const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465; // 465 = SSL, 587 = STARTTLS

// ✅ transporter
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // ✅ MUST be Google App Password
  },

  // Render is slow sometimes → don't use stupid 5s timeouts
  connectionTimeout: 20000,
  socketTimeout: 20000,

  // Helps avoid random TLS handshake issues on hosted platforms
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ Verify once (shows errors clearly in Render logs)
transporter
  .verify()
  .then(() => console.log("✅ SMTP Ready"))
  .catch((err) => console.error("❌ SMTP Verify Failed:", err));

// --------------------
// ✅ Send Welcome Email
// --------------------
export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Our Platform!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px;">
          <h1 style="color: #333;">Welcome ${username}!</h1>
          <p style="color: #666; font-size: 16px;">
            Thank you for signing up to our platform. We're excited to have you on board!
          </p>
          <p style="color: #666; font-size: 16px;">
            Get started by exploring all the features we have to offer.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw new Error("Welcome email could not be sent");
  }
};

// ---------------------------------
// ✅ Send Verification / Reset Code
// ---------------------------------
export const sendVerificationCode = async (
  email,
  code,
  username,
  purpose = "verification"
) => {
  const subject =
    purpose === "reset" ? "Password Reset Code" : "Email Verification Code";

  const title =
    purpose === "reset" ? "Password Reset Request" : "Verify Your Email";

  const message =
    purpose === "reset"
      ? "We received a request to reset your password. Use the code below to reset it:"
      : "Thank you for signing up! Please use the code below to verify your email address:";

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px;">
          <h1 style="color: #333;">${title}</h1>
          <p style="color: #666; font-size: 16px;">Hi ${username},</p>
          <p style="color: #666; font-size: 16px;">${message}</p>

          <div style="text-align: center; margin: 30px 0; background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h2 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">
              ${code}
            </h2>
          </div>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This code will expire in 10 minutes.
          </p>

          <p style="color: #999; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ ${purpose} code email sent to:`, email);
  } catch (error) {
    console.error(`❌ Error sending ${purpose} code email:`, error);
    throw new Error(`${purpose} email could not be sent`);
  }
};
