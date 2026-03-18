import React, { useMemo, useEffect, useRef } from "react";
import HeroHeader from "./S_Header";
import RootTreeOverlay from "./RootTreeOverlay";
import Gallery from "./IMG_gallery";
import "./ShowRoom.css";

export default function ShowRoom() {
  const orbLightRef = useRef(null);
  const orbOverlayRef = useRef(null);
  const darkMaskRef = useRef(null);
  const orbShapeRef = useRef('circle'); // 'circle' eller 'ellipse'
  const lastStateRef = useRef('unknown'); // Spor siste state: 'card', 'tomrom', 'unknown'
  const shapeTransitionRef = useRef({
    targetShape: 'circle',
    currentWidth: 1,
    currentHeight: 1,
    targetWidth: 1,
    targetHeight: 1,
    transitionSpeed: 0.15
  });

  // Monitor floating runes animation speed
  useEffect(() => {
    let lastTime = performance.now();
    let lastLogTime = lastTime;
    
    const monitorAnimations = () => {
      const now = performance.now();
      
      // Log hvert 2. sekund
      if (now - lastLogTime >= 2000){
        lastLogTime = now;
      }
      
      lastTime = now;
      requestAnimationFrame(monitorAnimations);
    };
    
    const animationId = requestAnimationFrame(monitorAnimations);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Smooth shape transition animation
  useEffect(() => {
    let animationId;
    
    const animateShapeTransition = () => {
      const transition = shapeTransitionRef.current;
      
      // Smooth interpolation towards target values
      const widthDiff = transition.targetWidth - transition.currentWidth;
      const heightDiff = transition.targetHeight - transition.currentHeight;
      
      if (Math.abs(widthDiff) > 0.01 || Math.abs(heightDiff) > 0.01) {
        transition.currentWidth += widthDiff * transition.transitionSpeed;
        transition.currentHeight += heightDiff * transition.transitionSpeed;
      } else {
        transition.currentWidth = transition.targetWidth;
        transition.currentHeight = transition.targetHeight;
      }
      
      animationId = requestAnimationFrame(animateShapeTransition);
    };
    
    animationId = requestAnimationFrame(animateShapeTransition);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Lytt etter orb-posisjon fra RootTreeOverlay
  useEffect(() => {
    let lastUpdateRef = 0;
    
    const handleOrbPosition = (event) => {
      const { x, y, radius, isFollowing } = event.detail;
      
      // Rate limiting - ikke oppdater for ofte (maks 15 ganger i sekundet for å unngå å påvirke animasjoner)
      const now = Date.now();
      if (now - lastUpdateRef < 66) return; // ~15fps
      lastUpdateRef = now;
      
      // Cache DOM query for bedre performance
      const galleryContainer = document.querySelector('[data-gallery-container]');
      
      // Hvis orben følger med (scroll), juster koordinater for gallery-container
      if (isFollowing && galleryContainer) {
        const rect = galleryContainer.getBoundingClientRect();
        // Konverter viewport-koordinater til relative koordinater i container
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        
        orbLightRef.current = { x: relativeX, y: relativeY, radius, isFollowing };
        
        // Finn creature-card elementer og bestem orb-form
        const cardElements = galleryContainer.querySelectorAll('.creature-card');
        
        let targetShape = 'circle'; // Default sirkel (tomrom)
        let currentState = 'tomrom'; // Default er tomrom
        
        // Finn den nærmeste card-en
        let closestCard = null;
        let closestDistance = Infinity;
        
        cardElements.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;
          
          const distanceFromCenter = Math.hypot(x - cardCenterX, y - cardCenterY);
          
          if (distanceFromCenter < closestDistance) {
            closestDistance = distanceFromCenter;
            closestCard = { index, cardCenterX, cardCenterY, distance: distanceFromCenter };
          }
        });
        
        // Sjekk om orb er over et card (basert på y-aksen rekkevidde)
        if (closestCard) {
          const cardElements = galleryContainer.querySelectorAll('.creature-card');
          const cardRect = cardElements[closestCard.index].getBoundingClientRect();
          
          // Sjekk om orb er innenfor cardets y-akse (vertikale rekkevidde)
          const cardTop = cardRect.top;
          const cardBottom = cardRect.bottom;
          const orbY = y;
          
          // Legg til litt margin for bedre deteksjon
          const margin = 50;
          const isInYRange = orbY >= (cardTop - margin) && orbY <= (cardBottom + margin);
          
          if (isInYRange) {
            targetShape = 'ellipse'; // Oval når innenfor y-rekkevidde
            currentState = 'card';
          }
        }
        
        // Logg kun når state endrer seg
        if (currentState !== lastStateRef.current) {
          console.log(`🔆 Orb er over: ${currentState.toUpperCase()}`);
          lastStateRef.current = currentState;
        }
        
        // Oppdater orb-form med smooth overgang
        if (orbShapeRef.current !== targetShape) {
          console.log(`🔷 Orb form bytter: ${orbShapeRef.current} → ${targetShape}`);
          orbShapeRef.current = targetShape;
          
          // Sett target verdier for smooth transition
          const transition = shapeTransitionRef.current;
          transition.targetShape = targetShape;
          
          if (targetShape === 'ellipse' && currentState === 'card') {
            transition.targetWidth = 2.5; // Bredere horisontal strekning
            transition.targetHeight = 1.0; // Behold samme høyde som sirkel
          } else {
            transition.targetWidth = 1.0; // Sirkel
            transition.targetHeight = 1.0; // Sirkel
          }
        }
        
      } else {
        // Vanlige viewport-koordinater
        orbLightRef.current = { x, y, radius, isFollowing };
        orbShapeRef.current = 'circle'; // Standard sirkel
      }

      // Direkte DOM-manipulasjon uten React re-render
      const orbLight = orbLightRef.current;
      
      
      // Hent nåværende state for form-beregning
      let currentState = 'tomrom';
      let closestCard = null;
      if (orbLight && isFollowing && galleryContainer) {
        // Finn creature-card elementer og bestem orb-form
        const cardElements = galleryContainer.querySelectorAll('.creature-card');
        
        let closestDistance = Infinity;
        
        // Finn den nærmeste card-en
        cardElements.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;
          
          const distanceFromCenter = Math.hypot(x - cardCenterX, y - cardCenterY);
          
          if (distanceFromCenter < closestDistance) {
            closestDistance = distanceFromCenter;
            closestCard = { index, cardCenterX, cardCenterY, distance: distanceFromCenter };
          }
        });
        
        // Sjekk om orb er over tekstområdet (creature-morph-zone)
        if (closestCard) {
          const infoElements = galleryContainer.querySelectorAll('.creature-info-block');
          const infoRect = infoElements[closestCard.index].getBoundingClientRect();
          
          // Finn creature-morph-zone innenfor info-block
          const morphZone = infoElements[closestCard.index].querySelector('.creature-morph-zone');
          const morphRect = morphZone ? morphZone.getBoundingClientRect() : infoRect;
          
          // Sjekk om orb er innenfor tekstområdets y-akse
          const textTop = morphRect.top;
          const textBottom = morphRect.bottom;
          const orbY = y;
          
          // Legg til liten margin for bedre deteksjon
          const margin = 20;
          const isInTextRange = orbY >= (textTop - margin) && orbY <= (textBottom + margin);
          
          if (isInTextRange) {
            currentState = 'card';
          }
        }
      }
      
      // Oppdater orb-light-overlay med dynamisk form
      if (orbOverlayRef.current) {
        const transition = shapeTransitionRef.current;
        // Bruk smooth transition verdier
        const baseRadius = orbLight.radius * 28;
        const ellipseWidth = baseRadius * transition.currentWidth;
        const ellipseHeight = baseRadius * transition.currentHeight;
        
        // Bestem form basert på hvor nær vi er sirkel vs ellipse
        const widthRatio = transition.currentWidth;
        // Bruk ellipse kun når det er betydelig horisontal strekning
        const shapeType = (widthRatio > 1.2) ? 'ellipse' : 'circle';
        
        const orbStyle = orbLight
          ? `radial-gradient(${shapeType} ${ellipseWidth}px ${shapeType === 'ellipse' ? ellipseHeight + 'px' : ''} at ${orbLight.x}px ${orbLight.y}px,
              rgba(255, 200, 80, 0.11) 0%,
              rgba(200, 120, 20, 0.06) 45%,
              transparent 70%)`
          : 'transparent';
        orbOverlayRef.current.style.background = orbStyle;
      }
      
      // Oppdater gallery-dark-mask med dynamisk form
      if (darkMaskRef.current) {
        const transition = shapeTransitionRef.current;
        // Bruk smooth transition verdier
        const baseRadius = orbLight.radius * 30;
        const maskWidth = baseRadius * transition.currentWidth;
        const maskHeight = baseRadius * transition.currentHeight;
        
        // Bestem form basert på hvor nær vi er sirkel vs ellipse
        const widthRatio = transition.currentWidth;
        // Bruk ellipse kun når det er betydelig horisontal strekning
        const shapeType = (widthRatio > 1.2) ? 'ellipse' : 'circle';
        
        const maskStyle = orbLight
          ? `radial-gradient(${shapeType} ${maskWidth}px ${shapeType === 'ellipse' ? maskHeight + 'px' : ''} at ${orbLight.x}px ${orbLight.y}px,
              transparent 0%,
              transparent 38%,
              rgba(5, 2, 0, 0.55) 60%,
              rgba(5, 2, 0, 0.92) 80%,
              rgba(5, 2, 0, 0.97) 100%)`
          : 'rgba(5, 2, 0, 0.97)';
        darkMaskRef.current.style.background = maskStyle;
      }
      
      // Send orb-position event til MorphText komponentene
      // Send orb-position event til tekstsystemet hele tiden
if (isFollowing && galleryContainer) {
  const cardElements = galleryContainer.querySelectorAll('.creature-card');
  const infoElements = galleryContainer.querySelectorAll('.creature-info-block');

  window.dispatchEvent(
    new CustomEvent("orbForText", {
      detail: {
        x,
        y,
        closestCardIndex: closestCard ? closestCard.index : -1,
        isOverCard: currentState === "card",
        cardElements: Array.from(cardElements).map((el) => el.getBoundingClientRect()),
        infoElements: Array.from(infoElements).map((el) => el.getBoundingClientRect()),
      },
    })
  );
}
    };

    // Bruker passive listener for å ikke blokkere rendering
    window.addEventListener('orbPosition', handleOrbPosition, { passive: true });
    return () => window.removeEventListener('orbPosition', handleOrbPosition);
  }, []);

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

      {/* Orb Light Overlay - varm gullglød under (z-index: 5) */}
      <div className="orb-light-overlay" ref={orbOverlayRef} aria-hidden="true" />

      {/* Gallery Container with relative positioning for mask */}
      <div style={{ position: 'relative' }} data-gallery-container>
        {/* Gallery Dark Mask - mørk overlay med hull (z-index: 7) */}
        <div className="gallery-dark-mask" ref={darkMaskRef} aria-hidden="true" />
        
        <Gallery />
      </div>
    </div>
  );
}