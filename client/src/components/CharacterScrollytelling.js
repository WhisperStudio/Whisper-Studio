import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

/* ====================== Utils ====================== */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t) => t * t * (3 - 2 * t);

// Robust asset resolver (handles require(), import meta URLs, and objects)
const resolveSrc = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img; // CRA/webpack require returns string
  if (typeof img === "object") {
    // Vite/Next sometimes expose { default: url } or { src: url }
    return img.default || img.src || "";
  }
  return "";
};

/* ====================== Data ====================== */
const RAW_CREATURES = [
  { id: 1,  img: require("../bilder/smart_gnome.png"),                                    title: "Nisse",           sub: "Friendly",   tags:["gnome","friendly","folk"] },
  { id: 2,  img: require("../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"), title: "Forest Dweller",  sub: "Unfriendly", tags:["forest","dark"] },
  { id: 3,  img: require("../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"), title: "Shadow",          sub: "Unfriendly", tags:["shadow","mystic"] },
  { id: 4,  img: require("../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"), title: "Huldra",          sub: "Unfriendly", tags:["folk","myth"] },
  { id: 12, img: require("../bilder/Nøkken.png"),                                         title: "Nøkken",          sub: "Unfriendly", tags:["water","monster"] },
  { id: 13, img: require("../bilder/Troll.png"),                                          title: "Troll",           sub: "Unfriendly", tags:["troll","rock"] },
  { id: 14, img: require("../bilder/Pesta.png"),                                          title: "Pesta",           sub: "Unfriendly", tags:["plague","dark"] },
];

const COLOR_BY_ID = {
  2:  "#ff3b3b",
  3:  "#4aa3ff",
  1:  "#ff6b6b",
  4:  "#ff5ab1",
  12: "#29e1ff",
  13: "#d1a04b",
  14: "#9aa5ff",
};
const colorFor = (id) => COLOR_BY_ID[id] || "#9aa5ff";

/* ====================== Global (rockstyle polish) ====================== */
const Global = createGlobalStyle`
  :root{
    --gutter: min(3.6vw, 28px);
    --noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.045'/%3E%3C/svg%3E");
  }
  html, body, #root{ height:100%; background:#000; }
  *{ box-sizing: border-box; }
`;

/* ====================== Layout ====================== */
const Page = styled.main`
  position: relative; color:#fff; min-height:100vh; overflow-x: clip;
  background:
    radial-gradient(120vmax 80vmax at 110% -10%, rgba(255,255,255,.05), transparent 55%),
    radial-gradient(110vmax 80vmax at -10% 110%, rgba(255,255,255,.04), transparent 55%),
    #000;
  &::after{ /* film grain */
    content:""; position: fixed; inset:-40px; pointer-events:none; z-index:5;
    background-image: var(--noise);
    mix-blend-mode: soft-light; opacity:.35; filter: contrast(120%);
  }
`;

const Nav = styled.nav`
  position: sticky; top:0; z-index:10; height:64px; display:flex; align-items:center;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(0,0,0,.75), rgba(0,0,0,.25));
  border-bottom: 1px solid rgba(255,255,255,.08);
  padding: 0 var(--gutter);
  letter-spacing:.08em; text-transform: uppercase; font-weight:700; font-size:12px;
  .brand{ font-weight:900; letter-spacing:.12em; margin-right:auto; font-size:13px; }
  .pill{ padding:10px 14px; border:1px solid rgba(255,255,255,.14); border-radius:999px; }
`;

const Shell = styled.div`
  width:min(1500px, 94vw); margin:0 auto; padding: 6vh var(--gutter) 10vh;
`;

const Hero = styled.header`
  position: relative; min-height: 92vh; display:grid; place-items:center; text-align:center;
  padding: 10vh var(--gutter) 6vh;
  .kicker{ color:#a3f1ff; font-weight:800; letter-spacing:.18em; font-size:12px; text-transform:uppercase; }
  h1{ font-size: clamp(48px, 8vw, 132px); line-height:.9; margin:.15em 0 .2em; letter-spacing:.01em; }
  p{ max-width: 82ch; margin:0 auto; color:rgba(255,255,255,.85); line-height:1.8; }
  .cta{ display:inline-flex; gap:12px; margin-top:28px; }
  .btn{
    padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,.16);
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
    font-weight:700; letter-spacing:.04em; text-transform:uppercase; font-size:12px;
  }
  /* neon frame */
  &::before{ content:""; position:absolute; inset:6% 8%; border-radius:28px; z-index:-1;
    background: radial-gradient(120% 100% at 50% 50%, rgba(255,255,255,.06), transparent 60%);
    border: 1px solid rgba(255,255,255,.09);
    box-shadow: 0 0 120px rgba(199,236,255,.15) inset, 0 0 140px rgba(199,236,255,.06);
  }
`;

/* ======= Two-column scrollytelling: left text, right fixed stage ======= */
const Scroller = styled.section`
  display:grid; grid-template-columns: 1.05fr 1fr; gap: clamp(24px, 3vw, 40px);
  align-items:start; position:relative;
  @media (max-width: 1100px){ grid-template-columns: 1fr; }
`;

const TextRail = styled.div`
  display:flex; flex-direction:column; gap: clamp(22vh, 30vh, 34vh);
  scroll-snap-type: y proximity;
`;

const StageWrap = styled.div`
  position: sticky; top: 6vh; height: 88vh; border-radius: 22px; overflow:hidden;
  background: radial-gradient(100% 100% at 50% 50%, #0b0e12 0%, #07090c 100%);
  border: 1px solid rgba(255,255,255,.08);
  box-shadow: 0 60px 140px rgba(0,0,0,.6), 0 0 120px rgba(163, 241, 255, .08) inset;
`;

const Stage = styled.div`
  position:relative; width:100%; height:100%; isolation:isolate;
`;

const Poster = styled.img`
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;
  transform:
    translate3d(var(--x,0), var(--y,0), 0)
    scale(var(--scale,1));
  opacity: var(--alpha, 0);
  transition: opacity .6s ease; /* transforms are driven by rAF for buttery motion */
  filter:
    brightness(var(--br, .98))
    contrast(var(--ct, 1.06))
    saturate(var(--sat, 1.02))
    blur(var(--blur, 0px));
  will-change: transform, opacity, filter;
  -webkit-mask-image: radial-gradient(120% 110% at 50% 50%, #000 60%, rgba(0,0,0,.88) 78%, transparent 96%);
          mask-image: radial-gradient(120% 110% at 50% 50%, #000 60%, rgba(0,0,0,.88) 78%, transparent 96%);
`;

const Halo = styled.div`
  position:absolute; width: 64vmin; height: 64vmin; border-radius: 50%; z-index:0; pointer-events:none;
  left:-18vmin; top: 50%; transform: translate3d(0, -50%, 0);
  filter: blur(26px) saturate(1.1);
  mix-blend-mode: screen; opacity:.75;
  background: radial-gradient(closest-side, ${({$color}) => $color} 0%, transparent 68%);
`;

const Card = styled.article`
  position: relative; padding: 3.2vh 2.2vw; border-left: 2px solid rgba(255,255,255,.08);
  max-width: 60ch; margin-left: .6vw; scroll-snap-align: center;
  .eyebrow{ color:#a3f1ff; font-weight:800; letter-spacing:.18em; font-size:12px; text-transform:uppercase; }
  h3{ font-size: clamp(28px, 4vw, 56px); margin:.2em 0 .2em; }
  p{ color:rgba(255,255,255,.86); line-height:1.85; margin:0; }
  .tags{ margin-top: 12px; opacity:.8; font-size:13px; letter-spacing:.02em; }
`;

const Marquee = styled.div`
  margin-top: 16vh; border-block:1px solid rgba(255,255,255,.08);
  overflow:hidden; white-space:nowrap; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
  font-size: clamp(20px, 3vw, 34px); padding: 14px 0; opacity:.8;
  .inner{ display:inline-block; padding-left: 100%; animation: roll 32s linear infinite; }
  @keyframes roll{ to{ transform: translateX(-100%);} }
`;

const ProgressRail = styled.div`
  position: fixed; right: 18px; top: 84px; bottom: 18px; width: 3px; z-index: 20;
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  border-radius: 999px; overflow: hidden; pointer-events: none;
  .bar{ position:absolute; left:0; top:0; width:100%; height: var(--p, 0%);
    background: linear-gradient(180deg, #a3f1ff, #ff6b6b);
  }
`;

/* ====================== Component ====================== */
export default function RockstyleCreatures(){
  // Normalize images up front so preload + rendering use the same URL string
  const CREATURES = useMemo(
    () => RAW_CREATURES.map(c => ({ ...c, src: resolveSrc(c.img) })),
    []
  );

  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(() => CREATURES.map(() => false));

  const textRefs = useRef([]);
  const posterRefs = useRef([]);
  const stageRef = useRef(null);
  const haloRef = useRef(null);
  const rafRef = useRef(0);

  // Preload images once to avoid flash/flicker — works for png/webp
  useEffect(() => {
    const nextLoaded = [...loaded];
    CREATURES.forEach((c, i) => {
      const im = new Image();
      im.src = c.src;
      if (im.complete) nextLoaded[i] = true;
      else im.onload = () => {
        setLoaded(prev => { const copy = [...prev]; copy[i] = true; return copy; });
      };
    });
    setLoaded(nextLoaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ultra-smooth scroll-driven engine: center locking, parallax, depth, halo sway
  useEffect(() => {
    let vx = 0, vy = 0; // velocity tracker for halo sway
    let lastY = window.scrollY;

    const onFrame = () => {
      const centerY = window.scrollY + window.innerHeight / 2;
      let bestIdx = 0; let bestDist = Infinity;

      // Velocity
      const dy = window.scrollY - lastY; lastY = window.scrollY;
      vy = lerp(vy, dy, 0.18);

      for (let i = 0; i < textRefs.current.length; i++){
        const el = textRefs.current[i]; if (!el) continue;
        const rect = el.getBoundingClientRect();
        const mid = rect.top + window.scrollY + rect.height / 2;
        const d = Math.abs(mid - centerY);
        if (d < bestDist){ bestDist = d; bestIdx = i; }

        // Per-card influence 0..1 relative to center (0 at far, 1 at center)
        const radius = Math.max(window.innerHeight * 0.85, 520);
        const t = clamp(1 - Math.abs(mid - centerY) / radius, 0, 1);

        // Map to tasty transforms
        const scale = lerp(1.02, 1.0, smoothstep(t));
        const y = lerp(40, 0, easeOut(t));
        const alpha = lerp(0.0, 1.0, smoothstep(t));
        const blur = lerp(8, 0.25, smoothstep(t));
        const sat = lerp(0.96, 1.06, smoothstep(t));
        const br = lerp(0.92, 1.0, smoothstep(t));
        const ct = lerp(1.02, 1.08, smoothstep(t));

        const poster = posterRefs.current[i];
        if (poster && loaded[i]){
          poster.style.setProperty("--scale", scale.toFixed(4));
          poster.style.setProperty("--y", `${y.toFixed(2)}px`);
          poster.style.setProperty("--alpha", alpha.toFixed(3));
          poster.style.setProperty("--blur", `${blur.toFixed(2)}px`);
          poster.style.setProperty("--sat", sat.toFixed(3));
          poster.style.setProperty("--br", br.toFixed(3));
          poster.style.setProperty("--ct", ct.toFixed(3));
        }
      }

      // Soft-lock to nearest card
      setActive((prev) => (prev === bestIdx ? prev : bestIdx));

      // Halo sway based on velocity + active color glow drift
      const halo = haloRef.current;
      if (halo){
        const swayX = clamp(vy * 1.1, -36, 36);
        const swayY = clamp(-vy * 0.6, -20, 20);
        halo.style.transform = `translate3d(${swayX}px, calc(-50% + ${swayY}px), 0)`;
        halo.style.opacity = String(0.65 + Math.min(Math.abs(vy) * 0.02, 0.25));
      }

      // Global progress bar
      const total = document.body.scrollHeight - window.innerHeight;
      const p = total > 0 ? (window.scrollY / total) * 100 : 0;
      document.documentElement.style.setProperty("--progress", `${p}%`);

      rafRef.current = requestAnimationFrame(onFrame);
    };
    rafRef.current = requestAnimationFrame(onFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loaded]);

  // Reduced motion: lock to first
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.matches) return;
    setActive(0);
  }, []);

  // Keyboard nav for vibes (↑/↓ to snap to previous/next)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const idx = clamp(active + dir, 0, CREATURES.length - 1);
      const el = textRefs.current[idx];
      if (el){ el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, CREATURES.length]);

  // Progress rail percentage
  const progress = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--progress') : '0%';

  return (
    <>
      <Global />
      <Page>
        <Nav>
          <div className="brand">V.O.T.E. // Creatures</div>
          <div className="pill">Scroll to Explore</div>
        </Nav>

        <Shell>
          <Hero>
            <div className="kicker">Folklore Universe</div>
            <h1>Meet the Creatures</h1>
            <p>
              The adventure is out there and waiting for you.
            </p>
            <div className="cta">
              <button className="btn">Watch Trailer</button>
              <button className="btn">Enter World</button>
            </div>
          </Hero>

          <Scroller>
            <TextRail>
              {CREATURES.map((c, i) => (
                <Card key={c.id} ref={(el) => (textRefs.current[i] = el)}>
                  <div className="eyebrow">{(c.sub || 'Unknown').toUpperCase()}</div>
                  <h3>{c.title}</h3>
                  <p>
                    {c.title} roams our folklore-inspired world. Expect mood, mystery and danger—sometimes all at once.
                  </p>
                  <div className="tags">{c.tags?.map(t => `#${t}`).join(' ')}</div>
                </Card>
              ))}
            </TextRail>

            <StageWrap>
              <Stage ref={stageRef}>
                {/* Halo that shifts tone with the active card + velocity sway */}
                <Halo ref={haloRef} key={`halo-${CREATURES[active]?.id || 0}`} $color={colorFor(CREATURES[active]?.id)} />

                {/* Always render all posters to avoid layout thrash; parallax & crossfade handled in rAF */}
                {CREATURES.map((c, i) => {
                  const ready = loaded[i];
                  return (
                    <Poster
                      key={c.id}
                      ref={(el) => (posterRefs.current[i] = el)}
                      src={c.src}
                      alt={c.title}
                      style={{ '--alpha': ready ? undefined : 0 }}
                      aria-hidden={active !== i}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  );
                })}
              </Stage>
            </StageWrap>
          </Scroller>

          <Marquee>
            <div className="inner">
              V.O.T.E. CREATURES • FOLKLORE • NORDIC MYTH • SECURITY • CINEMATIC • NEON • GRAIN • ROCKSTYLE • V.O.T.E. CREATURES • FOLKLORE • NORDIC MYTH • SECURITY • CINEMATIC • NEON • GRAIN • ROCKSTYLE •
            </div>
          </Marquee>
        </Shell>

        <ProgressRail aria-hidden>
          <div className="bar" style={{ '--p': progress }} />
        </ProgressRail>
      </Page>
    </>
  );
}
