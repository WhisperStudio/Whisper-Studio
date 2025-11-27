"""
All tekst / prompts / ordlister for VOTE-botten.
Endre ting her når du vil justere hva botten forstår eller svarer.
"""

# ========= KEYWORD-TAGS =========

KEYWORD_TAGS = {
    # domenet
    "vote": "domain",
    "vintra": "domain",
    "vintra studio": "domain",
    "spill": "game",
    "game": "game",

    # gameplay (inkl. stavefeil)
    "gameplay": "gameplay",
    "gamleplay": "gameplay",
    "game play": "gameplay",

    # pris / kostnad
    "pris": "price",
    "kostnad": "price",
    "cost": "price",
    "price": "price",

    # lansering
    "lansering": "release",
    "release": "release",
    "utgivelse": "release",

    # support / ticket
    "ticket": "ticket",
    "sak": "ticket",
    "henvendelse": "ticket",
    "support": "support",
    "støtte": "support",
    "kundeservice": "support",

    # nettsider / web
    "nettside": "web_dev",
    "nettsider": "web_dev",
    "webside": "web_dev",
    "website": "web_dev",
}

# bare norske spørreord – teksten oversettes uansett til norsk
QUESTION_WORDS = {
    "hva", "hvor", "hvem", "hvordan", "hvorfor", "når",
}

# ========= INTENT-ORD =========

YES_WORDS = [
    "ja","japp","jepp","yes","yep","yup","oui","si","sí",
    "da","okei","ok","okay","sure","ofc",
]
NO_WORDS = ["nei", "no", "nope", "non", "ne"]

THANK_WORDS = [
    "takk", "tusen takk", "takker", "thanks", "thank you",
    "nice", "supert", "kult", "bra bot", "flott",
]

GREET_WORDS = [
    "hei","heisann","hallo","hola","bonjour","hello",
    "hi","yo","hallais","morn","god dag","god morgen","god kveld",
]

FAREWELL_WORDS = [
    "ha det","hade","hadebra","snakkes","snx","vi snakkes",
    "god natt","bye","goodbye","see you","see ya",
]

ADMIN_WORDS = [
    "admin","administrator","ekte person","menneske","real person",
    "agent","supportmedarbeider","kundebehandler",
]

RELEASE_WORDS = [
    "lansering","release","utgivelse","når kommer",
    "hvor langt unna","hvor lenge til","when is it out",
    "when release","eta",
    "når er spillet ute","når er vote ute","when is vote out",
]

RELEASE_QUESTION_WORDS = [
    "når er spillet ute",
    "når kommer spillet",
    "når er vote ute",
    "when is vote out",
    "when is the game out",
]

GAMEPLAY_WORDS = [
    "gameplay", "gamleplay", "game play", "gameplayet",
    "hvordan er gameplay",
    "hvordan er spillet",
    "hva gjør man i spillet",
    "what is the gameplay",
]

DOMAIN_WORDS = ["vote", "vintra", "vintra studio"]

AMBIGUOUS_GREETINGS = {
    "hei", "hello", "hi", "hola", "bonjour", "hallo", "hej", "moi",
}

# ========= ML-TRENINGSData =========

ML_TRAIN_DATA = [
    ("hei", "greeting"),
    ("hei, jeg har et spørsmål", "greeting"),
    ("god morgen", "greeting"),
    ("hallo bot", "greeting"),

    ("ha det", "farewell"),
    ("snakkes", "farewell"),
    ("bye", "farewell"),
    ("goodbye", "farewell"),

    ("takk", "thanks"),
    ("tusen takk for hjelpen", "thanks"),
    ("thanks a lot", "thanks"),

    ("jeg trenger hjelp fra support", "ask_ticket"),
    ("kan du lage en ticket for meg", "ask_ticket"),
    ("jeg vil opprette sak", "ask_ticket"),

    ("hva koster spillet", "price"),
    ("hva blir prisen", "price"),
    ("what is the price", "price"),

    ("når kommer spillet", "release_window"),
    ("hva er lanseringsdatoen", "release_window"),
    ("when is the game out", "release_window"),

    ("hva er gameplayet", "gameplay_info"),
    ("hvordan er gameplay", "gameplay_info"),
    ("what is the gameplay like", "gameplay_info"),

    ("hva er vote", "what_is_vote"),
    ("hva går vote ut på", "what_is_vote"),

    ("hvem lager vote", "team_size"),
    ("hvor stort er teamet", "team_size"),

    ("hva er vintra studio", "what_is_vintra"),
    ("hva er vintra", "what_is_vintra"),
    ("fortell om vintra", "what_is_vintra"),
    ("fortell om vintra studio", "what_is_vintra"),

    ("jeg vet ikke helt", "fragment"),
    ("jeg", "fragment"),

    ("lol dette er ikke relatert i det hele tatt", "off_topic"),
    ("snakk om noe helt annet", "off_topic"),

    ("jeg trenger litt hjelp", "generic_help"),
    ("kan du hjelpe meg", "generic_help"),
]

# ========= SVAR-TEMPLATES =========
# alt som botten sier tilbake (på norsk)

REPLY_TEMPLATES = {
    "greeting": [
        "Hei! 👋 Hva kan jeg hjelpe deg med om VOTE eller Vintra Studio i dag?",
        "Hei hei! 😄 Lurer du på noe om VOTE, pris eller lansering?",
        "Hallais! 🙌 Spør meg gjerne om VOTE, gameplay eller support.",
        "God dag! 😊 Hva vil du vite om VOTE eller Vintra Studio?",
    ],
    "farewell": [
        "Ha det! 👋 Bare kom tilbake hvis du lurer på mer.",
        "Snakkes! 😊 Jeg er her hvis du trenger mer info om VOTE.",
        "Takk for praten! 🙏 Håper vi snakkes igjen.",
        "God natt! 😴 Vi snakkes når du vil vite mer om VOTE.",
    ],
    "emoji_smalltalk": [
        "Fin emoji! 😄 Lurer du på noe spesifikt om VOTE eller Vintra Studio?",
        "Hehe, nice emoji! 😎 Har du et spørsmål om VOTE?",
    ],
    "thanks": [
        "Bare hyggelig! 😊 Spør gjerne mer om VOTE, lansering, pris eller support hvis du vil.",
        "Ingen problem, glad jeg kunne hjelpe! 🙌",
        "Veldig hyggelig å høre! 🥹 Bare si ifra hvis du lurer på mer.",
    ],
    "fragment": [
        "Jeg tror ikke du ble helt ferdig med setningen 🙂 Vil du spørre om VOTE, pris, lansering eller support?",
        "Hmm, jeg trenger litt mer kontekst 😅 Prøv å forklare hva du lurer på om VOTE.",
    ],
    "off_topic": [
        "Jeg svarer kun på ting relatert til VOTE og Vintra Studio. Kan du spørre om noe innenfor det?",
        "Det høres interessant ut, men jeg er bare trent på VOTE og Vintra Studio 🤖",
    ],
    "price": "Vi sikter rundt 200 kr (~$20), men endelig pris er ikke satt ennå.",
    "release_window": (
        "Planen er å slippe VOTE en gang i løpet av 2026. "
        "Spillet er fortsatt under utvikling, så eksakt dato kan endre seg."
    ),
    "gameplay_info": (
        "VOTE er et historiedrevet action/strategi-spill der valgene dine faktisk får konsekvenser. "
        "Du beveger deg rundt, tar vanskelige valg og må leve med resultatene. "
        "Vi fokuserer mer på stemning, historie og spennende valg enn bare skyting."
    ),
    "web_dev_info": (
        "Vintra Studio er et lite indie-studio på tre personer. I tillegg til VOTE lager vi "
        "skreddersydde nettsider for kunder – moderne, responsive sider til lavere pris enn "
        "de fleste tradisjonelle byråer."
    ),
    "what_is_vintra": (
        "Vintra Studio er et lite indie-studio med tre utviklere. Akkurat nå jobber vi mest "
        "med spillet VOTE, et Roblox-prosjekt og skreddersydde nettsider for kunder."
    ),
    "what_is_vote": (
        "VOTE er vårt historiedrevne action/strategi-spill der valgene dine betyr noe. "
        "Vil du høre mer om gameplay, plattformer eller lansering?"
    ),
    "team_size": (
        "Vi er et lite indie-team på tre. Nå jobber vi mest med VOTE, men også et Roblox-spill "
        "og skreddersydde nettsider for kunder."
    ),
    "ask_ticket": (
        "Høres ut som du trenger support eller å snakke med en person. "
        "Vil du at jeg oppretter en support-ticket nå?"
    ),
    "confirm_ticket_yes": (
        "Supert — bytter til Ny ticket. Legg inn en kort tittel og beskrivelse."
    ),
    "confirm_ticket_no": (
        "Ingen problem. Hvis du ombestemmer deg, kan du bare si “opprett ticket”. "
        "Ellers kan du prøve å stille spørsmålet ditt litt mer utfyllende 😊"
    ),
    "generic_help": (
        "Jeg kan hjelpe med VOTE-spørsmål som pris (~200 kr), lansering (~2026), "
        "gameplay eller support. Hva trenger du? 😊"
    ),
    "fallback": (
        "Jeg hjelper gjerne med informasjon om VintraStudio og spillet VOTE! Du kan spørre om:\n"
        "• Gameplay og funksjoner i VOTE\n"
        "• Pris og lanseringsinformasjon\n"
        "• VintraStudio og utviklingsprosessen vår\n"
        "• Kunstgalleri og konseptkunst\n"
        "• Hvordan følge utviklingen videre\n\n"
        "Hvilket område er du mest interessert i?"
    ),
}
