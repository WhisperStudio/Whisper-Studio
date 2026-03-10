import React, { useMemo } from "react";
import "../Styled_Component/CharacterScroll.css";

export default function HeroHeader() {
  const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("");

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

  return (
    <div className="hero-page">
      <section className="hero-header">
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