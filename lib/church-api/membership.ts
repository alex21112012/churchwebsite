import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

const CHURCH_EMAIL = "serbianorthodoxchurchslc@gmail.com";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: CHURCH_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function row(label: string, value: string | undefined) {
  if (!value) return "";
  return `<tr>
    <td style="padding: 7px 0; color: #555; width: 200px; vertical-align: top;"><strong>${label}</strong></td>
    <td style="padding: 7px 0;">${value}</td>
  </tr>`;
}

function textRow(label: string, value: string | undefined) {
  if (!value) return "";
  return `${label}: ${value}\n`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const b = req.body as Record<string, string>;

  if (!b.surname || !b.name || !b.dob || !b.pob || !b.tel || !b.email || !b.address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD not set");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const fullName = `${b.surname}, ${b.name}`;

  const textBody = [
    "NEW MEMBERSHIP APPLICATION",
    "==============================",
    "",
    "PERSONAL INFORMATION",
    "----------------------------",
    textRow("Surname", b.surname),
    textRow("Name", b.name),
    textRow("Date of Birth", b.dob),
    textRow("Place of Birth", b.pob),
    textRow("Date of Baptism", b.dobaptism),
    textRow("Place of Baptism", b.pobaptism),
    textRow("Marital Status", b.marital),
    textRow("Spouse", b.spouse),
    textRow("Number of Children", b.children),
    textRow("Children's Names", b.childrenNames),
    "",
    "CONTACT INFORMATION",
    "----------------------------",
    textRow("Telephone", b.tel),
    textRow("Email", b.email),
    textRow("Address", b.address),
    "",
    "CHURCH INFORMATION",
    "----------------------------",
    textRow("Patron Saint (Slava)", b.slava),
    textRow("Previous Parish", b.fromParish),
  ].join("\n");

  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #c9a84c; border-radius: 4px;">
      <h2 style="color: #1a0a0a; font-family: serif; border-bottom: 2px solid #c9a84c; padding-bottom: 12px;">
        New Membership Application — ${fullName}
      </h2>

      <h3 style="color: #1a0a0a; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin: 20px 0 8px; border-bottom: 1px solid #e0d5c0; padding-bottom: 6px;">Personal Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${row("Surname", b.surname)}
        ${row("Name", b.name)}
        ${row("Date of Birth", b.dob)}
        ${row("Place of Birth", b.pob)}
        ${row("Date of Baptism", b.dobaptism)}
        ${row("Place of Baptism", b.pobaptism)}
        ${row("Marital Status", b.marital)}
        ${row("Name of Spouse", b.spouse)}
        ${row("Number of Children", b.children)}
        ${row("Children's Names", b.childrenNames)}
      </table>

      <h3 style="color: #1a0a0a; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin: 20px 0 8px; border-bottom: 1px solid #e0d5c0; padding-bottom: 6px;">Contact Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${row("Telephone", b.tel)}
        ${row("Email", b.email)}
        ${row("Home Address", b.address)}
      </table>

      <h3 style="color: #1a0a0a; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; margin: 20px 0 8px; border-bottom: 1px solid #e0d5c0; padding-bottom: 6px;">Church Information</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${row("Patron Saint (Slava)", b.slava)}
        ${row("Previous Parish", b.fromParish)}
      </table>

      <p style="color: #999; font-size: 12px; margin-top: 28px;">Submitted via the St. Archangel Michael church website membership form.</p>
    </div>
  `;

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"St. Archangel Michael Website" <${CHURCH_EMAIL}>`,
      to: CHURCH_EMAIL,
      subject: `Membership Application — ${fullName}`,
      text: textBody,
      html: htmlBody,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
