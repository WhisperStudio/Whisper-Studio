import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Styled_Component/CharacterScroll.css";

/* ===== GSAP ===== */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   INNBYGDE HJELPEKOMPONENTER (ScrollFloat / ScrollReveal)
   ========================================================= */

/* --- ScrollFloat: bokstav-for-bokstav for OVERSKRIFTER --- */
function ScrollFloat({
  children,
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "top 95%",
  scrollEnd = "top 40%",
  stagger = 0.03,
}) {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split("").map((char, i) => (
      <span className="char" key={i}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current ? scrollContainerRef.current : window;

    const ctx = gsap.context(() => {
      const charElements = el.querySelectorAll(".char");
      gsap.fromTo(
        charElements,
        {
          willChange: "opacity, transform",
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: "50% 0%",
        },
        {
          duration: animationDuration,
         ease,
         opacity: 1, yPercent: 0, scaleY: 1, scaleX: 1,
         stagger,
         scrollTrigger: {
           trigger: el,
           scroller,
           start: scrollStart,
           end: scrollEnd,
           scrub: false,
           toggleActions: "play none none reverse",
           once: true
         }
       });
    }, containerRef);

    return () => ctx.revert();
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h3 ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </h3>
  );
}

/* --- ScrollReveal: ord-for-ord for BRØDTEKST --- */
function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "top 40%",
  wordAnimationEnd = "top 40%",
}) {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word; // behold whitespace
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current ? scrollContainerRef.current : window;

    const ctx = gsap.context(() => {
      const wordElements = el.querySelectorAll(".word");

      // Liten “tilt” som spiller når teksten kommer inn
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          rotate: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top 95%",
            end: rotationEnd,
            scrub: false,
            toggleActions: "play none none reverse",
            once: true,
          },
        }
      );

      // Opacity-reveal ord-for-ord
      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: "opacity" },
        {
          opacity: 1,
          ease: "power1.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top 95%",
            end: wordAnimationEnd,
            scrub: false,
            toggleActions: "play none none reverse",
            once: true,
          },
        }
      );

      // Valgfri blur som fader ut
      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            filter: "blur(0px)",
            ease: "power1.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top 95%",
              end: wordAnimationEnd,
              scrub: false,
              toggleActions: "play none none reverse",
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
  ]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </div>
  );
}


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

/* ====================== HOVEDKOMPONENT ====================== */
export default function CharacterScroll() {
  const CREATURES = useMemo(
    () => RAW_CREATURES.map((c) => ({ ...c, src: resolveSrc(c.img) })),
    []
  );

  const [currentIndex, setCurrentIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const heroRef = useRef(null);
  const imageRefs = useRef([]);
  const textRef = useRef(null);
  const bodyRef = useRef(null);
  const haloRef = useRef(null);
  const stageRef = useRef(null);

  // Faser
  const HERO_PHASE = 60;
  const ZOOM_PHASE = 90;
  const TEXT_PHASE = 150;
  const FADE_PHASE = 40;
  const PHASE_LENGTH = ZOOM_PHASE + TEXT_PHASE + FADE_PHASE;
  const TOTAL_HEIGHT = HERO_PHASE + CREATURES.length * PHASE_LENGTH + 60;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.setProperty("--total-height", `${TOTAL_HEIGHT}vh`);
    }
  }, [TOTAL_HEIGHT]);

  // Første refresh for sikker måling
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!wrapperRef.current || !scrollContainerRef.current) return;

    const getBounds = () => {
      const rect = wrapperRef.current.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const height = rect.height;
      const viewH = window.innerHeight;
      const start = Math.max(0, top - viewH * 0.0);
      const end = top + height - viewH * 1.0;
      const length = Math.max(1, end - start);
      return { start, end, length };
    };

    let bounds = getBounds();

    const handleScroll = () => {
      const y = window.scrollY;
      const raw = (y - bounds.start) / bounds.length;
      const progress = clamp(raw, 0, 1);

      if (stageRef.current) {
        stageRef.current.style.setProperty("--stage-opacity", progress > 0 ? "1" : "0");
      }

      const HERO_RATIO = 0.12;

      if (progress < HERO_RATIO) {
        const heroProgress = progress / HERO_RATIO;
        const heroOpacity = 1 - heroProgress;
        const heroScale = 1 + heroProgress * 0.1;

        if (heroRef.current) {
          heroRef.current.style.setProperty("--hero-opacity", String(heroOpacity));
          heroRef.current.style.setProperty("--hero-scale", String(heroScale));
          heroRef.current.style.visibility = "visible";
          heroRef.current.style.pointerEvents = "auto";
        }
        setCurrentIndex(-1);
        return;
      }

      if (heroRef.current) {
        heroRef.current.style.setProperty("--hero-opacity", "0");
        heroRef.current.style.visibility = "hidden";
        heroRef.current.style.pointerEvents = "none";
      }

      const creatureProgress = (progress - HERO_RATIO) / (1 - HERO_RATIO);
      const totalCreaturePhase = creatureProgress * CREATURES.length;
      const activeCreatureIndex = Math.min(Math.floor(totalCreaturePhase), CREATURES.length - 1);
      let phaseProgress = totalCreaturePhase - activeCreatureIndex;

      setCurrentIndex(activeCreatureIndex);
      // Re-mål triggerpunkter når ny tekst/overskrift vises
      requestAnimationFrame(() => ScrollTrigger.refresh());

      const accent = colorFor(CREATURES[activeCreatureIndex].id);
      if (wrapperRef.current) wrapperRef.current.style.setProperty("--accent", accent);

      let zoom = 0.1,
        opacity = 0,
        textOpacity = 0,
        haloScale = 0,
        haloOpacity = 0;

      // ---- Tekstscroll KUN for .body ----
      if (textRef.current && bodyRef.current) {
        const wrap = textRef.current.querySelector(".scrollWrap");
        const content = bodyRef.current;

        const wrapH = wrap?.getBoundingClientRect().height || 0;
        const contentH = content?.getBoundingClientRect().height || 0;

        const naturalScroll = Math.max(0, contentH - wrapH);
        const minScroll = clamp(window.innerHeight * 0.18, 140, 220);
        const travel = Math.max(naturalScroll, minScroll);

        const textPhaseStart = 0.3;
        const textPhaseEnd = 0.8;

        const tProg = clamp(
          (phaseProgress - textPhaseStart) / (textPhaseEnd - textPhaseStart),
          0,
          1
        );

        const offset = -travel * tProg;
        content.style.setProperty("--content-offset", `${offset}px`);

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
        img.style.setProperty("--zoom", String(zoom));
        img.style.setProperty("--opacity", String(opacity));
      }

      // Tekst
      if (textRef.current) {
        textRef.current.style.setProperty("--text-opacity", String(textOpacity));
      }

      // Halo
      if (haloRef.current) {
        haloRef.current.style.setProperty("--halo-scale", String(haloScale));
        haloRef.current.style.setProperty("--halo-opacity", String(haloOpacity));
      }

      // Skjul andre bilder
      imageRefs.current.forEach((other, idx) => {
        if (other && idx !== activeCreatureIndex) {
          other.style.setProperty("--opacity", "0");
        }
      });
    };

    const handleResize = () => {
      bounds = getBounds();
      handleScroll();
      ScrollTrigger.refresh();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [CREATURES, TOTAL_HEIGHT]);

  const currentCreature = currentIndex >= 0 ? CREATURES[currentIndex] : null;

  return (
    <div className="component-wrapper" ref={wrapperRef}>
      <div className="scroll-container" ref={scrollContainerRef}>
        {/* Hero */}
        <section className="hero" ref={heroRef}>
          <div className="kicker" data-text="FOLKLORE UNIVERSE">
            FOLKLORE UNIVERSE
          </div>
          <h1 data-text="MEET THE CREATURES">MEET THE CREATURES</h1>
          <p>The adventure is out there and waiting for you.</p>
        </section>

        {/* Stage */}
        <div className="zoom-stage" ref={stageRef}>
          {currentCreature && (
            <div
              className="halo"
              ref={haloRef}
              style={{ "--halo-color": colorFor(currentCreature.id) }}
            />
          )}

          {CREATURES.map((creature, index) => (
            <img
              key={creature.id}
              ref={(el) => (imageRefs.current[index] = el)}
              className="creature-image"
              src={creature.src}
              alt={creature.title}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}

          {currentCreature && (
            <div className="text-overlay" ref={textRef}>
              <div className="header">
                <div className="eyebrow" data-text={currentCreature.sub.toUpperCase()}>
                  {currentCreature.sub.toUpperCase()}
                </div>

                {/* OVERSKRIFT med ScrollFloat */}
                <ScrollFloat key={currentCreature.id} scrollContainerRef={scrollContainerRef}>
                  {currentCreature.title}
                </ScrollFloat>
              </div>

              {/* BRØDTEKST med ScrollReveal */}
              <div className="scrollWrap">
                <div className="body" ref={bodyRef}>
                  <ScrollReveal key={`p-${currentCreature.id}`} scrollContainerRef={scrollContainerRef}>
                    {`${currentCreature.title} roams our folklore-inspired world. Expect mood, mystery and danger—sometimes all at once.`}
                  </ScrollReveal>

                  <ScrollReveal
                    key={`tags-${currentCreature.id}`}
                    scrollContainerRef={scrollContainerRef}
                    enableBlur={false}
                    baseOpacity={0.25}
                    baseRotation={0}
                    textClassName="tags"
                  >
                    {currentCreature.tags?.map((t) => `#${t}`).join(" ")}
                  </ScrollReveal>

                  <ScrollReveal
                    key={`details-${currentCreature.id}`}
                    scrollContainerRef={scrollContainerRef}
                    textClassName="details"
                    baseOpacity={0.15}
                    baseRotation={2}
                    blurStrength={3}
                  >
                    {`In the depths of Nordic mythology, creatures like ${currentCreature.title} represent the untamed forces of nature and the unknown. Each encounter tells a story of ancient wisdom, primal fear, and the delicate balance between the human world and the realm of spirits.

These beings have shaped the folklore of generations, passing down warnings and wisdom through whispered tales around flickering fires. Their presence in our world serves as a reminder that magic still exists for those brave enough to seek it.`}
                  </ScrollReveal>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
