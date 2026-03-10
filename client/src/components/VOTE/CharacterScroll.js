import React, { useMemo, useEffect, useRef } from "react";
import "../Styled_Component/CharacterScroll.css";

export default function HeroHeader() {
  const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("");
  const heroRef = useRef(null);
  const emblemRef = useRef(null);
  const orbRef = useRef(null);

  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${0.8 + Math.random() * 2}px`,
      duration: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  const floatingRunes = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      char: runes[Math.floor(Math.random() * runes.length)],
      left: `${5 + Math.random() * 90}%`,
      top: `${15 + Math.random() * 75}%`,
      fontSize: `${0.85 + Math.random() * 1.4}rem`,
      duration: `${7 + Math.random() * 9}s`,
      delay: `${Math.random() * 9}s`,
    }));
  }, [runes]);
  useEffect(() => {
  const orb = orbRef.current;
  const emblem = emblemRef.current;
  const hero = heroRef.current;

  if (!orb || !emblem || !hero) return;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const updateOrb = () => {
    const scrollY = window.scrollY;

    const heroRect = hero.getBoundingClientRect();
    const emblemRect = emblem.getBoundingClientRect();

    const emblemCenterX = emblemRect.left + emblemRect.width / 2;
    const emblemCenterY = emblemRect.top + emblemRect.height / 2;

    // Når toppen av hero treffer 200px fra toppen av viewport
    const heroTop = heroRect.top;

    const triggerStart = 200;
    const triggerEnd = -120;

    // progress: 0 når heroTop = 200
    // progress: 1 når heroTop = -120
    const progress = clamp((triggerStart - heroTop) / (triggerStart - triggerEnd), 0, 1);

    // skjul helt før trigger
    if (heroTop > triggerStart) {
      orb.style.opacity = "0";
      orb.style.transform = "translate(-50%, -50%) scale(0.2)";
      orb.style.left = `${emblemCenterX}px`;
      orb.style.top = `${emblemCenterY}px`;
      return;
    }

    orb.style.opacity = "1";

    // start = sentrum av symbolet
    const startX = emblemCenterX;
    const startY = emblemCenterY;

    // slutt = omtrent midten av skjermen
    const endX = window.innerWidth / 2;
    const endY = window.innerHeight / 2;

    // lerp fra symbol -> midten av skjermen
    const baseX = startX + (endX - startX) * progress;
    const baseY = startY + (endY - startY) * progress;

    // flyt når den først er aktiv
    const floatStrength = 1 + progress;
    const floatX = Math.sin(scrollY * 0.004) * 10 * floatStrength;
    const floatY = Math.cos(scrollY * 0.0032) * 7 * floatStrength;

    const x = baseX + floatX;
    const y = baseY + floatY;

    const scale = 0.25 + progress * 0.85;

    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
    orb.style.transform = `translate(-50%, -50%) scale(${scale})`;
  };

  updateOrb();
  window.addEventListener("scroll", updateOrb, { passive: true });
  window.addEventListener("resize", updateOrb);

  return () => {
    window.removeEventListener("scroll", updateOrb);
    window.removeEventListener("resize", updateOrb);
  };
}, []);

  return (
    <div className="hero-page">
      <section className="hero-header" ref={heroRef}>
        <div className="hero-stars">
          {stars.map((star) => (
            <span
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDuration: star.duration,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
          <div ref={orbRef} className="goldenOrb"></div>
        <div className="hero-runes">
          {floatingRunes.map((rune) => (
            <span
              key={rune.id}
              className="rune-float"
              style={{
                left: rune.left,
                top: rune.top,
                fontSize: rune.fontSize,
                animationDuration: rune.duration,
                animationDelay: rune.delay,
              }}
            >
              {rune.char}
            </span>
          ))}
        </div>

        <svg
          ref={emblemRef}
          className="hero-emblem"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path id="heroRunePath" d="M100,18 a82,82 0 1,1 -0.01,0 z" />
          </defs>

          <g className="outer-ring">
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(200,146,42,0.28)"
              strokeWidth="1.5"
            />
            <circle
              cx="100"
              cy="100"
              r="82"
              fill="none"
              stroke="rgba(200,146,42,0.1)"
              strokeWidth="6"
            />
            <text
              fontSize="9"
              fill="rgba(200,146,42,0.52)"
              fontFamily="serif"
              textAnchor="middle"
            >
              <textPath href="#heroRunePath">
                ᚠ · ᚢ · ᚦ · ᚨ · ᚱ · ᚲ · ᚷ · ᚹ · ᚺ · ᚾ · ᛁ · ᛏ · ᛒ · ᛖ · ᛗ · ᛚ · ᛜ · ᛞ · ᛟ ·
              </textPath>
            </text>
          </g>

          <g className="inner-ring">
            <circle
              cx="100"
              cy="100"
              r="62"
              fill="none"
              stroke="rgba(200,146,42,0.18)"
              strokeWidth="1"
            />
          </g>

          <g
            stroke="rgba(200,146,42,0.82)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          >
            <line x1="100" y1="38" x2="100" y2="162" />
            <line x1="38" y1="100" x2="162" y2="100" />
            <line x1="55" y1="55" x2="145" y2="145" />
            <line x1="145" y1="55" x2="55" y2="145" />

            <path d="M100,38 l-7,14 M100,38 l7,14" opacity="0.9" />
            <path d="M100,162 l-7,-14 M100,162 l7,-14" opacity="0.9" />
            <path d="M38,100 l14,-7 M38,100 l14,7" opacity="0.9" />
            <path d="M162,100 l-14,-7 M162,100 l-14,7" opacity="0.9" />

            <path d="M55,55 l5,15 M55,55 l15,5" opacity="0.65" />
            <path d="M145,55 l-5,15 M145,55 l-15,5" opacity="0.65" />
            <path d="M55,145 l5,-15 M55,145 l15,-5" opacity="0.65" />
            <path d="M145,145 l-5,-15 M145,145 l-15,-5" opacity="0.65" />
          </g>

          <circle cx="100" cy="100" r="11" fill="rgba(200,146,42,0.68)" />
          <circle cx="100" cy="100" r="5" fill="#0a0500" />
        </svg>

        <h1>
          Saga of
          <br />
          the Norse
        </h1>

        <p>A chronicle of the Viking age</p>

        <div className="scroll-cue">
          <span>Scroll to begin</span>
          <div className="scroll-cue-line" />
        </div>
      </section>
    </div>
  );
}