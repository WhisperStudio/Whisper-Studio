import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

/* ====================== Utils ====================== */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t) => t * t * (3 - 2 * t);

const resolveSrc = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.default || img.src || "";
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
  2: "#ff3b3b",
  3: "#4aa3ff",
  1: "#ff6b6b",
  4: "#ff5ab1",
  12: "#29e1ff",
  13: "#d1a04b",
  14: "#9aa5ff",
};
const colorFor = (id) => COLOR_BY_ID[id] || "#9aa5ff";

/* ====================== Layout ====================== */
/* Bakgrunn ala referansebildet: mørk base + myk diagonal wash av aksentfarge (bak alt) */
const ComponentWrapper = styled.div`
  --accent: #29e1ff;

  position: relative;
  width: 100%;
  color: #fff;
  background:
    radial-gradient(120vmax 90vmax at 50% 110%, rgba(0,0,0,.55), transparent 65%),
    linear-gradient(135deg,
      color-mix(in oklab, var(--accent) 18%, transparent) 0%,
      color-mix(in oklab, var(--accent) 8%, transparent) 28%,
      rgba(0,0,0,0) 60%),
    #0b0c13;
  transition: background .35s ease;

  &::after{
    content:""; position:absolute; inset:-40px; pointer-events:none; z-index:1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.045'/%3E%3C/svg%3E");
    mix-blend-mode: soft-light; opacity:.30; filter: contrast(120%);
  }
`;

const Hero = styled.section`
  position: sticky; top: 0; width: 100%; height: 100vh; 
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; z-index: 10;
  opacity: var(--hero-opacity, 1);
  transform: scale(var(--hero-scale, 1)) translateZ(0);
  transition: none;
  visibility: visible;

  .kicker{
    color:#a3f1ff; font-weight:800; letter-spacing:.18em; font-size:12px; text-transform:uppercase;
    position: relative; animation: glitchShift 2.2s infinite steps(2,end);
  }
  .kicker::after{
    content: attr(data-text); position:absolute; inset:0; transform: translateX(1px);
    color:#fff; opacity:.8; mix-blend-mode:screen; clip-path: var(--glitch-clip, inset(0 0 50% 0));
    animation: glitchClip 1.8s infinite;
  }

  h1{
    --glitch-color: #a3f1ff;
    font-size: clamp(48px, 8vw, 132px); line-height:.9; margin:.15em 0 .2em; letter-spacing:.01em;
    position: relative; animation: glitchShift 2.5s infinite steps(2,end);
  }
  h1::after{
    content: attr(data-text); position:absolute; inset:0; transform: translateX(1.5px);
    color: var(--glitch-color); opacity:.9; mix-blend-mode:screen;
    clip-path: var(--glitch-clip, inset(0 0 50% 0)); animation: glitchClip 1.6s infinite;
  }

  p{ max-width: 82ch; margin:0 auto; color:rgba(255,255,255,.85); line-height:1.8; }
`;

/* Glitch keyframes */
const GlobalKeyframes = styled.div`
  @keyframes glitchClip {
    0%{clip-path: inset(0 0 52% 0)} 20%{clip-path: inset(0 0 10% 0)}
    40%{clip-path: inset(0 0 64% 0)} 60%{clip-path: inset(0 0 28% 0)}
    80%{clip-path: inset(0 0 80% 0)} 100%{clip-path: inset(0 0 50% 0)}
  }
  @keyframes glitchShift {
    0%,100%{transform:none} 25%{transform:translateX(.2px)}
    50%{transform:translateX(.6px)} 75%{transform:translateX(.1px)}
  }
`;

const ScrollContainer = styled.div`
  position: relative;
  height: var(--total-height, 800vh);
`;

const ZoomStage = styled.div`
  position: sticky; top: 0; width: 100%; height: 100vh;
  overflow: hidden; z-index: 15;
  opacity: var(--stage-opacity, 0);
  pointer-events: none;
`;

/* Viktig: bilde over halo (halo legges bak) */
const CreatureImage = styled.img`
  position: absolute; top: 50%; left: 50%;
  z-index: 2;
  width: 80vmin; height: 80vmin;
  max-width: 100vw; max-height: 100vh;
  object-fit: cover;
  transform: translate(-50%, -50%) scale(var(--zoom, 0.1)) translateZ(0);
  opacity: var(--opacity, 0);
  border-radius: 20px;
  will-change: transform, opacity;
  filter: brightness(0.9) contrast(1.1) saturate(1.1);
  pointer-events: none;
`;

/* Tekst: header er “frozen”, kun body scroller i mask */
const TextOverlay = styled.div`
  position: absolute; right: 5vw; top: 50%;
  transform: translateY(-50%);
  z-index: 30; /* over bildet */
  max-width: 460px;
  opacity: var(--text-opacity, 0);

  .header { margin: 0 0 12px; }

  .eyebrow{
    position: relative; color:#a3f1ff; font-weight:800; letter-spacing:.18em;
    font-size:12px; text-transform:uppercase; margin-bottom: 8px;
    animation: glitchShift 2.2s infinite steps(2,end);
  }
  .eyebrow::after{
    content: attr(data-text); position:absolute; inset:0; transform: translateX(1px);
    color:#fff; opacity:.9; mix-blend-mode:screen; clip-path: var(--glitch-clip, inset(0 0 50% 0));
    animation: glitchClip 1.4s infinite;
  }

  h3{
    font-size: clamp(28px, 4vw, 56px); margin:.1em 0 .2em; line-height:1.1;
    position: relative; animation: glitchShift 2.8s infinite steps(2,end);
  }
  h3::after{
    content: attr(data-text); position:absolute; inset:0; transform: translateX(1.5px);
    color:#a3f1ff; opacity:.9; mix-blend-mode:screen; clip-path: var(--glitch-clip, inset(0 0 50% 0));
    animation: glitchClip 1.7s infinite;
  }

  /* selve scroll-vinduet (under headeren)  */
  .scrollWrap{
    position: relative;
    height: clamp(260px, 40vh, 520px); /* litt lavere for å tvinge scroll */
    overflow: hidden;
    /* fade inn rett under header + fade ut nederst */
    mask-image: linear-gradient(to bottom,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%);
  }

  /* bare brødteksten flyttes */
  .body{
    transform: translateY(var(--content-offset, 0px));
    will-change: transform;
  }

  p{ color:rgba(255,255,255,.86); line-height:1.85; margin:0 0 16px; font-size:16px; }
  .tags{ opacity:.8; font-size:13px; letter-spacing:.02em; color: rgba(255,255,255, 0.7); }
  .details{ margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.1);
    font-size: 14px; line-height: 1.6; color: rgba(255,255,255,.8); }
`;


/* Halo BAK bildet (z-index:1) – ikke lenger foran */
const Halo = styled.div`
  position: absolute; width: 80vmin; height: 80vmin; border-radius: 50%;
  z-index: 1; pointer-events: none; top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(var(--halo-scale, 0));
  filter: blur(40px) saturate(1.2);
  mix-blend-mode: screen;
  opacity: var(--halo-opacity, 0);
  background: radial-gradient(closest-side, ${({$color}) => $color} 0%, transparent 70%);
  will-change: transform, opacity;
`;

/* ====================== Component ====================== */
export default function ZoomScrollCreatures() {
  const CREATURES = useMemo(
    () => RAW_CREATURES.map(c => ({ ...c, src: resolveSrc(c.img) })),
    []
  );

  const [currentIndex, setCurrentIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const heroRef = useRef(null);
  const imageRefs = useRef([]);
  const textRef = useRef(null);
  const bodyRef = useRef(null);   // <- kun brødtekst
  const haloRef = useRef(null);
  const stageRef = useRef(null);

  // Faser
  const HERO_PHASE = 60;
  const ZOOM_PHASE = 90;
  const TEXT_PHASE = 150;
  const FADE_PHASE = 40;
  const PHASE_LENGTH = ZOOM_PHASE + TEXT_PHASE + FADE_PHASE;
  const TOTAL_HEIGHT = HERO_PHASE + (CREATURES.length * PHASE_LENGTH) + 60;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.setProperty('--total-height', `${TOTAL_HEIGHT}vh`);
    }
  }, [TOTAL_HEIGHT]);

  useEffect(() => {
    if (!wrapperRef.current || !scrollContainerRef.current) return;

    const getBounds = () => {
      const rect = wrapperRef.current.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const height = rect.height;
      const viewH = window.innerHeight;
      const start = Math.max(0, top - viewH * 0.0);
      const end   = top + height - viewH * 1.0;
      const length = Math.max(1, end - start);
      return { start, end, length };
    };

    let bounds = getBounds();

    const handleScroll = () => {
      const y = window.scrollY;
      const raw = (y - bounds.start) / bounds.length;
      const progress = clamp(raw, 0, 1);

      if (stageRef.current) {
        stageRef.current.style.setProperty('--stage-opacity', progress > 0 ? '1' : '0');
      }

      // Raskere inn i første bilde
      const HERO_RATIO = 0.12;

      if (progress < HERO_RATIO) {
        const heroProgress = progress / HERO_RATIO;
        const heroOpacity = 1 - heroProgress;
        const heroScale = 1 + heroProgress * 0.1;

        if (heroRef.current) {
          heroRef.current.style.setProperty('--hero-opacity', String(heroOpacity));
          heroRef.current.style.setProperty('--hero-scale', String(heroScale));
          heroRef.current.style.visibility = 'visible';
          heroRef.current.style.pointerEvents = 'auto';
        }
        setCurrentIndex(-1);
        return;
      }

      // Skjul hero helt
      if (heroRef.current) {
        heroRef.current.style.setProperty('--hero-opacity', '0');
        heroRef.current.style.visibility = 'hidden';
        heroRef.current.style.pointerEvents = 'none';
      }

      // Creatures
      const creatureProgress = (progress - HERO_RATIO) / (1 - HERO_RATIO);
      const totalCreaturePhase = creatureProgress * CREATURES.length;
      const activeCreatureIndex = Math.min(
        Math.floor(totalCreaturePhase),
        CREATURES.length - 1
      );
      let phaseProgress = totalCreaturePhase - activeCreatureIndex;

      setCurrentIndex(activeCreatureIndex);

      // Oppdater aksentfarge for bakgrunn
      const accent = colorFor(CREATURES[activeCreatureIndex].id);
      if (wrapperRef.current) wrapperRef.current.style.setProperty('--accent', accent);

      // Bildets anim/tekst
      let zoom = 0.1, opacity = 0, textOpacity = 0, haloScale = 0, haloOpacity = 0;

      // ---- Tekstscroll KUN for .body (p/tags/details) ----
let tProg = 0;
if (textRef.current && bodyRef.current) {
  const wrap = textRef.current.querySelector('.scrollWrap');
  const content = bodyRef.current;

  const wrapH = wrap?.getBoundingClientRect().height || 0;
  const contentH = content?.getBoundingClientRect().height || 0;

  // Hvor langt vi faktisk kan scrolle basert på innhold,
  // men gi alltid MINST litt bevegelse for “scroll-følelse”.
  const naturalScroll = Math.max(0, contentH - wrapH);
  const minScroll = clamp(window.innerHeight * 0.18, 140, 220); // 140–220px
  const travel = Math.max(naturalScroll, minScroll);

  const textPhaseStart = 0.3;
  const textPhaseEnd = 0.8;

  // map 0.3..0.8 -> 0..1
  tProg = clamp((phaseProgress - textPhaseStart) / (textPhaseEnd - textPhaseStart), 0, 1);

  // flytt brødtekst opp (negativ y)
  const offset = -travel * tProg;
  content.style.setProperty('--content-offset', `${offset}px`);

  // Ikke gå til fade/next før teksten er ferdig scrollet
  if (tProg < 1 && phaseProgress > textPhaseEnd) {
    phaseProgress = textPhaseEnd;
  }
}


      // --------- faser ----------
      if (phaseProgress < 0.3) {
        const zp = phaseProgress / 0.3;
        zoom = 0.1 + easeOut(zp) * 0.9;
        opacity = smoothstep(zp);
        haloScale = easeOut(zp) * 1.5;
        haloOpacity = smoothstep(zp) * 0.6;
        textOpacity = smoothstep(Math.max(0, (phaseProgress - 0.2) / 0.1));
      } else if (phaseProgress < 0.8) {
        zoom = 1.0;
        opacity = 1;
        haloScale = 1.5;
        haloOpacity = 0.6;
        textOpacity = 1;
      } else {
        const fp = (phaseProgress - 0.8) / 0.2;
        zoom = 1.0 + fp * 0.15;
        opacity = Math.max(0, 1 - fp * 2);
        textOpacity = Math.max(0, 1 - fp * 3);
        haloScale = 1.5 + fp * 0.5;
        haloOpacity = Math.max(0, 0.6 - fp);
      }

      // Oppdater bilde
      const img = imageRefs.current[activeCreatureIndex];
      if (img) {
        img.style.setProperty('--zoom', String(zoom));
        img.style.setProperty('--opacity', String(opacity));
      }

      // Tekst
      if (textRef.current) {
        textRef.current.style.setProperty('--text-opacity', String(textOpacity));
      }

      // Halo (bak bilde)
      if (haloRef.current) {
        haloRef.current.style.setProperty('--halo-scale', String(haloScale));
        haloRef.current.style.setProperty('--halo-opacity', String(haloOpacity));
      }

      // Skjul andre bilder
      imageRefs.current.forEach((other, idx) => {
        if (other && idx !== activeCreatureIndex) {
          other.style.setProperty('--opacity', '0');
        }
      });
    };

    const handleResize = () => {
      bounds = getBounds();
      handleScroll();
    };

    handleResize();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [CREATURES, TOTAL_HEIGHT]);

  const currentCreature = currentIndex >= 0 ? CREATURES[currentIndex] : null;

  return (
    <ComponentWrapper ref={wrapperRef}>
      <GlobalKeyframes />
      <ScrollContainer ref={scrollContainerRef}>
        {/* Hero */}
        <Hero ref={heroRef}>
          <div className="kicker" data-text="FOLKLORE UNIVERSE">FOLKLORE UNIVERSE</div>
          <h1 data-text="MEET THE CREATURES">MEET THE CREATURES</h1>
          <p>The adventure is out there and waiting for you.</p>
        </Hero>

        {/* Stage */}
        <ZoomStage ref={stageRef}>
          {currentCreature && (
            <Halo ref={haloRef} $color={colorFor(currentCreature.id)} />
          )}

          {CREATURES.map((creature, index) => (
            <CreatureImage
              key={creature.id}
              ref={(el) => (imageRefs.current[index] = el)}
              src={creature.src}
              alt={creature.title}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}

          {currentCreature && (
            <TextOverlay ref={textRef}>
              {/* HEADER (frosset) */}
              <div className="header">
                <div className="eyebrow" data-text={currentCreature.sub.toUpperCase()}>
                  {currentCreature.sub.toUpperCase()}
                </div>
                <h3 data-text={currentCreature.title}>{currentCreature.title}</h3>
              </div>

              {/* BODY (scroller, fader i topp/bunn) */}
              <div className="scrollWrap">
                <div className="body" ref={bodyRef}>
                  <p>
                    {currentCreature.title} roams our folklore-inspired world. 
                    Expect mood, mystery and danger—sometimes all at once.
                  </p>
                  <div className="tags">
                    {currentCreature.tags?.map(t => `#${t}`).join(' ')}
                  </div>
                  <div className="details">
                    In the depths of Nordic mythology, creatures like {currentCreature.title} 
                    represent the untamed forces of nature and the unknown. Each encounter 
                    tells a story of ancient wisdom, primal fear, and the delicate balance 
                    between the human world and the realm of spirits.
                    <br /><br />
                    These beings have shaped the folklore of generations, passing down 
                    warnings and wisdom through whispered tales around flickering fires. 
                    Their presence in our world serves as a reminder that magic still 
                    exists for those brave enough to seek it.
                  </div>
                </div>
              </div>
            </TextOverlay>
          )}
        </ZoomStage>
      </ScrollContainer>
    </ComponentWrapper>
  );
}
