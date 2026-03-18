import React, { useEffect, useMemo, useRef, useState } from "react";
import "./IMG_gallery.css";

import placeholderImage2 from "../../../bilder/smart_gnome.png";
import placeholderImage4 from "../../../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp";
import placeholderImage5 from "../../../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp";
import placeholderImage6 from "../../../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp";
import placeholderImage9 from "../../../bilder/Nøkken.png";
import placeholderImage10 from "../../../bilder/Troll.png";
import placeholderImage12 from "../../../bilder/Pesta.png";

const CREATURES = [
  {
    id: 1,
    img: placeholderImage2,
    title: "Nisse",
    sub: "Friendly",
    tags: ["gnome", "friendly", "folk"],
    desc: "A small and clever guardian spirit of the farm. The Nisse protects homes and animals, but demands respect if angered, it can turn mischievous and unpredictable.",
    rune: "ᚨ ᛊᛗᚨᛚᛚ ᚨᚾᛞ ᚲᛚᛖᚢᛖᚱ ᚷᚢᚨᚱᛞᛟᚾ ᛊᛈᛁᚱᛁᛏ ᛟᚠ ᚦᛖ ᚠᚨᚱᛗ. ᛏᚺᛖ ᚾᛁᛊᛊᛖ ᛈᚱᛟᛏᛖᚲᛏᛊ ᚺᛟᛗᛖᛊ ᚨᚾᛞ ᚨᚾᛁᛗᚨᛚᛊ, ᛒᚢᛏ ᛞᛖᛗᚨᚾᛞᛊ ᚱᛖᛊᛈᛖᚲᛏ ᛁᚠ ᚨᛜᛖᚱᛖᛞ, ᛁᛏ ᚲᚨᚾ ᛏᚢᚱᚾ ᛗᛁᛊᚲᚺᛁᛖᚢᛟᚢᛊ ᚨᚾᛞ ᚢᚾᛈᚱᛖᛞᛁᚲᛏᚨᛒᛚᛖ."
  },
  {
    id: 2,
    img: placeholderImage4,
    title: "Forest Dweller",
    sub: "Unfriendly",
    tags: ["forest", "dark"],
    desc: "A twisted, lesser form of a Nisse that has retreated into deep mine tunnels. Like a corrupted Gollum, it lurks in darkness, driven by greed and isolation.",
    rune: "ᚨ ᛏᚹᛁᛊᛏᛖᛞ, ᛚᛖᛊᛊᛖᚱ ᚠᛟᚱᛗ ᛟᚠ ᚨ ᚾᛁᛊᛊᛖ ᚦᚨᛏ ᚺᚨᛊ ᚱᛖᛏᚱᛖᛏᛖᛞ ᛁᚾᛏᛟ ᛞᛖᛖᛈ ᛗᛁᚾᛖ ᛏᚢᚾᚾᛖᛚᛊ. ᛚᛁᚲᛖ ᚨ ᚲᛟᚱᚱᚢᛈᛏᛖᛞ ᚷᛟᛚᛚᚢᛗ, ᛁᛏ ᛚᚢᚱᚲᛊ ᛁᚾ ᛞᚨᚱᚲᚾᛖᛊᛊ, ᛞᚱᛁᚢᛖᚾ ᛒᛁ ᚷᚱᛖᛖᛞ ᚨᚾᛞ ᛁᛊᛟᛚᚨᛏᛟᚾ."
  },
  {
    id: 3,
    img: placeholderImage6,
    title: "Shadow",
    sub: "Unfriendly",
    tags: ["shadow", "mystic"],
    desc: "A cursed demon bound by Odin to guard the forest for eternity. Once free, now enslaved, it silently watches and punishes those who wander too far.",
    rune: "ᚨ ᚲᚢᚱᛊᛖᛞ ᛞᛖᛗᛟᚾ ᛒᛟᚢᚾᛞ ᛒᛁ ᛟᛞᛁᚾ ᛏᛟ ᚷᚢᚨᚱᛞ ᚦᛖ ᚠᛟᚱᛖᛊᛏ ᚠᛟᚱ ᛖᛏᛖᚱᚾᛁᛏᛁ. ᛟᚾᚲᛖ ᚠᚱᛖᛖ, ᚾᛟᚹ ᛖᚾᛊᛚᚨᚢᛖᛞ, ᛁᛏ ᛊᛁᛚᛖᚾᛏᛚᛁ ᚹᚨᛏᚲᚺᛖᛊ ᚨᚾᛞ ᛈᚢᚾᛁᛊᚺᛖᛊ ᚦᛟᛊᛖ ᚹᚺᛟ ᚹᚨᚾᛞᛖᚱ ᛏᛟᛟ ᚠᚨᚱ."
  },
  {
    id: 4,
    img: placeholderImage5,
    title: "Huldra",
    sub: "Unfriendly",
    tags: ["folk", "myth"],
    desc: "A mysterious forest spirit with enchanting beauty. She lures humans deep into the woods, where many are never seen again.",
    rune: "ᚨ ᛗᛁᛊᛏᛖᚱᛟᚢᛊ ᚠᛟᚱᛖᛊᛏ ᛊᛈᛁᚱᛁᛏ ᚹᛁᚦ ᛖᚾᚲᚺᚨᚾᛏᛁᛜ ᛒᛖᚢᛏᛁ. ᛊᚺᛖ ᛚᚢᚱᛖᛊ ᚺᚢᛗᚨᚾᛊ ᛞᛖᛖᛈ ᛁᚾᛏᛟ ᚦᛖ ᚹᛟᛟᛞᛊ, ᚹᚺᛖᚱᛖ ᛗᚨᚾᛁ ᚨᚱᛖ ᚾᛖᚢᛖᚱ ᛊᛖᛖᚾ ᚨᚷᚨᛁᚾ."
  },
  {
    id: 12,
    img: placeholderImage9,
    title: "Nøkken",
    sub: "Unfriendly",
    tags: ["water", "monster"],
    desc: "A water spirit that haunts lakes and rivers. It uses music and illusions to lure victims into the depths.",
    rune: "ᚨ ᚹᚨᛏᛖᚱ ᛊᛈᛁᚱᛁᛏ ᚦᚨᛏ ᚺᚨᚢᚾᛏᛊ ᛚᚨᚲᛖᛊ ᚨᚾᛞ ᚱᛁᚢᛖᚱᛊ. ᛁᛏ ᚢᛊᛖᛊ ᛗᚢᛊᛁᚲ ᚨᚾᛞ ᛁᛚᛚᚢᛊᛟᚾᛊ ᛏᛟ ᛚᚢᚱᛖ ᚢᛁᚲᛏᛁᛗᛊ ᛁᚾᛏᛟ ᚦᛖ ᛞᛖᛈᚦᛊ."
  },
  {
    id: 13,
    img: placeholderImage10,
    title: "Troll",
    sub: "Unfriendly",
    tags: ["troll", "rock"],
    desc: "Massive and ancient creatures tied to stone and mountain. Slow but incredibly strong, they turn to stone in sunlight.",
    rune: "ᛗᚨᛊᛊᛁᚢᛖ ᚨᚾᛞ ᚨᚾᚲᛁᛖᚾᛏ ᚲᚱᛖᛏᚢᚱᛖᛊ ᛏᛁᛖᛞ ᛏᛟ ᛊᛏᛟᚾᛖ ᚨᚾᛞ ᛗᛟᚢᚾᛏᚨᛁᚾ. ᛊᛚᛟᚹ ᛒᚢᛏ ᛁᚾᚲᚱᛖᛞᛁᛒᛚᛁ ᛊᛏᚱᚱᛟᛜ, ᚦᛖᛁ ᛏᚢᚱᚾ ᛏᛟ ᛊᛏᛟᚾᛖ ᛁᚾ ᛊᚢᚾᛚᛁᚷᚺᛏ."
  },
  {
    id: 14,
    img: placeholderImage12,
    title: "Pesta",
    sub: "Unfriendly",
    tags: ["plague", "dark"],
    desc: "A dark omen of disease and death. Pesta wanders from place to place, bringing sickness and despair wherever she appears.",
    rune: "ᚨ ᛞᚨᚱᚲ ᛟᛗᛖᚾ ᛟᚠ ᛞᛁᛊᛖᛊᛖ ᚨᚾᛞ ᛞᛖᚦ. ᛈᛖᛊᛏᚨ ᚹᚨᚾᛞᛖᚱᛊ ᚠᚱᛟᛗ ᛈᛚᚨᚲᛖ ᛏᛟ ᛈᛚᚨᚲᛖ, ᛒᚱᛁᛜᛁᛜ ᛊᛁᚲᚲᚾᛖᛊᛊ ᚨᚾᛞ ᛞᛖᛊᛈᚨᛁᚱ ᚹᚺᛖᚱᛖᚢᛖᚱ ᛊᚺᛖ ᚨᛈᛈᛖᚱᛊ."
  },
];

function useOrbDrivenMorph(cardIndex) {
  const [targetProgress, setTargetProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const previousProgress = useRef(0);

  useEffect(() => {
    const handleOrbForText = (event) => {
      const { closestCardIndex, isOverCard } = event.detail;

      if (isOverCard && closestCardIndex === cardIndex) {
        setTargetProgress(1);
      } else {
        setTargetProgress(0);
      }
    };

    window.addEventListener("orbForText", handleOrbForText, { passive: true });

    return () => {
      window.removeEventListener("orbForText", handleOrbForText);
    };
  }, [cardIndex]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const animate = () => {
      setProgress((prev) => {
        previousProgress.current = prev;
        const diff = targetProgress - prev;

        if (Math.abs(diff) < 0.0015) {
          return targetProgress;
        }

        return prev + diff * 0.055;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetProgress]);

  return {
    progress,
    direction: progress >= previousProgress.current ? "up" : "down",
    isActive: progress > 0.01,
  };
}

function MorphText({ text, rune, className = "", cardIndex }) {
  const { progress, direction } = useOrbDrivenMorph(cardIndex);

  const chars = useMemo(() => {
    const max = Math.max(text.length, rune.length);
    return Array.from({ length: max }, (_, i) => ({
      text: text[i] ?? " ",
      rune: rune[i] ?? " ",
    }));
  }, [text, rune]);

  const total = Math.max(chars.length - 1, 1);

  return (
    <p className={`morph-line ${className}`}>
      {chars.map((char, index) => {
        const orderedIndex = direction === "up" ? index : total - index;
        const threshold = orderedIndex / total;

        const isFullyText = progress >= 0.999;
        const isFullyRune = progress <= 0.001;

        const showText = isFullyText
          ? true
          : isFullyRune
          ? false
          : progress >= threshold;

        const band = 0.02;
        const distance = Math.abs(progress - threshold);
        const isChanging = !isFullyText && !isFullyRune && distance < band;

        const currentChar = showText ? char.text : char.rune;

        let translateY = 0;
        let blur = 0;
        let scale = 1;
        let rotate = 0;
        let opacity = 1;

        if (isChanging) {
          const strength = 1 - distance / band;
          const motion = direction === "up" ? 1 : -1;

          translateY = (showText ? 6 : -6) * motion * strength;
          blur = 2.4 * strength;
          scale = 1 - 0.03 * strength;
          rotate = 1.4 * motion * strength;
          opacity = 1 - 0.04 * strength;
        }

        return (
          <span
            key={index}
            className={`morph-single-char ${isChanging ? "is-changing" : ""}`}
            style={{
              transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
              filter: `blur(${blur}px)`,
              opacity,
            }}
          >
            {currentChar === " " ? "\u00A0" : currentChar}
          </span>
        );
      })}
    </p>
  );
}

export { CREATURES };

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const handleOrbForText = (event) => {
      const { closestCardIndex, isOverCard } = event.detail;
      setActiveIndex(isOverCard ? closestCardIndex : null);
    };

    window.addEventListener("orbForText", handleOrbForText, { passive: true });

    return () => {
      window.removeEventListener("orbForText", handleOrbForText);
    };
  }, []);

  return (
    <div className="creature-flex">
      <div className="creature-grid">
        {CREATURES.map((creature) => (
          <div key={creature.id} className="creature-card">
            <img src={creature.img} alt={creature.title} />
          </div>
        ))}
      </div>

      <div className="creature-grid">
        {CREATURES.map((creature, index) => (
          <div
            key={creature.id}
            className={`creature-info-block ${
              activeIndex === index ? "is-active" : ""
            }`}
          >
            <div className="creature-morph-zone">
              <h3 className="creature-title">{creature.title}</h3>

              <span className={`sub-tag ${creature.sub.toLowerCase()}`}>
                {creature.sub}
              </span>

              <MorphText
                text={creature.desc}
                rune={creature.rune}
                className="creature-desc"
                cardIndex={index}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}