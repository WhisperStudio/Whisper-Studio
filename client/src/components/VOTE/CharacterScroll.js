import {
  useEffect, useLayoutEffect, useMemo,
  useRef, useState, useCallback,
} from "react";
import { gsap } from "gsap";

/* ═══════════════════════════════════════════════════════════
   CSS
   ─────────────────────────────────────────────────────────
   Layout philosophy:
     Left  45%  → creature image (fixed stage)
     Center 10% → tube spine (fixed, 160px wide, centered)
     Right  45% → text overlay (fixed)

   The tube canvas is 160px wide, positioned FIXED at:
     left: 50vw - 80px   (centres it on the screen midpoint)
   The canvas height = full gallery scroll height.
   It is shifted upward with translateY(-scrollY) so the
   correct section of the sine wave is always visible at the
   viewport midpoint. The ball is then placed at:
     x = canvas.getBoundingClientRect().left + getPathX(docY)
     y = 42vh  (fixed vertical position)
   ═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600&family=IM+Fell+English:ital@0;1&display=swap');

.cs-root *, .cs-root *::before, .cs-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.cs-root {
  --parchment: #f2e8c9;
  --dark-wood: #0a0500;
  --rune-gold: #c8922a;
  --ember:     #d94f00;
  --frost:     #8ab4c9;
  --accent:    #c8922a;
  position: relative;
  font-family: 'IM Fell English', serif;
  color: var(--parchment);
  background: var(--dark-wood);
  overflow-x: hidden;
}

/* ── Scroll spacer ── */
.cs-scroll-container { position: relative; }

/* ─────────────────── HERO ─────────────────── */
.cs-hero {
  position: sticky; top: 0; height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 55%, #3a1400 0%, #0a0500 70%);
  z-index: 20;
  transition: opacity 0.4s ease;
}
.cs-hero-stars { position: absolute; inset: 0; pointer-events: none; }
.cs-hero-runes { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.cs-star {
  position: absolute; border-radius: 50%; background: white;
  animation: csStarTwinkle ease-in-out infinite alternate;
}
@keyframes csStarTwinkle {
  from { opacity: 0.1; transform: scale(0.8); }
  to   { opacity: 0.7; transform: scale(1.2); }
}
.cs-rune-float {
  position: absolute; color: var(--rune-gold); opacity: 0;
  animation: csRuneFloat linear infinite;
  text-shadow: 0 0 14px var(--rune-gold), 0 0 30px rgba(200,146,42,0.4);
}
@keyframes csRuneFloat {
  0%   { opacity: 0;   transform: translateY(0)      rotate(0deg)   scale(0.8); }
  15%  { opacity: 0.5; }
  85%  { opacity: 0.2; }
  100% { opacity: 0;   transform: translateY(-140px) rotate(180deg) scale(1.2); }
}
.cs-emblem {
  width: 150px; height: 150px; margin-bottom: 2rem;
  animation: csEmblemBreath 4s ease-in-out infinite alternate;
}
@keyframes csEmblemBreath {
  from { filter: drop-shadow(0 0 20px rgba(200,146,42,0.4)); transform: scale(0.97); }
  to   { filter: drop-shadow(0 0 55px rgba(217,79,0,0.6));   transform: scale(1.03); }
}
.cs-outer-ring { animation: csSpinSlow 25s linear infinite; transform-origin: 100px 100px; }
.cs-inner-ring { animation: csSpinSlow 18s linear infinite reverse; transform-origin: 100px 100px; }
@keyframes csSpinSlow { to { transform: rotate(360deg); } }
.cs-hero h1 {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(2rem, 5.5vw, 4.5rem); font-weight: 900;
  color: var(--rune-gold); text-align: center;
  letter-spacing: 0.1em; line-height: 1.15;
  text-shadow: 0 0 80px rgba(200,146,42,0.4), 3px 3px 0 rgba(122,21,21,0.5);
  animation: csTitleReveal 2.4s cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes csTitleReveal {
  from { opacity: 0; letter-spacing: 0.5em; filter: blur(8px); }
  to   { opacity: 1; letter-spacing: 0.1em; filter: blur(0); }
}
.cs-kicker {
  font-family: 'Cinzel', serif; font-size: 0.6rem;
  letter-spacing: 0.45em; color: var(--ember);
  text-transform: uppercase; margin-bottom: 1rem; opacity: 0.8;
}
.cs-hero-sub {
  font-family: 'Cinzel', serif; font-size: clamp(0.7rem, 1.6vw, 0.95rem);
  color: var(--frost); letter-spacing: 0.35em; margin-top: 1.2rem;
  text-transform: uppercase; opacity: 0;
  animation: csFadeUp 1.5s 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes csFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cs-scroll-cue {
  position: absolute; bottom: 2.5rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  opacity: 0; animation: csFadeUp 1s 2s ease forwards;
}
.cs-scroll-cue span {
  font-family: 'Cinzel', serif; font-size: 0.62rem;
  letter-spacing: 0.3em; color: rgba(200,146,42,0.6); text-transform: uppercase;
}
.cs-scroll-cue-line {
  width: 1px; height: 48px;
  background: linear-gradient(to bottom, var(--rune-gold), transparent);
  animation: csLinePulse 2s ease-in-out infinite;
}
@keyframes csLinePulse {
  0%,100% { transform: scaleY(0.6); opacity: 0.3; }
  50%     { transform: scaleY(1);   opacity: 1;   }
}

/* ─────────────── FIXED STAGE ─────────────── */
/* Dark background for the entire scene */
.cs-stage {
  position: fixed; inset: 0; z-index: 1;
  opacity: var(--stage-opacity, 0);
  pointer-events: none;
  background: var(--dark-wood);
  transition: opacity 0.4s ease;
}
/* Vignette */
.cs-stage::after {
  content: ''; position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background:
    radial-gradient(ellipse at 25% 50%, transparent 15%, rgba(0,0,0,0.45) 70%),
    linear-gradient(to bottom,
      rgba(0,0,0,0.4) 0%, transparent 22%,
      transparent 60%, rgba(0,0,0,0.7) 100%);
}
/* Halo — positioned in left half behind the image */
.cs-halo {
  position: absolute; top: 50%; left: 25%;
  width: 70vmin; height: 70vmin; border-radius: 50%;
  transform: translate(-50%,-50%) scale(var(--halo-scale,1.4));
  opacity: var(--halo-opacity, 0);
  background: radial-gradient(circle, var(--halo-color, var(--rune-gold)) 0%, transparent 70%);
  filter: blur(80px);
  will-change: transform, opacity;
  z-index: 1; mix-blend-mode: screen;
}
/* ── IMAGE — left 48% of screen ── */
.cs-creature-image {
  position: absolute;
  top: 0; left: 0;
  width: 48%; height: 100%;
  object-fit: cover;
  object-position: center 15%;
  transform-origin: center center;
  transform: scale(var(--zoom, 0.06));
  opacity: var(--opacity, 0);
  will-change: transform, opacity;
  z-index: 2;
}
/* Decorative frame lines on the image side */
.cs-image-frame {
  position: absolute; top: 0; left: 0; width: 48%; height: 100%;
  pointer-events: none; z-index: 4;
}
.cs-image-frame::before {
  content: ''; position: absolute;
  inset: 2.5rem 0.5rem 2.5rem 2rem;
  border: 1px solid rgba(200,146,42,0.18);
}
.cs-image-frame::after {
  content: ''; position: absolute;
  inset: 3rem 0 2rem 2.5rem;
  border: 1px solid rgba(200,146,42,0.07);
}

/* ─────────── CENTER DIVIDER ─────────────── */
.cs-center-divider {
  position: fixed; top: 0; bottom: 0;
  left: calc(50% - 1px); width: 1px;
  background: linear-gradient(to bottom,
    transparent 0%,
    rgba(200,146,42,0.12) 15%,
    rgba(200,146,42,0.12) 85%,
    transparent 100%);
  z-index: 8; pointer-events: none;
}

/* ───────── TUBE SPINE + BALL ─────────────
   TUBE_W = 160px. Canvas is fixed at
   left = 50vw - 80px, clipped by overflow:hidden.
   The canvas translateY = -scrollY keeps the wave
   in the same world-space so ball coords are correct.
────────────────────────────────────────── */
.cs-tube-host {
  position: fixed;
  /* exactly 160px wide, centred */
  left: calc(50% - 80px);
  width: 160px;
  top: 0; bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 9;
}
.cs-tube-canvas {
  /* canvas is sized in JS; top is set by JS translateY */
  position: absolute;
  left: 0; top: 0;
  width: 160px;
  will-change: transform;
}
/* The glow ball — position set entirely by JS */
.cs-glow-ball {
  position: fixed;
  width: 22px; height: 22px; border-radius: 50%;
  pointer-events: none; z-index: 20;
  background: transparent;
  box-shadow:
    0 0 8px  5px  rgba(200,146,42,0.55),
    0 0 22px 10px rgba(200,146,42,0.25),
    0 0 52px 22px rgba(200,100,20,0.12);
  transform: translate(-50%, -50%);
  will-change: left, top, opacity;
}

/* ─────────── TEXT OVERLAY ──────────────────
   Right side: starts just after the tube spine.
   left: 52%  (a bit past centre)
   right: 0
────────────────────────────────────────── */
.cs-text-overlay {
  position: fixed;
  top: 0; bottom: 0;
  left: 54%; right: 0;
  z-index: 10;
  pointer-events: none;
  display: flex; flex-direction: column;
  justify-content: flex-start;
  opacity: var(--text-opacity, 0);
  will-change: opacity;
}
.cs-text-header {
  padding: 3.5rem 3rem 1rem 2.5rem;
  display: flex; flex-direction: column; gap: 0.45rem;
  flex-shrink: 0;
}
.cs-chapter-rule {
  display: block; width: 36px; height: 1px;
  background: var(--accent); opacity: 0.5; margin-bottom: 0.2rem;
}
.cs-eyebrow {
  font-family: 'Cinzel', serif; font-size: 0.58rem;
  letter-spacing: 0.45em; color: var(--accent);
  text-transform: uppercase; opacity: 0.85;
}
.cs-scroll-float {
  overflow: hidden;
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(1.1rem, 2.4vw, 2.1rem); font-weight: 700;
  color: var(--parchment); line-height: 1.22;
  text-shadow: 0 2px 30px rgba(0,0,0,0.95);
}
.cs-scroll-float-text { display: inline; }
.cs-char {
  display: inline-block;
  will-change: opacity, transform, filter;
  transform-origin: 50% 0%;
}

/* ── Masked text scroll window ── */
.cs-scroll-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black var(--top-fade, 5%),
    black calc(100% - var(--bottom-fade, 8%)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black var(--top-fade, 5%),
    black calc(100% - var(--bottom-fade, 8%)),
    transparent 100%
  );
}
/* Body content slides upward as tProg increases */
.cs-body {
  position: absolute; left: 0; right: 0;
  top: var(--content-offset, 100%);
  will-change: top;
  padding: 0 3rem 5rem 2.5rem;
}
.cs-scroll-reveal { transform-origin: 0% 50%; }
.cs-scroll-reveal-text {
  font-size: clamp(0.82rem, 1.25vw, 1rem);
  line-height: 2.1; color: rgba(242,232,201,0.78);
  font-style: italic; margin-bottom: 1.6rem;
}
.cs-word { display: inline; }
.cs-word.hl {
  color: var(--parchment); font-style: normal;
  text-shadow: 0 0 18px rgba(200,146,42,0.28);
}
.cs-tags-text {
  font-family: 'Cinzel', serif; font-size: 0.65rem;
  letter-spacing: 0.3em; color: var(--accent);
  opacity: 0.65; font-style: normal;
}

/* ─────────── FOOTER ─────────────────────── */
.cs-footer {
  position: absolute; bottom: 0; left: 0; right: 0;
  text-align: center; padding: 4rem 2rem 3rem; z-index: 2;
  background: linear-gradient(0deg, #000 0%, transparent 100%);
}
.cs-footer-symbol {
  font-size: 2.5rem; color: var(--rune-gold); display: inline-block;
  animation: csSpinSlow 30s linear infinite;
  filter: drop-shadow(0 0 16px rgba(200,146,42,0.35)); margin-bottom: 0.6rem;
}
.cs-footer-text {
  font-family: 'Cinzel', serif; font-size: 0.62rem;
  letter-spacing: 0.35em; color: rgba(200,146,42,0.28); text-transform: uppercase;
}

/* ─────────── OVERLAYS ───────────────────── */
.cs-ember-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 50; }
.cs-grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
}

/* ─────────── RESPONSIVE ─────────────────── */
@media (max-width: 700px) {
  .cs-creature-image  { width: 100%; object-position: center 10%; }
  .cs-image-frame     { width: 100%; }
  .cs-text-overlay    {
    left: 0; right: 0;
    background: linear-gradient(to top, rgba(10,5,0,0.94) 0%, transparent 55%);
    justify-content: flex-end;
  }
  .cs-text-header { padding: 1rem 1.5rem 0.5rem; }
  .cs-body        { padding: 0 1.5rem 4rem; }
  .cs-center-divider { display: none; }
  .cs-tube-host   { display: none; }
  .cs-glow-ball   { display: none; }
}
`;

/* ═══════════════════════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════════════════════ */
const clamp      = (v, a, b) => Math.min(Math.max(v, a), b);
const easeOut    = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut  = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const smoothstep = (t) => t * t * (3 - 2 * t);
const segment    = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);
const resolveSrc = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.default || img.src || "";
  return "";
};

/* ═══════════════════════════════════════════════════════════
   DATA  (original, unchanged)
   ═══════════════════════════════════════════════════════════ */
const COLOR_BY_ID = {
  1: "#ff6b6b", 2: "#ff3b3b", 3: "#4aa3ff",
  4: "#ff5ab1", 12: "#29e1ff", 13: "#d1a04b", 14: "#9aa5ff",
};
const colorFor = (id) => COLOR_BY_ID[id] || "#9aa5ff";

const RAW_CREATURES = [
  {
    id: 1,
    img: require("../../bilder/smart_gnome.png"),
    title: "Nisse — The Farmstead Gnome",
    sub: "Friendly",
    tags: ["gnome", "friendly", "folk"],
    details: `Nisser are the Nordic kin of gnomes: small, clever beings who make their homes around farms—lofts, barns, and quiet corners where the hay still smells of summer. They're often seen in red caps and simple coats that echo the look of Santa Claus, which is why many call them "the Nordic Santa." In winter, people leave out a bowl of warm Christmas porridge by the barn door. It's an old promise: treat the nisse well, and he'll keep the animals calm and the tools working; insult him, and you'll spend the night chasing spilled grain and untied knots.

Nisser come in many shapes and sizes, but they share the same heart: intelligent, watchful, and fair. Be polite, show respect, and they'll be kind in return. Cross them—and they will remind you who really runs the farm after dark.

In VOTE, this Nisse is one of the main characters—among the sharpest minds of his kind. He's your steady companion through the unknown: reading signs you miss, spotting hidden paths, and nudging puzzles into place when danger grows close. Expect quick wit, quiet magic, and the occasional grumble if you forget your manners. Treat him well, and he'll guide you safely—cap bobbing in the lantern light—toward whatever waits in the dark.`,
  },
  {
    id: 2,
    img: require("../../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"),
    title: "Forest Dweller",
    sub: "Unfriendly",
    tags: ["forest", "dark"],
    details: `Forest Dwellers are a twisted offshoot of the Nisse taken by the dark and turned inward until only hunger remains. They shun the sun and every bright thing, nesting in burrows, root-caves, and the hollow undersides of fallen trees. Where a Nisse keeps a farm running, a Forest Dweller unthreads it, hoarding what it can't eat and breaking what it can't carry.

They are dangerous not out of need, but desire. Cruel when they think no one is watching, they lash out for sport and skitter back to the dark. Yet for all their malice, they are simple-minded: the first glimpse of anything unfamiliar—light, a firm voice, a sudden clatter—can send them stumbling away with frightened chatter.

If you meet one, keep your lantern high and your steps steady. Do not chase; make yourself larger than your fear. In the under-earth where they lurk, courage and brightness are sharper than any blade.`,
  },
  {
    id: 3,
    img: require("../../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"),
    title: "Shadow",
    sub: "Unfriendly",
    tags: ["shadow", "mystic"],
    details: `Shadow is a demon set by Odin to guard the borders of the world you are drawn into—its warden and its executioner. It lives in the fog, moving where sight fails and breath turns cold. Step into that mist and it will be the last step you ever take.

This creature carries a darkness unlike anything seen before: a demonic night that drinks sound and swallows courage. In Scandinavian lore there is the old name—Gammel Erik. In his reckoning with Hel, he seized thousands of beings and broke them to his will: horns snapped, hooves cut away, wings torn from those that wore them. Cursed by his command, they were bound to the shadows, to watch and to punish any who trespass.

Where Shadow passes, lanterns gutter and paths forget where they lead. It does not bargain. It does not warn. If you feel the fog thicken and the world grow muffled, turn back—because Shadow never does.`,
  },
  {
    id: 4,
    img: require("../../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"),
    title: "Huldra",
    sub: "Unfriendly",
    tags: ["folk", "myth"],
    details: `Huldra is a forest spirit of Norwegian folklore—a breathtaking woman who steps out of birch and shadow with a smile that feels like summer. She sings soft and sweet, and wanderers follow before they realize they've left the path. Like sirens and mermaids, she lures with beauty and voice—but what she hides is sharper than love can soften.

Some say she wears a cow's tail tucked behind her dress; others whisper her back is hollow like a rotted tree. When the glamour slips, the truth shows through: bark-pale skin, eyes like deep moss, and a hunger older than the farmsteads she haunts. She rewards respect with gifts of luck and safe passage—but mock her, boast, or try to pry at her secrets, and the woods will close like a fist.

Huldra is kin to the sea's sirens, but her realm is the high forest where wind threads through needles and stones remember your name. If you hear her song, keep your wits and your lantern close. Beauty leads you in; only wisdom leads you out.`,
  },
  {
    id: 12,
    img: require("../../bilder/Nøkken.png"),
    title: "Nøkken",
    sub: "Unfriendly",
    tags: ["water", "monster"],
    details: `Nøkken is a Scandinavian river spirit that haunts broad rivers, deep lakes, and still, black waters. Its eyes shine like lanterns beneath the surface, and its head is tangled with roots and moss so it can lie hidden among reeds and driftwood. It calls from the shore with soft music or the splash of something just out of sight, drawing wanderers closer until the water is the only path left.

Hungry and patient, Nøkken lures not to defend a lair, but to feed. It can shape-shift into a beautiful white horse, spotless and calm, inviting riders with lowered head and gentle breath. The moment someone climbs onto its back, it surges toward the water, plunges under, and drags its victim down where the current keeps secrets.

Parents told tales of Nøkken to keep children from the banks—to teach that dark water is never harmless and beauty can be bait. If you hear a violin over still water, or see a pale horse with eyes too bright for dusk, stay away from the edge and keep the lantern high.`,
  },
  {
    id: 13,
    img: require("../../bilder/Troll.png"),
    title: "Troll",
    sub: "Unfriendly",
    tags: ["troll", "rock"],
    details: `Trolls are the giants of Nordic folklore—mountain-born, thick-skinned, and quick to anger. They hate the sun; a single dawn can crack them into stone where they stand, which is why old cliffs and crooked boulders look like sleeping faces. By night they roam forests and high passes, quarrelsome and greedy, sniffing out travelers and guarding bridges as if the earth itself were theirs.

Some trolls are clever with bargains and riddles; others are blunt as hammers. All are dangerous when mocked or crossed. Bells and iron unsettle them, and bright fire keeps them at bay—but it's wits that save most wanderers. Trade fairly, speak carefully, and never linger when the sky begins to pale.

Trolls hoard what they can't eat and hold grudges longer than winter. If you must deal with one, choose words like you choose footholds on an icy ledge—and remember: sunrise is your strongest ally.`,
  },
  {
    id: 14,
    img: require("../../bilder/Pesta.png"),
    title: "Pesta",
    sub: "Unfriendly",
    tags: ["plague", "dark"],
    details: `Pesta was born of the Black Death—a woman in ash and silence who walks where the air tastes of iron. She is not a hunter of the living, but a herald of endings: dangerous only to those already near the edge. When Pesta appears, it means death is close. Doors shutter, candles bend, and prayers learn to whisper.

You cannot run from her. She does not chase. She simply arrives at the threshold that fate has marked and sweeps it clean. If you see her, you can only hope she has come for someone else—a mercy to the suffering, a warning to the rest.

Some say she carries a broom for villages and a rake for lone houses; others say she leaves no footprints at all. But all agree: where Pesta passes, the world grows still, and the living count their heartbeats, grateful for each one more.`,
  },
];

/* ═══════════════════════════════════════════════════════════
   HIGHLIGHT HELPER  (original, unchanged)
   ═══════════════════════════════════════════════════════════ */
const markHighlights = (text) => {
  if (!text) return "";
  const sentences = text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const starters  = [/^If\b/i,/^Do not\b/i,/^Never\b/i,/^Treat\b/i,
                     /^Keep\b/i,/^Remember\b/i,/^Trade\b/i,/^Be\b/i];
  const picks = []; const usedIdx = new Set();
  sentences.forEach((s, i) => {
    if (picks.length >= 3) return;
    if (starters.some(r => r.test(s))) { picks.push(i); usedIdx.add(i); }
  });
  if (picks.length < 2 && sentences.length) { picks.push(0); usedIdx.add(0); }
  if (picks.length < 3 && sentences.length > 1) {
    const cand = sentences.map((s, i) => ({ s, i, len: s.length }))
      .filter(({ i }) => !usedIdx.has(i)).sort((a, b) => b.len - a.len)[0];
    if (cand) picks.push(cand.i);
  }
  return sentences.map((s, i) => picks.includes(i) ? `[HL]${s}[/HL]` : s).join(" ");
};

/* ═══════════════════════════════════════════════════════════
   SCROLL FLOAT  (char-by-char, GSAP)
   ═══════════════════════════════════════════════════════════ */
function ScrollFloat({ children, progress = 0, ease = "back.inOut(2)", stagger = 0.04 }) {
  const containerRef = useRef(null);
  const tlRef        = useRef(null);
  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split("").map((char, i) => (
      <span className="cs-char" key={i}>{char === " " ? "\u00A0" : char}</span>
    ));
  }, [children]);
  useLayoutEffect(() => {
    const el = containerRef.current; if (!el) return;
    const chars = el.querySelectorAll(".cs-char");
    tlRef.current?.kill();
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(chars,
      { willChange:"opacity,transform,filter", opacity:0, yPercent:130,
        scaleY:2.5, scaleX:0.65, filter:"blur(4px)", transformOrigin:"50% 0%" },
      { opacity:1, yPercent:0, scaleY:1, scaleX:1,
        filter:"blur(0px)", ease, stagger, duration:2.0 }
    );
    tlRef.current = tl;
    return () => { tl.kill(); tlRef.current = null; };
  }, [ease, stagger]);
  useEffect(() => { tlRef.current?.progress(progress); }, [progress]);
  return (
    <h3 ref={containerRef} className="cs-scroll-float">
      <span className="cs-scroll-float-text">{splitText}</span>
    </h3>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL  (word-by-word, GSAP, supports [HL] tags)
   ═══════════════════════════════════════════════════════════ */
function ScrollReveal({
  children, progress = 0, enableBlur = true,
  baseOpacity = 0.0, baseRotation = 1.5, blurStrength = 1.5,
  textClassName = "",
}) {
  const containerRef = useRef(null);
  const tlRef        = useRef(null);
  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    const hasMarkers = /\[HL\]|\[\/HL\]/.test(text);
    if (!hasMarkers) {
      return text.split(/(\s+)/).map((word, i) =>
        /^\s+$/.test(word) ? word :
        <span className="cs-word" key={i}>{word}</span>
      );
    }
    const tokens = text.split(/(\[HL\]|\[\/HL\])/);
    let inHL = false, key = 0; const nodes = [];
    tokens.forEach(t => {
      if (t === "[HL]")  { inHL = true;  return; }
      if (t === "[/HL]") { inHL = false; return; }
      if (!t) return;
      t.split(/(\s+)/).forEach(piece => {
        if (/^\s+$/.test(piece)) { nodes.push(piece); return; }
        if (piece.length)
          nodes.push(
            <span className={`cs-word${inHL ? " hl" : ""}`} key={`w-${key++}`}>{piece}</span>
          );
      });
    });
    return nodes;
  }, [children]);
  useLayoutEffect(() => {
    const el = containerRef.current; if (!el) return;
    const words = el.querySelectorAll(".cs-word");
    tlRef.current?.kill();
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(el,
      { rotate: baseRotation, transformOrigin:"0% 50%" },
      { rotate:0, ease:"power2.out", duration:1 }, 0
    );
    tl.fromTo(words,
      { opacity:baseOpacity, filter:enableBlur?`blur(${blurStrength}px)`:"none",
        y:enableBlur?4:0, willChange:"opacity,filter,transform" },
      { opacity:1, filter:enableBlur?"blur(0px)":"none", y:0,
        ease:"power2.out", duration:1.1,
        stagger:{ each:0.018, ease:"power1.inOut" } }, 0
    );
    tlRef.current = tl;
    return () => { tl.kill(); tlRef.current = null; };
  }, [enableBlur, baseOpacity, baseRotation, blurStrength]);
  useEffect(() => { tlRef.current?.progress(progress); }, [progress]);
  return (
    <div ref={containerRef} className="cs-scroll-reveal">
      <p className={`cs-scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VEGVISIR EMBLEM
   ═══════════════════════════════════════════════════════════ */
function VegvisirEmblem() {
  return (
    <svg className="cs-emblem" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g className="cs-outer-ring">
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(200,146,42,0.28)" strokeWidth="1.5"/>
        <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(200,146,42,0.1)" strokeWidth="6"/>
        <text fontSize="9" fill="rgba(200,146,42,0.52)" fontFamily="serif" textAnchor="middle">
          <textPath href="#cs-rp">ᚠ · ᚢ · ᚦ · ᚨ · ᚱ · ᚲ · ᚷ · ᚹ · ᚺ · ᚾ · ᛁ · ᛏ · ᛒ · ᛖ · ᛗ · ᛚ · ᛜ · ᛞ · ᛟ ·</textPath>
        </text>
        <defs><path id="cs-rp" d="M100,18 a82,82 0 1,1 -0.01,0 z"/></defs>
      </g>
      <g className="cs-inner-ring">
        <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(200,146,42,0.18)" strokeWidth="1"/>
      </g>
      <g stroke="rgba(200,146,42,0.82)" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="100" y1="38"  x2="100" y2="162"/>
        <line x1="38"  y1="100" x2="162" y2="100"/>
        <line x1="55"  y1="55"  x2="145" y2="145"/>
        <line x1="145" y1="55"  x2="55"  y2="145"/>
        <path d="M100,38 l-7,14 M100,38 l7,14"      opacity="0.9"/>
        <path d="M100,162 l-7,-14 M100,162 l7,-14"   opacity="0.9"/>
        <path d="M38,100 l14,-7 M38,100 l14,7"      opacity="0.9"/>
        <path d="M162,100 l-14,-7 M162,100 l-14,7"   opacity="0.9"/>
        <path d="M55,55   l5,15 M55,55   l15,5"     opacity="0.65"/>
        <path d="M145,55  l-5,15 M145,55  l-15,5"   opacity="0.65"/>
        <path d="M55,145  l5,-15 M55,145  l15,-5"   opacity="0.65"/>
        <path d="M145,145 l-5,-15 M145,145 l-15,-5" opacity="0.65"/>
      </g>
      <circle cx="100" cy="100" r="11" fill="rgba(200,146,42,0.68)"/>
      <circle cx="100" cy="100" r="5"  fill="#0a0500"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO DECORATIONS
   ═══════════════════════════════════════════════════════════ */
function HeroDecorations() {
  const starsRef = useRef(null);
  const runesRef = useRef(null);
  const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
  useEffect(() => {
    if (starsRef.current && !starsRef.current.children.length) {
      for (let i = 0; i < 80; i++) {
        const s = document.createElement("div"); s.className = "cs-star";
        const sz = 0.8 + Math.random() * 2;
        s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-duration:${2+Math.random()*4}s;animation-delay:${Math.random()*5}s;`;
        starsRef.current.appendChild(s);
      }
    }
    if (runesRef.current && !runesRef.current.children.length) {
      for (let i = 0; i < 22; i++) {
        const r = document.createElement("div"); r.className = "cs-rune-float";
        r.textContent = RUNES[Math.floor(Math.random() * RUNES.length)];
        r.style.left = (5 + Math.random() * 90) + "%";
        r.style.top  = (15 + Math.random() * 75) + "%";
        r.style.fontSize = (0.85 + Math.random() * 1.4) + "rem";
        r.style.animationDuration = (7 + Math.random() * 9) + "s";
        r.style.animationDelay   = (Math.random() * 9) + "s";
        runesRef.current.appendChild(r);
      }
    }
  }, []);
  return (
    <>
      <div className="cs-hero-stars" ref={starsRef}/>
      <div className="cs-hero-runes" ref={runesRef}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TUBE SPINE
   ─────────────────────────────────────────────────────────
   Canvas width = TUBE_W = 160px, centred at 50vw.
   Canvas height = full gallery height in px.

   The canvas sits inside .cs-tube-host (fixed, overflow:hidden).
   On every scroll tick we do:
     canvas.style.transform = `translateY(${-galleryScrollY}px)`
   where galleryScrollY = scrollY - heroHeightPx.
   This keeps the same sine-wave section at the viewport midpoint.

   Ball position (screen coords):
     X = hostLeft + getPathX(docY)        (hostLeft = 50vw - 80px)
     Y = 42vh
   where docY = galleryScrollY + viewH * 0.42
   ═══════════════════════════════════════════════════════════ */
const TUBE_W    = 160;
const TUBE_CX   = TUBE_W / 2;   // = 80  (centre of canvas)
const AMPLITUDE = 36;
const WAVEFORM  = 310;           // pixels per full sine cycle
const getPathX  = (y) => TUBE_CX + Math.sin((y / WAVEFORM) * Math.PI * 2) * AMPLITUDE;

function drawTube(canvas) {
  const ctx = canvas.getContext("2d");
  const H   = canvas.height;
  ctx.clearRect(0, 0, TUBE_W, H);
  const steps = Math.ceil(H / 3);
  const tracePath = () => {
    ctx.beginPath();
    ctx.moveTo(getPathX(0), 0);
    for (let i = 1; i <= steps; i++) {
      const y = (i / steps) * H;
      ctx.lineTo(getPathX(y), y);
    }
  };
  // three layered soft glows — no hard line
  [
    [56, "rgba(170,80,5,0.028)"],
    [34, "rgba(195,110,15,0.045)"],
    [18, "rgba(218,138,28,0.058)"],
  ].forEach(([w, c]) => {
    ctx.save();
    ctx.lineWidth = w; ctx.strokeStyle = c;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    tracePath(); ctx.stroke();
    ctx.restore();
  });
}

/* ═══════════════════════════════════════════════════════════
   EMBERS
   ═══════════════════════════════════════════════════════════ */
function useEmbers(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let embers = [], rafId = null;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const spawn = () => embers.push({
      x: Math.random() * canvas.width, y: canvas.height + 8,
      vx: (Math.random() - .5) * .7, vy: -(0.5 + Math.random() * 1.2),
      life: 1, decay: 0.0035 + Math.random() * 0.005, size: 1 + Math.random() * 2.2,
      color: Math.random() > .5 ? "#d94f00" : "#c8922a",
    });
    const tid = setInterval(spawn, 130);
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      embers = embers.filter(e => e.life > 0);
      for (const e of embers) {
        e.x += e.vx + Math.sin(e.life * 9) * .25; e.y += e.vy; e.life -= e.decay;
        ctx.save(); ctx.globalAlpha = e.life * .65; ctx.fillStyle = e.color;
        ctx.shadowColor = e.color; ctx.shadowBlur = 7;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      clearInterval(tid); cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

/* ═══════════════════════════════════════════════════════════
   PHASE CONSTANTS  (identical to original)
   ═══════════════════════════════════════════════════════════ */
const HERO_PHASE   = 20;
const ZOOM_PHASE   = 70;
const TEXT_PHASE   = 380;
const EXIT_PHASE   = 90;
const PHASE_LENGTH = ZOOM_PHASE + TEXT_PHASE + EXIT_PHASE; // 540

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CharacterScroll() {
  const CREATURES    = useMemo(() => RAW_CREATURES.map(c => ({ ...c, src: resolveSrc(c.img) })), []);
  const TOTAL_HEIGHT = HERO_PHASE + CREATURES.length * PHASE_LENGTH + 60; // vh

  /* refs */
  const wrapperRef         = useRef(null);
  const scrollContainerRef = useRef(null);
  const heroRef            = useRef(null);
  const stageRef           = useRef(null);
  const haloRef            = useRef(null);
  const imageRefs          = useRef([]);
  const textOverlayRef     = useRef(null);
  const scrollWrapRef      = useRef(null);
  const bodyRef            = useRef(null);
  const tubeHostRef        = useRef(null);  // the fixed 160px wrapper
  const tubeCanvasRef      = useRef(null);
  const ballRef            = useRef(null);
  const emberCanvasRef     = useRef(null);

  /* scroll logic state */
  const [renderIndex, setRenderIndex] = useState(-1);
  const lockedIndexRef = useRef(-1);
  const textProgRef    = useRef(0);
  const exitingRef     = useRef(false);
  const exitProgRef    = useRef(0);

  /* embers */
  useEmbers(emberCanvasRef);

  /* inject CSS once */
  useEffect(() => {
    const id = "cs-global-style";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style"); tag.id = id; tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
  }, []);

  /* scroll container height */
  useEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.style.height = `${TOTAL_HEIGHT}vh`;
  }, [TOTAL_HEIGHT]);

  /* ── Build tube canvas ──
     Height = full gallery scroll in pixels.
     Called on mount + resize.
  */
  const buildTube = useCallback(() => {
    const canvas = tubeCanvasRef.current; if (!canvas) return;
    const viewH = window.innerHeight;
    const galH  = CREATURES.length * PHASE_LENGTH * viewH / 100;
    // add one extra viewport so the wave doesn't clip at the very bottom
    const totalH = galH + viewH;
    canvas.width  = TUBE_W;
    canvas.height = Math.ceil(totalH);
    canvas.style.width  = TUBE_W + "px";
    canvas.style.height = canvas.height + "px";
    drawTube(canvas);
  }, [CREATURES.length]);

  useEffect(() => {
    buildTube();
    window.addEventListener("resize", buildTube);
    return () => window.removeEventListener("resize", buildTube);
  }, [buildTube]);

  /* ── Update tube scroll + ball position ──
     Called on every scroll tick with the smoothed Y.
  */
  const updateTubeAndBall = useCallback((scrollY) => {
    const canvas = tubeCanvasRef.current;
    const ball   = ballRef.current;
    const host   = tubeHostRef.current;
    if (!canvas || !ball || !host) return;

    const viewH   = window.innerHeight;
    const heroH   = HERO_PHASE * viewH / 100;  // hero height in px
    // how many px we've scrolled into the gallery section
    const galScrollY = Math.max(0, scrollY - heroH);

    // ── Scroll the canvas: shift it up by galScrollY
    // so the correct wave section is always at viewport 42%
    canvas.style.transform = `translateY(${-galScrollY}px)`;

    // ── Ball position
    // docY = where we are on the canvas = galScrollY + fixed screen position
    const BALL_SCREEN_Y = viewH * 0.42;
    const docY          = galScrollY + BALL_SCREEN_Y;
    // hostLeft = left edge of the fixed tube host in screen coords
    // Since host is `left: calc(50% - 80px)`, this equals innerWidth/2 - 80
    const hostLeft = window.innerWidth / 2 - 80;
    const ballX    = hostLeft + getPathX(docY);
    ball.style.left    = ballX + "px";
    ball.style.top     = BALL_SCREEN_Y + "px";

    // fade in as we enter gallery
    const into = scrollY - heroH;
    ball.style.opacity = String(clamp((into + viewH * 0.3) / 350, 0, 1));
  }, []);

  /* ── GSAP progress polling (50ms) ── */
  const [textProgState, setTextProgState] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTextProgState(textProgRef.current), 50);
    return () => clearInterval(id);
  }, []);

  const headingProg = easeOut(segment(textProgState, 0.06, 0.40));
  const copyProg    = segment(textProgState, 0.18, 0.99);
  const tagsProg    = segment(textProgState, 0.70, 0.97);

  /* ══════════════════════════════════════════════
     MAIN SCROLL ENGINE  (original logic, unchanged)
  ══════════════════════════════════════════════ */
  useEffect(() => {
    if (!wrapperRef.current || !scrollContainerRef.current) return;

    const getBounds = () => {
      const rect  = wrapperRef.current.getBoundingClientRect();
      const top   = window.scrollY + rect.top;
      const viewH = window.innerHeight;
      const end   = top + rect.height - viewH;
      return { start: Math.max(0, top), end, length: Math.max(1, end - Math.max(0, top)) };
    };
    let bounds = getBounds();
    let targetY = window.scrollY, smoothY = window.scrollY, rafSmooth = null;
    const SMOOTHING = 0.10;
    let scrollVelocity = 0, lastScrollY = window.scrollY;
    let momentumRaf = null, isMomentum = false, scrollEndTimer = null;

    const handleMomentum = () => {
      if (!isMomentum) return;
      scrollVelocity *= 0.96;
      window.scrollTo(0, window.scrollY + scrollVelocity);
      if (Math.abs(scrollVelocity) < 0.15) {
        isMomentum = false; scrollVelocity = 0;
        if (momentumRaf) { cancelAnimationFrame(momentumRaf); momentumRaf = null; }
        return;
      }
      momentumRaf = requestAnimationFrame(handleMomentum);
    };
    const startMomentum = (v) => {
      if (isMomentum) return;
      scrollVelocity = v; isMomentum = true;
      if (momentumRaf) cancelAnimationFrame(momentumRaf);
      momentumRaf = requestAnimationFrame(handleMomentum);
    };

    const update = (y) => {
      const raw      = (y - bounds.start) / bounds.length;
      const progress = clamp(raw, 0, 1);

      if (stageRef.current)
        stageRef.current.style.setProperty("--stage-opacity", progress > 0 ? "1" : "0");

      const HERO_RATIO = 0.05;

      /* hero phase */
      if (progress < HERO_RATIO) {
        if (heroRef.current) {
          heroRef.current.style.opacity       = "1";
          heroRef.current.style.visibility    = "visible";
          heroRef.current.style.pointerEvents = "auto";
        }
        if (textOverlayRef.current)
          textOverlayRef.current.style.setProperty("--text-opacity", "0");
        lockedIndexRef.current = -1; setRenderIndex(-1);
        updateTubeAndBall(y); return;
      }

      /* hide hero */
      if (heroRef.current) {
        heroRef.current.style.opacity       = "0";
        heroRef.current.style.visibility    = "hidden";
        heroRef.current.style.pointerEvents = "none";
      }

      const afterHero          = (progress - HERO_RATIO) / (1 - HERO_RATIO);
      const totalCreaturePhase = afterHero * CREATURES.length;

      if (lockedIndexRef.current < 0) {
        lockedIndexRef.current = 0; setRenderIndex(0); textProgRef.current = 0;
      }

      const intendedIdx = Math.min(Math.floor(totalCreaturePhase), CREATURES.length - 1);
      if (intendedIdx < lockedIndexRef.current) {
        lockedIndexRef.current = intendedIdx; setRenderIndex(intendedIdx);
        textProgRef.current = 0; exitingRef.current = false; exitProgRef.current = 0;
      }

      const activeIdx = lockedIndexRef.current;
      const phaseRaw  = totalCreaturePhase - activeIdx;

      const zoomEnd = ZOOM_PHASE  / PHASE_LENGTH;
      const textEnd = (ZOOM_PHASE + TEXT_PHASE) / PHASE_LENGTH;

      const tProg  = clamp((phaseRaw - zoomEnd) / (textEnd - zoomEnd), 0, 1);
      const inExit = phaseRaw >= textEnd;
      const exitP  = clamp((phaseRaw - textEnd) / (1 - textEnd), 0, 1);

      if (renderIndex !== activeIdx) setRenderIndex(activeIdx);

      /* accent */
      const accent = colorFor(CREATURES[activeIdx].id);
      if (wrapperRef.current) wrapperRef.current.style.setProperty("--accent", accent);
      if (haloRef.current)    haloRef.current.style.setProperty("--halo-color", accent);

      /* text scroll */
      let textOpacity = 1;
      if (textOverlayRef.current && bodyRef.current && scrollWrapRef.current) {
        const wrapH    = scrollWrapRef.current.getBoundingClientRect().height || 0;
        const contentH = bodyRef.current.getBoundingClientRect().height       || 0;
        const startOff = wrapH + 80;
        const endOff   = Math.min(wrapH * 0.6 - contentH, startOff - 80);
        const scrollT  = inExit ? 1.0 : easeInOut(tProg);
        bodyRef.current.style.setProperty("--content-offset",
          `${startOff + (endOff - startOff) * scrollT}px`);

        const topFade = tProg < 0.05 ? 5 : 5 + ((tProg - 0.05) / 0.95) * 16;
        const botFade = 5 + (inExit ? 0 : tProg * 4);
        scrollWrapRef.current.style.setProperty("--top-fade",    `${Math.round(topFade)}%`);
        scrollWrapRef.current.style.setProperty("--bottom-fade", `${Math.round(botFade)}%`);

        if      (phaseRaw < zoomEnd * 0.6) textOpacity = 0;
        else if (phaseRaw < zoomEnd)       textOpacity = smoothstep((phaseRaw - zoomEnd*0.6) / (zoomEnd*0.4));
        else if (!inExit)                  textOpacity = 1;
        else                               textOpacity = Math.max(0, 1 - smoothstep(exitP));

        textProgRef.current = tProg;

        /* advance lock */
        if (inExit && exitP >= 0.98) {
          const next = Math.min(lockedIndexRef.current + 1, CREATURES.length - 1);
          if (next !== lockedIndexRef.current) {
            lockedIndexRef.current = next; setRenderIndex(next);
            textProgRef.current = 0; exitingRef.current = false; exitProgRef.current = 0;
          }
          updateTubeAndBall(y); return;
        }
      }

      if (textOverlayRef.current)
        textOverlayRef.current.style.setProperty("--text-opacity", String(textOpacity));

      /* image / halo */
      let zoom = 1, imgOpacity = 1, haloScale = 1.4, haloOpacity = 0.5;
      if (phaseRaw < zoomEnd) {
        const zp = phaseRaw / zoomEnd;
        zoom = 0.06 + easeOut(zp) * 0.94; imgOpacity = smoothstep(zp);
        haloScale = easeOut(zp) * 1.4;    haloOpacity = smoothstep(zp) * 0.5;
      } else if (!inExit) {
        const holdP = (phaseRaw - zoomEnd) / (textEnd - zoomEnd);
        zoom = 1.0 + holdP * 0.035; imgOpacity = 1; haloScale = 1.4; haloOpacity = 0.5;
      } else {
        const ep = smoothstep(exitP);
        zoom = 1.035 + ep * 0.30; imgOpacity = Math.max(0, 1 - ep * 1.1);
        haloScale = 1.4 + ep * 0.6; haloOpacity = Math.max(0, 0.5 - ep * 0.5);
      }

      imageRefs.current.forEach((img, idx) => {
        if (!img) return;
        if (idx === activeIdx) {
          img.style.setProperty("--zoom",    String(zoom));
          img.style.setProperty("--opacity", String(imgOpacity));
        } else {
          img.style.setProperty("--zoom",    "0.06");
          img.style.setProperty("--opacity", "0");
        }
      });
      if (haloRef.current) {
        haloRef.current.style.setProperty("--halo-scale",   String(haloScale));
        haloRef.current.style.setProperty("--halo-opacity", String(haloOpacity));
      }

      updateTubeAndBall(y);
    }; // end update()

    const tick = () => {
      smoothY += (targetY - smoothY) * SMOOTHING;
      update(smoothY);
      rafSmooth = Math.abs(targetY - smoothY) > 0.4 ? requestAnimationFrame(tick) : null;
    };

    const handleScroll = () => {
      const y = window.scrollY, vel = y - lastScrollY;
      lastScrollY = y; targetY = y;
      if (!rafSmooth) rafSmooth = requestAnimationFrame(tick);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        if (!isMomentum && Math.abs(vel) > 1.0) startMomentum(vel * 0.5);
      }, 55);
    };
    const handleResize = () => { bounds = getBounds(); buildTube(); update(smoothY); };

    targetY = window.scrollY; smoothY = window.scrollY;
    update(smoothY); handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      if (momentumRaf)    cancelAnimationFrame(momentumRaf);
      if (rafSmooth)      cancelAnimationFrame(rafSmooth);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CREATURES, TOTAL_HEIGHT, renderIndex, PHASE_LENGTH, buildTube, updateTubeAndBall]);

  const currentCreature = renderIndex >= 0 ? CREATURES[renderIndex] : null;

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="cs-root" ref={wrapperRef}>
      <div className="cs-grain" aria-hidden="true"/>

      {/* ── Scroll height spacer ── */}
      <div className="cs-scroll-container" ref={scrollContainerRef}>

        {/* Hero */}
        <section className="cs-hero" ref={heroRef}>
          <HeroDecorations/>
          <VegvisirEmblem/>
          <div className="cs-kicker">FOLKLORE UNIVERSE</div>
          <h1>MEET SOME OF THE CREATURES</h1>
          <p className="cs-hero-sub">The adventure is out there and waiting for you.</p>
          <div className="cs-scroll-cue">
            <span>Scroll to begin</span>
            <div className="cs-scroll-cue-line"/>
          </div>
        </section>

        {/* Footer */}
        <div className="cs-footer">
          <div className="cs-footer-symbol">⚚</div>
          <p className="cs-footer-text">The saga is told — may Odin remember your name</p>
        </div>

      </div>

      {/* ── Fixed stage — image left 48% ── */}
      <div className="cs-stage" ref={stageRef} style={{ "--stage-opacity": 0 }}>
        <div className="cs-halo" ref={haloRef}/>
        <div className="cs-image-frame" aria-hidden="true"/>
        {CREATURES.map((creature, index) => (
          <img
            key={creature.id}
            ref={el => (imageRefs.current[index] = el)}
            className="cs-creature-image"
            src={creature.src}
            alt={creature.title}
            loading={index === 0 ? "eager" : "lazy"}
            style={{ "--zoom": "0.06", "--opacity": "0" }}
          />
        ))}
      </div>

      {/* ── Center divider ── */}
      <div className="cs-center-divider" aria-hidden="true"/>

      {/* ── Tube spine — fixed 160px at 50vw ──
           The canvas is TALL (full gallery height).
           It gets translateY(-galScrollY) every frame
           so the right wave section is always visible.
      ── */}
      <div className="cs-tube-host" ref={tubeHostRef}>
        <canvas ref={tubeCanvasRef} className="cs-tube-canvas"/>
      </div>

      {/* ── Glow ball — position set by updateTubeAndBall() ── */}
      <div className="cs-glow-ball" ref={ballRef} style={{ opacity: 0 }}/>

      {/* ── Text overlay — right side ── */}
      <div
        className="cs-text-overlay"
        ref={textOverlayRef}
        style={{ "--text-opacity": 0 }}
      >
        {currentCreature && (
          <>
            <div className="cs-text-header">
              <span className="cs-chapter-rule"/>
              <div className="cs-eyebrow">{currentCreature.sub.toUpperCase()}</div>
              <ScrollFloat key={currentCreature.id} progress={headingProg}>
                {currentCreature.title}
              </ScrollFloat>
            </div>

            <div className="cs-scroll-wrap" ref={scrollWrapRef}>
              <div className="cs-body" ref={bodyRef}>
                <ScrollReveal
                  key={`copy-${currentCreature.id}`}
                  progress={copyProg}
                  baseOpacity={0.0} baseRotation={0} blurStrength={1.5}
                >
                  {markHighlights(
                    currentCreature.details ??
                    `In the depths of Nordic mythology, creatures like ${currentCreature.title} represent the untamed forces of nature and the unknown.`
                  )}
                </ScrollReveal>

                <ScrollReveal
                  key={`tags-${currentCreature.id}`}
                  progress={tagsProg}
                  enableBlur={false}
                  baseOpacity={0.0} baseRotation={0}
                  textClassName="cs-tags-text"
                >
                  {(currentCreature.tags ?? []).map(t => `#${t}`).join("  ")}
                </ScrollReveal>
              </div>
            </div>
          </>
        )}
      </div>

      <canvas className="cs-ember-canvas" ref={emberCanvasRef}/>
    </div>
  );
}