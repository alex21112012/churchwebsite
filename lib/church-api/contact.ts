import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

const CHURCH_EMAIL = "serbianorthodoxchurchslc@gmail.com";

function createTransport() {
  const appPassword = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: CHURCH_EMAIL,
      pass: appPassword,
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, contact, message } = req.body as {
    name?: string;
    contact?: string;
    message?: string;
  };

  if (!name || !contact || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD not set");
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"St. Archangel Michael Website" <${CHURCH_EMAIL}>`,
      to: CHURCH_EMAIL,
      subject: `Website Contact Form — ${name}`,
      text: [
        "NEW CONTACT FORM SUBMISSION",
        "==============================",
        `Name:    ${name}`,
        `Contact: ${contact}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #c9a84c; border-radius: 4px;">
          <h2 style="color: #1a0a0a; font-family: serif; border-bottom: 2px solid #c9a84c; padding-bottom: 12px;">
            New Contact Form Submission
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #666; width: 100px;"><strong>Name</strong></td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Contact</strong></td><td style="padding: 8px 0;">${contact}</td></tr>
          </table>
          <div style="margin-top: 16px;">
            <strong style="color: #666;">Message:</strong>
            <p style="background: #f9f5ec; padding: 16px; border-radius: 4px; margin-top: 8px; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">Sent from the St. Archangel Michael church website contact form.</p>
        </div>
      `,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
