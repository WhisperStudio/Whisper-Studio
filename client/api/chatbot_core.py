# chatbot_core.py
import unicodedata
import re
import random  # for varierte svar / "følelser"
from dataclasses import dataclass

from bot_texts import (
    KEYWORD_TAGS,
    QUESTION_WORDS,
    YES_WORDS, NO_WORDS,
    THANK_WORDS, GREET_WORDS, FAREWELL_WORDS,
    ADMIN_WORDS, RELEASE_WORDS, RELEASE_QUESTION_WORDS,
    GAMEPLAY_WORDS, DOMAIN_WORDS,
    AMBIGUOUS_GREETINGS,
    ML_TRAIN_DATA,
    REPLY_TEMPLATES,
)

try:
    from deep_translator import GoogleTranslator as GT
except Exception:
    GT = None

# ML / NLP
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
except Exception:
    TfidfVectorizer = None
    LogisticRegression = None

NLP = None


# ===================== TEKST-HJELPERE =====================

def norm(s: str) -> str:
    """Rens og normaliser tekst."""
    if not s:
        return ""
    s = s.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = re.sub(r"[^a-z0-9æøåäöüßñç\s]", " ", s, flags=re.IGNORECASE)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def levenshtein(a: str, b: str) -> int:
    a = norm(a)
    b = norm(b)
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)

    dp = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev = i - 1
        cur = i
        for j in range(1, len(b) + 1):
            temp = dp[j]
            dp[j] = min(
                dp[j] + 1,
                cur + 1,
                prev + (0 if a[i - 1] == b[j - 1] else 1),
            )
            prev = temp
            cur = dp[j]
    return dp[len(b)]


def fuzzy_includes(text: str, keywords, max_dist: int = 2) -> bool:
    """True hvis text inneholder et av keywords-ish."""
    t = norm(text)
    tokens = t.split()
    for kw in keywords:
        k = norm(kw)
        if not k:
            continue
        if k in t:
            return True
        for tok in tokens:
            allowed = min(max_dist, max(1, len(k) // 3))
            if levenshtein(tok, k) <= allowed:
                return True
    return False


# ===================== EMOJI =====================

EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF]")

def is_emoji_only(text: str) -> bool:
    if not text:
        return False
    trimmed = re.sub(r"\s+", "", text)
    if not trimmed:
        return False
    return bool(EMOJI_RE.fullmatch(trimmed))

def has_any_emoji(text: str) -> bool:
    return bool(EMOJI_RE.search(text or ""))


# ===================== KEYWORDS / STIKKORD =====================

def extract_keywords(text: str):
    """
    Returnerer:
      tags: sett med tags (f.eks {'domain','price'})
      tokens: liste med normaliserte ord
      is_question: True hvis det ser ut som et spørsmål
    """
    n = norm(text)
    tokens = n.split()
    tags = set()

    for i, tok in enumerate(tokens):
        if tok in KEYWORD_TAGS:
            tags.add(KEYWORD_TAGS[tok])

        if i < len(tokens) - 1:
            pair = tok + " " + tokens[i + 1]
            if pair in KEYWORD_TAGS:
                tags.add(KEYWORD_TAGS[pair])

    is_q = "?" in text or any(w in tokens for w in QUESTION_WORDS)
    return tags, tokens, is_q


# ===================== SPRÅKDETeksjon (regex-baserT) =====================

def detect_lang_rule(text: str) -> str:
    """Grovt språk-gjett basert på regex-mønstre."""
    raw = text or ""
    lower = raw.lower()
    n = norm(text)

    # KEYWORDS: hvis setningen handler om vote/vintra OG har et typisk norsk ord,
    # behandl det som norsk (så vi slipper å oversette bort "vote").
    if re.search(r"\b(vote|vintra)\b", lower) and re.search(
        r"\b(hva|hvor|hvem|hvordan|hvorfor|når)\b", n
    ):
        return "no"

    # norsk – æøå eller typiske norske ord / spørreord
    if re.search(r"[æøå]", lower):
        return "no"
    if re.search(r"\b(hva|hvor|hvem|hvordan|hvorfor|når|hei|pris|billett|støtte|hjelp|ticket)\b", n):
        return "no"

    if re.search(r"\b(hej|hvordan|pris|billet|støtte)\b", n):
        return "da"
    if re.search(r"\b(hej|pris|stöd|biljett)\b", n):
        return "sv"
    if re.search(r"\b(hola|precio|ayuda|soporte|ticket)\b", n):
        return "es"
    if re.search(r"\b(bonjour|prix|aide|billet|support)\b", n):
        return "fr"
    if re.search(r"\b(hallo|preis|hilfe|ticket|unterstützung)\b", n):
        return "de"
    if re.search(r"\b(moi|hinta|lippu|tuki)\b", n):
        return "fi"

    return "en"


# ===================== DOMAIN-RELASJON =====================

def is_domain_related(text: str) -> bool:
    return (
        fuzzy_includes(text, DOMAIN_WORDS, 1)
        or fuzzy_includes(text, GREET_WORDS, 1)
        or is_emoji_only(text)
        or has_any_emoji(text)
    )


# ===================== AUTOCORRECT =====================

# Ord vi prøver å "rette" til ved stavefeil.
AUTOCORRECT_VOCAB = set(KEYWORD_TAGS.keys()) | set(QUESTION_WORDS) | set(DOMAIN_WORDS) | {
    "er", "vil", "team", "stort", "mange", "stor", "størrelse",
    "gameplay", "pris", "lansering", "hjelp", "support", "ticket", "sak",
}

def autocorrect_text(text: str) -> str:
    """
    Grov stavekorreksjon: finner nærmeste ord i AUTOCORRECT_VOCAB
    hvis avstanden er liten nok.
    Eksempel: 'hvirdan' -> 'hvordan', 'gameplayte' -> 'gameplay'.
    """
    n = norm(text)
    tokens = n.split()
    corrected = []

    for tok in tokens:
        best = tok
        best_dist = 999

        for cand in AUTOCORRECT_VOCAB:
            d = levenshtein(tok, cand)
            if d < best_dist:
                best_dist = d
                best = cand

        # tillat små feil – strengere på korte ord
        if best != tok and (
            (len(tok) >= 6 and best_dist <= 2) or
            (4 <= len(tok) < 6 and best_dist <= 1)
        ):
            corrected.append(best)
        else:
            corrected.append(tok)

    return " ".join(corrected)


# ===================== STATE =====================

@dataclass
class ChatState:
    """State per bruker/konversasjon."""
    awaiting_ticket_confirm: bool = False
    active_view: str | None = None
    last_topic: str | None = None
    user_lang: str | None = None   # språket vi tror brukeren bruker
    lang_history: list[str] = None # husk siste språkvalg

    def __post_init__(self):
        if self.lang_history is None:
            self.lang_history = []


def pick_lang_for_message(text: str, state: ChatState) -> str:
    """
    Velg språk basert på:
    - regex-baserte regler (detect_lang_rule)
    - tidligere språk (state.user_lang + history)
    - ikke bytt bare på en kort, tvetydig hilsen
    """
    detected = detect_lang_rule(text)
    n = norm(text)
    tokens = n.split()
    token_count = len(tokens)

    # Hvis dette er første melding og det er en tvetydig hilsen, anta norsk
    if state.user_lang is None:
        if token_count <= 2 and n in AMBIGUOUS_GREETINGS:
            state.user_lang = "no"
        else:
            state.user_lang = detected
        state.lang_history.append(state.user_lang)
        return state.user_lang

    # Hvis vi har brukt samme språk flere ganger på rad, gi det litt "tyngde"
    recent_lang = state.user_lang
    if detected == recent_lang:
        state.lang_history.append(detected)
        return detected

    # kort og tvetydig -> behold forrige
    if token_count <= 2 and n in AMBIGUOUS_GREETINGS:
        state.lang_history.append(recent_lang)
        return recent_lang

    # ellers: bytt til det nye språket
    state.user_lang = detected
    state.lang_history.append(detected)
    return detected


# ===================== ML-INTENT (TFIDF + LOGISTIC REGRESSION) =====================

def ml_preprocess(text: str) -> str:
    """Tekst-preprosessering for ML. Bruker spaCy hvis tilgjengelig, ellers norm()."""
    if not text:
        return ""
    if NLP is None:
        return norm(text)
    doc = NLP(text.lower())
    tokens = [t.lemma_ for t in doc if not t.is_space and not t.is_punct]
    return " ".join(tokens)

def fuzzy_token_match(tok: str, cand: str, max_dist: int = 2) -> bool:
    """
    Fuzzy match mellom to ord – tillater stavefeil basert på lengde.
    """
    tok = norm(tok)
    cand = norm(cand)
    if not tok or not cand:
        return False
    if tok == cand:
        return True
    allowed = min(max_dist, max(1, len(cand) // 3))
    return levenshtein(tok, cand) <= allowed


def phrase_match_score(text_tokens: list[str], pattern_tokens: list[str]) -> float:
    """
    Gir en score mellom 0 og 1 for hvor godt en tekst matcher en eksempel-setning.
    1.0 = alle pattern-ord har en (fuzzy) match i teksten.
    """
    if not pattern_tokens:
        return 0.0
    matches = 0
    for p_tok in pattern_tokens:
        if any(fuzzy_token_match(t, p_tok) for t in text_tokens):
            matches += 1
    return matches / len(pattern_tokens)


def fuzzy_intent_from_examples(text_no: str, min_score: float = 0.6) -> str | None:
    """
    Bruker ML_TRAIN_DATA som "eksempel-setninger" og finner hvilken intent
    som best matcher teksten, med fuzzy token-match.
    """
    if not text_no:
        return None

    text_tokens = norm(text_no).split()
    if not text_tokens:
        return None

    best_label = None
    best_score = 0.0

    for example, intent in ML_TRAIN_DATA:
        # vi bruker ikke off_topic her – det håndteres av egne regler
        if intent == "off_topic":
            continue
        pattern_tokens = norm(example).split()
        if not pattern_tokens:
            continue

        score = phrase_match_score(text_tokens, pattern_tokens)
        if score > best_score:
            best_score = score
            best_label = intent

    if best_label and best_score >= min_score:
        return best_label
    return None

ML_VECTORIZER = None
ML_CLASSIFIER = None

def _train_intent_classifier():
    global ML_VECTORIZER, ML_CLASSIFIER
    if TfidfVectorizer is None or LogisticRegression is None:
        ML_VECTORIZER = None
        ML_CLASSIFIER = None
        return
    texts = [ml_preprocess(t) for t, _ in ML_TRAIN_DATA]
    labels = [intent for _, intent in ML_TRAIN_DATA]
    ML_VECTORIZER = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X = ML_VECTORIZER.fit_transform(texts)
    ML_CLASSIFIER = LogisticRegression(max_iter=1000)
    ML_CLASSIFIER.fit(X, labels)

try:
    _train_intent_classifier()
except Exception:
    ML_VECTORIZER = None
    ML_CLASSIFIER = None


def ml_predict_intent(text_no: str, threshold: float = 0.7) -> str | None:
    """Bruk ML-modellen til å foreslå intent. Returnerer None hvis usikker."""
    if not ML_CLASSIFIER or not ML_VECTORIZER or not text_no:
        return None
    X = ML_VECTORIZER.transform([ml_preprocess(text_no)])
    probs = ML_CLASSIFIER.predict_proba(X)[0]
    labels = ML_CLASSIFIER.classes_
    best_idx = probs.argmax()
    best_label = labels[best_idx]
    best_prob = probs[best_idx]
    if best_prob >= threshold:
        return best_label
    return None


# ===================== INTENT-DETEKSJON =====================

def get_intent(text_no: str, state: ChatState) -> str:
    """
    text_no: meldingen oversatt til norsk (internt tekst).
    1) stave-korriger tekst
    2) prioriter spesialtilfeller (vintra / team_size)
    3) prøv ML-modellen
    4) fallback til regelbasert logikk
    """
    orig = text_no or ""
    # 1) grov stavekorreksjon
    t = autocorrect_text(orig)
    n = norm(t)

    # hent tags/tokens/is_question med én gang – vi bruker dette flere steder
    tags, tokens, is_question = extract_keywords(t)
    token_count = len(tokens)

    # 🔹 PRIORITERT: VINTRA-SPØRSMÅL (hva er vintra ...)
    if fuzzy_includes(
        t,
        [
            "hva er vintra",
            "hva er vintra studio",
            "om vintra",
            "om vintra studio",
        ],
        max_dist=2,
    ):
        return "what_is_vintra"

    # 🔹 PRIORITERT: TEAM-STØRRELSE – spørsmål + domain + mengde-ord
    if "domain" in tags and (
        "hvor mange" in n
        or "hvor stort" in n
        or "hvor stor er" in n
        or "hvor stort er" in n
        or "størrelse" in n
    ):
        return "team_size"

      # 2) Eksempel-basert fuzzy intent etter de viktigste spesialreglene
    fuzzy_intent = fuzzy_intent_from_examples(t)
    if fuzzy_intent and not state.awaiting_ticket_confirm and fuzzy_intent != "off_topic":
        return fuzzy_intent

    # 3) ML-intent (scikit-learn) – brukes bare hvis modellen faktisk er trent
    ml_intent = ml_predict_intent(t)
    if ml_intent and not state.awaiting_ticket_confirm and ml_intent != "off_topic":
        return ml_intent

    # 4) REGELBASERT

    # JA/NEI på ticket?
    if state.awaiting_ticket_confirm and fuzzy_includes(t, YES_WORDS, 1):
        return "confirm_ticket_yes"
    if state.awaiting_ticket_confirm and fuzzy_includes(t, NO_WORDS, 1):
        return "confirm_ticket_no"

    # emoji
    if is_emoji_only(t):
        return "emoji_smalltalk"

    # hilsen
    if fuzzy_includes(t, GREET_WORDS, 1):
        return "greeting"

    # farvel – IKKE fuzzy, ellers kan "mye" ligne på "bye"
    if any(tok in FAREWELL_WORDS for tok in tokens):
        return "farewell"

    # takk
    if fuzzy_includes(t, THANK_WORDS, 1):
        return "thanks"

    # fragment
    if (
        n in ("jeg", "i")
        or (token_count == 1 and n not in ("ticket", "support", "støtte", "pris", "price"))
    ):
        return "fragment"

    # --- ticket / support ---
    if "ticket" in tags or "support" in tags:
        if token_count <= 3:
            return "ask_ticket"

        if re.search(
            r"\b(jeg vil|ønsker|skal|trenger|må|kan du|kan jeg|jeg trenger)\b.*\b(support|støtte|ticket|sak|henvendelse|kundeservice|hjelp)\b",
            n,
        ):
            return "ask_ticket"

    # --- gameplay ---
    if "gameplay" in tags or fuzzy_includes(t, GAMEPLAY_WORDS, 2):
        return "gameplay_info"

    # --- nettsider / web ---
    if "web_dev" in tags:
        return "web_dev_info"

    # --- pris ---
    if "price" in tags:
        return "price"

    # --- lansering ---
    if "release" in tags or fuzzy_includes(t, RELEASE_QUESTION_WORDS, 2):
        return "release_window"

    # --- hva er VOTE ---
    if "domain" in tags or "game" in tags:
        if fuzzy_includes(
            t,
            [
                "hva er vote",
                "hva går vote ut på",
                "hva går spillet ut på",
                "hva handler vote om",
                "om vote",
            ],
        ) or ("domain" in tags and is_question and "price" not in tags and "release" not in tags):
            return "what_is_vote"

    # --- hvem lager VOTE / team ---
    if "domain" in tags or "game" in tags:
        if fuzzy_includes(
            t,
            [
                "hvem lager vote",
                "team",
                "utviklere",
                "hvor mange jobber",
                # engelsk variant – i tilfelle vi ikke oversetter
                "who makes vote",
            ],
        ):
            return "team_size"

    # ekstra: hva er VINTRA (fallback, hvis tidl. spesialregel ikke traff)
    if fuzzy_includes(
        t,
        [
            "hva er vintra",
            "om vintra",
            "hva er vintra studio",
            "om vintra studio",
        ],
    ):
        return "what_is_vintra"

    # backup-regler – pris
    if fuzzy_includes(
        t,
        [
            "pris",
            "kost",
            "koster",
            "koste",
            "hva koster",
            "hva blir prisen",
            "hvor mye",
            "hvor mye vil",
        ],
    ):
        return "price"

    # backup-regler – lansering
    if fuzzy_includes(t, RELEASE_WORDS, 1):
        return "release_window"

    # backup-regler – support
    if fuzzy_includes(
        t,
        [
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
        ],
    ):
            return "ask_ticket"

    if fuzzy_includes(t, ADMIN_WORDS, 1):
        return "ask_ticket"

    # kontekst-basert: vi snakket nettopp om vote
    if state.last_topic == "vote":
        if fuzzy_includes(t, ["hva går det ut på"], 2):
            return "what_is_vote"
        if fuzzy_includes(t, ["hvem lager det"], 2):
            return "team_size"

    # off-topic
    if (
        not is_domain_related(t)
        and "domain" not in tags
        and "ticket" not in tags
        and "support" not in tags
        and "price" not in tags
        and "release" not in tags
        and "gameplay" not in tags
        and "web_dev" not in tags
    ):
        return "off_topic"

    return "other"


# ===================== SVAR (kun NORSK, via REPLY_TEMPLATES) =====================

def reply_for(intent: str, state: ChatState) -> str:
    # oppdater state for enkelte intents
    if intent in ("what_is_vote", "team_size", "price", "release_window", "gameplay_info"):
        state.last_topic = "vote"

    if intent == "ask_ticket":
        state.awaiting_ticket_confirm = True
    elif intent == "confirm_ticket_yes":
        state.awaiting_ticket_confirm = False
        state.active_view = "createTicket"
    elif intent == "confirm_ticket_no":
        state.awaiting_ticket_confirm = False

    # hent svar fra REPLY_TEMPLATES
    templates = REPLY_TEMPLATES.get(intent) or REPLY_TEMPLATES.get("fallback")

    if isinstance(templates, list):
        return random.choice(templates)
    return templates


# ===================== OVERSATT INN/UT =====================

# lag en enkel "protection map" for domenenavn
PROTECTED_DOMAINS = {w: f"__{w.upper()}__" for w in DOMAIN_WORDS}

def normalize_to_norwegian(text: str, detected_lang: str) -> tuple[str, str]:
    """
    Oversett brukerens tekst til norsk (internt språk).
    Beskytter domenenavn (vote / vintra / vintra studio) mot å bli oversatt.
    Returnerer (tekst_på_norsk, originalspråk_kode).
    """
    raw = text or ""
    if detected_lang == "no":
        return raw, "no"

    protected = raw
    # beskytt domenenavn før oversettelse
    for w, token in PROTECTED_DOMAINS.items():
        protected = re.sub(rf"\b{re.escape(w)}\b", token, protected, flags=re.IGNORECASE)

    try:
        translated = GT(source="auto", target="no").translate(protected) if GT else protected
    except Exception:
        translated = protected

    # fjern beskyttelse igjen
    for w, token in PROTECTED_DOMAINS.items():
        translated = translated.replace(token, w)

    return translated, detected_lang


# ===================== HOVEDFUNKSJON =====================

def handle_message(text: str, state: ChatState | None = None):
    """
    1) Velg språk for bruker (med historikk)
    2) Oversett inn-tekst til norsk
    3) Finn intent (ML + regler) på norsk
    4) Lag svar på norsk
    5) Oversett svaret tilbake til brukerens språk
    """
    if state is None:
        state = ChatState()

    # 1: gjett språk (med historikk / "sjanse")
    user_lang = pick_lang_for_message(text, state)

    # 2: oversett inn til norsk
    text_no, original_lang = normalize_to_norwegian(text, user_lang)

    # 3: intent på norsk
    intent = get_intent(text_no, state)

    # 4: svar på norsk
    reply_no = reply_for(intent, state)

    # 5: oversett svar tilbake til brukerens språk
    if original_lang != "no":
        try:
            reply_out = GT(source="no", target=original_lang).translate(reply_no) if GT else reply_no
        except Exception:
            reply_out = reply_no
    else:
        reply_out = reply_no

    return {
        "reply": reply_out,
        "lang": original_lang,
        "intent": intent,
        "awaiting_ticket_confirm": state.awaiting_ticket_confirm,
        "active_view": state.active_view,
        "last_topic": state.last_topic,
    }, state
