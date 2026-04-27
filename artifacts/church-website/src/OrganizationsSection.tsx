import { useState, useEffect } from "react";

type Lang = "en" | "sr";

interface Organization {
  id: string;
  name: string;
  nameSr: string;
  description: string;
  descriptionSr: string;
  image: string;
  contact: string;
  createdAt: string;
}

interface Props {
  lang: Lang;
}

const labels = {
  title: { en: "Parish Organizations", sr: "Парохијске Организације" },
  subtitle: { en: "Community & Fellowship", sr: "Заједница и братство" },
  contactLabel: { en: "Contact", sr: "Контакт" },
  loading: { en: "Loading…", sr: "Учитавање…" },
  joinUs: { en: "Join Us", sr: "Придружите нам се" },
};

export default function OrganizationsSection({ lang }: Props) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/church/organizations")
      .then((r) => r.json())
      .then((data: Organization[]) => { setOrgs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="organizations" style={{
      background: "linear-gradient(180deg, #f8f4ee 0%, var(--stone) 100%)",
      padding: "96px 40px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            color: "var(--gold-dark)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            {labels.subtitle[lang]}
          </div>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--dark-burgundy)",
            marginBottom: 20,
          }}>
            {labels.title[lang]}
          </h2>
          <div style={{ width: 60, height: 2, background: "var(--gold-dark)", margin: "0 auto" }} />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-mid)", fontStyle: "italic" }}>
            {labels.loading[lang]}
          </p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 36,
          }}>
            {orgs.map((org) => (
              <div key={org.id} style={{
                background: "white",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                border: "1px solid rgba(107,26,42,0.08)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}>
                {/* Photo area */}
                {org.image ? (
                  <div style={{ height: 220, overflow: "hidden" }}>
                    <img
                      src={org.image}
                      alt={lang === "sr" ? org.nameSr : org.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.4s",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    height: 120,
                    background: "linear-gradient(135deg, var(--dark-burgundy) 0%, #2a0f17 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ color: "var(--gold)", fontSize: "2rem", opacity: 0.6 }}>✦</span>
                  </div>
                )}

                {/* Content */}
                <div style={{
                  padding: "28px 32px 32px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderTop: "3px solid var(--dark-burgundy)",
                }}>
                  <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    color: "var(--dark-burgundy)",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: 14,
                    lineHeight: 1.35,
                  }}>
                    {lang === "sr" ? (org.nameSr || org.name) : org.name}
                  </h3>
                  <p style={{
                    color: "var(--text-mid)",
                    fontSize: "1rem",
                    lineHeight: 1.85,
                    flex: 1,
                    marginBottom: org.contact ? 20 : 0,
                  }}>
                    {lang === "sr" ? (org.descriptionSr || org.description) : org.description}
                  </p>
                  {org.contact && (
                    <div style={{
                      borderTop: "1px solid rgba(107,26,42,0.12)",
                      paddingTop: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <span style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: "0.6rem",
                        color: "var(--gold-dark)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}>
                        {labels.contactLabel[lang]}:
                      </span>
                      <span style={{ color: "var(--dark-burgundy)", fontSize: "0.95rem" }}>
                        {org.contact}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
