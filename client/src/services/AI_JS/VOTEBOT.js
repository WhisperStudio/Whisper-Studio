/**
 * VOTE-bot logikk oversatt fra Python
 */
export default class VOTEBot {
    constructor() {
        this.state = {
            awaiting_ticket_confirm: false,
            active_view: null,
            last_topic: null,
            user_lang: 'no'
        };

        // Konfigurasjon fra bot_texts.py
        this.REPLY_TEMPLATES = {
            "greeting": [
                "Hei! 👋 Hva kan jeg hjelpe deg med om VOTE eller Vintra Studio i dag?",
                "Hei hei! 😄 Lurer du på noe om VOTE, pris eller lansering?",
                "Hallais! 🙌 Spør meg gjerne om VOTE, gameplay eller support."
            ],
            "farewell": ["Ha det! 👋 Bare kom tilbake hvis du lurer på mer.", "Snakkes! 😊"],
            "thanks": ["Bare hyggelig! 😊", "Ingen problem, glad jeg kunne hjelpe! 🙌"],
            "price": "Vi sikter rundt 200 kr (~$20), men endelig pris er ikke satt ennå.",
            "release_window": "Planen er å slippe VOTE en gang i løpet av 2026. Spillet er under utvikling, så datoen kan endre seg.",
            "gameplay_info": "VOTE er et historiedrevet action/strategi-spill der valgene dine faktisk får konsekvenser. Vi fokuserer på stemning og historie.",
            "what_is_vintra": "Vintra Studio er et lite indie-studio med tre utviklere. Vi jobber med VOTE, Roblox-prosjekter og nettsider.",
            "what_is_vote": "VOTE er vårt historiedrevne spill der valgene dine betyr noe. Vil du høre mer om gameplay eller lansering?",
            "team_size": "Vi er et lite indie-team på tre personer.",
            "ask_ticket": "Høres ut som du trenger support. Vil du at jeg oppretter en support-ticket nå?",
            "confirm_ticket_yes": "Supert — bytter til Ny ticket. Legg inn en kort tittel og beskrivelse.",
            "confirm_ticket_no": "Ingen problem. Bare si ifra hvis du ombestemmer deg.",
            "off_topic": "Jeg svarer kun på ting relatert til VOTE og Vintra Studio.",
            "fallback": "Jeg hjelper gjerne med info om VOTE! Spør om gameplay, pris, lansering eller support."
        };
    }

    // Enkel normalisering (fjerner spesialtegn og gjør til lowercase)
    norm(str) {
        return str.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9æøå\s]/g, " ")
            .replace(/\s+/g, " ").trim();
    }

    // Finn intent basert på nøkkelord (Regelbasert fallback for ML)
    getIntent(text) {
        const n = this.norm(text);
        
        // Ticket bekreftelse
        if (this.state.awaiting_ticket_confirm) {
            if (/\b(ja|japp|jepp|yes|ok)\b/.test(n)) return "confirm_ticket_yes";
            if (/\b(nei|no|nope)\b/.test(n)) return "confirm_ticket_no";
        }

        // Prioriterte spørsmål
        if (n.includes("vintra")) return "what_is_vintra";
        if (n.includes("hvem lager") || n.includes("team") || n.includes("hvor mange")) return "team_size";
        if (n.includes("pris") || n.includes("koster") || n.includes("cost")) return "price";
        if (n.includes("når") && (n.includes("kommer") || n.includes("release") || n.includes("ute"))) return "release_window";
        if (n.includes("gameplay") || n.includes("hvordan er spillet")) return "gameplay_info";
        if (n.includes("hva er vote") || n.includes("hva handler")) return "what_is_vote";
        
        // Support
        if (/\b(hjelp|support|ticket|sak|kundeservice)\b/.test(n)) return "ask_ticket";

        // Småprat
        if (/\b(hei|hallo|heisann|hi|hello)\b/.test(n)) return "greeting";
        if (/\b(takk|thanks)\b/.test(n)) return "thanks";
        if (/\b(hade|snakkes|bye)\b/.test(n)) return "farewell";

        return "fallback";
    }

    handleMessage(text) {
        const intent = this.getIntent(text);
        
        // Oppdater state
        if (intent === "ask_ticket") {
            this.state.awaiting_ticket_confirm = true;
        } else if (intent === "confirm_ticket_yes") {
            this.state.awaiting_ticket_confirm = false;
            this.state.active_view = "createTicket";
        } else if (intent === "confirm_ticket_no") {
            this.state.awaiting_ticket_confirm = false;
        }

        const response = this.REPLY_TEMPLATES[intent];
        const reply = Array.isArray(response) 
            ? response[Math.floor(Math.random() * response.length)] 
            : response;

        return {
            reply: reply,
            intent: intent,
            state: this.state
        };
    }
}