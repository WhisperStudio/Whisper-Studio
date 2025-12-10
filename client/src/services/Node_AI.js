// chatbotCore.js
// Node.js-versjon av chatbot_core.py

// ===================== IMPORTS / KONFIG =====================
import { translate } from '@vitalets/google-translate-api';

// ===================== TEKST-HJELPERE =====================

function norm(s) {
  if (!s) return "";
  let n = s.toLowerCase();
  // Fjern aksenter / diakritiske tegn (tilsvarer unicodedata.normalize + Mn-filter)
  n = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Behold bare a-z, 0-9, nordiske spesialtegn + whitespace
  n = n.replace(/[^a-z0-9æøåäöüßñç\s]/gi, " ");
  n = n.replace(/\s+/g, " ").trim();
  return n;
}

function levenshtein(a, b) {
  a = norm(a);
  b = norm(b);
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const dp = [];
  for (let j = 0; j <= b.length; j++) dp[j] = j;

  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(
        dp[j] + 1,        // deletion
        dp[j - 1] + 1,    // insertion
        prev + cost       // substitution
      );
      prev = temp;
    }
  }
  return dp[b.length];
}

function fuzzyIncludes(text, keywords, maxDist = 2) {
  const t = norm(text);
  const tokens = t.split(" ").filter(Boolean);
  for (const kw of keywords) {
    const k = norm(kw);
    if (!k) continue;

    if (t.includes(k)) return true;

    for (const tok of tokens) {
      const allowed = Math.min(maxDist, Math.max(1, Math.floor(k.length / 3)));
      if (levenshtein(tok, k) <= allowed) return true;
    }
  }
  return false;
}

// ===================== EMOJI =====================

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}]/u;

function isEmojiOnly(text) {
  if (!text) return false;
  const trimmed = text.replace(/\s+/g, "");
  if (!trimmed) return false;
  return EMOJI_RE.test(trimmed) && trimmed.replace(EMOJI_RE, "") === "";
}

function hasAnyEmoji(text) {
  return EMOJI_RE.test(text || "");
}

// ===================== KONSTANTER (bot_texts) =====================

// === KEYWORD-TAGS ===
const KEYWORD_TAGS = {
  // domenet
  "vote": "domain",
  "vintra": "domain",
  "vintra studio": "domain",
  "spill": "game",
  "game": "game",

  // gameplay
  "gameplay": "gameplay",
  "gamleplay": "gameplay",
  "game play": "gameplay",

  // pris / kostnad
  "pris": "price",
  "kostnad": "price",
  "cost": "price",
  "price": "price",

  // lansering
  "lansering": "release",
  "release": "release",
  "utgivelse": "release",

  // support / ticket
  "ticket": "ticket",
  "sak": "ticket",
  "henvendelse": "ticket",
  "support": "support",
  "støtte": "support",
  "kundeservice": "support",

  // nettsider / web
  "nettside": "web_dev",
  "nettsider": "web_dev",
  "webside": "web_dev",
  "website": "web_dev",
};

// bare norske spørreord – teksten oversettes uansett til norsk
const QUESTION_WORDS = new Set(["hva", "hvor", "hvem", "hvordan", "hvorfor", "når"]);

const YES_WORDS = [
  "ja","japp","jepp","yes","yep","yup","oui","si","sí",
  "da","okei","ok","okay","sure","ofc",
];
const NO_WORDS = ["nei", "no", "nope", "non", "ne"];

const THANK_WORDS = [
  "takk", "tusen takk", "takker", "thanks", "thank you",
  "nice", "supert", "kult", "bra bot", "flott",
];

const GREET_WORDS = [
  "hei","heisann","hallo","hola","bonjour","hello",
  "hi","yo","hallais","morn","god dag","god morgen","god kveld",
];

const FAREWELL_WORDS = [
  "ha det","hade","hadebra","snakkes","snx","vi snakkes",
  "god natt","bye","goodbye","see you","see ya",
];

const ADMIN_WORDS = [
  "admin","administrator","ekte person","menneske","real person",
  "agent","supportmedarbeider","kundebehandler",
];

const RELEASE_WORDS = [
  "lansering","release","utgivelse","når kommer",
  "hvor langt unna","hvor lenge til","when is it out",
  "when release","eta",
  "når er spillet ute","når er vote ute","when is vote out",
];

const RELEASE_QUESTION_WORDS = [
  "når er spillet ute",
  "når kommer spillet",
  "når er vote ute",
  "when is vote out",
  "when is the game out",
];

const GAMEPLAY_WORDS = [
  "gameplay", "gamleplay", "game play", "gameplayet",
  "hvordan er gameplay",
  "hvordan er spillet",
  "hva gjør man i spillet",
  "what is the gameplay",
];

const DOMAIN_WORDS = ["vote", "vintra", "vintra studio"];

const AMBIGUOUS_GREETINGS = new Set([
  "hei", "hello", "hi", "hola", "bonjour", "hallo", "hej", "moi",
]);

// ========= ML-TRENINGSData =========
const ML_TRAIN_DATA = [
  ["hei", "greeting"],
  ["hei, jeg har et spørsmål", "greeting"],
  ["god morgen", "greeting"],
  ["hallo bot", "greeting"],

  ["ha det", "farewell"],
  ["snakkes", "farewell"],
  ["bye", "farewell"],
  ["goodbye", "farewell"],

  ["takk", "thanks"],
  ["tusen takk for hjelpen", "thanks"],
  ["thanks a lot", "thanks"],

  ["jeg trenger hjelp fra support", "ask_ticket"],
  ["kan du lage en ticket for meg", "ask_ticket"],
  ["jeg vil opprette sak", "ask_ticket"],

  ["hva koster spillet", "price"],
  ["hva blir prisen", "price"],
  ["what is the price", "price"],

  ["når kommer spillet", "release_window"],
  ["hva er lanseringsdatoen", "release_window"],
  ["when is the game out", "release_window"],

  ["hva er gameplayet", "gameplay_info"],
  ["hvordan er gameplay", "gameplay_info"],
  ["what is the gameplay like", "gameplay_info"],

  ["hva er vote", "what_is_vote"],
  ["hva går vote ut på", "what_is_vote"],

  ["hvem lager vote", "team_size"],
  ["hvor stort er teamet", "team_size"],

  ["hva er vintra studio", "what_is_vintra"],
  ["hva er vintra", "what_is_vintra"],
  ["fortell om vintra", "what_is_vintra"],
  ["fortell om vintra studio", "what_is_vintra"],

  ["jeg vet ikke helt", "fragment"],
  ["jeg", "fragment"],

  ["lol dette er ikke relatert i det hele tatt", "off_topic"],
  ["snakk om noe helt annet", "off_topic"],

  ["jeg trenger litt hjelp", "generic_help"],
  ["kan du hjelpe meg", "generic_help"],
];

// ========= SVAR-TEMPLATES =========
const REPLY_TEMPLATES = {
  greeting: [
    "Hei! 👋 Hva kan jeg hjelpe deg med om VOTE eller Vintra Studio i dag?",
    "Hei hei! 😄 Lurer du på noe om VOTE, pris eller lansering?",
    "Hallais! 🙌 Spør meg gjerne om VOTE, gameplay eller support.",
    "God dag! 😊 Hva vil du vite om VOTE eller Vintra Studio?",
  ],
  farewell: [
    "Ha det! 👋 Bare kom tilbake hvis du lurer på mer.",
    "Snakkes! 😊 Jeg er her hvis du trenger mer info om VOTE.",
    "Takk for praten! 🙏 Håper vi snakkes igjen.",
    "God natt! 😴 Vi snakkes når du vil vite mer om VOTE.",
  ],
  emoji_smalltalk: [
    "Fin emoji! 😄 Lurer du på noe spesifikt om VOTE eller Vintra Studio?",
    "Hehe, nice emoji! 😎 Har du et spørsmål om VOTE?",
  ],
  thanks: [
    "Bare hyggelig! 😊 Spør gjerne mer om VOTE, lansering, pris eller support hvis du vil.",
    "Ingen problem, glad jeg kunne hjelpe! 🙌",
    "Veldig hyggelig å høre! 🥹 Bare si ifra hvis du lurer på mer.",
  ],
  fragment: [
    "Jeg tror ikke du ble helt ferdig med setningen 🙂 Vil du spørre om VOTE, pris, lansering eller support?",
    "Hmm, jeg trenger litt mer kontekst 😅 Prøv å forklare hva du lurer på om VOTE.",
  ],
  off_topic: [
    "Jeg svarer kun på ting relatert til VOTE og Vintra Studio. Kan du spørre om noe innenfor det?",
    "Det høres interessant ut, men jeg er bare trent på VOTE og Vintra Studio 🤖",
  ],
  price: "Vi sikter rundt 200 kr (~$20), men endelig pris er ikke satt ennå.",
  release_window:
    "Planen er å slippe VOTE en gang i løpet av 2026. Spillet er fortsatt under utvikling, så eksakt dato kan endre seg.",
  gameplay_info:
    "VOTE er et historiedrevet action/strategi-spill der valgene dine faktisk får konsekvenser. " +
    "Du beveger deg rundt, tar vanskelige valg og må leve med resultatene. " +
    "Vi fokuserer mer på stemning, historie og spennende valg enn bare skyting.",
  web_dev_info:
    "Vintra Studio er et lite indie-studio på tre personer. I tillegg til VOTE lager vi " +
    "skreddersydde nettsider for kunder – moderne, responsive sider til lavere pris enn " +
    "de fleste tradisjonelle byråer.",
  what_is_vintra:
    "Vintra Studio er et lite indie-studio med tre utviklere. Akkurat nå jobber vi mest " +
    "med spillet VOTE, et Roblox-prosjekt og skreddersydde nettsider for kunder.",
  what_is_vote:
    "VOTE er vårt historiedrevne action/strategi-spill der valgene dine betyr noe. " +
    "Vil du høre mer om gameplay, plattformer eller lansering?",
  team_size:
    "Vi er et lite indie-team på tre. Nå jobber vi mest med VOTE, men også et Roblox-spill " +
    "og skreddersydde nettsider for kunder.",
  ask_ticket:
    "Høres ut som du trenger support eller å snakke med en person. " +
    "Vil du at jeg oppretter en support-ticket nå?",
  confirm_ticket_yes:
    "Supert — bytter til Ny ticket. Legg inn en kort tittel og beskrivelse.",
  confirm_ticket_no:
    "Ingen problem. Hvis du ombestemmer deg, kan du bare si “opprett ticket”. " +
    "Ellers kan du prøve å stille spørsmålet ditt litt mer utfyllende 😊",
  generic_help:
    "Jeg kan hjelpe med VOTE-spørsmål som pris (~200 kr), lansering (~2026), " +
    "gameplay eller support. Hva trenger du? 😊",
  fallback:
    "Jeg hjelper gjerne med informasjon om VintraStudio og spillet VOTE! Du kan spørre om:\n" +
    "• Gameplay og funksjoner i VOTE\n" +
    "• Pris og lanseringsinformasjon\n" +
    "• VintraStudio og utviklingsprosessen vår\n" +
    "• Kunstgalleri og konseptkunst\n" +
    "• Hvordan følge utviklingen videre\n\n" +
    "Hvilket område er du mest interessert i?",
};

// ===================== KEYWORDS / STIKKORD =====================

function extractKeywords(text) {
  const n = norm(text);
  const tokens = n.split(" ").filter(Boolean);
  const tags = new Set();

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (KEYWORD_TAGS[tok]) {
      tags.add(KEYWORD_TAGS[tok]);
    }
    if (i < tokens.length - 1) {
      const pair = tok + " " + tokens[i + 1];
      if (KEYWORD_TAGS[pair]) {
        tags.add(KEYWORD_TAGS[pair]);
      }
    }
  }

  const isQuestion = text.includes("?") || tokens.some(t => QUESTION_WORDS.has(t));
  return { tags, tokens, isQuestion };
}

// ===================== SPRÅKDETEKSJON =====================

function detectLangRule(text) {
  // Ensure text is a string and not null/undefined
  const raw = (text || "").toString();
  const lower = raw.toLowerCase();
  const n = norm(raw);

  // vote/vintra + norsk spørreord -> norsk
  if (/\b(vote|vintra)\b/i.test(lower) && /\b(hva|hvor|hvem|hvordan|hvorfor|når)\b/.test(n)) {
    return "no";
  }

  if (/[æøå]/.test(lower)) return "no";
  if (/\b(hva|hvor|hvem|hvordan|hvorfor|når|hei|pris|billett|støtte|hjelp|ticket)\b/.test(n)) {
    return "no";
  }

  if (/\b(hej|hvordan|pris|billet|støtte)\b/.test(n)) return "da";
  if (/\b(hej|pris|stöd|biljett)\b/.test(n)) return "sv";
  if (/\b(hola|precio|ayuda|soporte|ticket)\b/.test(n)) return "es";
  if (/\b(bonjour|prix|aide|billet|support)\b/.test(n)) return "fr";
  if (/\b(hallo|preis|hilfe|ticket|unterstützung)\b/.test(n)) return "de";
  if (/\b(moi|hinta|lippu|tuki)\b/.test(n)) return "fi";

  return "en";
}

// ===================== DOMAIN-RELASJON =====================

function isDomainRelated(text) {
  return (
    fuzzyIncludes(text, DOMAIN_WORDS, 1) ||
    fuzzyIncludes(text, GREET_WORDS, 1) ||
    isEmojiOnly(text) ||
    hasAnyEmoji(text)
  );
}

// ===================== AUTOCORRECT =====================

const AUTOCORRECT_VOCAB = new Set([
  ...Object.keys(KEYWORD_TAGS),
  ...QUESTION_WORDS,
  ...DOMAIN_WORDS,
  "er", "vil", "team", "stort", "mange", "stor", "størrelse",
  "gameplay", "pris", "lansering", "hjelp", "support", "ticket", "sak",
]);

function autocorrectText(text) {
  const n = norm(text);
  const tokens = n.split(" ").filter(Boolean);
  const corrected = [];

  const vocab = Array.from(AUTOCORRECT_VOCAB);

  for (const tok of tokens) {
    let best = tok;
    let bestDist = Infinity;

    for (const cand of vocab) {
      const d = levenshtein(tok, cand);
      if (d < bestDist) {
        bestDist = d;
        best = cand;
      }
    }

    if (
      best !== tok &&
      (
        (tok.length >= 6 && bestDist <= 2) ||
        (tok.length >= 4 && tok.length < 6 && bestDist <= 1)
      )
    ) {
      corrected.push(best);
    } else {
      corrected.push(tok);
    }
  }

  return corrected.join(" ");
}

// ===================== STATE =====================

class ChatState {
  constructor(init = {}) {
    this.awaiting_ticket_confirm = init.awaiting_ticket_confirm || false;
    this.active_view = init.active_view || null;
    this.last_topic = init.last_topic || null;
    this.user_lang = init.user_lang || null;
    this.lang_history = init.lang_history ? [...init.lang_history] : [];
  }
}

function pickLangForMessage(text, state) {
  // Ensure text is a string before processing
  const textStr = (text || "").toString();
  const detected = detectLangRule(textStr);
  const n = norm(textStr);
  const tokens = n.split(" ").filter(Boolean);
  const tokenCount = tokens.length;

  if (!state.user_lang) {
    if (tokenCount <= 2 && AMBIGUOUS_GREETINGS.has(n)) {
      state.user_lang = "no";
    } else {
      state.user_lang = detected;
    }
    state.lang_history.push(state.user_lang);
    return state.user_lang;
  }

  const recentLang = state.user_lang;
  if (detected === recentLang) {
    state.lang_history.push(detected);
    return detected;
  }

  if (tokenCount <= 2 && AMBIGUOUS_GREETINGS.has(n)) {
    state.lang_history.push(recentLang);
    return recentLang;
  }

  state.user_lang = detected;
  state.lang_history.push(detected);
  return detected;
}

// ===================== ML-INTENT (placeholder) =====================

// I Python brukes spaCy + scikit-learn (Tfidf + LogisticRegression).
// Her lager vi bare en stub. Du kan implementere dette med f.eks. "natural" + "ml-logistic-regression".

function mlPreprocess(text) {
  // Enkel versjon: bruk norm() (ev. plugg inn wink-nlp eller liknende)
  return norm(text);
}

let ML_VECTORIZER = null;
let ML_CLASSIFIER = null;

function trainIntentClassifier() {
  // TODO: Implementer med "natural" eller annet ML-bibliotek hvis du vil.
  // For nå gjør vi ingenting og lar reglene styre.
  ML_VECTORIZER = null;
  ML_CLASSIFIER = null;
}

trainIntentClassifier();

function mlPredictIntent(textNo, threshold = 0.7) {
  if (!ML_CLASSIFIER || !ML_VECTORIZER || !textNo) return null;
  // TODO: egentlig implementasjon. Nå bare returnerer vi null.
  return null;
}

// ===================== INTENT-DETEKSJON =====================

function getIntent(textNo, state) {
  const orig = textNo || "";
  const t = autocorrectText(orig);
  const n = norm(t);

  const { tags, tokens, isQuestion } = extractKeywords(t);
  const tokenCount = tokens.length;

  // VINTRA-spørsmål
  if (
    fuzzyIncludes(t, [
      "hva er vintra",
      "hva er vintra studio",
      "om vintra",
      "om vintra studio",
    ], 2)
  ) {
    return "what_is_vintra";
  }

  // TEAM-størrelse
  if (
    tags.has("domain") &&
    (
      n.includes("hvor mange") ||
      n.includes("hvor stort") ||
      n.includes("hvor stor er") ||
      n.includes("hvor stort er") ||
      n.includes("størrelse")
    )
  ) {
    return "team_size";
  }

  const mlIntent = mlPredictIntent(t);
  if (mlIntent) {
    if (state.awaiting_ticket_confirm) {
      if (fuzzyIncludes(t, YES_WORDS, 1)) return "confirm_ticket_yes";
      if (fuzzyIncludes(t, NO_WORDS, 1)) return "confirm_ticket_no";
    }
    if (mlIntent !== "off_topic") return mlIntent;
  }

  if (state.awaiting_ticket_confirm && fuzzyIncludes(t, YES_WORDS, 1)) {
    return "confirm_ticket_yes";
  }
  if (state.awaiting_ticket_confirm && fuzzyIncludes(t, NO_WORDS, 1)) {
    return "confirm_ticket_no";
  }

  if (isEmojiOnly(t)) return "emoji_smalltalk";

  if (fuzzyIncludes(t, GREET_WORDS, 1)) return "greeting";

  if (tokens.some(tok => FAREWELL_WORDS.includes(tok))) {
    return "farewell";
  }

  if (fuzzyIncludes(t, THANK_WORDS, 1)) return "thanks";

  if (
    n === "jeg" ||
    n === "i" ||
    (tokenCount === 1 && !["ticket", "support", "støtte", "pris", "price"].includes(n))
  ) {
    return "fragment";
  }

  if (tags.has("ticket") || tags.has("support")) {
    if (tokenCount <= 3) return "ask_ticket";

    if (/\b(jeg vil|ønsker|skal|trenger|må|kan du|kan jeg|jeg trenger)\b.*\b(support|støtte|ticket|sak|henvendelse|kundeservice|hjelp)\b/.test(n)) {
      return "ask_ticket";
    }
  }

  if (tags.has("gameplay") || fuzzyIncludes(t, GAMEPLAY_WORDS, 2)) {
    return "gameplay_info";
  }

  if (tags.has("web_dev")) {
    return "web_dev_info";
  }

  if (tags.has("price")) {
    return "price";
  }

  if (tags.has("release") || fuzzyIncludes(t, RELEASE_QUESTION_WORDS, 2)) {
    return "release_window";
  }

  if (tags.has("domain") || tags.has("game")) {
    if (
      fuzzyIncludes(t, [
        "hva er vote",
        "hva går vote ut på",
        "hva går spillet ut på",
        "hva handler vote om",
        "om vote",
      ]) ||
      (tags.has("domain") && isQuestion && !tags.has("price") && !tags.has("release"))
    ) {
      return "what_is_vote";
    }
  }

  if (tags.has("domain") || tags.has("game")) {
    if (
      fuzzyIncludes(t, [
        "hvem lager vote",
        "team",
        "utviklere",
        "hvor mange jobber",
        "who makes vote",
      ])
    ) {
      return "team_size";
    }
  }

  if (
    fuzzyIncludes(t, [
      "hva er vintra",
      "om vintra",
      "hva er vintra studio",
      "om vintra studio",
    ])
  ) {
    return "what_is_vintra";
  }

  if (
    fuzzyIncludes(t, [
      "pris",
      "kost",
      "koster",
      "koste",
      "hva koster",
      "hva blir prisen",
      "hvor mye",
      "hvor mye vil",
    ])
  ) {
    return "price";
  }

  if (fuzzyIncludes(t, RELEASE_WORDS, 1)) {
    return "release_window";
  }

  if (
    fuzzyIncludes(t, [
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
  ) {
    return "ask_ticket";
  }

  if (fuzzyIncludes(t, ADMIN_WORDS, 1)) {
    return "ask_ticket";
  }

  if (state.last_topic === "vote") {
    if (fuzzyIncludes(t, ["hva går det ut på"], 2)) return "what_is_vote";
    if (fuzzyIncludes(t, ["hvem lager det"], 2)) return "team_size";
  }

  if (
    !isDomainRelated(t) &&
    !tags.has("domain") &&
    !tags.has("ticket") &&
    !tags.has("support") &&
    !tags.has("price") &&
    !tags.has("release") &&
    !tags.has("gameplay") &&
    !tags.has("web_dev")
  ) {
    return "off_topic";
  }

  return "other";
}

// ===================== SVAR =====================

function replyFor(intent, state) {
  if (["what_is_vote", "team_size", "price", "release_window", "gameplay_info"].includes(intent)) {
    state.last_topic = "vote";
  }

  if (intent === "ask_ticket") {
    state.awaiting_ticket_confirm = true;
  } else if (intent === "confirm_ticket_yes") {
    state.awaiting_ticket_confirm = false;
    state.active_view = "createTicket";
  } else if (intent === "confirm_ticket_no") {
    state.awaiting_ticket_confirm = false;
  }

  let templates = REPLY_TEMPLATES[intent] || REPLY_TEMPLATES["fallback"];
  if (Array.isArray(templates)) {
    return templates[Math.floor(Math.random() * templates.length)];
  }
  return templates;
}

// ===================== OVERSATT INN/UT =====================

const PROTECTED_DOMAINS = DOMAIN_WORDS.reduce((acc, w) => {
  acc[w] = `__${w.toUpperCase()}__`;
  return acc;
}, {});

async function translateText(text, sourceLang, targetLang) {
  if (!text) return '';
  try {
    const res = await translate(text, { 
      from: sourceLang, 
      to: targetLang,
      forceFrom: true,
      forceTo: true
    });
    return res.text || text;
  } catch (e) {
    console.error('Translation failed:', e);
    return text;
  }
}

async function normalizeToNorwegian(text, detectedLang) {
  // Ensure text is a string
  const raw = (text || "").toString();
  if (detectedLang === "no") {
    return { textNo: raw, originalLang: "no" };
  }

  let protectedText = raw;
  
  // Only proceed with replace if we have a string
  if (typeof protectedText === 'string') {
    for (const [w, token] of Object.entries(PROTECTED_DOMAINS)) {
      const re = new RegExp(`\\b${w}\\b`, "ig");
      protectedText = protectedText.replace(re, token);
    }
  }

  let translated;
  try {
    translated = await translateText(protectedText, "auto", "no");
  } catch (e) {
    console.error('Translation error:', e);
    translated = protectedText;
  }

  // Only proceed with replace if we have a string
  if (typeof translated === 'string') {
    for (const [w, token] of Object.entries(PROTECTED_DOMAINS)) {
      translated = translated.replace(new RegExp(token, "g"), w);
    }
  } else {
    translated = String(translated || '');
  }

  return { 
    textNo: translated, 
    originalLang: detectedLang 
  };
}

// ===================== HOVEDFUNKSJON =====================

async function handleMessage(text, state = null) {
  const s = state instanceof ChatState ? state : new ChatState();

  const userLang = pickLangForMessage(text, s);
  const { textNo, originalLang } = await normalizeToNorwegian(text, userLang);

  const intent = getIntent(textNo, s);
  const replyNo = replyFor(intent, s);

  let replyOut = replyNo;
  if (originalLang !== "no") {
    try {
      replyOut = await translateText(replyNo, "no", originalLang);
    } catch (e) {
      replyOut = replyNo;
    }
  }

  return {
    reply: replyOut,
    lang: originalLang,
    intent,
    awaiting_ticket_confirm: s.awaiting_ticket_confirm,
    active_view: s.active_view,
    last_topic: s.last_topic,
    state: s,
  };
}

// ===================== EXPORTS =====================

export { ChatState, handleMessage, norm, levenshtein, fuzzyIncludes };