/** ----------------------- Character Scrollytelling (forbedret layout + path) ----------------------- */

import React, { useRef, useEffect } from "react";
import styled from "styled-components";

/* utils */
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const lerp  = (a, b, t) => a + (b - a) * t;
const ease  = t => 1 - Math.pow(1 - t, 3);

/* bring creatures from gallery */
const RAW_FROM_GALLERY = [
  { id: 1,  img: require("../bilder/smart_gnome.png"),                                        category: "Creatures", sub: "Friendly",   title: "Nisse",   tags:["gnome","friendly","folk"] },
  { id: 2,  img: require("../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"),      category: "Creatures", sub: "Unfriendly", title: "Forest Dweller", tags:["forest","dark"] },
  { id: 3,  img: require("../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"),      category: "Creatures", sub: "Unfriendly", title: "Shadow",  tags:["shadow","mystic"] },
  { id: 4,  img: require("../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"),      category: "Creatures", sub: "Unfriendly", title: "Huldra",  tags:["folk","myth"] },
  { id: 12, img: require("../bilder/Nøkken.png"),                                             category: "Creatures", sub: "Unfriendly", title: "Nøkken",  tags:["water","monster"] },
  { id: 13, img: require("../bilder/Troll.png"),                                              category: "Creatures", sub: "Unfriendly", title: "Troll",   tags:["troll","rock"] },
  { id: 14, img: require("../bilder/Pesta.png"),                                              category: "Creatures", sub: "Unfriendly", title: "Pesta",   tags:["plague","dark"] },
];
const CREATURES = RAW_FROM_GALLERY.filter(x => x.category === "Creatures");

/* ---------- styles ---------- */
const Section = styled.section`
  position: relative;
  background:#000;
  color:#fff;
  overflow: clip;
  background-image:
    radial-gradient(120vmax 80vmax at 110% -10%, rgba(255,255,255,.05), transparent 55%),
    radial-gradient(110vmax 80vmax at -10% 110%, rgba(255,255,255,.04), transparent 55%);
`;

const Wrap = styled.div`
  width:min(1400px, 94vw);
  margin:0 auto;
  padding: 10vh 0 12vh;
  position:relative;
  z-index:1;
`;

const Head = styled.header`
  margin:0 0 6vh;
  h2{ font-size:clamp(28px, 3.8vw, 56px); letter-spacing:.02em; margin:0 0 8px; }
  p{ color:rgba(255,255,255,.75); max-width:70ch; margin:0; }
`;

/* Enkel PathLayer - fixed til skjermen */
const PathLayer = styled.svg`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 5;
`;

const Track = styled.div``;

/* Forbedret TextCol med bedre fade-effekter */
const TextCol = styled.div`
  padding-left: 3vw;
  position: relative;
  z-index: 3;
  will-change: transform, opacity;

  h3{ 
    font-size:clamp(28px, 3.2vw, 46px); 
    margin:0 0 12px; 
    color: #ffffff;
    text-shadow: 0 0 20px rgba(255,255,255,0.3);
  }
  .meta{ 
    color:#7dd3fc; 
    font-weight:700; 
    margin-bottom:18px; 
    letter-spacing:.06em; 
    font-size: 14px;
  }
  p{ 
    color:rgba(255,255,255,.85); 
    line-height:1.8; 
    margin:0; 
    max-width:55ch; 
    font-size: 16px;
  }

  &::before{
    content:"";
    position:absolute; 
    inset:-8% -6% -8% -15%;
    background: radial-gradient(70% 70% at 15% 50%, rgba(0,0,0,.75), transparent 60%);
    z-index:-1;
    filter: blur(25px);
  }
`;

const MediaCol = styled.div`
  position: relative;
  height: 100%;
`;

/* Forbedret StickyMedia med bedre fade-effekter */
const StickyMedia = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.08);
  background: linear-gradient(135deg, #07090b 0%, #0a0c0f 100%);
  will-change: transform, filter;

  /* Hovedfade-overlay */
  &::before{
    content:"";
    position:absolute; 
    inset:0;
    background: radial-gradient(110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,.7) 85%);
    mix-blend-mode: multiply;
    pointer-events:none;
    z-index: 1;
  }
  
  /* Venstre side fade (mot tekst) */
  &::after{
    content:"";
    position:absolute; 
    top:0; bottom:0; left:0; width:45%;
    background: linear-gradient(90deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 60%, transparent 100%);
    filter: blur(12px);
    pointer-events:none;
    z-index: 2;
  }

  img{
    width:105%; 
    height:105%; 
    object-fit:cover; 
    display:block;
    transform: scale(1.08);
    will-change: transform, filter;
    filter: saturate(1.1) contrast(1.08) brightness(.92);
    /* Mykere mask for bedre fade */
    -webkit-mask-image: radial-gradient(130% 120% at 50% 50%, #000 60%, rgba(0,0,0,0.8) 75%, transparent 95%);
            mask-image: radial-gradient(130% 120% at 50% 50%, #000 60%, rgba(0,0,0,0.8) 75%, transparent 95%);
  }
`;

/* Panel med forbedret spacing */
const Panel = styled.section`
  position: relative;
  height: 140vh;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 4vw;

  ${p => p.$reverse && `
    grid-template-columns: 1.1fr 1fr;
    ${TextCol}{ 
      order: 2; 
      padding-left: 0; 
      padding-right: 3vw; 
      text-align: right; 
    }
    ${StickyMedia}::after{ 
      left:auto; 
      right:0; 
      background: linear-gradient(270deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 60%, transparent 100%);
    }
  `}

  @media (max-width:980px){
    grid-template-columns: 1fr;
    height: 120vh;
    gap: 3vh;
    ${TextCol}{ order:1; padding: 0 3vw; text-align:left; }
  }
`;

/* helper: beregn hvilken panel som er aktiv og fade-verdier */

const visibleProgress = (el) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const centerY = vh / 2;
  const panelCenterY = r.top + r.height / 2;
  
  // Beregn avstand fra sentrum av skjermen
  const distance = Math.abs(panelCenterY - centerY);
  const maxDistance = vh * 0.8; // Hvor langt unna før full fade
  
  // Returner fade-verdi: 1 når sentrert, 0 når langt unna
  return Math.max(0, 1 - (distance / maxDistance));
};

function CharacterScrollytelling(){
  const sectionRef = useRef(null);
  const panelRefs  = useRef([]);
  const textRefs   = useRef([]);
  const imgRefs    = useRef([]);

  /* timeline bits */
  const svgRef  = useRef(null);
  const dotRef  = useRef(null);
  const pathRef = useRef(null);

  const buildPath = () => {
    // Enkel beregning: finn hvor mange bilder vi har
    const totalImages = CREATURES.length;
    if (totalImages === 0) return;

    const sec = sectionRef.current;
    const svg = svgRef.current;
    if (!sec || !svg) return;

    const H = sec.scrollHeight;
    const W = window.innerWidth;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");

    // Beregn start og slutt Y-posisjoner
    const startY = H * 0.1; // Start 10% ned i seksjonen
    const endY = H * 0.9;   // Slutt 90% ned i seksjonen
    const totalDistance = endY - startY;
    const stepY = totalDistance / (totalImages - 1);

    // Lag enkle punkter for hver bilde-posisjon
    const points = [];
    for (let i = 0; i < totalImages; i++) {
      const y = startY + (i * stepY);
      // Alternerende sider: 50px fra kant
      const isLeft = i % 2 === 1;
      const x = isLeft ? 50 : W - 50;
      points.push({ x, y });
    }

    // Lag enkel kurve mellom punktene
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Enkel bue-kontroll: midtpunkt mellom X-verdiene
      const midX = (prev.x + curr.x) / 2;
      const midY1 = prev.y + (curr.y - prev.y) * 0.3;
      const midY2 = prev.y + (curr.y - prev.y) * 0.7;
      
      d += ` C ${midX},${midY1} ${midX},${midY2} ${curr.x},${curr.y}`;
    }
    
    pathRef.current.setAttribute("d", d);
  };

  useEffect(() => {
    const rebuild = () => buildPath();

    imgRefs.current.forEach(img => {
      if (!img) return;
      if (img.complete) return;
      img.addEventListener("load", rebuild, { once: true });
    });

    buildPath();
    const ro = new ResizeObserver(rebuild);
    ro.observe(document.documentElement);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;

    /* helper: beregn hvilken panel som er aktiv */
    const getActivePanelProgress = () => {
      const vh = window.innerHeight;
      const centerY = vh / 2;
      
      let activeIndex = 0;
      let minDistance = Infinity;
      
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        const panelCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(panelCenterY - centerY);
        
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = i;
        }
      });
      
      return activeIndex;
    };

    const tick = () => {
      // Forbedret fade-system: kun ett aktivt panel om gangen
      const activeIndex = getActivePanelProgress();
      
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        
        // Beregn fade basert på avstand fra skjermens sentrum
        const fadeAmount = visibleProgress(panel);
        const isActive = i === activeIndex;
        
        const text = textRefs.current[i];
        if (text) {
          const opacity = fadeAmount;
          const yOffset = (1 - fadeAmount) * 40;
          text.style.opacity = String(opacity);
          text.style.transform = `translateY(${yOffset}px)`;
        }

        const img = imgRefs.current[i];
        if (img) {
          const opacity = fadeAmount;
          const scale = lerp(1.12, 1.0, fadeAmount);
          const y = lerp(25, 0, fadeAmount);
          const blur = (1 - fadeAmount) * 3;
          
          img.style.opacity = String(opacity);
          img.style.transform = `translateY(${y}px) scale(${scale})`;
          img.style.filter = `brightness(${lerp(0.85, 1.0, fadeAmount)}) saturate(${lerp(0.8, 1.0, fadeAmount)}) contrast(1.08) blur(${blur}px)`;
        }
        
        // Parent panel fade
        const stickyMedia = panel.querySelector('[class*="StickyMedia"]');
        if (stickyMedia) {
          stickyMedia.style.opacity = String(fadeAmount * 0.9 + 0.1);
        }
      });

      // Enkel ball-bevegelse langs path
      const sec = sectionRef.current;
      const path = pathRef.current;
      const dot = dotRef.current;
      if (sec && path && dot) {
        const secRect = sec.getBoundingClientRect();
        const vh = window.innerHeight;

        // Beregn scroll-progress (0 til 1)
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const sectionTop = secRect.top + scrollTop;
        const sectionBottom = sectionTop + sec.scrollHeight;
        const viewportCenter = scrollTop + vh / 2;
        
        // Progress gjennom seksjonen
        const progress = clamp((viewportCenter - sectionTop) / (sectionBottom - sectionTop), 0, 1);

        const L = path.getTotalLength();
        if (L > 0) {
          const pt = path.getPointAtLength(L * progress);
          dot.setAttribute("cx", pt.x);
          dot.setAttribute("cy", pt.y);
          
          // Vis ball kun når vi er i seksjonen (ikke topp/bunn)
          const ballOpacity = progress > 0.05 && progress < 0.95 ? 1 : 0;
          dot.style.opacity = ballOpacity;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Section ref={sectionRef}>
      {/* Forbedret timeline overlay */}
      <PathLayer ref={svgRef}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#7dd3fc" stopOpacity=".7"/>
            <stop offset="50%"  stopColor="#a78bfa" stopOpacity=".8"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity=".6"/>
          </linearGradient>
          
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2"/>
            <feMerge>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
            <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7"/>
          </radialGradient>
        </defs>

        <path
          ref={pathRef}
          d=""
          fill="none"
          stroke="none"
          strokeWidth="0"
        />
        
        {/* Enkel hvit ball */}
        <circle
          ref={dotRef}
          r="15"
          fill="#ffffff"
          style={{ 
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
            opacity: 0
          }}
        />
      </PathLayer>

      <Wrap>
        <Head>
          <h2>Meet the Creatures</h2>
          <p>
            Scroll to explore beings from the world of V.O.T.E. Each frame sticks like a poster;
            images melt into the darkness as a glowing orb guides you through their stories.
          </p>
        </Head>

        <Track>
          {CREATURES.map((c, i) => {
            const reverse = i % 2 === 1;
            return (
              <Panel key={c.id} $reverse={reverse} ref={el => (panelRefs.current[i] = el)}>
                <TextCol ref={el => (textRefs.current[i] = el)}>
                  <h3>{c.title}</h3>
                  <div className="meta">{c.sub?.toUpperCase() || "UNKNOWN"}</div>
                  <p>
                    {c.title} roams our folklore-inspired world. Expect mood, mystery and danger — sometimes
                    all at once. {c.tags?.map(t => `#${t}`).join(" ")}
                  </p>
                </TextCol>

                <MediaCol>
                  <StickyMedia>
                    <img
                      ref={el => (imgRefs.current[i] = el)}
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </StickyMedia>
                </MediaCol>
              </Panel>
            );
          })}
        </Track>
      </Wrap>
    </Section>
  );
}

export default CharacterScrollytelling;