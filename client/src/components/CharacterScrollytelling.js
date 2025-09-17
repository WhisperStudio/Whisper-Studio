import React, { useRef, useEffect } from "react";
import styled from "styled-components";

/* ---------- Utils ---------- */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - t, 3);

// smoothstep 0..1
const smooth = (t) => t * t * (3 - 2 * t);

// 0→1 between [a,b]
const ramp = (x, a, b) => clamp((x - a) / (b - a), 0, 1);

// plateau: fade in on [a,b], hold, fade out on [c,d]
const plateau = (x, a, b, c, d) => {
  const fadeIn = smooth(ramp(x, a, b));                     // 0→1
  const fadeOut = smooth(ramp(1 - x, 1 - d, 1 - c));        // 0→1 from right
  return Math.min(fadeIn, fadeOut);                         // 0..1 with flat top
};

/* ---------- Data (Creatures) ---------- */
const CREATURES = [
  { id: 1,  img: require("../bilder/smart_gnome.png"), category: "Creatures", sub: "Friendly",   title: "Nisse",           tags:["gnome","friendly","folk"] },
  { id: 2,  img: require("../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"), category: "Creatures", sub: "Unfriendly", title: "Forest Dweller", tags:["forest","dark"] },
  { id: 3,  img: require("../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"), category: "Creatures", sub: "Unfriendly", title: "Shadow",          tags:["shadow","mystic"] },
  { id: 4,  img: require("../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"), category: "Creatures", sub: "Unfriendly", title: "Huldra",          tags:["folk","myth"] },
  { id: 12, img: require("../bilder/Nøkken.png"),                                   category: "Creatures", sub: "Unfriendly", title: "Nøkken",          tags:["water","monster"] },
  { id: 13, img: require("../bilder/Troll.png"),                                    category: "Creatures", sub: "Unfriendly", title: "Troll",           tags:["troll","rock"] },
  { id: 14, img: require("../bilder/Pesta.png"),                                    category: "Creatures", sub: "Unfriendly", title: "Pesta",           tags:["plague","dark"] },
].filter(x => x.category === "Creatures");

/* ---------- Halo colors by ID ---------- */
const COLOR_BY_ID = {
  2:  "#7a0b0b", // Forest Dweller – deep red
  3:  "#1e3a5f", // Shadow – deep blue
  1:  "#6d1d1d", // Nisse – deep red
  4:  "#6b2f57", // Huldra – plum
  12: "#0a5c6b", // Nøkken – teal blue
  13: "#6a5428", // Troll – earthy brown
  14: "#3e4666", // Pesta – muted indigo
};
const colorFor = (id) => COLOR_BY_ID[id] || "#2f3b55";

/* ---------- Styles ---------- */
const MainSection = styled.section`
  position: relative;
  background: #000;
  color: #fff;
  overflow: visible;
  background-image:
    radial-gradient(120vmax 80vmax at 110% -10%, rgba(255,255,255,.05), transparent 55%),
    radial-gradient(110vmax 80vmax at -10% 110%, rgba(255,255,255,.04), transparent 55%);
`;

const Container = styled.div`
  width: min(1400px, 94vw);
  margin: 0 auto;
  padding: 10vh 0 12vh;
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  margin: 0 0 6vh;
  h2{ font-size: clamp(28px, 3.8vw, 56px); letter-spacing:.02em; margin:0 0 8px; }
  p { color: rgba(255,255,255,.75); max-width: 70ch; margin: 0; }
`;

const BallSVG = styled.svg`
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  pointer-events: none; z-index: 5;
`;

const CreaturePanel = styled.section`
  position: relative;
  height: 140vh;
  display: grid;
  grid-template-columns: ${p => (p.reverse ? "1.1fr 1fr" : "1fr 1.1fr")};
  align-items: center;
  gap: 4vw;

  @media (max-width: 980px){
    grid-template-columns: 1fr;
    height: 120vh;
    gap: 3vh;
  }
`;

const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;            /* header stays left */
  gap: 10px;

  padding-left: ${p => (p.reverse ? 0 : "3vw")};
  padding-right:${p => (p.reverse ? "3vw" : 0)};
  order:        ${p => (p.reverse ? 2 : 1)};
  position: relative;
  z-index: 3;
  max-width: 46ch;                    /* body text stays under header */
  will-change: transform, opacity;

  h3{
    font-size: clamp(28px, 3.2vw, 46px);
    margin: 0;
    color: #fff;
    text-shadow: 0 0 20px rgba(255,255,255,.3);
  }
  .category{
    color:#7dd3fc;
    font-weight:700;
    letter-spacing:.06em;
    font-size:14px;
    margin: 0 0 6px;
  }
  p{
    color: rgba(255,255,255,.85);
    line-height: 1.8;
    margin: 0;
    font-size: 16px;
  }

  &::before{
    content:"";
    position:absolute; inset:-8% -6% -8% -15%;
    background: radial-gradient(70% 70% at 15% 50%, rgba(0,0,0,.75), transparent 60%);
    z-index:-1; filter: blur(25px);
  }

  @media (max-width:980px){
    order:1; padding:0 3vw; max-width: 60ch;
  }
`;

const EdgeWrap = styled.div`
  position: relative;
  height: 100%;
  order: ${p => (p.reverse ? 1 : 2)};
  z-index: 0;
  overflow: visible;                 /* allow halo to hang outside */
  @media (max-width: 980px){ order: 2; }
`;

const StickyImageContainer = styled.div`
  position: sticky; top: 0; height: 100vh;
  display: grid; place-items: center;
  overflow: hidden; border-radius: 22px;
  margin-top: 100px; margin-bottom: 100px;
  border: none; background: linear-gradient(135deg, #07090b 0%, #0a0c0f 100%);
  will-change: transform, filter; width: clamp(520px, 62vw, 980px);
  z-index: 1;

  /* push to viewport edge */
  margin-right: ${p => (p.reverse ? "0"     : "-250px")};
  margin-left:  ${p => (p.reverse ? "-250px": "0")};

  /* Remove vignette to avoid extra darkening mid-panel */
  &::before{ content:""; display:none; }

  /* Gentle blend toward text side (keep this) */
  &::after{
    content:""; position:absolute; top:0; bottom:0;
    ${p => (p.reverse ? "right:0" : "left:0")};
    width:45%;
    background: ${p => (p.reverse
      ? "linear-gradient(270deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 60%, transparent 100%)"
      : "linear-gradient(90deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 60%, transparent 100%)")};
    filter: blur(12px); pointer-events:none; z-index:2;
  }

  img{
    width:106%; height:106%; object-fit:cover; display:block;
    transform: scale(1.08); will-change: transform, filter;
    filter: saturate(1.1) contrast(1.08) brightness(.92);
    -webkit-mask-image: radial-gradient(130% 120% at 50% 50%, #000 60%, rgba(0,0,0,0.8) 75%, transparent 95%);
            mask-image: radial-gradient(130% 120% at 50% 50%, #000 60%, rgba(0,0,0,0.8) 75%, transparent 95%);
  }
`;

/* Halo sits on the side facing the text and blends into black */
const Halo = styled.div`
  position: absolute;
  top: 50%;
  /* inner edge: when image is LEFT (reverse=true), halo sits on RIGHT; else on LEFT */
  ${p => (p.reverse ? "right:-10vw;" : "left:-10vw;")}
  transform: translateY(-50%) scale(1);
  width: clamp(420px, 48vmin, 680px);
  height: clamp(420px, 48vmin, 680px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 3;
  /* show only the half that faces inward (toward the text) */
  clip-path: ${p => (p.reverse ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)")};
  background: radial-gradient(closest-side, ${p => p.$color} 0%, rgba(0,0,0,0) 66%);
  filter: blur(26px) saturate(1.08);
  opacity: .18;               /* baseline so you always see it */
  mix-blend-mode: screen;
  box-shadow:
    0 0 60px ${p => p.$color}40,
    0 0 140px ${p => p.$color}30;
`;

/* ---------- Component ---------- */
function CharacterScrollytelling(){
  const sectionRef = useRef(null);
  const panelRefs  = useRef([]);
  const textRefs   = useRef([]);
  const haloRefs   = useRef([]);
  const imgRefs    = useRef([]);
  const svgRef     = useRef(null);
  const dotRef     = useRef(null);
  const pathRef    = useRef(null);

  const calculateVisibility = (el) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const center = vh / 2;
    const pc = r.top + r.height / 2;
    const dist = Math.abs(pc - center);
    const maxD = vh * 0.8;
    return Math.max(0, 1 - dist / maxD); // 0 (far) .. 1 (centered)
  };

  /* Build path for the scrolling orb */
  const createBallPath = () => {
    const total = CREATURES.length; if (!total) return;
    const section = sectionRef.current; const svg = svgRef.current;
    if (!section || !svg) return;

    const sectionH = section.scrollHeight;
    const w = window.innerWidth;

    svg.setAttribute("viewBox", `0 0 ${w} ${sectionH}`);
    svg.setAttribute("preserveAspectRatio", "none");

    const startY = sectionH * 0.1;
    const endY   = sectionH * 0.9;
    const stepY  = (endY - startY) / (total - 1);

    const points = [];
    for (let i = 0; i < total; i++){
      const y = startY + i * stepY;
      const isLeft = i % 2 === 1;
      const x = isLeft ? 50 : w - 50;
      points.push({ x, y });
    }

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++){
      const p = points[i - 1], c = points[i];
      const midX = (p.x + c.x) / 2;
      const midY1 = p.y + (c.y - p.y) * 0.3;
      const midY2 = p.y + (c.y - p.y) * 0.7;
      d += ` C ${midX},${midY1} ${midX},${midY2} ${c.x},${c.y}`;
    }
    if (pathRef.current) pathRef.current.setAttribute("d", d);
  };

  /* Build path on mount/resize and when images load */
  useEffect(() => {
    const rebuild = () => createBallPath();

    imgRefs.current.forEach(img => {
      if (!img || img.complete) return;
      img.addEventListener("load", rebuild, { once: true });
    });

    createBallPath();
    const ro = new ResizeObserver(rebuild);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  /* Scroll-linked animations */
  useEffect(() => {
    let raf = 0;

    const update = () => {
      // Panels: text, image, halo
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;

        const v = calculateVisibility(panel);   // 0..1
        const e = ease(v);

        // Image has a nice long "on-stage" plateau
        const imgOpacity  = plateau(v, 0.06, 0.22, 0.78, 0.94);
        // Text appears a bit later and leaves earlier
        const textOpacity = plateau(v, 0.20, 0.35, 0.65, 0.85);

        // TEXT
        const t = textRefs.current[i];
        if (t){
          t.style.opacity   = String(textOpacity);
          t.style.transform = `translateY(${(1 - textOpacity) * 40}px)`;
        }

        // IMAGE
        const img = imgRefs.current[i];
        if (img){
          const scale   = lerp(1.10, 1.0, e);     // gentle settle
          const yOffset = lerp(30, 0, e);
          const blur    = (1 - imgOpacity) * 3;
          img.style.opacity   = String(imgOpacity);
          img.style.transform = `translateY(${yOffset}px) scale(${scale})`;
          img.style.filter    = `brightness(${lerp(0.82, 1.0, e)}) saturate(${lerp(0.85, 1.0, e)}) contrast(1.06) blur(${blur}px)`;
        }

        // Poster container fade (track image)
        const sc = panel.querySelector('[class*="StickyImageContainer"]');
        if (sc){
          sc.style.opacity = String(0.08 + 0.92 * imgOpacity);
        }

        // HALO (breathes with the image plateau)
        const halo = haloRefs.current[i];
        if (halo){
          const s = lerp(0.98, 1.10, e);
          const drift = (i % 2 ? -1 : 1) * lerp(0, 14, e);
          const base = .18;
          halo.style.opacity   = String(base + (1 - base) * imgOpacity);
          halo.style.transform = `translateY(-50%) translateX(${drift}px) scale(${s})`;
        }
      });

      // Moving orb position
      const section = sectionRef.current;
      const path = pathRef.current;
      const dot  = dotRef.current;

      if (section && path && dot){
        const rect = section.getBoundingClientRect();
        const wh = window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const sectionTop = rect.top + scrollTop;
        const sectionBottom = sectionTop + section.scrollHeight;
        const viewportCenter = scrollTop + wh / 2;

        const progress = clamp((viewportCenter - sectionTop) / (sectionBottom - sectionTop), 0, 1);
        const pathLength = path.getTotalLength();
        if (pathLength > 0){
          const pt = path.getPointAtLength(pathLength * progress);
          dot.setAttribute("cx", pt.x);
          dot.setAttribute("cy", pt.y);
          dot.style.opacity = progress > 0.05 && progress < 0.95 ? 1 : 0;
        }
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <MainSection ref={sectionRef}>
      {/* Orb path + dot */}
      <BallSVG ref={svgRef}>
        <path ref={pathRef} d="" fill="none" stroke="none" strokeWidth="0" />
        <circle
          ref={dotRef}
          r="15"
          fill="#ffffff"
          style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))", opacity: 0 }}
        />
      </BallSVG>

      <Container>
        <Header>
          <h2>Meet the Creatures</h2>
          <p>
            Scroll to explore beings from the world of V.O.T.E. Each frame sticks like a poster;
            images melt into the darkness as a glowing orb guides you through their stories.
          </p>
        </Header>

        {CREATURES.map((c, index) => {
          const reverse = index % 2 === 1;
          return (
            <CreaturePanel
              key={c.id}
              reverse={reverse}
              ref={el => (panelRefs.current[index] = el)}
            >
              <TextSection reverse={reverse} ref={el => (textRefs.current[index] = el)}>
                <h3>{c.title}</h3>
                <div className="category">{c.sub?.toUpperCase() || "UNKNOWN"}</div>
                <p>
                  {c.title} roams our folklore-inspired world. Expect mood, mystery and danger —
                  sometimes all at once. {c.tags?.map(tag => `#${tag}`).join(" ")}
                </p>
              </TextSection>

              <EdgeWrap reverse={reverse}>
                {/* Halo on the inward edge (toward the text) */}
                <Halo
                  reverse={reverse}
                  $color={colorFor(c.id)}
                  ref={el => (haloRefs.current[index] = el)}
                />
                <StickyImageContainer reverse={reverse}>
                  <img
                    ref={el => (imgRefs.current[index] = el)}
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                  />
                </StickyImageContainer>
              </EdgeWrap>
            </CreaturePanel>
          );
        })}
      </Container>
    </MainSection>
  );
}

export default CharacterScrollytelling;
