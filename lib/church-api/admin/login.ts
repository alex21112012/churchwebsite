import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ADMIN_PASSWORD } from "../_lib";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { password } = req.body as { password?: string };
  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({
  success: true,
  key: ADMIN_PASSWORD,
  token: ADMIN_PASSWORD
});
  }
  return res.status(401).json({ error: "Invalid password" });
}
