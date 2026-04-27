import { useState, useEffect, useRef } from "react";
import { scheduleData as staticSchedule } from "./data/schedule";
import michaelMosaic from "@assets/image_1776786073638.png";
import michaelBW from "@assets/image_1776786172781.png";
import EventsSection from "./EventsSection";
import OrganizationsSection from "./OrganizationsSection";
import DonationsSection from "./DonationsSection";
import AdminPanel from "./AdminPanel";
import NewsSection from "./NewsSection";
import MissionPage from "./MissionPage";

type Lang = "en" | "sr";

const t = {
  churchName: { en: "St. Archangel Michael", sr: "Свети Арханђел Михаило" },
  churchSubtitle: { en: "Serbian Orthodox Church", sr: "Српска Православна Црква" },
  churchCity: { en: "Salt Lake City, Utah", sr: "Солт Лејк Сити, Јута" },
  navHome: { en: "Home", sr: "Почетна" },
  navParish: { en: "Parish", sr: "Парохија" },
  navAbout: { en: "About St. Michael", sr: "О Св. Михаилу" },
  navPriest: { en: "Parish Priest", sr: "Свештеник" },
  navBoard: { en: "Board Members", sr: "Одбор" },
  navHistory: { en: "History", sr: "Историја" },
  navSchedule: { en: "Service Schedule", sr: "Распоред служби" },
  navContact: { en: "Contact", sr: "Контакт" },
  navMembership: { en: "Membership", sr: "Чланство" },
  navCalendar: { en: "Calendar", sr: "Календар" },
  navEvents: { en: "Events", sr: "Дешавања" },
  navOrganizations: { en: "Organizations", sr: "Организације" },
  navDonations: { en: "Donations", sr: "Донације" },
  heroTagline: {
    en: "Welcoming all who seek faith, fellowship, and tradition",
    sr: "Добродошли свима који траже веру, заједницу и традицију",
  },
  heroText: {
    en: "We are a Serbian Orthodox parish in Salt Lake City, Utah — a place of prayer, worship, and belonging for Serbian Orthodox Christians and all who wish to draw near to the ancient Christian faith.",
    sr: "Ми смо српска православна парохија у Солт Лејк Ситију, Јута — место молитве, богослужења и припадности за српске православне хришћане и све оне који желе да се приближе древној хришћанској вери.",
  },
  heroBtn: { en: "Our Parish", sr: "Наша парохија" },
  heroBtn2: { en: "Service Schedule", sr: "Распоред служби" },
  aboutTitle: { en: "St. Archangel Michael", sr: "Свети Арханђел Михаило" },
  aboutSubtitle: { en: "Our Patron and Protector", sr: "Наш заштитник и покровитељ" },
  aboutText1: {
    en: 'The name Michael comes from the Hebrew "Mikha\'el," meaning "Who is like God?" — a rhetorical declaration that no created being can equal the Almighty. In the Serbian Orthodox tradition, St. Michael is honored as the leader of God\'s angelic hosts, the fearless champion who cast down the rebellious angels and stands as an eternal guardian over the faithful. He is shown in iconography holding a sword and scales — symbols of both divine power and righteous judgment.',
    sr: 'Име Михаило потиче од хебрејског „Михаел," које значи „Ко је као Бог?" — реторичка изјава да ниједно створено биће не може бити равно Свевишњем. У српском православном предању, Свети Михаило се поштује као вођа Божијих анђеоских сила, неустрашиви јунак који је збацио побуњене анђеле и стоји као вечни чувар над верним народом. У иконографији га приказују са мачем и вагом — симболима божанске моћи и праведног суда.',
  },
  aboutText2: {
    en: "Every year on November 21st, Serbian Orthodox families across the world celebrate Aranđelovdan — the feast of St. Archangel Michael. For many Serbian families, this is also their Slava, the cherished tradition of honoring a household's patron saint passed down through generations. At our parish in Salt Lake City, this day is a time of solemn liturgy, warm fellowship, and gratitude for the heavenly protector who watches over our community.",
    sr: "Сваке године 21. новембра, српске православне породице широм света прослављају Аранђеловдан — празник Светог Арханђела Михаила. За многе српске породице, ово је такође и њихова Крсна слава — драгоцена традиција поштовања патронског свеца домаћинства која се преноси кроз генерације. У нашој парохији у Солт Лејк Ситију, овај дан је прилика за свечану литургију, топло братство и захвалност небеском заштитнику који бди над нашом заједницом.",
  },
  priestTitle: { en: "Our Parish Priest", sr: "Наш Парохијски Свештеник" },
  priestBio: {
    en: "Father Nemanja Plavšić was born in 1996 in Prijedor, Bosnia and Herzegovina. He began his theological formation at the St. Three Hierarchs Seminary at Krka Monastery in Croatia and later continued his studies at the St. Sava Serbian Orthodox School of Theology in Libertyville, Illinois. Father Nemanja’s parents remain in Bosnia and Herzegovina, while his sister lives in Canada. He is married to Sanja, who was born in Bosnia and Herzegovina and raised in Phoenix, Arizona. Together, they are blessed with a daughter, Mila. Rooted in the Serbian Orthodox faith and shaped by family ties across Bosnia and Herzegovina, Canada, and the American West, Father Nemanja and his family bring a strong connection to the Serbian Orthodox tradition and the wider diaspora community. Father Nemanja currently serves the Serbian Orthodox faithful of Salt Lake City and the surrounding area, offering spiritual guidance through worship, pastoral care, parish life, and fellowship.",
    sr: "Отац Немања Плавшић рођен је 1996. године у Приједору, у Босни и Херцеговини. Своје богословско образовање започео је у Богословији Света Три Јерарха при манастиру Крка у Хрватској, а потом је наставио школовање у Српској православној богословској школи Светог Саве у Либертивилу, Илиноис. Родитељи оца Немање и даље живе у Босни и Херцеговини, док његова сестра живи у Канади. Ожењен је Сањом, која је рођена у Босни и Херцеговини, а одрасла је у Финиксу, Аризона. Заједно су благословени кћерком Милом. Укорењени у српској православној вери и повезани породичним везама које се протежу кроз Босну и Херцеговину, Канаду и амерички Запад, отац Немања и његова породица доносе снажну повезаност са српском православном традицијом и широм дијаспором. Отац Немања тренутно служи српским православним верницима у Солт Лејк Ситију и околини, пружајући духовно вођство кроз богослужење, пастирску бригу, парохијски живот и заједништво.",
  },
  priestPhone: { en: "Phone", sr: "Телефон" },
  historyTitle: { en: "History of Orthodox Serbs", sr: "Историја православних Срба" },
  historySubtitle: { en: "in Salt Lake City", sr: "у Солт Лејк Ситију" },
  historyText: {
    en: "Serbian immigrants first came to Utah in the late 19th and early 20th centuries, seeking a better life and work in the coal mines, copper smelters, railroads, construction, and other demanding labor fields of the American West. Many left behind poverty, hardship, war, and loved ones in their homeland, hoping to support their families both in America and back home. Although far from the land of their ancestors, they carried with them the Serbian Orthodox faith, which became an anchor for preserving their language, customs, sacred traditions, and community life. In the early twentieth century, Serbian settlers in Midvale, Utah, established a parish dedicated to St. Archangel Michael. For many years, the parish served as a spiritual and cultural home for Serbian Orthodox Christians in the area. Unfortunately, due to declining membership, the original parish was eventually dissolved. Aside from a few treasured records and the old parish graveyard, little written history from that period remains. Many decades later, a new wave of religious, political, and economic immigrants from the former Yugoslavia settled in Salt Lake City and the surrounding area. With renewed faith and determination, St. Archangel Michael Serbian Orthodox Church was re-established in 1997. After nearly ten years of struggle and dedication, the parish purchased a building in 2006 to provide a permanent place for divine services, cultural gatherings, and community activities. One of the most meaningful connections to the early Serbian community in Utah came through Sofia Piedmont Lovrich, a descendant of the early Serbian settlers. At the age of 98, although she had never visited the homeland of her ancestors, she still spoke Serbian beautifully and began attending church services with great joy. Before her passing in 2010, she remembered the parish in her will with a generous contribution. Her gift helped the parish pay off the mortgage on the church building and begin a new chapter in its life. Today, St. Archangel Michael Serbian Orthodox Church continues its founding mission: to serve Serbian Orthodox Christians in Utah and to provide a spiritual home where the faithful can gather for worship, baptisms, weddings, memorial services, feast days, fellowship, and cultural life. The parish serves long-established Serbian families, newer immigrants, and all who seek the Orthodox Christian faith, preserving the sacred traditions of the Serbian Orthodox Church for future generations.",
    sr: "Српски досељеници су први пут дошли у Јуту крајем 19. и почетком 20. вијека, тражећи бољи живот и посао у рудницима угља, топионицама бакра, на жељезници, у грађевинарству и другим тешким радним пословима америчког Запада. Многи су иза себе оставили сиромаштво, тешкоће, рат и своје најмилије у отаџбини, надајући се да ће моћи да издржавају своје породице и у Америци и код куће. Иако далеко од земље својих предака, са собом су понијели српску православну вјеру, која је постала ослонац у очувању језика, обичаја, свештених традиција и заједничког живота. Почетком 20. вијека, српски досељеници у Мидвејлу, у Јути, основали су парохију посвећену Светом архангелу Михаилу. Много година парохија је служила као духовни и културни дом српских православних хришћана у том подручју. Нажалост, због смањења броја чланова, првобитна парохија је временом угашена. Осим неколико драгоцјених записа и старог парохијског гробља, мало је писаних трагова остало из тог периода. Много деценија касније, након што се нови талас вјерских, политичких и економских имиграната из бивше Југославије населио у Солт Лејк Ситију и околини, Српска православна црква Светог архангела Михаила поново је основана 1997. године. Након скоро десет година труда, борбе и преданости, парохија је 2006. године купила зграду како би обезбиједила стално мјесто за богослужења, културна окупљања и друге заједничке активности. Једна од најзначајнијих веза са раном српском заједницом у Јути била је Софија Пијемонт Ловрић, потомак раних српских досељеника. У 98. години живота, иако никада није посјетила земљу својих предака, и даље је лијепо говорила српски језик и са великом радошћу почела да долази на богослужења. Прије свог упокојења 2010. године, у свом тестаменту се сјетила парохије и оставила јој великодушан прилог. Њен дар помогао је парохији да отплати кредит за црквену зграду и започне ново поглавље у свом животу. Данас Српска православна црква Светог архангела Михаила наставља своју првобитну мисију: да служи српским православним хришћанима у Јути и да пружи духовни дом у којем се вјерни могу окупљати на богослужењима, крштењима, вјенчањима, парастосима, великим празницима, дружењима и културном животу. Парохија служи старим српским породицама, новим досељеницима и свима који траже православну хришћанску вјеру, чувајући свештене традиције Српске православне цркве за будуће генерације.",
  },
  scheduleTitle: { en: "Monthly Service Schedule", sr: "Месечни распоред служби" },
  scheduleNote: {
    en: "For special services and feast days, please contact the parish.",
    sr: "За посебне службе и празнике, молимо контактирајте парохију.",
  },
  contactTitle: { en: "Contact Us", sr: "Контактирајте нас" },
  contactAddress: { en: "Address", sr: "Адреса" },
  contactPriest: { en: "Parish Priest", sr: "Парохијски свештеник" },
  contactFollow: { en: "Follow Us", sr: "Пратите нас" },
  contactFormTitle: { en: "Send Us a Message", sr: "Пошаљите нам поруку" },
  contactName: { en: "Your Name", sr: "Ваше Име" },
  contactReason: { en: "Reason / Message", sr: "Разлог / Порука" },
  contactReasonNote: { en: "Maximum 500 characters", sr: "Максимално 500 знакова" },
  contactYours: { en: "Your Contact (email or phone)", sr: "Ваш контакт (е-пошта или телефон)" },
  contactSubmit: { en: "Send Message", sr: "Пошаљи поруку" },
  membershipTitle: { en: "Become a Member", sr: "Постаните члан" },
  membershipDesc: {
    en: "To become a member of St. Archangel Michael Serbian Orthodox Church, please complete the membership application form below. Completed forms are reviewed by our parish council.",
    sr: "Да бисте постали члан Цркве Светог Арханђела Михаила, молимо попуните формулар за чланство испод. Попуњени обрасци се прегледају од стране нашег парохијског одбора.",
  },
  memberPersonal: { en: "Personal Information", sr: "Лични подаци" },
  memberSurname: { en: "Surname", sr: "Презиме" },
  memberName: { en: "Name", sr: "Ime" },
  memberDob: { en: "Date of Birth", sr: "Датум рођења" },
  memberPob: { en: "Place of Birth", sr: "Место рођења" },
  memberDobaptism: { en: "Date of Baptism", sr: "Датум крштења" },
  memberPobaptism: { en: "Place of Baptism", sr: "Место крштења" },
  memberMarital: { en: "Marital Status", sr: "Брачно стање" },
  memberSpouse: { en: "Name of Spouse", sr: "Име супружника" },
  memberChildren: { en: "Number of Children", sr: "Број деце" },
  memberChildrenNames: { en: "Names of Children", sr: "Имена деце" },
  memberTel: { en: "Telephone", sr: "Телефон" },
  memberEmail: { en: "Email", sr: "Е-пошта" },
  memberAddress: { en: "Home Address", sr: "Кућна адреса" },
  memberSlava: { en: "Patron Saint (Slava)", sr: "Крсна слава" },
  memberFromParish: { en: "Previous Parish", sr: "Претходна парохија" },
  memberSubmit: { en: "Submit Application", sr: "Поднеси пријаву" },
  memberContact: { en: "Contact Information", sr: "Контакт информације" },
  memberChurch: { en: "Church Information", sr: "Подаци о цркви" },
  footerRights: { en: "All rights reserved.", sr: "Сва права задржана." },
  muteMusic: { en: "Mute", sr: "Искључи" },
  unmuteMusic: { en: "Music", sr: "Укључи" },
  boardTitle: { en: "Board Members", sr: "Чланови одбора" },
  boardDesc: {
    en: "Our parish is guided by a dedicated board of community members who serve with faith and commitment.",
    sr: "Нашом парохијом руководи посвећени одбор чланова заједнице који служе са вером и посвећеношћу.",
  },
};

const tx = (key: keyof typeof t, lang: Lang): string =>
  (t[key] as Record<Lang, string>)[lang];

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [muted, setMuted] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [memberSubmitted, setMemberSubmitted] = useState(false);
  const [memberError, setMemberError] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState(staticSchedule);
  const [historyData, setHistoryData] = useState<{
    introEn: string;
    introSr: string;
    images: string[];
    timeline: { year: string; yearSr: string; textEn: string; textSr: string }[];
  } | null>(null);

  const ddTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLIFrameElement>(null);

  function openDd(name: string) {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    setOpenDropdown(name);
  }

  function closeDd() {
    ddTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  }

  useEffect(() => {
    fetch("/api/church/schedule")
      .then((r) => r.json())
      .then((data: typeof staticSchedule) => {
        if (data?.monthEn) setScheduleData(data);
      })
      .catch(() => {});

    fetch("/api/church/history")
      .then((r) => r.json())
      .then((data: typeof historyData) => {
        if (data && (data.introEn || data.timeline?.length)) {
          setHistoryData(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    setFormLoading(true);
    setFormError(false);

    try {
      const res = await fetch("/api/church/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          message: fd.get("message"),
          contact: fd.get("contact"),
        }),
      });

      if (res.ok) {
        setFormSubmitted(true);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setFormSubmitted(false), 6000);
      } else {
        setFormError(true);
        setTimeout(() => setFormError(false), 5000);
      }
    } catch {
      setFormError(true);
      setTimeout(() => setFormError(false), 5000);
    } finally {
      setFormLoading(false);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    setMemberLoading(true);
    setMemberError(false);

    try {
      const body: Record<string, string> = {};

      fd.forEach((v, k) => {
        body[k] = v as string;
      });

      const res = await fetch("/api/church/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMemberSubmitted(true);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setMemberSubmitted(false), 6000);
      } else {
        setMemberError(true);
        setTimeout(() => setMemberError(false), 5000);
      }
    } catch {
      setMemberError(true);
      setTimeout(() => setMemberError(false), 5000);
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif" }}>
      {/* ===== YouTube iframe (hidden, for audio) ===== */}
      <iframe
        ref={audioRef}
        id="ytAudio"
        src={`https://www.youtube.com/embed/xbm5IF25DkI?autoplay=1&loop=1&playlist=xbm5IF25DkI&mute=${
          muted ? 1 : 0
        }&controls=0&enablejsapi=1`}
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          bottom: 0,
          left: 0,
        }}
        allow="autoplay"
        title="background music"
      />

     <style>{`
  .nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    align-items: center;
    height: 72px;
    min-width: 0;
  }

  .brand-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: auto;
    min-width: 0;
    flex-shrink: 1;
  }

  .brand-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--dark-bg);
    font-weight: bold;
    font-family: "Cinzel", serif;
    flex: 0 0 auto;
  }

  .brand-text {
    text-align: left;
    min-width: 0;
  }

  .brand-name {
    font-family: "Cinzel", serif;
    color: var(--gold-light);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    line-height: 1.2;
    white-space: nowrap;
  }

  .brand-subtitle {
    color: rgba(255,255,255,0.6);
    font-size: 0.62rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    line-height: 1.2;
    white-space: nowrap;
  }

  .desktop-nav {
    display: flex !important;
    align-items: center;
    gap: 28px;
    margin-left: 28px;
    margin-right: 250px;
    min-width: 0;
  }

  .hidden-mobile {
    display: flex !important;
  }

  .show-mobile {
    display: none !important;
  }

  .fixed-controls {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 20000;
    display: flex !important;
    gap: 14px;
    pointer-events: auto;
  }

  .fixed-controls button {
    pointer-events: auto;
  }

  .mobile-menu-button {
    background: none;
    border: 1px solid rgba(201,165,90,0.55);
    cursor: pointer;
    color: var(--gold-light);
    padding: 10px;
    margin-left: auto;
    min-width: 46px;
    min-height: 46px;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(10, 3, 6, 0.97);
    padding: 24px;
    overflow-y: auto;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateX(100%);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  }

  .mobile-menu.open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(0);
  }

  @media (max-width: 1180px) {
    .desktop-nav {
      gap: 18px;
      margin-right: 0;
    }
  }

  @media (max-width: 900px) {
    .hidden-mobile,
    .desktop-nav,
    .fixed-controls {
      display: none !important;
    }

    .show-mobile {
      display: flex !important;
    }

    .nav-inner {
      padding: 0 14px;
    }

    .brand-text {
      max-width: 205px;
      overflow: hidden;
    }

    .brand-name,
    .brand-subtitle {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media (max-width: 420px) {
    .brand-text {
      max-width: 165px;
    }

    .brand-name {
      font-size: 0.68rem;
    }

    .brand-subtitle {
      font-size: 0.5rem;
      letter-spacing: 0.1em;
    }
  }
    
`}</style>

      {/* ===== FIXED CONTROLS ===== */}
      <div className="fixed-controls">
        <button
          type="button"
          className="lang-btn"
          onClick={() => setLang((l) => (l === "en" ? "sr" : "en"))}
          aria-label="Toggle language"
        >
          {lang === "en" ? "Српски" : "English"}
        </button>

        <button
          type="button"
          className="music-btn"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute music" : "Mute music"}
        >
          <span style={{ fontSize: "1rem" }}>{muted ? "🔇" : "🔊"}</span>
          {muted ? tx("unmuteMusic", lang) : tx("muteMusic", lang)}
        </button>
      </div>

      {/* ===== MOBILE MENU ===== */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} style={{ zIndex: 9999 }}>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "none",
            border: "1px solid rgba(201,165,90,0.45)",
            color: "rgba(255,255,255,0.85)",
            fontSize: "2rem",
            cursor: "pointer",
            lineHeight: 1,
            width: 48,
            height: 48,
          }}
        >
          ×
        </button>

        <div
          style={{
            color: "var(--gold)",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          ✦ MENU ✦
        </div>

        {[
          ["home", tx("navHome", lang)],
          ["about", tx("navAbout", lang)],
          ["priest", tx("navPriest", lang)],
          ["history", tx("navHistory", lang)],
          ["schedule", tx("navSchedule", lang)],
          ["news", lang === "en" ? "News" : "Вести"],
          ["board", tx("navBoard", lang)],
          ["events", tx("navEvents", lang)],
          ["_mission", lang === "en" ? "Mission" : "Мисија"],
          ["organizations", tx("navOrganizations", lang)],
          ["donations", tx("navDonations", lang)],
          ["contact", tx("navContact", lang)],
          ["membership", tx("navMembership", lang)],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="mobile-nav-link"
            onClick={() => {
              setMobileOpen(false);

              if (id === "_mission") {
                setShowMission(true);
              } else {
                scrollTo(id);
              }
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}

        <div
          style={{
            borderTop: "1px solid rgba(201,165,90,0.25)",
            marginTop: 18,
            paddingTop: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => setLang((l) => (l === "en" ? "sr" : "en"))}
            style={{
              background: "none",
              border: "1px solid rgba(201,165,90,0.35)",
              cursor: "pointer",
            }}
          >
            {lang === "en" ? "Српски" : "English"}
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => setMuted((m) => !m)}
            style={{
              background: "none",
              border: "1px solid rgba(201,165,90,0.35)",
              cursor: "pointer",
            }}
          >
            {muted ? "🔇 " : "🔊 "}
            {muted ? tx("unmuteMusic", lang) : tx("muteMusic", lang)}
          </button>
        </div>
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className={`navbar ${navScrolled ? "scrolled" : "at-top"}`}>
        <div className="nav-inner">
          {/* Logo / Brand */}
          <button
            type="button"
            onClick={() => scrollTo("home")}
            className="brand-button"
            aria-label="Go to home section"
          >
            <div className="brand-icon">✦</div>

            <div className="brand-text">
              <div className="brand-name">{tx("churchName", lang)}</div>
              <div className="brand-subtitle">{tx("churchSubtitle", lang)}</div>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="desktop-nav hidden-mobile">
            <button
              type="button"
              className="nav-link"
              onClick={() => scrollTo("home")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {tx("navHome", lang)}
            </button>

            {/* Parish dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => openDd("parish")}
              onMouseLeave={closeDd}
            >
              <span
                className="nav-link"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {tx("navParish", lang)}
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="currentColor"
                  style={{ opacity: 0.6 }}
                >
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </span>

              <div
                className="dropdown-menu"
                style={{
                  opacity: openDropdown === "parish" ? 1 : 0,
                  visibility: openDropdown === "parish" ? "visible" : "hidden",
                  transform: `translateX(-50%) translateY(${
                    openDropdown === "parish" ? 0 : -8
                  }px)`,
                  pointerEvents: openDropdown === "parish" ? "auto" : "none",
                }}
              >
                {[
                  ["about", tx("navAbout", lang)],
                  ["priest", tx("navPriest", lang)],
                  ["board", tx("navBoard", lang)],
                  ["history", tx("navHistory", lang)],
                  ["membership", tx("navMembership", lang)],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      scrollTo(id);
                      setOpenDropdown(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="nav-link"
              onClick={() => scrollTo("schedule")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {tx("navSchedule", lang)}
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => scrollTo("news")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {lang === "en" ? "News" : "Вести"}
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => scrollTo("events")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {tx("navEvents", lang)}
            </button>

            <button
              type="button"
              className="nav-link"
              onClick={() => setShowMission(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {lang === "en" ? "Mission" : "Мисија"}
            </button>

            {/* Community dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => openDd("community")}
              onMouseLeave={closeDd}
            >
              <span
                className="nav-link"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {lang === "en" ? "Community" : "Заједница"}
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="currentColor"
                  style={{ opacity: 0.6 }}
                >
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </span>

              <div
                className="dropdown-menu"
                style={{
                  opacity: openDropdown === "community" ? 1 : 0,
                  visibility: openDropdown === "community" ? "visible" : "hidden",
                  transform: `translateX(-50%) translateY(${
                    openDropdown === "community" ? 0 : -8
                  }px)`,
                  pointerEvents: openDropdown === "community" ? "auto" : "none",
                }}
              >
                {[
                  ["organizations", tx("navOrganizations", lang)],
                  ["donations", tx("navDonations", lang)],
                  ["contact", tx("navContact", lang)],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      scrollTo(id);
                      setOpenDropdown(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="mobile-menu-button show-mobile"
            aria-label="Open menu"
          >
            <svg
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="hero-section">
        {/* B&W fresco background on right side */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "52%", height: "100%",
          backgroundImage: `url(${michaelBW})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          zIndex: 0,
          maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.85) 100%)",
        }} />
        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(26,10,14,0.98) 35%, rgba(26,10,14,0.65) 65%, rgba(26,10,14,0.3) 100%)",
          zIndex: 1,
        }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "0 40px", width: "100%" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div className="gold-divider-left" />
              <span style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>
                {tx("churchCity", lang)}
              </span>
            </div>
            {/* Church name is the main headline */}
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(2rem, 3.8vw, 3.5rem)",
              fontWeight: 700,
              color: "var(--gold)",
              lineHeight: 1.2,
              letterSpacing: "0.02em",
              marginBottom: 10,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}>
              {tx("churchName", lang)}
            </h1>
            {/* Subtitle line */}
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 28,
            }}>
              {tx("churchSubtitle", lang)}
            </div>
            <div style={{ width: 56, height: 2, background: "var(--gold-dark)", marginBottom: 28 }} />
            <p style={{
              fontSize: "clamp(1.1rem, 1.5vw, 1.22rem)",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 560,
            }}>
              {tx("heroText", lang)}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button className="btn-gold" onClick={() => scrollTo("about")}>
                {tx("heroBtn", lang)}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button className="btn-gold" onClick={() => scrollTo("schedule")} style={{ borderColor: "rgba(201,165,90,0.4)" }}>
                {tx("heroBtn2", lang)}
              </button>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, transparent, var(--gold))" }} />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--gold)">
            <path d="M12 16l-6-6h12z"/>
          </svg>
        </div>
      </section>

      {/* ===== THREE PILLARS ===== */}
      <section className="section-stone-dark" style={{ padding: "72px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
          {[
            {
              icon: "✦",
              title: lang === "en" ? "Faith" : "Вера",
              text: lang === "en"
                ? "Grounded in the ancient traditions of the Serbian Orthodox Church, maintaining the sacred liturgical life of our community."
                : "Утемељени у древним традицијама Српске православне цркве, чувајући свети богослужбени живот наше заједнице.",
            },
            {
              icon: "⛪",
              title: lang === "en" ? "Community" : "Заједница",
              text: lang === "en"
                ? "A vibrant gathering of Serbian Orthodox Christians in Salt Lake City, united by faith, language, and heritage."
                : "Живахно окупљање српских православних хришћана у Солт Лејк Ситију, уједињених вером, језиком и наслеђем.",
            },
            {
              icon: "🕊",
              title: lang === "en" ? "Heritage" : "Наслеђе",
              text: lang === "en"
                ? "Preserving Serbian Orthodox culture and passing it to future generations through worship, education, and fellowship."
                : "Чување српске православне културе и преношење је будућим генерацијама кроз богослужење, образовање и заједништво.",
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: "white",
              padding: "40px 32px",
              borderTop: "3px solid var(--gold)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              <div style={{ fontSize: "1.8rem", color: "var(--gold-dark)" }}>{item.icon}</div>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--text-dark)", letterSpacing: "0.05em" }}>
                {item.title}
              </h3>
              <p style={{ color: "var(--text-mid)", fontSize: "1.05rem", lineHeight: 1.75 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ST. MICHAEL ===== */}
      <section id="about" className="section-stone" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="responsive-grid">
            {/* Image side — mosaic icon */}
            <div style={{ position: "relative" }}>
              <div style={{
                background: "linear-gradient(135deg, var(--dark-burgundy), #3d1520)",
                padding: 10,
                boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
              }}>
                <img
                  src={michaelMosaic}
                  alt="St. Archangel Michael — Byzantine mosaic icon"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    border: "1px solid rgba(201,165,90,0.3)",
                  }}
                />
              </div>
              {/* Caption bar */}
              <div style={{
                background: "linear-gradient(135deg, var(--dark-burgundy), #2a1218)",
                padding: "12px 20px",
                borderTop: "2px solid var(--gold)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <div style={{ width: 28, height: 1, background: "var(--gold)" }} />
                <span style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-light)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {lang === "en" ? "Byzantine Mosaic Icon" : "Византијска мозаик икона"}
                </span>
              </div>
              {/* Corner gold square */}
              <div style={{
                position: "absolute", bottom: 42, right: -14,
                width: 56, height: 56,
                background: "var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              }}>✦</div>
            </div>

            {/* Text side */}
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
                {lang === "en" ? "Our Patron Saint" : "Наш заштитник"}
              </div>
              <h2 className="section-heading" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.15, marginBottom: 8 }}>
                {tx("aboutTitle", lang)}
              </h2>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: "var(--gold-dark)", fontWeight: 400, marginBottom: 32 }}>
                {tx("aboutSubtitle", lang)}
              </h3>
              <div className="gold-divider-left" style={{ marginBottom: 32 }} />
              <p style={{ color: "var(--text-mid)", fontSize: "1.1rem", lineHeight: 1.85, marginBottom: 20 }}>
                {tx("aboutText1", lang)}
              </p>
              <p style={{ color: "var(--text-mid)", fontSize: "1.1rem", lineHeight: 1.85, marginBottom: 32 }}>
                {tx("aboutText2", lang)}
              </p>
              <div style={{
                background: "linear-gradient(135deg, var(--dark-burgundy), #2a1218)",
                padding: "20px 24px",
                borderLeft: "4px solid var(--gold)",
              }}>
                <p style={{ color: "var(--gold-light)", fontFamily: "'Crimson Pro', serif", fontSize: "1.1rem", fontStyle: "italic", lineHeight: 1.7 }}>
                  {lang === "en"
                    ? "\"Aranđelovdan\" — the Feast of St. Archangel Michael — is celebrated on November 21st in the Serbian Orthodox calendar."
                    : "\"Аранђеловдан\" — Празник Светог Арханђела Михаила — прославља се 21. новембра по српском православном календару."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARISH PRIEST ===== */}
      <section id="priest" className="section-stone-dark" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
            {lang === "en" ? "Our Clergy" : "Наше свештенство"}
          </div>
          <h2 className="section-heading" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: 16 }}>
            {tx("priestTitle", lang)}
          </h2>
          <div className="gold-divider" style={{ marginBottom: 56 }} />
          
          <div style={{
            background: "white",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 0,
            boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
            overflow: "hidden",
            textAlign: "left",
          }} className="responsive-grid">
            {/* Left accent */}
            <div style={{
              background: "linear-gradient(135deg, var(--dark-burgundy), #2a1218)",
              width: 8,
              minHeight: 200,
            }} />
            
            {/* Content */}
            <div style={{ padding: "40px 40px 40px 32px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
                <div style={{
                  width: 80, height: 80,
                  background: "linear-gradient(135deg, var(--dark-burgundy), #4d1a28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  color: "var(--gold)",
                  flexShrink: 0,
                }}>✝</div>
                <div>
                  <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: 4 }}>
                    Fr. Nemanja Plavšić
                  </h3>
                  <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    {lang === "en" ? "Parish Priest" : "Парохијски свештеник"}
                  </div>
                </div>
              </div>
              <p style={{ color: "var(--text-mid)", fontSize: "1.08rem", lineHeight: 1.85, marginBottom: 24 }}>
                {tx("priestBio", lang)}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: "1px solid var(--stone-dark)" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-mid)" }}>
                  {tx("priestPhone", lang)}:
                </div>
                <a href="tel:8476682643" style={{ color: "var(--gold-dark)", fontFamily: "'Cinzel', serif", fontWeight: 500, fontSize: "1.05rem", textDecoration: "none" }}>
                  (847) 668-2643
                </a>
                <a href="mailto:fr.nemanjaplavsic@gmail.com" style={{ color: "var(--gold-dark)", fontFamily: "'Cinzel', serif", fontWeight: 500, fontSize: "0.95rem", textDecoration: "none", marginLeft: 8, display: "block", marginTop: 4 }}>
                  fr.nemanjaplavsic@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICE SCHEDULE ===== */}
      <section id="schedule" className="section-dark" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
              {lang === "en" ? "Liturgical Calendar" : "Богослужбени календар"}
            </div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "white", fontWeight: 600, marginBottom: 16 }}>
              {tx("scheduleTitle", lang)}
            </h2>
            <div className="gold-divider" />
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,165,90,0.2)",
          }}>
            {/* Month header */}
            <div style={{
              background: "rgba(201,165,90,0.12)",
              padding: "20px 32px",
              borderBottom: "1px solid rgba(201,165,90,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "1.2rem", fontWeight: 600 }}>
                {lang === "en" ? scheduleData.monthEn : scheduleData.monthSr}
              </h3>
              <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.15em" }}>
                {new Date().getFullYear()}
              </div>
            </div>

            {/* Schedule rows */}
            {scheduleData.services.map((service, i) => (
              <div key={i} className="schedule-row" style={{
                padding: "18px 32px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "12px 24px",
                alignItems: "center",
                flexWrap: "wrap",
              }}>
                <div style={{
                  width: 48, height: 48,
                  background: "rgba(201,165,90,0.1)",
                  border: "1px solid rgba(201,165,90,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "1.1rem", fontWeight: 700, lineHeight: 1 }}>
                    {service.day}
                  </span>
                </div>
                <div>
                  <div style={{ color: "white", fontFamily: "'Cinzel', serif", fontSize: "0.95rem", fontWeight: 500, marginBottom: 2 }}>
                    {lang === "en" ? service.titleEn : service.titleSr}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                    {lang === "en" ? service.dowEn : service.dowSr}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Cinzel', serif",
                  color: "var(--gold)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}>
                  {service.time}
                </div>
              </div>
            ))}

            {/* Footer note */}
            <div style={{
              padding: "16px 32px",
              borderTop: "1px solid rgba(201,165,90,0.15)",
              background: "rgba(0,0,0,0.2)",
            }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontStyle: "italic", fontSize: "0.95rem" }}>
                {tx("scheduleNote", lang)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HISTORY ===== */}
      <section id="history" className="section-stone" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="responsive-grid">
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
                {lang === "en" ? "Our Roots" : "Наши корени"}
              </div>
              <h2 className="section-heading" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.2, marginBottom: 8 }}>
                {tx("historyTitle", lang)}
              </h2>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1rem, 1.8vw, 1.3rem)", color: "var(--gold-dark)", fontWeight: 400, marginBottom: 32 }}>
                {tx("historySubtitle", lang)}
              </h3>
              <div className="gold-divider-left" style={{ marginBottom: 32 }} />
              <p style={{ color: "var(--text-mid)", fontSize: "1.1rem", lineHeight: 1.85 }}>
                {historyData
                  ? (lang === "en" ? historyData.introEn : (historyData.introSr || historyData.introEn))
                  : tx("historyText", lang)}
              </p>
              {/* Gallery */}
              {historyData && historyData.images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8, marginTop: 32 }}>
                  {historyData.images.map(url => (
                    <img key={url} src={url} alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block", border: "2px solid rgba(107,26,42,0.15)" }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(historyData && historyData.timeline.length > 0
                ? historyData.timeline.map(item => ({
                    year: lang === "en" ? item.year : (item.yearSr || item.year),
                    text: lang === "en" ? item.textEn : (item.textSr || item.textEn),
                  }))
                : [
                    { year: "Early 1900s", text: lang === "en" ? "Serbian immigrants arrive in Utah for mining & railroads. In the town of Midvale, they established a parish dedicated to St. Archangel Michael" : "Српски имигранти долазе у Јуту ради рударства и железнице. У граду Мидвејлу основали су парохију посвећену Светом архангелу Михаилу." },
                    { year: "Generations", text: lang === "en" ? "Faith and traditions passed down through Serbian families" : "Вера и традиције преношене кроз српске породице" },
                    { year: "1997", text: lang === "en" ? "St. Archangel Michael Church re-established in Salt Lake City" : "Црква Светог архангела Михаила поново је основана у Солт Лејк Ситију." },
                    { year: lang === "en" ? "Today" : "Данас", text: lang === "en" ? "A growing community serving Serbian Orthodox Christians in Utah" : "Растућа заједница која служи српским православцима у Јути" },
                  ]
              ).map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em", paddingTop: 4, minWidth: 90, whiteSpace: "nowrap" }}>
                    {item.year}
                  </div>
                  <div style={{ flex: 1, borderLeft: "2px solid var(--gold-light)", paddingLeft: 20, paddingBottom: 8 }}>
                    <p style={{ color: "var(--text-mid)", fontSize: "1rem", lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOARD MEMBERS ===== */}
      <section id="board" className="section-stone-dark" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
            {lang === "en" ? "Parish Leadership" : "Парохијско руководство"}
          </div>
          <h2 className="section-heading" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: 16 }}>
            {tx("boardTitle", lang)}
          </h2>
          <div className="gold-divider" style={{ marginBottom: 24 }} />
          <p style={{ color: "var(--text-mid)", fontSize: "1.1rem", lineHeight: 1.75, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
            {tx("boardDesc", lang)}
          </p>
          <div style={{
            background: "white",
            padding: "40px",
            border: "1px solid var(--stone-dark)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <p style={{ color: "var(--text-mid)", fontStyle: "italic", fontSize: "1.05rem" }}>
              {lang === "en"
                ? "Board member information will be published here. Please contact the parish office for current board member details."
                : "Информације о члановима одбора биће објављене овде. Молимо контактирајте парохијску канцеларију за тренутне детаље о члановима одбора."}
            </p>
          </div>
        </div>
      </section>

      {/* ===== NEWS ===== */}
      <NewsSection lang={lang} />

      {/* ===== EVENTS ===== */}
      <EventsSection lang={lang} />

      {/* ===== ORGANIZATIONS ===== */}
      <OrganizationsSection lang={lang} />

      {/* ===== DONATIONS ===== */}
      <DonationsSection lang={lang} gofundmeUrl={scheduleData.gofundmeUrl} />

      {/* ===== CONTACT ===== */}
      <section id="contact" className="section-white" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
              {lang === "en" ? "Get in Touch" : "Контактирајте нас"}
            </div>
            <h2 className="section-heading" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: 16 }}>
              {tx("contactTitle", lang)}
            </h2>
            <div className="gold-divider" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="responsive-grid">
            {/* Info column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                {
                  icon: "📍",
                  title: tx("contactAddress", lang),
                  content: <><p>1606 South 1000 West</p><p>Salt Lake City, Utah 84104</p></>,
                },
                {
                  icon: "✝",
                  title: tx("contactPriest", lang),
                  content: <><p>Fr. Nemanja Plavšić</p><a href="tel:8476682643" style={{ color: "var(--gold-dark)", textDecoration: "none" }}>(847) 668-2643</a><br /><a href="mailto:fr.nemanjaplavsic@gmail.com" style={{ color: "var(--gold-dark)", textDecoration: "none", fontSize: "0.95rem" }}>fr.nemanjaplavsic@gmail.com</a></>,
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 20 }}>
                  <div className="icon-box">
                    <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dark)", marginBottom: 8 }}>
                      {item.title}
                    </h4>
                    <div style={{ color: "var(--text-mid)", fontSize: "1.05rem", lineHeight: 1.7 }}>
                      {item.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div>
                <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dark)", marginBottom: 16 }}>
                  {tx("contactFollow", lang)}
                </h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a
                    href="https://www.facebook.com/crkvasvetogarhangelamihailaslc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                    style={{ fontSize: "0.7rem", padding: "10px 20px", color: "var(--text-dark)", borderColor: "var(--gold-dark)" }}
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/crkvasvetogarhangelamihailaslc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                    style={{ fontSize: "0.7rem", padding: "10px 20px", color: "var(--text-dark)", borderColor: "var(--gold-dark)" }}
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Form column */}
            <div>
              <div style={{ borderTop: "3px solid var(--gold)", paddingTop: 32 }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", fontWeight: 600, color: "var(--text-dark)", marginBottom: 8 }}>
                  {tx("contactFormTitle", lang)}
                </h3>
                <div className="gold-divider-left" style={{ marginBottom: 32 }} />

                {formSubmitted ? (
                  <div style={{
                    background: "#f0f9f0",
                    border: "1px solid #a8d5a8",
                    padding: "24px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>✓</div>
                    <p style={{ color: "#2d6e2d", fontFamily: "'Cinzel', serif", fontSize: "0.9rem" }}>
                      {lang === "en" ? "Message sent successfully!" : "Порука је успешно послата!"}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="form-field">
                      <label>{tx("contactName", lang)}</label>
                      <input type="text" name="name" required placeholder={lang === "en" ? "Your full name" : "Ваше пуно име"} />
                    </div>
                    <div className="form-field">
                      <label>{tx("contactReason", lang)}</label>
                      <textarea
                        name="message"
                        required
                        maxLength={500}
                        rows={4}
                        placeholder={lang === "en" ? "Describe your reason or message..." : "Опишите ваш разлог или поруку..."}
                        style={{ resize: "vertical" }}
                      />
                      <span style={{ fontSize: "0.82rem", color: "var(--text-mid)", opacity: 0.7 }}>
                        {tx("contactReasonNote", lang)}
                      </span>
                    </div>
                    <div className="form-field">
                      <label>{tx("contactYours", lang)}</label>
                      <input type="text" name="contact" required placeholder={lang === "en" ? "email@example.com or (801) 555-0123" : "email@primer.com или (801) 555-0123"} />
                    </div>
                    {formError && (
                      <div style={{ background: "#fdf2f2", border: "1px solid #e88", borderRadius: 6, padding: "12px 16px", color: "#c33", fontFamily: "'Cinzel', serif", fontSize: "0.85rem" }}>
                        {lang === "en" ? "Could not send message. Please try again or email us directly." : "Порука није послата. Покушајте поново или нас контактирајте директно."}
                      </div>
                    )}
                    <button type="submit" className="btn-gold-solid" disabled={formLoading} style={{ opacity: formLoading ? 0.7 : 1 }}>
                      {formLoading ? (lang === "en" ? "Sending…" : "Слање…") : tx("contactSubmit", lang)}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MEMBERSHIP ===== */}
      <section id="membership" className="section-stone" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "'Cinzel', serif", color: "var(--gold-dark)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
              {lang === "en" ? "Join Our Parish" : "Придружите се парохији"}
            </div>
            <h2 className="section-heading" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: 16 }}>
              {tx("membershipTitle", lang)}
            </h2>
            <div className="gold-divider" style={{ marginBottom: 24 }} />
            <p style={{ color: "var(--text-mid)", fontSize: "1.1rem", lineHeight: 1.75, maxWidth: 640, margin: "0 auto" }}>
              {tx("membershipDesc", lang)}
            </p>
          </div>

          <div style={{ background: "white", border: "1px solid var(--stone-dark)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
            {/* Form header */}
            <div style={{
              background: "linear-gradient(135deg, var(--dark-burgundy), #2a1218)",
              padding: "24px 40px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              <span style={{ color: "var(--gold)", fontSize: "1.5rem" }}>✦</span>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: "white", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                {lang === "en" ? "Membership Application Form" : "Пријавни образац за чланство"}
              </h3>
            </div>

            <div style={{ padding: "48px 40px" }}>
              {memberSubmitted ? (
                <div style={{
                  background: "#f0f9f0",
                  border: "1px solid #a8d5a8",
                  padding: "32px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>✓</div>
                  <p style={{ color: "#2d6e2d", fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "0.05em" }}>
                    {lang === "en" ? "Application submitted successfully!" : "Пријава је успешно поднета!"}
                  </p>
                  <p style={{ color: "#4a8a4a", fontSize: "0.95rem", marginTop: 8 }}>
                    {lang === "en" ? "We will contact you soon." : "Ускоро ћемо вас контактирати."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                  {/* Personal info */}
                  <div>
                    <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dark)", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--stone-dark)" }}>
                      {tx("memberPersonal", lang)}
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }} className="responsive-grid-sm">
                      <div className="form-field"><label>{tx("memberSurname", lang)}</label><input type="text" name="surname" required /></div>
                      <div className="form-field"><label>{tx("memberName", lang)}</label><input type="text" name="name" required /></div>
                      <div className="form-field"><label>{tx("memberDob", lang)}</label><input type="date" name="dob" required /></div>
                      <div className="form-field"><label>{tx("memberPob", lang)}</label><input type="text" name="pob" required /></div>
                      <div className="form-field"><label>{tx("memberDobaptism", lang)}</label><input type="date" name="dobaptism" /></div>
                      <div className="form-field"><label>{tx("memberPobaptism", lang)}</label><input type="text" name="pobaptism" /></div>
                      <div className="form-field"><label>{tx("memberMarital", lang)}</label><input type="text" name="marital" /></div>
                      <div className="form-field"><label>{tx("memberSpouse", lang)}</label><input type="text" name="spouse" /></div>
                      <div className="form-field"><label>{tx("memberChildren", lang)}</label><input type="number" name="children" min="0" /></div>
                      <div className="form-field"><label>{tx("memberChildrenNames", lang)}</label><input type="text" name="childrenNames" /></div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div>
                    <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dark)", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--stone-dark)" }}>
                      {tx("memberContact", lang)}
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }} className="responsive-grid-sm">
                      <div className="form-field"><label>{tx("memberTel", lang)}</label><input type="tel" name="tel" required /></div>
                      <div className="form-field"><label>{tx("memberEmail", lang)}</label><input type="email" name="email" required /></div>
                    </div>
                    <div className="form-field" style={{ marginTop: 16 }}>
                      <label>{tx("memberAddress", lang)}</label>
                      <input type="text" name="address" required />
                    </div>
                  </div>

                  {/* Church info */}
                  <div>
                    <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-dark)", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--stone-dark)" }}>
                      {tx("memberChurch", lang)}
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }} className="responsive-grid-sm">
                      <div className="form-field"><label>{tx("memberSlava", lang)}</label><input type="text" name="slava" /></div>
                      <div className="form-field"><label>{tx("memberFromParish", lang)}</label><input type="text" name="fromParish" /></div>
                    </div>
                  </div>

                  {memberError && (
                    <div style={{ background: "#fdf2f2", border: "1px solid #e88", borderRadius: 6, padding: "12px 16px", color: "#c33", fontFamily: "'Cinzel', serif", fontSize: "0.85rem" }}>
                      {lang === "en" ? "Could not submit application. Please try again or contact us directly." : "Пријава није послата. Покушајте поново или нас контактирајте директно."}
                    </div>
                  )}
                  <button type="submit" className="btn-gold-solid" disabled={memberLoading} style={{ opacity: memberLoading ? 0.7 : 1 }}>
                    {memberLoading ? (lang === "en" ? "Submitting…" : "Слање…") : tx("memberSubmit", lang)}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="section-dark" style={{ padding: "48px 40px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Top */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 48, alignItems: "start", marginBottom: 48 }} className="responsive-grid">
            <div>
              <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "0.95rem", fontWeight: 600, marginBottom: 16 }}>
                {tx("churchName", lang)}
              </h4>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", lineHeight: 1.8 }}>
                {tx("churchSubtitle", lang)}<br />
                Salt Lake City, Utah
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--gold)", fontFamily: "'Cinzel', serif", fontSize: "2rem", marginBottom: 8 }}>✦</div>
              <div className="gold-divider" style={{ width: 40 }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--gold)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                {tx("contactAddress", lang)}
              </h4>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", lineHeight: 1.8 }}>
                1606 South 1000 West<br />
                Salt Lake City, Utah 84104
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(201,165,90,0.2)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", fontFamily: "'Cinzel', serif", letterSpacing: "0.05em", margin: 0 }}>
              © {new Date().getFullYear()} {tx("churchName", lang)} · {tx("churchSubtitle", lang)} · {tx("footerRights", lang)}
            </p>
            <button
              onClick={() => setShowAdmin(true)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.12)",
                fontSize: "0.65rem",
                cursor: "pointer",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "0.08em",
                padding: "4px 8px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(201,165,90,0.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.12)")}
            >
              Parish Admin
            </button>
          </div>
        </div>
      </footer>

      {/* ===== ADMIN PANEL ===== */}
      {showAdmin && <AdminPanel lang={lang} onClose={() => setShowAdmin(false)} />}

      {/* ===== MISSION PAGE ===== */}
      {showMission && <MissionPage lang={lang} onClose={() => setShowMission(false)} />}

      {/* Responsive grid styles */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .responsive-grid-sm { grid-template-columns: 1fr !important; }
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .lang-btn { right: 90px !important; }
          .music-btn { right: 12px !important; top: 12px !important; }
          .lang-btn { right: 100px !important; top: 12px !important; }
          main { padding: 0 !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        
      `}</style>
    </div>
  );
}
