type Lang = "en" | "sr";

interface Props {
  lang: Lang;
  gofundmeUrl?: string;
}

const content = {
  title: { en: "Support Our Parish", sr: "Подржите Нашу Парохију" },
  subtitle: { en: "Donations & Giving", sr: "Донације и прилози" },
  intro: {
    en: "Your generosity sustains the life and ministry of St. Archangel Michael Serbian Orthodox Church. Every contribution — large or small — helps us maintain our church building, support our clergy, preserve Serbian Orthodox traditions, and serve our community.",
    sr: "Ваша великодушност одржава живот и служење Цркве Светог Арханђела Михаила. Сваки прилог — велики или мали — помаже нам да одржавамо наш храм, подржимо нашег свештенства, чувамо српске православне традиције и служимо нашој заједници.",
  },
  gofundme: {
    title: { en: "Online Campaign", sr: "Онлајн кампања" },
    desc: {
      en: "Support our church restoration and courtyard fencing campaign. Every contribution brings us closer to completing this sacred work.",
      sr: "Подржите нашу кампању за обнову храма и ограђивање црквене порте. Сваки прилог нас приближава завршетку овог светог дела.",
    },
    button: { en: "Donate via GoFundMe", sr: "Донирајте преко GoFundMe" },
  },
  methods: [
    {
      icon: "🏦",
      title: { en: "Check or Money Order", sr: "Чек или налог за исплату" },
      desc: {
        en: "Make checks payable to:\nSt. Archangel Michael Serbian Orthodox Church\n1606 South 1000 West\nSalt Lake City, UT 84104",
        sr: "Чек нагласити на:\nСрпска православна Црква Светог Арханђела Михаила\n1606 South 1000 West\nSalt Lake City, UT 84104",
      },
    },
    {
      icon: "💳",
      title: { en: "In-Person", sr: "Лично" },
      desc: {
        en: "Donations may be placed in the collection basket during services, or brought to the church office. We are grateful for your support.",
        sr: "Прилози могу бити стављени у корпу за прикупљање прилога током служби или донесени у канцеларију цркве. Захвални смо на вашој подршци.",
      },
    },
  ],
  
  taxNote: {
    en: "St. Archangel Michael Serbian Orthodox Church is a 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent permitted by law. Please retain your receipt for tax purposes.",
    sr: "Српска православна Црква Светог Арханђела Михаила је непрофитна организација 501(c)(3). Све донације су одбитне за порез у мери дозвољеној законом.",
  },
  memorial: {
    en: "Memorial & Dedication Gifts",
    sr: "Меморијалне и посветне донације",
  },
  memorialDesc: {
    en: "Donations may be made in memory of a loved one or in honor of a special occasion — a birthday, anniversary, baptism, or feast day. Please contact the parish office to arrange a memorial gift.",
    sr: "Донације могу бити дате у спомен драге особе или у част посебне прилике — рођендана, годишњице, крштења или празника. Молимо контактирајте канцеларију парохије за договор о меморијалном поклону.",
  },
};

export default function DonationsSection({ lang, gofundmeUrl }: Props) {
  return (
    <section id="donations" style={{
      background: "linear-gradient(180deg, var(--stone) 0%, #ede8df 100%)",
      padding: "96px 40px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            color: "var(--gold-dark)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            {content.subtitle[lang]}
          </div>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--dark-burgundy)",
            marginBottom: 24,
          }}>
            {content.title[lang]}
          </h2>
          <div style={{ width: 60, height: 2, background: "var(--gold-dark)", margin: "0 auto 28px" }} />
          <p style={{
            maxWidth: 680,
            margin: "0 auto",
            color: "var(--text-mid)",
            fontSize: "1.1rem",
            lineHeight: 1.85,
          }}>
            {content.intro[lang]}
          </p>
        </div>

        {/* GoFundMe feature card */}
        {gofundmeUrl && (
          <div style={{
            background: "linear-gradient(135deg, #1a3a1a 0%, #0f2a0f 100%)",
            border: "1px solid rgba(80,160,80,0.3)",
            borderTop: "3px solid #5cb85c",
            padding: "40px 48px",
            marginBottom: 36,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}>
            <div style={{ fontSize: "2.8rem" }}>🙏</div>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#a8d5a2",
              letterSpacing: "0.04em",
            }}>
              {content.gofundme.title[lang]}
            </h3>
            <p style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              maxWidth: 560,
              margin: 0,
            }}>
              {content.gofundme.desc[lang]}
            </p>
            <a
              href={gofundmeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 8,
                background: "#00b964",
                color: "white",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "16px 40px",
                borderRadius: 2,
                boxShadow: "0 4px 16px rgba(0,185,100,0.3)",
                transition: "opacity 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseOut={e => (e.currentTarget.style.opacity = "1")}
            >
              {content.gofundme.button[lang]}
            </a>
          </div>
        )}

        {/* Other donation methods */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 28,
          marginBottom: 56,
        }}>
          {content.methods.map((m, i) => (
            <div key={i} style={{
              background: "white",
              padding: "36px 32px",
              border: "1px solid rgba(107,26,42,0.12)",
              borderTop: "3px solid var(--dark-burgundy)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>{m.icon}</div>
              <h3 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--dark-burgundy)",
                marginBottom: 14,
                letterSpacing: "0.04em",
              }}>
                {m.title[lang]}
              </h3>
              <p style={{
                color: "var(--text-mid)",
                fontSize: "1rem",
                lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}>
                {m.desc[lang]}
              </p>
            </div>
          ))}
        </div>

        <div
  style={{
    marginTop: 40,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 28,
    alignItems: "stretch",
  }}
>
  {/* PayPal Donation */}
  <div
    style={{
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(122, 28, 45, 0.14)",
      padding: 28,
      textAlign: "center",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    }}
  >
    <h3
      style={{
        fontFamily: "'Cinzel', serif",
        color: "var(--maroon)",
        fontSize: "1.35rem",
        marginBottom: 14,
      }}
    >
      Donate by PayPal
    </h3>

    <p style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 22 }}>
      Support St. Archangel Michael Serbian Orthodox Church through PayPal.
    </p>

    <a
      href="https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=PWYTKTLEVSNU6&source=url&ssrt=1777314047907"
      target="_blank"
      rel="noopener noreferrer"
      style={{
         display: "inline-flex",
         alignItems: "center",
         justifyContent: "center",
         minHeight: 52,
  padding: "0 34px",
  background: "linear-gradient(135deg, #4b0012, #7a1c2d)",
  color: "#f7e8b2",
  border: "1px solid rgba(201,165,90,0.75)",
  textDecoration: "none",
  fontFamily: "'Cinzel', serif",
  letterSpacing: "0.1em",
  fontSize: "0.85rem",
  fontWeight: 600,
  textTransform: "uppercase",
  boxShadow: "0 14px 30px rgba(75, 0, 18, 0.25)",
}}
    >
      Donate with PayPal
    </a>
  </div>

  {/* Venmo Donation */}
  <div
    style={{
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(122, 28, 45, 0.14)",
      padding: 28,
      textAlign: "center",
      boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    }}
  >
    <h3
      style={{
        fontFamily: "'Cinzel', serif",
        color: "var(--maroon)",
        fontSize: "1.35rem",
        marginBottom: 10,
      }}
    >
      Donate by Venmo
    </h3>

    <p style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: 18 }}>
      Donations can also be accepted through Venmo.
      <br />
      Find us at{" "}
      <strong>@StArchangelMichael-SerbianChur</strong>
    </p>

    <img
      src="/images/venmo-qr.png"
      alt="Venmo QR code for St. Archangel Michael Serbian Church"
      style={{
        width: "100%",
        maxWidth: 320,
        height: "auto",
        display: "block",
        margin: "0 auto",
      }}
    />
  </div>
</div>

        {/* Memorial gifts */}
        <div style={{
          background: "linear-gradient(135deg, var(--dark-burgundy), #3d1520)",
          padding: "48px 56px",
          color: "white",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 32,
          alignItems: "center",
          marginBottom: 40,
        }} className="responsive-grid">
          <div style={{
            width: 64, height: 64,
            border: "2px solid rgba(201,165,90,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem",
            flexShrink: 0,
          }}>
            🕯️
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Cinzel', serif",
              color: "var(--gold)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: 12,
            }}>
              {content.memorial[lang]}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem", lineHeight: 1.8 }}>
              {content.memorialDesc[lang]}
            </p>
          </div>
        </div>

        {/* Tax note */}
        <p style={{
          textAlign: "center",
          color: "var(--text-mid)",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          opacity: 0.8,
          fontStyle: "italic",
          maxWidth: 700,
          margin: "0 auto",
        }}>
          {content.taxNote[lang]}
        </p>
      </div>
    </section>
  );
}
