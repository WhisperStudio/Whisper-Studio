import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Styled_Component/CharacterScroll.css";

/* ===== GSAP ===== */
import { gsap } from "gsap";

/* =========================================================
   HJELPEKOMPONENTER (ScrollFloat / ScrollReveal)
   ========================================================= */

/* --- ScrollFloat: bokstav-for-bokstav for OVERSKRIFTER (styres av progress) --- */
function ScrollFloat({
  children,
  progress = 0,
  containerClassName = "",
  textClassName = "",
  ease = "back.inOut(2)",
  stagger = 0.05,
}) {
  const containerRef = useRef(null);
  const tlRef = useRef(null);

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

    const chars = el.querySelectorAll(".char");

    tlRef.current?.kill();
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      chars,
      {
        willChange: "opacity, transform",
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: "50% 0%",
      },
      {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        ease,
        stagger,
        duration: 1.8, // roligere tittel
      }
    );
    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [ease, stagger]);

  useEffect(() => {
    if (!tlRef.current) return;
    tlRef.current.progress(progress);
  }, [progress]);

  return (
    <h3 ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </h3>
  );
}

/* --- ScrollReveal: ord-for-ord for BRØDTEKST (styres av progress) --- */
function ScrollReveal({
  children,
  progress = 0,
  enableBlur = true,
  baseOpacity = 0.0,     // start helt gjennomsiktig
  baseRotation = 2,
  blurStrength = 1.2,    // veldig mild blur
  containerClassName = "",
  textClassName = "",
}) {
  const containerRef = useRef(null);
  const tlRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      return <span className="word" key={index}>{word}</span>;
    });
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const words = el.querySelectorAll(".word");

    tlRef.current?.kill();
    const tl = gsap.timeline({ paused: true });

    tl.fromTo(
      el,
      { rotate: baseRotation, transformOrigin: "0% 50%" },
      { rotate: 0, ease: "none", duration: 1 },
      0
    );

    tl.fromTo(
      words,
      {
        opacity: baseOpacity,
        filter: enableBlur ? `blur(${blurStrength}px)` : "none",
        willChange: "opacity, filter",
      },
      {
        opacity: 1,
        filter: enableBlur ? "blur(0px)" : "none",
        ease: "power1.out",
        duration: 1.05,
        stagger: 0.02,
      },
      0
    );

    tlRef.current = tl;
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [enableBlur, baseOpacity, baseRotation, blurStrength]);

  useEffect(() => {
    if (!tlRef.current) return;
    tlRef.current.progress(progress);
  }, [progress]);

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
const segment = (p, a, b) => Math.min(Math.max((p - a) / (b - a), 0), 1);

const resolveSrc = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.default || img.src || "";
  return "";
};

/* ====================== Data ====================== */
const RAW_CREATURES = [
  {
    id: 1,
    img: require("../bilder/smart_gnome.png"),
    title: "Nisse — The Farmstead Gnome",
    sub: "Friendly",
    tags: ["gnome", "friendly", "folk"],
    summary: "",
    details: `Nisser are the Nordic kin of gnomes: small, clever beings who make their homes around farms—lofts, barns, and quiet corners where the hay still smells of summer. They’re often seen in red caps and simple coats that echo the look of Santa Claus, which is why many call them "the Nordic Santa." In winter, people leave out a bowl of warm Christmas porridge by the barn door. It’s an old promise: treat the nisse well, and he’ll keep the animals calm and the tools working; insult him, and you’ll spend the night chasing spilled grain and untied knots.

Nisser come in many shapes and sizes, but they share the same heart: intelligent, watchful, and fair. Be polite, show respect, and they’ll be kind in return. Cross them—and they will remind you who really runs the farm after dark.

In VOTE, this Nisse is one of the main characters—among the sharpest minds of his kind. He’s your steady companion through the unknown: reading signs you miss, spotting hidden paths, and nudging puzzles into place when danger grows close. Expect quick wit, quiet magic, and the occasional grumble if you forget your manners. Treat him well, and he’ll guide you safely—cap bobbing in the lantern light—toward whatever waits in the dark.`
  },
  {
    id: 2,
    img: require("../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp"),
    title: "Forest Dweller",
    sub: "Unfriendly",
    tags: ["forest", "dark"],
    details: `Forest Dwellers are a twisted offshoot of the Nisse taken by the dark and turned inward until only hunger remains. They shun the sun and every bright thing, nesting in burrows, root-caves, and the hollow undersides of fallen trees. Where a Nisse keeps a farm running, a Forest Dweller unthreads it, hoarding what it can’t eat and breaking what it can’t carry.

They are dangerous not out of need, but desire. Cruel when they think no one is watching, they lash out for sport and skitter back to the dark. Yet for all their malice, they are simple-minded: the first glimpse of anything unfamiliar—light, a firm voice, a sudden clatter—can send them stumbling away with frightened chatter.

If you meet one, keep your lantern high and your steps steady. Do not chase; make yourself larger than your fear. In the under-earth where they lurk, courage and brightness are sharper than any blade.`
  },
  {
    id: 3,
    img: require("../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp"),
    title: "Shadow",
    sub: "Unfriendly",
    tags: ["shadow", "mystic"],
    details: `Shadow is a demon set by Odin to guard the borders of the world you are drawn into—its warden and its executioner. It lives in the fog, moving where sight fails and breath turns cold. Step into that mist and it will be the last step you ever take.

This creature carries a darkness unlike anything seen before: a demonic night that drinks sound and swallows courage. In Scandinavian lore there is the old name—Gammel Erik. In his reckoning with Hel, he seized thousands of beings and broke them to his will: horns snapped, hooves cut away, wings torn from those that wore them. Cursed by his command, they were bound to the shadows, to watch and to punish any who trespass.

Where Shadow passes, lanterns gutter and paths forget where they lead. It does not bargain. It does not warn. If you feel the fog thicken and the world grow muffled, turn back—because Shadow never does.`
  },
  {
    id: 4,
    img: require("../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp"),
    title: "Huldra",
    sub: "Unfriendly",
    tags: ["folk", "myth"],
    details: `Huldra is a forest spirit of Norwegian folklore—a breathtaking woman who steps out of birch and shadow with a smile that feels like summer. She sings soft and sweet, and wanderers follow before they realize they’ve left the path. Like sirens and mermaids, she lures with beauty and voice—but what she hides is sharper than love can soften.

Some say she wears a cow’s tail tucked behind her dress; others whisper her back is hollow like a rotted tree. When the glamour slips, the truth shows through: bark-pale skin, eyes like deep moss, and a hunger older than the farmsteads she haunts. She rewards respect with gifts of luck and safe passage—but mock her, boast, or try to pry at her secrets, and the woods will close like a fist.

Huldra is kin to the sea’s sirens, but her realm is the high forest where wind threads through needles and stones remember your name. If you hear her song, keep your wits and your lantern close. Beauty leads you in; only wisdom leads you out.`
  },
  {
    id: 12,
    img: require("../bilder/Nøkken.png"),
    title: "Nøkken",
    sub: "Unfriendly",
    tags: ["water", "monster"],
    details: `Nøkken is a Scandinavian river spirit that haunts broad rivers, deep lakes, and still, black waters. Its eyes shine like lanterns beneath the surface, and its head is tangled with roots and moss so it can lie hidden among reeds and driftwood. It calls from the shore with soft music or the splash of something just out of sight, drawing wanderers closer until the water is the only path left.

Hungry and patient, Nøkken lures not to defend a lair, but to feed. It can shape-shift into a beautiful white horse, spotless and calm, inviting riders with lowered head and gentle breath. The moment someone climbs onto its back, it surges toward the water, plunges under, and drags its victim down where the current keeps secrets.

Parents told tales of Nøkken to keep children from the banks—to teach that dark water is never harmless and beauty can be bait. If you hear a violin over still water, or see a pale horse with eyes too bright for dusk, stay away from the edge and keep the lantern high.`
  },
  {
    id: 13,
    img: require("../bilder/Troll.png"),
    title: "Troll",
    sub: "Unfriendly",
    tags: ["troll", "rock"],
    details: `Trolls are the giants of Nordic folklore—mountain-born, thick-skinned, and quick to anger. They hate the sun; a single dawn can crack them into stone where they stand, which is why old cliffs and crooked boulders look like sleeping faces. By night they roam forests and high passes, quarrelsome and greedy, sniffing out travelers and guarding bridges as if the earth itself were theirs.

Some trolls are clever with bargains and riddles; others are blunt as hammers. All are dangerous when mocked or crossed. Bells and iron unsettle them, and bright fire keeps them at bay—but it’s wits that save most wanderers. Trade fairly, speak carefully, and never linger when the sky begins to pale.

Trolls hoard what they can’t eat and hold grudges longer than winter. If you must deal with one, choose words like you choose footholds on an icy ledge—and remember: sunrise is your strongest ally.`
  },
  {
    id: 14,
    img: require("../bilder/Pesta.png"),
    title: "Pesta",
    sub: "Unfriendly",
    tags: ["plague", "dark"],
    details: `Pesta was born of the Black Death—a woman in ash and silence who walks where the air tastes of iron. She is not a hunter of the living, but a herald of endings: dangerous only to those already near the edge. When Pesta appears, it means death is close. Doors shutter, candles bend, and prayers learn to whisper.

You cannot run from her. She does not chase. She simply arrives at the threshold that fate has marked and sweeps it clean. If you see her, you can only hope she has come for someone else—a mercy to the suffering, a warning to the rest.

Some say she carries a broom for villages and a rake for lone houses; others say she leaves no footprints at all. But all agree: where Pesta passes, the world grows still, and the living count their heartbeats, grateful for each one more.`
  },
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
  const [textProg, setTextProg] = useState(0);
  useEffect(() => { setTextProg(0); }, [currentIndex]);

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
  const TEXT_PHASE = 180; // låser lengre på tekst
  const FADE_PHASE = 40;
  const PHASE_LENGTH = ZOOM_PHASE + TEXT_PHASE + FADE_PHASE;
  const TOTAL_HEIGHT = HERO_PHASE + CREATURES.length * PHASE_LENGTH + 60;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.setProperty("--total-height", `${TOTAL_HEIGHT}vh`);
    }
  }, [TOTAL_HEIGHT]);

  useEffect(() => {
    const onLoad = () => {
      document.fonts?.ready?.then(() => {
        window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      });
    };
    window.addEventListener("load", onLoad);
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

      if (activeCreatureIndex !== currentIndex) setCurrentIndex(activeCreatureIndex);

      const accent = colorFor(CREATURES[activeCreatureIndex].id);
      if (wrapperRef.current) wrapperRef.current.style.setProperty("--accent", accent);

      let zoom = 0.1,
        opacity = 0,
        textOpacity = 0,
        haloScale = 0,
        haloOpacity = 0;

      // ---- Tekstscroll for .body ----
      if (textRef.current && bodyRef.current) {
        const wrap = textRef.current.querySelector(".scrollWrap");
        const content = bodyRef.current;

        const wrapH = wrap?.getBoundingClientRect().height || 0;
        const contentH = content?.getBoundingClientRect().height || 0;

        const naturalScroll = Math.max(0, contentH - wrapH);
        const minScroll = clamp(window.innerHeight * 0.18, 140, 220);
        const travel = Math.max(naturalScroll, minScroll);

        // start litt senere for å gi tittelen rom
        const textPhaseStart = 0.28;
        const textPhaseEnd   = 0.98;

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

        // overlay-opasitet (fade inn like etter tittel)
        if (phaseProgress < textPhaseStart) {
          textOpacity = smoothstep( Math.min(1, Math.max(0, (phaseProgress - (textPhaseStart - 0.12)) / 0.12)) );
        } else if (phaseProgress < textPhaseEnd) {
          textOpacity = 1;
        } else {
          const fp = (phaseProgress - textPhaseEnd) / (1 - textPhaseEnd);
          textOpacity = Math.max(0, 1 - fp * 2.0);
        }

        setTextProg(tProg);
      }

      // ---- bilde/halo ----
      if (phaseProgress < 0.3) {
        const zp = phaseProgress / 0.3;
        zoom = 0.1 + easeOut(zp) * 0.9;
        opacity = smoothstep(zp);
        haloScale = easeOut(zp) * 1.5;
        haloOpacity = smoothstep(zp) * 0.6;
      } else if (phaseProgress < 0.8) {
        zoom = 1.0;
        opacity = 1;
        haloScale = 1.5;
        haloOpacity = 0.6;
      } else {
        const fp = (phaseProgress - 0.8) / 0.2;
        zoom = 1.0 + fp * 0.15;
        opacity = Math.max(0, 1 - fp * 2);
        haloScale = 1.5 + fp * 0.5;
        haloOpacity = Math.max(0, 0.6 - fp);
      }

      const img = imageRefs.current[activeCreatureIndex];
      if (img) {
        img.style.setProperty("--zoom", String(zoom));
        img.style.setProperty("--opacity", String(opacity));
      }

      if (textRef.current) {
        textRef.current.style.setProperty("--text-opacity", String(textOpacity));
      }

      if (haloRef.current) {
        haloRef.current.style.setProperty("--halo-scale", String(haloScale));
        haloRef.current.style.setProperty("--halo-opacity", String(haloOpacity));
      }

      imageRefs.current.forEach((other, idx) => {
        if (other && idx !== activeCreatureIndex) {
          other.style.setProperty("--opacity", "0");
        }
      });
    };

    const handleResize = () => {
      bounds = getBounds();
      handleScroll();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [CREATURES, TOTAL_HEIGHT, currentIndex]);

  const currentCreature = currentIndex >= 0 ? CREATURES[currentIndex] : null;

  // vinduer – copy starter klart etter heading
  const headingProg = easeOut(segment(textProg, 0.10, 0.42));
  const copyProg    = segment(textProg, 0.35, 0.98); // <- senere start, ingen "peek" bak tittelen
  const tagsProg    = segment(textProg, 0.70, 0.95);

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

                <ScrollFloat key={currentCreature.id} progress={headingProg}>
                  {currentCreature.title}
                </ScrollFloat>
              </div>

              {/* Transparent scroll-område: opacity styres av copyProg */}
              <div className="scrollWrap" style={{ opacity: copyProg }}>
                <div className="body" ref={bodyRef}>

                  <ScrollReveal
                    key={`copy-${currentCreature.id}`}
                    progress={copyProg}
                    textClassName="details"
                    baseOpacity={0.0}
                    baseRotation={0}
                    blurStrength={1.2}
                  >
                    {currentCreature.details ??
                      currentCreature.summary ??
                      `In the depths of Nordic mythology, creatures like ${currentCreature.title} represent the untamed forces of nature and the unknown.`}
                  </ScrollReveal>

                  <ScrollReveal
                    key={`tags-${currentCreature.id}`}
                    progress={tagsProg}
                    enableBlur={false}
                    baseOpacity={0.0}
                    baseRotation={0}
                    textClassName="tags"
                  >
                    {currentCreature.tags?.map((t) => `#${t}`).join(" ")}
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
