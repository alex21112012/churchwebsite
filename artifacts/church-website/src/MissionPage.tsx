import { useEffect, useState } from "react";

type Lang = "en" | "sr";

interface NewsItem {
  id: string; title: string; titleSr: string;
  body: string; bodySr: string; date: string;
  image: string; pinned: boolean; createdAt: string;
}

interface Props {
  lang: Lang;
  onClose: () => void;
}

const tx = {
  title: { en: "Holy Resurrection Serbian Orthodox Mission", sr: "Света Мисија Светог Васкрсења" },
  subtitle: { en: "Boise, Idaho", sr: "Бојс, Ајдахо" },
  back: { en: "← Back to St. Archangel Michael", sr: "← Назад" },
  intro1: {
    en: "Fr. Nemanja Plavšić also serves the faithful in Idaho through the Holy Resurrection Serbian Orthodox Mission in Boise. This mission provides spiritual care, Holy Services, and pastoral guidance to Orthodox Christians in the region.",
    sr: "Свештеник Немања Плавшић такође служи верницима у Ајдаху кроз Свету Мисију Светог Васкрсења у Бојсу. Ова мисија пружа духовну бригу, Свете Службе и пасторално вођство православним хришћанима у региону.",
  },
  intro2: {
    en: "Though based in Salt Lake City, Fr. Nemanja regularly travels to Boise to support the growing Serbian Orthodox community, ensuring continuity of worship, sacraments, and connection to the Church.",
    sr: "Иако је базиран у Солт Лејк Ситију, отац Немања редовно путује у Бојс да подржи растућу српску православну заједницу, обезбеђујући континуитет богослужења, светих тајни и повезаности са Црквом.",
  },
  mailing: { en: "Mailing Address", sr: "Поштанска адреса" },
  physical: { en: "Physical Address", sr: "Физичка адреса" },
  newsTitle: { en: "Mission News", sr: "Вести мисије" },
  noNews: { en: "No news items yet. Check back soon.", sr: "Тренутно нема вести. Проверите ускоро." },
  pinned: { en: "Pinned", sr: "Истакнуто" },
};

export default function MissionPage({ lang, onClose }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetch("/api/church/mission-news")
      .then(r => r.json())
      .then((data: NewsItem[]) => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "var(--stone, #f5f0e8)",
      overflowY: "auto",
    }}>
      {/* Top bar */}
      <div style={{
        background: "var(--dark-bg, #1a0a0d)",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid rgba(201,165,90,0.2)",
      }}>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--gold-light, #e8c96a)",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {tx.back[lang]}
        </button>
      </div>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, var(--dark-bg, #1a0a0d) 0%, #2a0e14 100%)",
        padding: "80px 40px 72px",
        textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56,
          background: "linear-gradient(135deg, var(--gold-dark, #b8932a), var(--gold, #c9a55a))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", margin: "0 auto 28px",
          fontFamily: "'Cinzel', serif",
        }}>✦</div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          color: "var(--gold-dark, #b8932a)",
          fontSize: "0.62rem", letterSpacing: "0.25em",
          textTransform: "uppercase", marginBottom: 18,
        }}>
          {lang === "en" ? "Serbian Orthodox" : "Српска Православна"}
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          color: "var(--gold-light, #e8c96a)",
          fontSize: "clamp(1.5rem, 3.2vw, 2.4rem)",
          fontWeight: 700,
          lineHeight: 1.25,
          maxWidth: 760,
          margin: "0 auto 12px",
        }}>
          {tx.title[lang]}
        </h1>
        <div style={{
          fontFamily: "'Cinzel', serif",
          color: "rgba(201,165,90,0.7)",
          fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
          letterSpacing: "0.12em",
          marginBottom: 28,
        }}>
          — {tx.subtitle[lang]} —
        </div>
        <div style={{ width: 60, height: 2, background: "var(--gold-dark, #b8932a)", margin: "0 auto" }} />
      </div>

      {/* Intro text */}
      <div style={{
        background: "white",
        borderBottom: "1px solid rgba(107,26,42,0.1)",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 40px" }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.05rem, 1.5vw, 1.18rem)",
            lineHeight: 1.9,
            color: "#3a2a2a",
            marginBottom: 24,
          }}>
            {tx.intro1[lang]}
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.05rem, 1.5vw, 1.18rem)",
            lineHeight: 1.9,
            color: "#3a2a2a",
          }}>
            {tx.intro2[lang]}
          </p>
        </div>
      </div>

      {/* Address cards */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 40px 0" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 28,
          marginBottom: 72,
        }}>
          {/* Mailing */}
          <div style={{
            background: "white",
            padding: "36px 32px",
            border: "1px solid rgba(107,26,42,0.12)",
            borderTop: "3px solid var(--dark-burgundy, #6b1a2a)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 16 }}>📬</div>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.85rem", fontWeight: 600,
              color: "var(--dark-burgundy, #6b1a2a)",
              marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {tx.mailing[lang]}
            </h3>
            <p style={{ color: "var(--text-mid, #555)", fontSize: "1.05rem", lineHeight: 1.8 }}>
              1606 South 1000 West<br />
              Salt Lake City, Utah 84104
            </p>
          </div>

          {/* Physical */}
          <div style={{
            background: "white",
            padding: "36px 32px",
            border: "1px solid rgba(107,26,42,0.12)",
            borderTop: "3px solid var(--dark-burgundy, #6b1a2a)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 16 }}>📍</div>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.85rem", fontWeight: 600,
              color: "var(--dark-burgundy, #6b1a2a)",
              marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {tx.physical[lang]}
            </h3>
            <p style={{ color: "var(--text-mid, #555)", fontSize: "1.05rem", lineHeight: 1.8 }}>
              2618 W Bannock Street<br />
              Boise, Idaho 83702
            </p>
          </div>
        </div>

        {/* News section */}
        <div style={{ borderTop: "2px solid var(--dark-burgundy, #6b1a2a)", paddingTop: 56, marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              color: "var(--gold-dark, #b8932a)",
              fontSize: "0.62rem", letterSpacing: "0.25em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              {lang === "en" ? "Latest Updates" : "Најновије"}
            </div>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: 700,
              color: "var(--dark-burgundy, #6b1a2a)",
              marginBottom: 20,
            }}>
              {tx.newsTitle[lang]}
            </h2>
            <div style={{ width: 50, height: 2, background: "var(--gold-dark, #b8932a)", margin: "0 auto" }} />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "var(--text-mid, #555)", padding: "40px 0", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem" }}>
              {lang === "en" ? "Loading…" : "Учитавање…"}
            </div>
          ) : news.length === 0 ? (
            <div style={{
              textAlign: "center",
              background: "white",
              padding: "48px 32px",
              border: "1px solid rgba(107,26,42,0.1)",
              color: "var(--text-mid, #555)",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "1.1rem",
              fontStyle: "italic",
            }}>
              {tx.noNews[lang]}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {news.map(item => (
                <article key={item.id} style={{
                  background: "white",
                  padding: "36px 40px",
                  border: "1px solid rgba(107,26,42,0.1)",
                  borderLeft: item.pinned ? "4px solid var(--gold-dark, #b8932a)" : "1px solid rgba(107,26,42,0.1)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  display: "grid",
                  gridTemplateColumns: item.image ? "1fr 220px" : "1fr",
                  gap: 32,
                  alignItems: "start",
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      {item.pinned && (
                        <span style={{
                          background: "var(--gold-dark, #b8932a)", color: "white",
                          fontFamily: "'Cinzel', serif", fontSize: "0.55rem",
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          padding: "3px 10px",
                        }}>
                          {tx.pinned[lang]}
                        </span>
                      )}
                      {item.date && (
                        <span style={{
                          fontFamily: "'Cinzel', serif", color: "var(--text-mid, #555)",
                          fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                        }}>
                          {item.date}
                        </span>
                      )}
                    </div>
                    <h3 style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "1.15rem", fontWeight: 600,
                      color: "var(--dark-burgundy, #6b1a2a)",
                      marginBottom: 14, lineHeight: 1.4,
                    }}>
                      {lang === "en" ? item.title : (item.titleSr || item.title)}
                    </h3>
                    <p style={{
                      color: "var(--text-mid, #555)", fontSize: "1.05rem",
                      lineHeight: 1.85, whiteSpace: "pre-wrap",
                    }}>
                      {lang === "en" ? item.body : (item.bodySr || item.body)}
                    </p>
                  </div>
                  {item.image && (
                    <img
                      src={item.image} alt={item.title}
                      style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                    />
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
