import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Log env variables at startup
console.log("🔧 Mailer config loaded:");
console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("EMAIL_FROM =", process.env.EMAIL_FROM);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true", // true = 465, false = 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP Email
 */
export async function sendOtpEmail({ to, code }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your CrossPing Verification Code",
    text: `Your OTP code is: ${code}. It will expire in 10 minutes.`,
    html: `<p>Your OTP code is:</p>
           <h2 style="color:#2d89ef">${code}</h2>
           <p>This code will expire in 10 minutes.</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 OTP email sent to ${to}, messageId=${info.messageId}`);
  return info;
}
