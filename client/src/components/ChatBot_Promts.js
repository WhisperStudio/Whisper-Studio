// ChatBot_Promts.js

/* ===================== TEXT + INTENT HELPERS ===================== */
export const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9æøåäöüßñç\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const levenshtein = (a, b) => {
  a = norm(a);
  b = norm(b);
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array(b.length + 1)
    .fill(0)
    .map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1,
      cur = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        cur + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = temp;
      cur = dp[j];
    }
  }
  return dp[b.length];
};

export const fuzzyIncludes = (text, keywords, maxDist = 2) => {
  const t = norm(text);
  const tokens = t.split(" ");
  return keywords.some((kw) => {
    const k = norm(kw);
    if (!k) return false;
    if (t.includes(k)) return true;
    return tokens.some(
      (tok) =>
        levenshtein(tok, k) <= Math.min(maxDist, Math.ceil(k.length / 3))
    );
  });
};

const isEmojiOnly = (text) => {
  if (!text) return false;
  const trimmed = text.replace(/\s/g, "");
  // matches a sequence of emoji/pictographs
  return /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})+$/u.test(
    trimmed
  );
};

const hasAnyEmoji = (text) =>
  /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})/u.test(
    text || ""
  );

/* ===================== LANGUAGE DETECTION ===================== */
export const detectLang = (text) => {
  const raw = text || "";
  const lower = raw.toLowerCase();
  const n = norm(text);
  if (/[æøå]/.test(lower)) return "no";
  if (/\b(hvordan|pris|billett|støtte|hjelp|ticket)\b/.test(n)) return "no";
  if (/\b(hej|hvordan|pris|billet|støtte)\b/.test(n)) return "da";
  if (/\b(hej|pris|stöd|biljett)\b/.test(n)) return "sv";
  if (/\b(hola|precio|ayuda|soporte|ticket)\b/.test(n)) return "es";
  if (/\b(bonjour|prix|aide|billet|support)\b/.test(n)) return "fr";
  if (/\b(hallo|preis|hilfe|ticket|unterstützung)\b/.test(n)) return "de";
  if (/\b(hei|hinta|lippu|tuki)\b/.test(n)) return "fi";
  return "en";
};

/* ===================== INTENTS ===================== */
const yesWords = [
  "ja",
  "japp",
  "jepp",
  "yes",
  "yep",
  "yup",
  "oui",
  "si",
  "sí",
  "da",
  "okei",
  "ok",
  "okay",
  "sure",
  "ofc",
];
const noWords = ["nei", "no", "nope", "non", "ne"];

const greetWords = [
  "hei",
  "heisann",
  "hallo",
  "hola",
  "bonjour",
  "hello",
  "hi",
  "yo",
  "hallais",
  "morn",
  "god dag",
];

const adminWords = [
  "admin",
  "administrator",
  "ekte person",
  "menneske",
  "real person",
  "agent",
  "supportmedarbeider",
  "kundebehandler",
];

const releaseWords = [
  "lansering",
  "release",
  "utgivelse",
  "når kommer",
  "hvor langt unna",
  "hvor lenge til",
  "when is it out",
  "when release",
  "eta",
];

const domainWords = ["vote", "vintra", "vintra studio"];

const isDomainRelated = (text) =>
  fuzzyIncludes(text, domainWords, 1) ||
  // allow general smalltalk (greeting/emoji/help) to pass without hard domain term
  fuzzyIncludes(text, greetWords, 1) ||
  isEmojiOnly(text) ||
  hasAnyEmoji(text);

export const getIntent = (text, awaitingTicketConfirm) => {
  const t = text || "";

  // confirmation path first
  if (awaitingTicketConfirm && fuzzyIncludes(t, yesWords, 1))
    return "confirm_ticket_yes";
  if (awaitingTicketConfirm && fuzzyIncludes(t, noWords, 1))
    return "confirm_ticket_no";

  // emoji smalltalk
  if (isEmojiOnly(t)) return "emoji_smalltalk";

  // greeting
  if (fuzzyIncludes(t, greetWords, 1)) return "greeting";

  // fragment like single pronoun/unfinished
  const n = norm(t);
  if (n === "jeg" || n === "i" || n.split(" ").length === 1) return "fragment";

  // domain guard: if clearly off-topic, bounce
  if (!isDomainRelated(t)) return "off_topic";

  // intents within domain
  if (
    fuzzyIncludes(t, [
      "price",
      "pris",
      "kost",
      "koster",
      "cost",
      "costs",
      "hva koster",
      "hva blir prisen",
      "how much",
      "price point",
    ])
  )
    return "price";

  if (fuzzyIncludes(t, releaseWords, 1)) return "release_window";

  if (
    fuzzyIncludes(t, [
      "help",
      "hjelp",
      "assist",
      "guide",
      "støtte",
      "support",
      "ticket",
      "sak",
      "henvendelse",
      "kundeservice",
      "lag sak",
      "opprett ticket",
    ])
  )
    return "ask_ticket";

  if (fuzzyIncludes(t, adminWords, 1)) return "ask_ticket";

  // what is vote
  if (
    fuzzyIncludes(t, [
      "what is vote",
      "hva er vote",
      "vote game",
      "spill vote",
      "om vote",
      "about vote",
      "hva handler vote",
      "what is vintra",
      "om vintra",
    ])
  )
    return "what_is_vote";

  // team size
  if (
    fuzzyIncludes(t, [
      "team",
      "size",
      "how many",
      "hvor mange",
      "utviklere",
      "devs",
      "folk jobber",
      "hvem jobber",
    ])
  )
    return "team_size";

  return "other";
};

/* ===================== REPLIES ===================== */
/**
 * replyFor returns a string in the detected language.
 * We keep it minimal and friendly, and always stay within VOTE/Vintra scope.
 */
export const replyFor = (
  intent,
  lang,
  setAwaitingTicketConfirm,
  setActiveView
) => {
  const NO = lang === "no";

  const L = (en, no) => (NO ? no : en);

  switch (intent) {
    case "greeting":
      return L(
        "Hi! 👋 How can I help with VOTE or Vintra Studio today?",
        "Hei! 👋 Hva kan jeg hjelpe deg med om VOTE eller Vintra Studio i dag?"
      );

    case "emoji_smalltalk":
      return L(
        "Nice emoji! 😄 Anything specific you’re curious about in VOTE or Vintra Studio?",
        "Fin emoji! 😄 Lurer du på noe spesifikt om VOTE eller Vintra Studio?"
      );

    case "fragment":
      return L(
        "I don’t think that was a full sentence 🙂 Want to ask about VOTE, price, release, or support?",
        "Jeg tror ikke du ble helt ferdig med setningen 🙂 Vil du spørre om VOTE, pris, lansering eller support?"
      );

    case "off_topic":
      return L(
        "I’m focused on VOTE and Vintra Studio. Could you ask something related to those?",
        "Jeg svarer kun på ting relatert til VOTE og Vintra Studio. Kan du spørre om noe innenfor det?"
      );

    case "price":
      return L(
        "We’re aiming around NOK 200 (~$20), but the final price isn’t set yet.",
        "Vi sikter rundt 200 kr (~$20), men endelig pris er ikke satt ennå."
      );

    case "release_window":
      return L(
        "We’re targeting roughly about one year from now.",
        "Vi sikter mot omtrent ett år fra nå."
      );

    case "what_is_vote":
      return L(
        "VOTE is our story-driven action/strategy game where your choices matter. Curious about gameplay, platforms, or release?",
        "VOTE er vårt historiedrevne action/strategi-spill der valgene dine betyr noe. Vil du høre om gameplay, plattformer eller lansering?"
      );

    case "team_size":
      return L(
        "We’re a small indie team of three building this together.",
        "Vi er et lite indie-team på tre som bygger dette sammen."
      );

    case "ask_ticket":
      setAwaitingTicketConfirm?.(true);
      return L(
        "Sounds like you need support or to talk to a human. Want me to open a support ticket now?",
        "Høres ut som du trenger support eller å snakke med en person. Vil du at jeg oppretter en support-ticket nå?"
      );

    case "confirm_ticket_yes":
      setAwaitingTicketConfirm?.(false);
      setActiveView?.("createTicket");
      return L(
        "Great — switching to the New Ticket view. Add a short title and description.",
        "Supert — bytter til Ny ticket. Legg inn en kort tittel og beskrivelse."
      );

    case "confirm_ticket_no":
      setAwaitingTicketConfirm?.(false);
      return L(
        "No problem. If you change your mind, just say “create ticket”.",
        "Ingen problem. Om du ombestemmer deg, si “opprett ticket”."
      );

    case "generic_help":
      return L(
        "I can help with VOTE questions like price (~NOK 200), release (~1 year), gameplay, or support. What do you need?",
        "Jeg kan hjelpe med VOTE-spørsmål som pris (~200 kr), lansering (~1 år), gameplay eller support. Hva trenger du?"
      );

    case "other":
    default:
      // Stay in-domain but didn’t match a specific intent
      return L(
        "Got it. I can answer about VOTE (price, release, gameplay) or help create a support ticket. What would you like to know?",
        "Skjønner. Jeg kan svare om VOTE (pris, lansering, gameplay) eller hjelpe deg å opprette en support-ticket. Hva vil du vite?"
      );
  }
};
