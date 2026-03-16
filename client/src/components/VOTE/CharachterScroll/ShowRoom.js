import React, {  useMemo } from "react";
import HeroHeader from "./S_Header";
import RootTreeOverlay from "./RootTreeOverlay";
import Gallery from "./IMG_gallery";
import "./ShowRoom.css";


export default function ShowRoom() {
  

  const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("");

  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      top: `${Math.random() * 95}%`,
      size: `${0.8 + Math.random() * 2}px`,
      duration: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  const floatingRunes = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      char: runes[Math.floor(Math.random() * runes.length)],
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 70 + 15}%`,
      fontSize: `${0.85 + Math.random() * 1.4}rem`,
      duration: `${7 + Math.random() * 9}s`,
      delay: `${Math.random() * 9}s`,
    }));
  }, [runes]);

  return (
    <div className="showroom showroom--with-tree">
      <div className="showroom-stars" aria-hidden="true">
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

      <div className="showroom-runes" aria-hidden="true">
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

      <HeroHeader />

      <div className="showroom-tree-layer">
        <RootTreeOverlay opacity={0.42} />
      </div>
      <div>
        <Gallery />
      </div>

      
    </div>
  );
}