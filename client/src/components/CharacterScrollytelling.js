/** ----------------------- Character Scrollytelling ----------------------- */

import React, { useRef, useEffect } from "react";
import styled from "styled-components";

/* små hjelpere */
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const lerp  = (a, b, t) => a + (b - a) * t;
const ease  = t => 1 - Math.pow(1 - t, 3);

/* Gjenbruk karakterer fra galleriet – bare Creatures */
const RAW_FROM_GALLERY = [
  { id: 1, img: require("../bilder/smart_gnome.png"), category: "Creatures", sub: "Friendly", title: "Nisse", tags:["gnome","friendly","folk"] },
  { id: 2, img: require("../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"), category: "Creatures", sub: "Unfriendly", title: "Forest Dweller", tags:["forest","dark"] },
  { id: 3, img: require("../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"), category: "Creatures", sub: "Unfriendly", title: "Shadow", tags:["shadow","mystic"] },
  { id: 4, img: require("../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"), category: "Creatures", sub: "Unfriendly", title: "Huldra", tags:["folk","myth"] },
  { id: 12, img: require("../bilder/Nøkken.png"), category: "Creatures", sub: "Unfriendly", title: "Nøkken", tags:["water","monster"] },
  { id: 13, img: require("../bilder/Troll.png"), category: "Creatures", sub: "Unfriendly", title: "Troll", tags:["troll","rock"] },
  { id: 14, img: require("../bilder/Pesta.png"), category: "Creatures", sub: "Unfriendly", title: "Pesta", tags:["plague","dark"] },
];

const CREATURES = RAW_FROM_GALLERY.filter(x => x.category === "Creatures");

/* --- styles --- */
const CS_Section = styled.section`
  position: relative;
  background: #000;
  color: #fff;
  /* liten gradient topp/bunn for lesbarhet mot videoen over */
  background-image: radial-gradient(120vmax 80vmax at 110% -10%, rgba(255,255,255,.06), transparent 55%),
                    radial-gradient(110vmax 80vmax at -10% 110%, rgba(255,255,255,.05), transparent 55%);
`;

const CS_Wrap = styled.div`
  width: min(1300px, 92vw);
  margin: 0 auto;
  padding: 10vh 0 12vh;
`;

const CS_Header = styled.header`
  margin: 0 0 6vh;
  h2{
    font-size: clamp(28px, 3.8vw, 56px);
    letter-spacing: .02em;
    margin: 0 0 8px;
  }
  p{
    color: rgba(255,255,255,.75);
    max-width: 70ch;
    margin: 0;
  }
`;

const CS_Track = styled.div`
  /* hvert panel er “langt”, så bildet kan stå sticky */
`;

const Panel = styled.section`
  position: relative;
  height: 140vh;                 /* gir god “reise” per karakter */
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  align-items: center;
  gap: 3vw;

  @media (max-width: 980px){
    grid-template-columns: 1fr;
    height: 120vh;
  }
`;

const TextCol = styled.div`
  padding-left: 2vw;
  position: relative;
  z-index: 2;
  will-change: transform, opacity;

  h3{
    font-size: clamp(28px, 3.2vw, 46px);
    margin: 0 0 10px;
  }
  .meta{
    color: #90e0ef;
    font-weight: 700;
    margin-bottom: 16px;
    letter-spacing: .04em;
  }
  p{
    color: rgba(255,255,255,.8);
    line-height: 1.75;
    margin: 0;
    max-width: 60ch;
  }
`;

const MediaCol = styled.div`
  position: relative;
  height: 100%;
`;

const StickyMedia = styled.div`
  position: sticky;
  top: 0;                        /* “hold” bildet i viewport */
  height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.12);
  background: #080a0c;
  will-change: transform, filter;

  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.06);
    will-change: transform, filter;
    filter: saturate(1.02) contrast(1.03) brightness(.96);
  }
`;

/* liten helper for å lese hvor langt panelet er inne i viewport */
const visibleProgress = (el) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  /* start litt før toppen, slutt litt etter bunn for “treig” bevegelse */
  const start = vh * 0.85;
  const end   = -r.height * 0.25;
  const t = clamp((start - r.top) / (start - end), 0, 1);
  return t;
};

function CharacterScrollytelling(){
  const panelRefs = useRef([]);
  const textRefs  = useRef([]);
  const imgRefs   = useRef([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      panelRefs.current.forEach((panel, i) => {
        if(!panel) return;
        const t  = visibleProgress(panel);     // 0..1 hvor langt i panelet vi er
        const e  = ease(t);

        // tekst: fade + translate (liten)
        const text = textRefs.current[i];
        if(text){
          text.style.opacity   = String(e);
          text.style.transform = `translateY(${(1-e)*26}px)`;
        }

        // media: subtil zoom-in og parallax
        const img = imgRefs.current[i];
        if(img){
          const scale = lerp(1.04, 1.0, e);            // 1.04 -> 1.00
          const y     = lerp(16, -12, e);              // liten parallax
          img.style.transform = `translateY(${y}px) scale(${scale})`;
          img.style.filter    = `brightness(${lerp(0.92, 1.0, e)})`;
        }
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <CS_Section>
      <CS_Wrap>
        <CS_Header>
          <h2>Meet the Creatures</h2>
          <p>
            Scroll to explore a few of the beings wandering the world of V.O.T.E.  
            Subtle motion, sticky frames and smooth easing make the reveals feel cinematic.
          </p>
        </CS_Header>

        <CS_Track>
          {CREATURES.map((c, i) => (
            <Panel
              key={c.id}
              ref={el => (panelRefs.current[i] = el)}
            >
              <TextCol ref={el => (textRefs.current[i] = el)}>
                <h3>{c.title}</h3>
                <div className="meta">{c.sub?.toUpperCase() || "UNKNOWN"}</div>
                <p>
                  {c.title} appears in our folklore-inspired world.  
                  Expect mood, mystery and danger — sometimes all at once.  
                  ({c.tags?.map(t => `#${t}`).join(" ")})
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
          ))}
        </CS_Track>
      </CS_Wrap>
    </CS_Section>
  );
}

export default CharacterScrollytelling ;
