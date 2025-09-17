import React, { useRef, useEffect } from "react";
import styled from "styled-components";

// Hjelpefunksjoner
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, progress) => start + (end - start) * progress;
const ease = progress => 1 - Math.pow(1 - progress, 3);

// Data
const CREATURES = [
  { id: 1,  img: require("../bilder/smart_gnome.png"), category: "Creatures", sub: "Friendly", title: "Nisse", tags:["gnome","friendly","folk"] },
  { id: 2,  img: require("../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"), category: "Creatures", sub: "Unfriendly", title: "Forest Dweller", tags:["forest","dark"] },
  { id: 3,  img: require("../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"), category: "Creatures", sub: "Unfriendly", title: "Shadow", tags:["shadow","mystic"] },
  { id: 4,  img: require("../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"), category: "Creatures", sub: "Unfriendly", title: "Huldra", tags:["folk","myth"] },
  { id: 12, img: require("../bilder/Nøkken.png"), category: "Creatures", sub: "Unfriendly", title: "Nøkken", tags:["water","monster"] },
  { id: 13, img: require("../bilder/Troll.png"), category: "Creatures", sub: "Unfriendly", title: "Troll", tags:["troll","rock"] },
  { id: 14, img: require("../bilder/Pesta.png"), category: "Creatures", sub: "Unfriendly", title: "Pesta", tags:["plague","dark"] },
].filter(x => x.category === "Creatures");

const COLOR_MAP = {
  Shadow:        '#1e3a5f',   // deep blue
  'Forest Dweller': '#2e5b3a', // mossy green
  Nisse:         '#6d1d1d',   // deep red
  Huldra:        '#6b2f57',   // plum
  'Nøkken':      '#0a5c6b',   // teal blue
  Troll:         '#6a5428',   // earthy brown
  Pesta:         '#3e4666',   // muted indigo
};
const colorFor = title => COLOR_MAP[title] || '#2f3b55';


// Main container
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
  
  h2 { 
    font-size: clamp(28px, 3.8vw, 56px); 
    letter-spacing: .02em; 
    margin: 0 0 8px; 
  }
  
  p { 
    color: rgba(255,255,255,.75); 
    max-width: 70ch; 
    margin: 0; 
  }
`;

// Ball som beveger seg (fixed til skjermen)
const BallSVG = styled.svg`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 5;
`;

// Hver creature panel
const CreaturePanel = styled.section`
  position: relative;
  height: 140vh;
  display: grid;
  grid-template-columns: ${props => props.reverse ? '1.1fr 1fr' : '1fr 1.1fr'};
  align-items: center;
  gap: 4vw;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    height: 120vh;
    gap: 3vh;
  }
`;

// Tekst-innhold
const TextSection = styled.div`
  padding-left: ${props => props.reverse ? 0 : '3vw'};
  padding-right: ${props => props.reverse ? '3vw' : 0};
  text-align: ${props => props.reverse ? 'right' : 'left'};
  order: ${props => props.reverse ? 2 : 1};
  position: relative;
  z-index: 3;
  will-change: transform, opacity;

  h3 { 
    font-size: clamp(28px, 3.2vw, 46px); 
    margin: 0 0 12px; 
    color: #ffffff;
    text-shadow: 0 0 20px rgba(255,255,255,0.3);
  }
  
  .category { 
    color: #7dd3fc; 
    font-weight: 700; 
    margin-bottom: 18px; 
    letter-spacing: .06em; 
    font-size: 14px;
  }
  
  p { 
    color: rgba(255,255,255,.85); 
    line-height: 1.8; 
    margin: 0; 
    max-width: 55ch; 
    font-size: 16px;
  }

  /* Bakgrunn fade for lesbarhet */
  &::before {
    content: "";
    position: absolute; 
    inset: -8% -6% -8% -15%;
    background: radial-gradient(70% 70% at 15% 50%, rgba(0,0,0,.75), transparent 60%);
    z-index: -1;
    filter: blur(25px);
  }

  @media (max-width: 980px) {
    order: 1; 
    padding: 0 3vw; 
    text-align: left;
  }
`;

/* wraps the sticky image and pushes it to the outer viewport edge */
const EdgeWrap = styled.div`
 position: relative;
 height: 100%;
 order: ${p => (p.reverse ? 1 : 2)};
 @media (max-width: 980px) { order: 2; }
`;

/* sticky poster that hugs the side; the halo sits outside it */
const StickyImageContainer = styled.div`
 position: sticky;
 top: 0;
 height: 100vh;
 display: grid;
 place-items: center;
 overflow: hidden;
 border-radius: 22px;
 margin-top: 100px;
 margin-bottom: 100px;
 border: none;
 background: linear-gradient(135deg, #07090b 0%, #0a0c0f 100%);
 will-change: transform, filter;
 width: clamp(520px, 62vw, 980px);

 /* push to the viewport edge */
 margin-right: ${p => (p.reverse ? '0' : '-250px')};
 margin-left:  ${p => (p.reverse ? '-250px' : '0')};

  /* Hovedfade-overlay */
  &::before {
    content: "";
    position: absolute; 
    inset: 0;
    background: radial-gradient(110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,.7) 85%);
    mix-blend-mode: multiply;
    pointer-events: none;
    z-index: 1;
  }
  
  /* Fade mot tekst */
  &::after {
    content: "";
    position: absolute; 
    top: 0; 
    bottom: 0; 
    ${p => (p.reverse ? 'right: 0px' : 'left: 0')}; 
    width: 45%;
    background: ${p => p.reverse 
      ? 'linear-gradient(270deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 60%, transparent 100%)'
      : 'linear-gradient(90deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 60%, transparent 100%)'
    };
    filter: blur(12px);
    pointer-events: none;
    z-index: 2;
  }

  img {
    width: 106%; 
    height: 106%; 
    object-fit: cover; 
    display: block;
    transform: scale(1.08);
    will-change: transform, filter;
    filter: saturate(1.1) contrast(1.08) brightness(.92);
    -webkit-mask-image: radial-gradient(130% 120% at 50% 50%, #000 60%, rgba(0,0,0,0.8) 75%, transparent 95%);
    mask-image: radial-gradient(130% 120% at 50% 50%, #000 60%, rgba(0,0,0,0.8) 75%, transparent 95%);
  }
`;
/* soft colored half-circle halo that blends into black */
const Halo = styled.div`
 position: absolute;
 top: 50%;
 ${p => (p.reverse ? 'left: 0vw;' : 'right:0vw;')}
 transform: translateY(0%);
 width: clamp(360px, 44vmin, 620px);
 height: clamp(360px, 44vmin, 620px);
 border-radius: 50%;
 pointer-events: none;
 z-index: 0;
 /* half-circle clip depending on side */
 clip-path: ${p => (p.reverse ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)')};
 background:
   radial-gradient(closest-side, ${p => p.$color} 0%,
     rgba(255, 5, 5, 0) 62%);
 filter: blur(18px) saturate(1.1);
 opacity: 1.7;
 mix-blend-mode: screen;
`;

function CharacterScrollytelling() {
  // Refs for alle elementer
  const sectionRef = useRef(null);
  const panelRefs = useRef([]);
  const textRefs = useRef([]);
  const imgRefs = useRef([]);
  const svgRef = useRef(null);
  const dotRef = useRef(null);
  const pathRef = useRef(null);

  // Beregn hvor synlig et panel er (0-1)
  const calculateVisibility = (element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const centerY = windowHeight / 2;
    const panelCenterY = rect.top + rect.height / 2;
    
    const distance = Math.abs(panelCenterY - centerY);
    const maxDistance = windowHeight * 0.8;
    
    return Math.max(0, 1 - (distance / maxDistance));
  };

  // Finn hvilket panel som er nærmest sentrum
  const findActivePanel = () => {
    const windowHeight = window.innerHeight;
    const centerY = windowHeight / 2;
    
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

  // Lag path for ball (kjøres ved oppstart og resize)
  const createBallPath = () => {
    const totalImages = CREATURES.length;
    if (totalImages === 0) return;

    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const sectionHeight = section.scrollHeight;
    const screenWidth = window.innerWidth;
    
    svg.setAttribute("viewBox", `0 0 ${screenWidth} ${sectionHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");

    // Beregn punkter for hvert bilde
    const startY = sectionHeight * 0.1;
    const endY = sectionHeight * 0.9;
    const totalDistance = endY - startY;
    const stepY = totalDistance / (totalImages - 1);

    const points = [];
    for (let i = 0; i < totalImages; i++) {
      const y = startY + (i * stepY);
      const isLeft = i % 2 === 1;
      const x = isLeft ? 50 : screenWidth - 50;
      points.push({ x, y });
    }

    // Lag kurve mellom punkter
    let pathData = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      const midX = (prev.x + curr.x) / 2;
      const midY1 = prev.y + (curr.y - prev.y) * 0.3;
      const midY2 = prev.y + (curr.y - prev.y) * 0.7;
      
      pathData += ` C ${midX},${midY1} ${midX},${midY2} ${curr.x},${curr.y}`;
    }
    
    pathRef.current.setAttribute("d", pathData);
  };

  // Setup path ved oppstart
  useEffect(() => {
    const rebuild = () => createBallPath();

    // Vent på bilder
    imgRefs.current.forEach(img => {
      if (!img || img.complete) return;
      img.addEventListener("load", rebuild, { once: true });
    });

    createBallPath();
    
    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(document.documentElement);

    return () => resizeObserver.disconnect();
  }, []);

  // Scroll-animasjoner
  useEffect(() => {
    let animationFrame = 0;

    const updateAnimations = () => {
      const activeIndex = findActivePanel();
      
      // Oppdater hvert panel
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        
        const visibility = calculateVisibility(panel);
        
        // Tekst-animasjon
        const text = textRefs.current[i];
        if (text) {
          text.style.opacity = String(visibility);
          text.style.transform = `translateY(${(1 - visibility) * 40}px)`;
        }

        // Bilde-animasjon
        const img = imgRefs.current[i];
        if (img) {
          const scale = lerp(1.12, 1.0, visibility);
          const yOffset = lerp(25, 0, visibility);
          const blur = (1 - visibility) * 3;
          
          img.style.opacity = String(visibility);
          img.style.transform = `translateY(${yOffset}px) scale(${scale})`;
          img.style.filter = `brightness(${lerp(0.85, 1.0, visibility)}) saturate(${lerp(0.8, 1.0, visibility)}) contrast(1.08) blur(${blur}px)`;
        }
        
        // Panel fade
        const stickyContainer = panel.querySelector('[class*="StickyImageContainer"]');
        if (stickyContainer) {
          stickyContainer.style.opacity = String(visibility * 0.9 + 0.1);
        }
      });

      // Ball-posisjon
      const section = sectionRef.current;
      const path = pathRef.current;
      const dot = dotRef.current;
      
      if (section && path && dot) {
        const sectionRect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const sectionTop = sectionRect.top + scrollTop;
        const sectionBottom = sectionTop + section.scrollHeight;
        const viewportCenter = scrollTop + windowHeight / 2;
        
        const progress = clamp((viewportCenter - sectionTop) / (sectionBottom - sectionTop), 0, 1);

        const pathLength = path.getTotalLength();
        if (pathLength > 0) {
          const point = path.getPointAtLength(pathLength * progress);
          dot.setAttribute("cx", point.x);
          dot.setAttribute("cy", point.y);
          
          // Vis ball kun i midtseksjonen
          const ballVisible = progress > 0.05 && progress < 0.95 ? 1 : 0;
          dot.style.opacity = ballVisible;
        }
      }

      animationFrame = requestAnimationFrame(updateAnimations);
    };

    animationFrame = requestAnimationFrame(updateAnimations);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <MainSection ref={sectionRef}>
      {/* Ball som beveger seg */}
      <BallSVG ref={svgRef}>
        <path
          ref={pathRef}
          d=""
          fill="none"
          stroke="none"
          strokeWidth="0"
        />
        
        <circle
          ref={dotRef}
          r="15"
          fill="#ffffff"
          style={{ 
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
            opacity: 0
          }}
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

        {CREATURES.map((creature, index) => {
          const isReverse = index % 2 === 1;
          
          return (
            <CreaturePanel 
              key={creature.id} 
              reverse={isReverse} 
              ref={el => (panelRefs.current[index] = el)}
            >
              <TextSection reverse={isReverse} ref={el => (textRefs.current[index] = el)}>
                <h3>{creature.title}</h3>
                <div className="category">{creature.sub?.toUpperCase() || "UNKNOWN"}</div>
                <p>
                  {creature.title} roams our folklore-inspired world. Expect mood, mystery and danger — sometimes
                  all at once. {creature.tags?.map(tag => `#${tag}`).join(" ")}
                </p>
              </TextSection>

               <EdgeWrap reverse={isReverse}>
                {/* the halo sits outside and blends into the black */}
                <Halo reverse={isReverse} $color={colorFor(creature.title)} />

                <StickyImageContainer reverse={isReverse}>
                    <img
                    ref={el => (imgRefs.current[index] = el)}
                    src={creature.img}
                    alt={creature.title}
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