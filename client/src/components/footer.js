import React from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { FaEnvelope, FaGithub, FaDiscord } from 'react-icons/fa';

const GlobalFont = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=IM+Fell+English:ital@0;1&display=swap');
`;

const runeGlow = keyframes`
  0%, 100% { text-shadow: 0 0 8px rgba(180,120,40,0.4), 0 0 20px rgba(180,120,40,0.15); opacity: 0.7; }
  50%       { text-shadow: 0 0 18px rgba(210,150,50,0.9), 0 0 40px rgba(210,150,50,0.35); opacity: 1; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const runeSweep = keyframes`
  /* step = 5s (3s on + 2s off), count=13 => total 65s */

  0% {
    opacity: var(--base-o, 0.55);
    fill: rgba(200,146,42,0.55);
    filter: none;
  }

  /* Fade IN */
  0.6153846% {
    opacity: 1;
    fill: rgba(245,204,72,0.95); /* brighter gold */
    filter:
      drop-shadow(0 0 4px rgba(245,204,72,0.85))
      drop-shadow(0 0 10px rgba(240,192,64,0.45));
  }

  /* Hold glow */
  4% {
    opacity: 1;
    fill: rgba(255,220,90,1); /* slightly hotter gold */
    filter:
      drop-shadow(0 0 6px rgba(255,215,90,0.95))
      drop-shadow(0 0 14px rgba(240,192,64,0.6));
  }

  /* Fade OUT */
  4.6153846% {
    opacity: var(--base-o, 0.55);
    fill: rgba(200,146,42,0.55);
    filter: none;
  }

  /* Idle */
  7.6923077% {
    opacity: var(--base-o, 0.55);
    fill: rgba(200,146,42,0.55);
    filter: none;
  }

  100% {
    opacity: var(--base-o, 0.55);
    fill: rgba(200,146,42,0.55);
    filter: none;
  }
`;
/* Outer wrapper — transparent, just a positioning context */
const FooterWrapper = styled.footer`
  position: relative;
  width: 100%;
  margin-top: 0;
  font-family: 'Cinzel', serif;

  /* hvor høy selve fjell-kappen skal være */
  --capH: clamp(220px, 38vw, 520px);
  overflow: hidden;
`;
const FooterFill = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: var(--capH);
  bottom: 0;
  background: #130e05; /* samme som wrapper bg */
  z-index: 0;
  pointer-events: none;
`;
/* Dark background transition layer */
const DarkTransition = styled.div`
  position: absolute;
  top:-10px;
  left: 0;
  right: 0;
  height: 500px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 2%,
    rgba(0, 0, 0, 0.3) 6%,
    rgba(0, 0, 0, 0.8) 15%,
    rgba(0, 0, 0, 1) 30%,
    rgba(0, 0, 0, 1) 100%
  );
  z-index: -1;
  pointer-events: none;
`;

/* The SVG background — stretched absolutely to fill the wrapper */
const FooterSVGBg = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: var(--capH);
  pointer-events: none;
  z-index: 1;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

/* Content centered vertically in the mountain peak area */
const FooterContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1100px;
  margin: 0 auto;

  /* Dette er “hvor langt ned fra toppen av fjellet” content starter */
  padding: clamp(90px, 18vw, 170px) 48px 120px;

  animation: ${fadeUp} 0.85s ease both;

  @media (max-width: 600px) {
    padding: clamp(80px, 22vw, 150px) 22px 110px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 56px;
  align-items: start;

  margin-top: clamp(1.5rem, 8vw, 14rem);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ColTitle = styled.h3`
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e8c060;
  margin-bottom: 4px;
  position: relative;
  padding-bottom: 14px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 50px; height: 1.5px;
    background: linear-gradient(90deg, #c8922a, #f0c040, transparent);
  }
`;

const AboutText = styled.p`
  font-family: 'IM Fell English', serif;
  font-style: italic;
  color: rgba(235,215,165,0.88);
  font-size: 1rem;
  line-height: 1.82;
`;

const KnotDivider = styled.div`
  display: flex; align-items: center; gap: 10px; opacity: 0.38;
  span { display: block; height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(200,146,42,0.6), transparent); }
  em   { font-style: normal; font-size: 0.72rem; color: #c8922a; letter-spacing: 0.3em; }
`;

const ContactRow = styled.a`
  display: flex; align-items: center; gap: 12px;
  color: rgba(235,215,165,0.84);
  text-decoration: none;
  font-family: 'IM Fell English', serif;
  font-size: 0.98rem;
  transition: color 0.25s, transform 0.25s;
  position: relative; padding-left: 6px;

  svg { color: #c8922a; font-size: 1rem; flex-shrink: 0; transition: color 0.25s; }

  &:hover { color: #f0d080; transform: translateX(6px); svg { color: #f0c040; } }

  &::before {
    content: '⟩'; position: absolute; left: -12px;
    opacity: 0; color: #c8922a;
    transition: opacity 0.25s, left 0.25s; font-size: 0.8rem;
  }
  &:hover::before { opacity: 1; left: -8px; }
`;

const BottomBar = styled.div`
  margin-top: 44px; padding-top: 22px;
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid rgba(180,130,40,0.16);

  @media (max-width: 600px) { flex-direction: column; gap: 12px; text-align: center; }
`;

const Copyright = styled.p`
  font-family: 'Cinzel', serif;
  font-size: 0.78rem; letter-spacing: 0.16em;
  color: rgba(180,140,60,0.52); text-transform: uppercase;
`;

const RuneSeal = styled.div`
  font-size: 1.5rem; letter-spacing: 0.14em;
  color: rgba(180,130,40,0.38);
  animation: ${runeGlow} 4s ease-in-out infinite;
  font-family: serif; user-select: none;
`;

const BorderRune = styled.text`
  --base-o: 0.55;
  --on: 3s;
  --off: 2s;
  --step: calc(var(--on) + var(--off));
  --count: 13;

  opacity: var(--base-o);
  fill: rgba(200,146,42,0.55);

  font-family: serif;
  font-size: 16px;
  letter-spacing: 0.02em;

  paint-order: stroke fill;
  stroke: rgba(0,0,0,0.35);
  stroke-width: 1.2px;

  animation-name: ${runeSweep};
  animation-duration: calc(var(--count) * var(--step));
  animation-timing-function: linear;
  animation-iteration-count: infinite;

  /* ✅ VENSTRE → HØYRE */
  animation-delay: calc(var(--i) * var(--step));

  animation-fill-mode: both;
`;
/* ─── TICK MARKS along the mountain border — generated as an array ─── */
/* These are decorative notch positions (x, approx y on the curve) */
const tickData = [
  [120,288],[220,248],[340,198],[460,150],[580,116],
  [660,96],[720,82],[780,96],[860,116],[980,150],
  [1100,198],[1220,248],[1320,288],
];

const borderRunes = [
  "ᚠ", "ᛟ", "ᚱ", "ᛖ", "ᛋ", "ᛏ", "-", "ᚱ", "ᛖ", "ᛗ", "ᛖ", "ᛗ", "ᛒ", "ᛖ", "ᚱ", "ᛋ",
];

const Footer = () => (
  <>
    <GlobalFont />
    <FooterWrapper>

      {/* ── Dark transition layer behind the mountain ── */}
      <DarkTransition />

      {/* ── SVG IS the footer shape ── */}
      <FooterSVGBg aria-hidden="true">
        <svg
          viewBox="0 0 1440 560"
          preserveAspectRatio="xMidYMin slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background fill — dark stone */}
            <linearGradient id="bgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2a1f0e" />
              <stop offset="40%"  stopColor="#1e1609" />
              <stop offset="100%" stopColor="#130e05" />
            </linearGradient>

            {/* Warm ember glow at the top peak */}
            <radialGradient id="peakGlow" cx="50%" cy="20%" r="45%">
              <stop offset="0%"   stopColor="rgba(180,90,20,0.25)" />
              <stop offset="100%" stopColor="rgba(160,70,10,0)" />
            </radialGradient>

            {/* Cooler dark vignette at the lower edges */}
            <radialGradient id="edgeDark" cx="50%" cy="100%" r="70%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.35)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>

            {/* Gold gradient for the border stroke */}
            <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(107,74,26,0)" />
              <stop offset="10%"  stopColor="#7a5520" />
              <stop offset="28%"  stopColor="#c8922a" />
              <stop offset="50%"  stopColor="#f5cc48" />
              <stop offset="72%"  stopColor="#c8922a" />
              <stop offset="90%"  stopColor="#7a5520" />
              <stop offset="100%" stopColor="rgba(107,74,26,0)" />
            </linearGradient>

            {/* Softer inner shimmer line */}
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="transparent" />
              <stop offset="22%"  stopColor="rgba(220,170,50,0.22)" />
              <stop offset="50%"  stopColor="rgba(245,204,72,0.42)" />
              <stop offset="78%"  stopColor="rgba(220,170,50,0.22)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>


          </defs>

          {/*
            MOUNTAIN SHAPE:
            The footer starts at the very bottom of the viewport (y=480).
            It rises on both sides up toward a central arch/peak at ~y=55 (top center).
            Left and right corners sit at y≈310 (the "feet" of the mountain).

            The curve is intentionally asymmetric / organic — not a perfect arch —
            to feel more like a mountain range than a dome.
          */}

          {/* Main fill */}
          <path
            d="M 0,560 L 0,308
               C 70,292  150,262  250,220
               C 350,178  445,130  555,96
               C 620,76   670,62   720,55
               C 770,62   820,76   885,96
               C 995,130  1090,178 1190,220
               C 1290,262 1370,292 1440,308
               L 1440,560 Z"
            fill="url(#bgFill)"
          />

          {/* Ember/fire glow overlay at peak */}
          <path
            d="M 0,560 L 0,308
               C 70,292  150,262  250,220
               C 350,178  445,130  555,96
               C 620,76   670,62   720,55
               C 770,62   820,76   885,96
               C 995,130  1090,178 1190,220
               C 1290,262 1370,292 1440,308
               L 1440,560 Z"
            fill="url(#peakGlow)"
          />

          {/* Edge darkening at corners */}
          <path
            d="M 0,560 L 0,308
               C 70,292  150,262  250,220
               C 350,178  445,130  555,96
               C 620,76   670,62   720,55
               C 770,62   820,76   885,96
               C 995,130  1090,178 1190,220
               C 1290,262 1370,292 1440,308
               L 1440,560 Z"
            fill="url(#edgeDark)"
          />

          {/* Gold border tracing the mountain silhouette */}
          <path
            d="M 0,308
               C 70,292  150,262  250,220
               C 350,178  445,130  555,96
               C 620,76   670,62   720,55
               C 770,62   820,76   885,96
               C 995,130  1090,178 1190,220
               C 1290,262 1370,292 1440,308"
            fill="none"
            stroke="url(#goldStroke)"
            strokeWidth="2"
          />

          {/* Inner shimmer line — slightly inset */}
          <path
            d="M 0,316
               C 72,300  152,270  252,228
               C 352,186  447,138  557,104
               C 622,84   672,70   720,63
               C 768,70   818,84   883,104
               C 993,138  1088,186 1188,228
               C 1288,270 1368,300 1440,316"
            fill="none"
            stroke="url(#shimmer)"
            strokeWidth="1.2"
          />

          {/* Decorative rune-carving ticks along the gold border */}
          {tickData.map(([x, y], i) => (
  <BorderRune
    key={i}
    x={x}
    y={y + 5}
    textAnchor="middle"
    dominantBaseline="middle"
    style={{
      "--i": i,
      "--count": borderRunes.length,
    }}
  >
    {borderRunes[i] ?? "ᛟ"}
  </BorderRune>
))}

          {/* Tiny peak ornament — a Norse cross / sun wheel at the very top */}
          <g transform="translate(720, 55)" opacity="0.55">
            <circle cx="0" cy="0" r="10" fill="none" stroke="rgba(240,192,64,0.5)" strokeWidth="1"/>
            <line x1="-14" y1="0" x2="14" y2="0" stroke="rgba(240,192,64,0.45)" strokeWidth="1"/>
            <line x1="0" y1="-14" x2="0" y2="14" stroke="rgba(240,192,64,0.45)" strokeWidth="1"/>
            <circle cx="0" cy="0" r="3" fill="rgba(240,192,64,0.6)"/>
          </g>
        </svg>
      </FooterSVGBg>
      
      {/* ── Main content ── */}
      <FooterFill aria-hidden="true" />
      <FooterContent>

        <Grid>
          <Col>
            <ColTitle>Vintra Studio</ColTitle>
            <AboutText>
              Forged in the frozen north, we craft a world where warriors rise
              and legends are born. Our game breathe life into the ancient nordic tales — where
              every choice you take carries the weight of your soul.
            </AboutText>
            <KnotDivider><span/><em>✦ ✦ ✦</em><span/></KnotDivider>
            <AboutText style={{ fontSize: '0.88rem', opacity: 0.6 }}>
              Empowering players through immersive, myth-driven experiences.
            </AboutText>
          </Col>

          <Col>
            <ColTitle>Summon Us</ColTitle>
            <ContactRow href="mailto:support@vintrastudio.com">
              <FaEnvelope />
              support@vintrastudio.com
            </ContactRow>
            <ContactRow as="div" style={{ cursor: 'default', opacity: 0.42 }}>
              <FaEnvelope style={{ opacity: 0.4 }} />
              <span style={{ fontStyle: 'italic', fontSize: '0.9rem', fontFamily: "'IM Fell English', serif" }}>
                Carrier raven — coming soon
              </span>
            </ContactRow>
          </Col>

          <Col>
            <ColTitle>The Great Hall</ColTitle>
            <ContactRow href="https://github.com/whisperstudio" target="_blank" rel="noopener noreferrer">
              <FaGithub />
              github.com/whisperstudio
            </ContactRow>
            <ContactRow href="https://discord.gg/8cw3962z7J" target="_blank" rel="noopener noreferrer">
              <FaDiscord />
              Join the Mead Hall
            </ContactRow>
          </Col>
        </Grid>
        <BottomBar>
          <Copyright>©Vintra Studio · All rights reserved · Skål 🍺</Copyright>
          <RuneSeal aria-hidden="true">ᛏ ᛁ ᛚ - ᚹ ᚨ ᛚ ᚺ ᚨ ᛚ</RuneSeal>
        </BottomBar>
      </FooterContent>

    </FooterWrapper>
  </>
);

export default Footer;