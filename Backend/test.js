// // import { downloadAudioFile, transcribeAudio, translateText } from "./utils/voiceTranslate.js";

// // const test = async () => {
// //   try {
// //     const url = "https://res.cloudinary.com/hamna123/video/upload/v1754230083/uvn0dzjunou0aeoxhhzo.webm";
// //     const filePath = await downloadAudioFile(url);

// //     const text = await transcribeAudio(filePath);
// //     console.log("📝 Transcribed:", text);

// //     const translated = await translateText(text, "fr"); // Translate to Urdu
// //     console.log("🌐 Translated:", translated);
// //   } catch (err) {
// //     console.error("❌ Test failed:", err.message);
// //   }
// // };

// // test();
// // server/scripts/test.js
// import 'dotenv/config.js';
// import nodemailer from 'nodemailer';

// function env(name, fallback = '') {
//   return process.env[name] ?? fallback;
// }

// const host   = env('SMTP_HOST', 'smtp.gmail.com');
// const port   = Number(env('SMTP_PORT', '465'));
// const user   = env('SMTP_USER');        // crosspingweb@gmail.com
// const pass   = env('SMTP_PASS');        // 16-char Gmail App Password (no spaces)
// const secure = String(env('SMTP_SECURE', port === 465 ? 'true' : 'false')).toLowerCase() !== 'false';
// const from   = env('EMAIL_FROM', user);

// // tiny argv parser: --to someone@x.com --subject "Hi" --text "hello"
// const args = process.argv.slice(2);
// const argv = {};
// for (let i = 0; i < args.length; i++) {
//   if (args[i].startsWith('--')) {
//     const k = args[i].slice(2);
//     argv[k] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
//   }
// }

// const to      = argv.to || env('TEST_TO', user);
// const subject = argv.subject || 'CrossPing SMTP test';
// const text    = argv.text || 'This is a test email from CrossPing SMTP test.js. If you see this, SMTP works ✅';
// const html    = argv.html || `<p>This is a <b>test email</b> from <code>test.js</code>.<br/>SMTP appears to be working ✅</p>`;

// if (!user || !pass) {
//   console.error('❌ Missing SMTP_USER or SMTP_PASS in your .env');
//   process.exit(1);
// }

// const transporter = nodemailer.createTransport({
//   host,
//   port,
//   secure, // true for 465, false for 587 (STARTTLS)
//   auth: { user, pass },
// });

// async function main() {
//   console.log('ℹ️  Verifying SMTP connection…');
//   await transporter.verify();
//   console.log('✅ SMTP transporter verified');

//   console.log(`ℹ️  Sending:
//   from: ${from}
//   to:   ${to}
//   host: ${host}:${port} secure=${secure}`);

//   const info = await transporter.sendMail({ from, to, subject, text, html });

//   console.log('✅ Message sent. id:', info.messageId);
//   if (info.accepted?.length) console.log('   accepted:', info.accepted.join(', '));
//   if (info.rejected?.length) console.log('   rejected:', info.rejected.join(', '));
// }

// main()
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.error('❌ SMTP test failed:', err?.message || err);
//     process.exit(1);
//   });
// test.js
import nodemailer from "nodemailer";

// load .env if needed
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Starting OTP email test...");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === "true" || true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // simple 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000);

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"CrossPing" <${process.env.SMTP_USER}>`,
    to: process.env.TEST_TO || process.env.SMTP_USER,
    subject: "🔑 OTP Test Email",
    text: `Here is your test OTP: ${code}`,
    html: `<h2>Here is your test OTP: <span style="color:#2d89ef">${code}</span></h2>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("🔑 Sent OTP:", code);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
}

main();
