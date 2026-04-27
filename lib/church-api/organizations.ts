import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB, isAdmin, uploadToStorage, parseMultipart, mapOrg } from "./_lib";

export const config = { api: { bodyParser: false } };

const defaultOrgs = [
  {
    id: "folklore",
    name: "Serbian Folklore Group",
    nameSr: "Српска Фолклорна Група",
    description:
      "Our folklore ensemble keeps the rich tradition of Serbian folk dance and music alive in Utah. Members of all ages are welcome to join and perform at parish events, cultural festivals, and community gatherings throughout the year.",
    descriptionSr:
      "Наш фолклорни ансамбл чува богату традицију српске народне игре и музике у Јути. Чланови свих узраста су добродошли да се придруже и наступају на парохијским приредбама, културним фестивалима и окупљањима током целе године.",
    image: "",
    contact: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "choir",
    name: "Parish Choir",
    nameSr: "Парохијски Хор",
    description:
      "The parish choir sings the Divine Liturgy and other services in the Serbian Orthodox musical tradition. Our singers are the voice of the congregation in worship, lifting hearts and minds toward God with sacred song. New voices are always welcome.",
    descriptionSr:
      "Парохијски хор пева Свету Литургију и друге службе у српској православној музичкој традицији. Наши певачи су глас парохије у богослужењу, подижући срца и умове ка Богу светом песмом. Нови гласови су увек добродошли.",
    image: "",
    contact: "",
    createdAt: new Date().toISOString(),
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();

  if (req.method === "GET") {
    const { data, error } = await db
      .from("church_organizations")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const rows = data ?? [];

    return res.json(
      rows.length === 0
        ? defaultOrgs
        : rows.map((r: any) => mapOrg(r as Record<string, unknown>))
    );
  }

  if (req.method === "POST") {
    if (!isAdmin(req.headers)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fields, file } = await parseMultipart(req);

    let imageUrl = "";
    if (file) {
      imageUrl = await uploadToStorage(file.buffer, file.mimetype, file.ext);
    }

    const { data, error } = await db
      .from("church_organizations")
      .insert({
        id: Date.now().toString(),
        name: fields["name"] ?? "",
        name_sr: fields["nameSr"] ?? "",
        description: fields["description"] ?? "",
        description_sr: fields["descriptionSr"] ?? "",
        image: imageUrl,
        contact: fields["contact"] ?? "",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json(mapOrg(data as Record<string, unknown>));
  }

  return res.status(405).json({ error: "Method not allowed" });
}