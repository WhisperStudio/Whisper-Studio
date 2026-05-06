import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import OptimizedImage from '../components/OptimizedImage';
import backgroundImage from '../bilder/BoyDramatic.mp4';
import placeholderImage1 from '../bilder/1.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../bilder/3.webp';
import voteV from '../images/Vote_V.png';
import voteO from '../images/Vote_O.png';
import voteT from '../images/Vote_T.png';
import voteE from '../images/Vote_E.png';

/* ---------- Utils (Optimized) ---------- */

// Standard klemme-funksjon
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

// Standard easing-funksjon (Cubic EaseInOut)
const ease = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

// Sjekker hvor synlig et element er i viewporten (0 til 1)
const visibleProgress = (el) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  // Starter animasjon når elementet er 80% opp fra bunnen, ferdig når det er 20% over toppen
  const start = vh * 0.8; 
  const end = -r.height * 0.2; 
  return clamp((start - r.top) / (start - end), 0, 1);
};

// Throttle-funksjon for å begrense kallfrekvensen til en funksjon
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/* ---------- Global Styles (Forbedret) ---------- */
const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #0B0F14;
    --color-surface: #1C1F24;
    --color-text: #E9E2D3;
    --color-text-dim: rgba(233, 226, 211, 0.78);
    --color-primary: #8B1E1E;
    --color-accent: #C7A44C;
    --color-glow: #FF5A1F;
    --color-dark: var(--color-bg);
    --color-light-text: var(--color-text);
    --radius-hard: 10px;
    --radius-soft: 14px;
    --ring: 0 0 0 1px rgba(199, 164, 76, 0.22), 0 0 0 3px rgba(139, 30, 30, 0.18);
    --header-height: 60px;
    
    @media (max-width: 768px) {
      --header-height: 50px;
    }
  }

  html {
    scroll-behavior: auto;
    font-size: 16px; 
  }
  
  body {
    cursor: default; 
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: radial-gradient(1200px 700px at 20% 10%, rgba(139, 30, 30, 0.25), transparent 60%),
      radial-gradient(900px 500px at 85% 25%, rgba(199, 164, 76, 0.12), transparent 55%),
      linear-gradient(180deg, #05070A 0%, var(--color-bg) 40%, #06080C 100%);
    color: var(--color-text);
    font-family: "Cinzel", ui-serif, Georgia, "Times New Roman", serif;
    letter-spacing: 0.01em;
  }

  a { color: inherit; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

const Tagline = styled.p`
  margin: 18px 0 0;
  max-width: 54ch;
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  color: var(--color-text-dim);
  font-size: clamp(1.0rem, 1.6vw, 1.35rem);
  line-height: 1.55;
  letter-spacing: 0.02em;
  text-shadow: 0 12px 40px rgba(0,0,0,0.65);
  opacity: ${p => p.$opacity};
  transform: translateY(${p => p.$shift}px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  @media (max-width: 768px) {
    text-align: center;
    margin-top: 14px;
  }
`;

const Atmosphere = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(1000px 700px at 20% 10%, rgba(255, 90, 31, 0.10), transparent 60%),
      radial-gradient(900px 600px at 85% 30%, rgba(199, 164, 76, 0.08), transparent 55%),
      radial-gradient(700px 500px at 55% 80%, rgba(0, 0, 0, 0.50), transparent 55%);
    mix-blend-mode: screen;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const smokeDrift = keyframes`
  0%   { transform: translate3d(-2%, 1%, 0) scale(1.02); opacity: 0.22; }
  50%  { transform: translate3d(2%, -1%, 0) scale(1.05); opacity: 0.34; }
  100% { transform: translate3d(-1%, 0.5%, 0) scale(1.02); opacity: 0.22; }
`;

const SmokeLayer = styled.div`
  position: fixed;
  inset: -12% -12% -12% -12%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
  background:
    radial-gradient(closest-side at 18% 25%, rgba(255,255,255,0.08), transparent 60%),
    radial-gradient(closest-side at 76% 18%, rgba(255,255,255,0.06), transparent 62%),
    radial-gradient(closest-side at 55% 74%, rgba(255,255,255,0.07), transparent 60%),
    radial-gradient(closest-side at 32% 82%, rgba(255,255,255,0.05), transparent 62%);
  filter: blur(22px) contrast(110%);
  animation: ${smokeDrift} 14s ease-in-out infinite;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* ---------- Animations ---------- */
const heroIn = keyframes`
  0% { 
    opacity: 0; 
    transform: translate3d(0, 40px, 0) scale(0.95); 
    filter: blur(8px); 
  }
  100% { 
    opacity: 1; 
    transform: translate3d(0, 0, 0) scale(1.0); 
    filter: blur(0); 
  }
`;

/* ---------- Layout wrappers ---------- */
const AppContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;
`;

const StyledHeader = styled.header`
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  z-index: 1000;
  background: linear-gradient(
    180deg,
    rgba(5, 7, 10, 0.88) 0%,
    rgba(5, 7, 10, 0.62) 60%,
    rgba(5, 7, 10, 0.0) 100%
  );
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
  height: var(--header-height);
`;

/* ---------- Fixed bakgrunnsvideo ---------- */
const FixedBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: #000;
  
  @media (max-width: 500px) {
    background-image: url(${p => p.$fallbackImage}); 
    background-size: cover;
    background-position: center;
  }
`;

const BackgroundVideo = styled.video`
  position: absolute;
  left: 50%; 
  top: 50%;
  transform: translate(-50%, -50%) translateY(${p => p.$parallax}px) scale(${p => p.$scale});
  min-width: 100%;
  min-height: 100%;
  width: auto; 
  height: auto;
  object-fit: cover;
  will-change: transform;
  backface-visibility: hidden;
  filter: brightness(0.9) contrast(1.1) saturate(1.2);
  transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  @media (max-width: 500px) {
    display: none;
  }
`;

/* ---------- Hero (Forbedret responsivitet) ---------- */
const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  height: 100vh; 
  width: 100vw;
  display: flex; 
  flex-direction: column;
  justify-content: center; 
  align-items: flex-start;
  padding-left: 5%; 
  padding-top: var(--header-height); 
  
  @media (max-width: 768px) {
    align-items: center;
    padding: var(--header-height) 5% 0;
    text-align: center;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-left: 1%;
  justify-content: flex-start;
  gap: clamp(0px, 0.5vw, 5px); 
  opacity: ${p => p.$opacity};
  transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${heroIn} 1000ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
  filter: drop-shadow(0 8px 30px rgba(0,0,0,0.55));
  position: relative;
  
  @media (max-width: 768px) {
    justify-content: center;
    left: 0;
    width: auto;
    padding: 0;
    margin-bottom: 25px;
  }

  @media (min-width: 769px) {
    left: -90px;
    padding-right: 50px;
    width: calc(100% + 90px);
    margin-bottom: 20px;
  }
`;

const TitleLetter = styled.img`
  /* Standard/Basis størrelse for T og andre bokstaver uten spesifikk override */
  --letter-size: clamp(75px, 10vw, 110px); 
  width: var(--letter-size);
  height: var(--letter-size);
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  flex: 0 0 auto;
  margin: 0 clamp(1px, 0.5vw, 4px); /* Redusert margin */

  /* Spesifikke justeringer for V */
  ${props => props.$letter === 'V' && `
    --letter-size: clamp(85px, 12vw, 140px); /* Litt større V */
    margin-right: clamp(-3px, -1vw, -8px); /* Trekker O nærmere V */
  `}
  
  /* Spesifikke justeringer for E */
  ${props => props.$letter === 'E' && `
    --letter-size: clamp(87px, 12.5vw, 143px); /* Litt større E */
    margin-left: clamp(-2px, -0.5vw, -4px);
  `}
  
  /* Spesifikke justeringer for O (mindre enn standard for bedre balanse) */
  ${props => props.$letter === 'O' && `
    --letter-size: clamp(70px, 9vw, 120px); /* Mindre O */
    margin-bottom: clamp(-3px, -0.5vw, -5px);
  `}
`;

const TitleDot = styled.span`
  width: clamp(4px, 0.8vw, 10px);
  height: clamp(4px, 0.8vw, 10px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  display: inline-block;
  align-self: flex-end;
  transform: translateY(30%); 
  flex-shrink: 0;
`;

const BaseButton = styled.button`
  padding: 14px 26px; 
  font-size: 1.05rem;
  font-weight: 800;
  border: 1px solid;
  border-radius: var(--radius-hard);
  text-transform: uppercase;
  letter-spacing: 0.09em;
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  isolation: isolate;
  outline: none;

  &:focus-visible {
    box-shadow: var(--ring);
  }
  
  &:active {
    transform: translateY(1px) scale(0.99);
  }

  @media (max-width: 768px) { 
    width: 100%;
    font-size: 1.1rem;
    padding: 14px 28px;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  opacity: ${p => p.$opacity};
  transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${heroIn} 1200ms 150ms cubic-bezier(0.2, 0.9, 0.25, 1) both;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    width: 90%;
    max-width: 380px;
    align-self: center;
  }
`;

const PlayButton = styled(BaseButton)`
  background: linear-gradient(180deg, rgba(12, 12, 14, 0.92) 0%, rgba(9, 9, 11, 0.96) 100%);
  color: var(--color-text);
  border-color: rgba(199, 164, 76, 0.38);
  box-shadow: 0 14px 60px rgba(0,0,0,0.55);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgba(139,30,30,0.58), rgba(255,90,31,0.25)),
      repeating-linear-gradient(90deg, rgba(199,164,76,0.18) 0 6px, rgba(0,0,0,0) 6px 12px);
    opacity: 0.12;
    z-index: -1;
    mask-image: linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0.55));
  }
  
  &:hover { 
    transform: translateY(-3px);
    border-color: rgba(255, 90, 31, 0.75);
    box-shadow:
      0 18px 70px rgba(0,0,0,0.65),
      0 0 30px rgba(255, 90, 31, 0.18);
  }
`;

const WatchTrailerButton = styled(BaseButton)`
  background: rgba(10, 12, 15, 0.35);
  color: var(--color-text);
  border-color: rgba(199, 164, 76, 0.55);
  backdrop-filter: blur(10px);
  font-weight: 800;
  
  &:hover { 
    transform: translateY(-3px);
    border-color: rgba(199, 164, 76, 0.95);
    box-shadow: 0 0 0 1px rgba(199, 164, 76, 0.30), 0 0 34px rgba(199, 164, 76, 0.16);
  }
`;

/* ---------- News + Cards (Ekstremt forbedret responsivitet) ---------- */
const NewsSection = styled.section`
  position: relative;
  width: 100%;
  padding: clamp(60px, 10vw, 120px) 5% clamp(40px, 8vw, 100px); 
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.55) 15%, rgba(0,0,0,0.75) 100%);
  z-index: 10;
`;

const NewsSectionTitle = styled.h2`
  font-size: clamp(2.5rem, 6vw, 5rem); 
  margin-bottom: clamp(40px, 8vw, 80px); 
  color: var(--color-text);
  text-align: center; 
  font-weight: 900; 
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 14px 60px rgba(0,0,0,0.65);
  
  will-change: transform, opacity;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: clamp(20px, 4vw, 40px); 
  max-width: 1600px; 
  margin: 0 auto;
  
  @media (max-width: 1024px) { 
    grid-template-columns: 1fr; 
  }
`;

const ContactSection = styled.section`
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 0 5% clamp(70px, 10vw, 110px);
  box-sizing: border-box;
`;

const ContactCard = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(28px, 4vw, 42px);
  border-radius: var(--radius-soft);
  background:
    linear-gradient(145deg, rgba(28, 31, 36, 0.92), rgba(11, 15, 20, 0.94));
  border: 1px solid rgba(199, 164, 76, 0.18);
  box-shadow: 0 18px 80px rgba(0,0,0,0.45);
  backdrop-filter: blur(20px);
`;

const ContactTitle = styled.h2`
  margin: 0 0 14px;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--color-text);
`;

const ContactIntro = styled.p`
  margin: 0 0 26px;
  max-width: 58ch;
  color: var(--color-text-dim);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  line-height: 1.7;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContactItem = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 22px;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-hard);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(199, 164, 76, 0.16);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 90, 31, 0.45);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
`;

const ContactLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(199, 164, 76, 0.88);
`;

const ContactValue = styled.span`
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
`;

const Card = styled(Link)`
  text-decoration: none; 
  background:
    linear-gradient(145deg, rgba(28, 31, 36, 0.92), rgba(11, 15, 20, 0.92));
  color: var(--color-text);
  border-radius: var(--radius-soft);
  overflow: hidden;
  box-shadow: 0 18px 80px rgba(0,0,0,0.55);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(199, 164, 76, 0.12);
  will-change: transform, box-shadow, border-color; 
  will-change: transform, opacity;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(600px 260px at 10% 10%, rgba(139, 30, 30, 0.18), transparent 70%),
      radial-gradient(500px 220px at 90% 30%, rgba(199, 164, 76, 0.12), transparent 72%),
      repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 2px, rgba(0,0,0,0) 2px 7px);
    opacity: 0.55;
    pointer-events: none;
    mix-blend-mode: overlay;
  }
  
  &:hover { 
    transform: translateY(-10px) scale(1.01); 
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    border-color: rgba(255, 90, 31, 0.30);
  }

  &:active {
    transform: translateY(-5px) scale(1.0);
  }
`;

const LargeCard = styled(Card)`
  grid-row: span 2; 
  display: flex; 
  flex-direction: column; 
  height: auto; 
  
  @media (max-width: 1024px) { 
    grid-row: auto; 
  }
`;

const SmallCardContainer = styled.div`
  display: grid; 
  grid-template-rows: repeat(2, 1fr); 
  gap: clamp(20px, 4vw, 40px);
  
  @media (max-width: 1024px) { 
    grid-template-rows: auto; 
  }
  @media (max-width: 500px) {
    grid-template-rows: auto;
  }
`;

const SmallCard = styled(Card)``;

const CardImage = ({ image, $large }) => {
  return (
    <OptimizedImage 
      src={image} 
      alt="Card image" 
      className={$large ? "card-image-large" : "card-image"}
      preload={$large} // Preload large cards
    />
  );
};

const CardContent = styled.div`
  padding: ${p => (p.$large ? 'clamp(25px, 5vw, 50px)' : 'clamp(20px, 4vw, 35px)')}; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: ${p => (p.$large ? 'clamp(2rem, 4vw, 3.2rem)' : 'clamp(1.5rem, 3vw, 2.4rem)')}; 
  font-weight: 900; 
  color: var(--color-text);
  margin-bottom: clamp(15px, 2vw, 25px); 
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

const CardDescription = styled.p`
  font-size: ${p => (p.$large ? 'clamp(1rem, 1.5vw, 1.5rem)' : 'clamp(0.9rem, 1.2vw, 1.2rem)')}; 
  color: var(--color-text-dim);
  line-height: 1.6; 
  margin-bottom: clamp(20px, 3vw, 35px);
  font-weight: 400;
`;

const CardButton = styled(BaseButton)`
  padding: 12px 22px;
  background: linear-gradient(180deg, rgba(199, 164, 76, 0.22), rgba(139, 30, 30, 0.22));
  color: var(--color-text);
  border-color: rgba(199, 164, 76, 0.65);
  font-size: 0.95rem;
  font-weight: 900;
  align-self: flex-start;
  box-shadow: 0 14px 60px rgba(0,0,0,0.55);
  
  &:hover { 
    border-color: rgba(255, 90, 31, 0.75);
    box-shadow: 0 14px 70px rgba(0,0,0,0.65), 0 0 30px rgba(255, 90, 31, 0.18);
  }
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 0.9rem;
    align-self: stretch;
  }
`;

const CardDate = styled.span`
  font-size: 0.9rem;
  color: rgba(199, 164, 76, 0.85);
  margin-bottom: 20px; 
  display: block; 
  font-weight: 600;
`;

/* ---------- Component ---------- */
function App() {
  const vidRef = useRef(null);
  const [heroState, setHeroState] = useState({
    opacity: 1,
    shift: 0,
    scale: 1,
    parallax: 0,
    videoScale: 1.05,
  });
  const [videoReady, setVideoReady] = useState(false);
  const titleRef = useRef(null);
  const largeRef = useRef(null);
  const smallRefs = useRef([]);
  // Liste over alle elementer som skal scroll-animeres
  const animatedRefs = useRef([]);

  const getMaxScroll = useCallback(() =>
    Math.max(0, (document.documentElement?.scrollHeight || 0) - window.innerHeight),
    []
  );

  /* Video setup */
  useEffect(() => {
    const idleHandle = ('requestIdleCallback' in window)
      ? window.requestIdleCallback(() => setVideoReady(true), { timeout: 1200 })
      : window.setTimeout(() => setVideoReady(true), 1200);

    return () => {
      if ('cancelIdleCallback' in window && typeof idleHandle === 'number') {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }
    };
  }, []);

  useEffect(() => {
    const v = vidRef.current;
    if (!v || !videoReady) return;

    const attemptPlay = () => {
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.play().catch(() => {
        v.pause();
      });
    };

    v.addEventListener('loadedmetadata', attemptPlay);
    v.addEventListener('loadeddata', attemptPlay);
    v.addEventListener('canplaythrough', attemptPlay);

    attemptPlay();

    return () => {
      v.removeEventListener('loadedmetadata', attemptPlay);
      v.removeEventListener('loadeddata', attemptPlay);
      v.removeEventListener('canplaythrough', attemptPlay);
    };
  }, [videoReady]);

  /* Scroll handler med throttling og requestAnimationFrame */
  useEffect(() => {
    // 1. Scroll State Update (Throttled)
    const handleScrollThrottled = throttle(() => {
      const scrollY = window.scrollY || 0;
      const maxScroll = getMaxScroll();
      const progress = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0;
      
      const easedProgress = ease(progress);

      setHeroState({
        opacity: Math.max(0, 1 - progress * 1.8), 
        shift: progress * 80, 
        scale: Math.max(0.9, 1 - progress * 0.15),
        parallax: easedProgress * 50, 
        videoScale: 1.05 + easedProgress * 0.1,
      });

    }, 16); 

    // 2. Element Animation (RequestAnimationFrame)
    const animateElements = () => {
      if (animatedRefs.current.length === 0) {
        animatedRefs.current = [
          titleRef.current,
          largeRef.current,
          ...smallRefs.current.filter(Boolean)
        ].filter(Boolean);
      }

      animatedRefs.current.forEach(el => {
        const progress = visibleProgress(el);
        const easedProgress = ease(progress);
        
        el.style.opacity = String(easedProgress);
        el.style.transform = `translateY(${(1 - easedProgress) * 40}px)`;
      });
      
      requestAnimationFrame(animateElements);
    };

    handleScrollThrottled(); 
    window.addEventListener('scroll', handleScrollThrottled, { passive: true });
    window.addEventListener('resize', handleScrollThrottled, { passive: true });
    
    const animFrame = requestAnimationFrame(animateElements);
    
    return () => {
      window.removeEventListener('scroll', handleScrollThrottled);
      window.removeEventListener('resize', handleScrollThrottled);
      cancelAnimationFrame(animFrame);
    };
  }, [getMaxScroll]);

  const handlePlayNowClick = () => {
    window.location.href = '/vote';
  };

  return (
    <>
      <GlobalStyle />

      <Atmosphere />
      <SmokeLayer />

      <FixedBackground $fallbackImage={placeholderImage1}>
        <BackgroundVideo
          ref={vidRef}
          src={videoReady ? backgroundImage : undefined}
          muted
          playsInline
          preload="none"
          poster={placeholderImage1}
          $parallax={heroState.parallax}
          $scale={heroState.videoScale}
        />
      </FixedBackground>

      <StyledHeader>
        <Header />
      </StyledHeader>

      <AppContainer>
        {/* --- Hero Section --- */}
        <ContentContainer>
          <TitleContainer
            $opacity={heroState.opacity}
            $shift={heroState.shift}
            $scale={heroState.scale}
          >
            {/* Justerte margin-bottom for visuell balanse */}
            <TitleLetter src={voteV} alt="V" $letter="V" style={{ marginBottom: '-10px' }}/>
            <TitleDot />
            <TitleLetter src={voteO} alt="O" $letter="O" style={{ marginBottom: '-5px' }}/>
            <TitleDot />
            <TitleLetter src={voteT} alt="T" /> {/* T bruker nå den mindre standardstørrelsen */}
            <TitleDot />
            <TitleLetter src={voteE} alt="E" $letter="E" style={{ marginBottom: '-10px' }}/>
          </TitleContainer>

          <Tagline $opacity={heroState.opacity} $shift={heroState.shift * 0.35}>
            When the forest falls silent, the truth awakens.
          </Tagline>

          <ButtonContainer
            $opacity={heroState.opacity}
            $shift={heroState.shift}
            $scale={heroState.scale}
          >
            <PlayButton onClick={handlePlayNowClick}>Enter the Realm</PlayButton>
            <WatchTrailerButton>Witness the Prophecy</WatchTrailerButton>
          </ButtonContainer>
        </ContentContainer>

        {/* --- News Section --- */}
        <NewsSection>
          <NewsSectionTitle ref={titleRef}>Saga of the Woods</NewsSectionTitle>

          <CardContainer>
            {/* Large Card (Første kort i kolonnen) */}
            <LargeCard ref={largeRef} to="/update-vintra-vote">
              <CardImage $large image={placeholderImage1} />
              <CardContent $large>
                <div>
                  <CardDate>Saga Entry — August 22, 2025</CardDate>
                  <CardTitle $large>Carved Into the Bark of Time</CardTitle>
                  <CardDescription $large>
                    The Vintra/Vote website is under construction.
                    <br /><br />
                    The game Vote is well underway, two of the maps are under construction,
                    characters are being created, and the story of the game is being created bit by bit.
                  </CardDescription>
                </div>
                <CardButton as="div">Read the Entry</CardButton>
              </CardContent>
            </LargeCard>

            <SmallCardContainer>
              {/* Small Card 1 (Art Gallery) */}
              <SmallCard 
                ref={el => (smallRefs.current[0] = el)} 
                to="/artwork" 
                >
                <CardImage image={placeholderImage2} />
                <CardContent>
                  <div>
                    <CardDate>V.O.T.E</CardDate>
                    <CardTitle>The Archives</CardTitle>
                    <CardDescription>
                      Check out our art gallery of the landscape and creatures you might see in the game.
                    </CardDescription>
                  </div>
                  <CardButton as="div">Enter the Archives</CardButton>
                </CardContent>
              </SmallCard>

              {/* Small Card 2 (Game) */}
              <SmallCard as="a" href="https://games.vintrastudio.com/" target="_blank" rel="noopener noreferrer">
                <CardImage image={placeholderImage3} />
                <CardContent>
                  <div>
                    <CardDate>Jan, 2026</CardDate>
                    <CardTitle>Imposter Game</CardTitle>
                    <CardDescription>
                      Try out our new imposter game. A fast test of wit, lies, and instincts.
                    </CardDescription>
                  </div>
                  <CardButton as="div">Enter the Realm</CardButton>
                </CardContent>
              </SmallCard>
            </SmallCardContainer>
          </CardContainer>
        </NewsSection>

        <ContactSection aria-labelledby="home-contact-title">
          <ContactCard>
            <ContactTitle id="home-contact-title">Contact Vintra Studio</ContactTitle>
            <ContactIntro>
              Need help with AI chatbots, websites, or digital solutions? Reach us directly by phone or email.
            </ContactIntro>
            <ContactGrid>
              <ContactItem href="tel:+4741761252">
                <ContactLabel>Phone</ContactLabel>
                <ContactValue>+47 417 61 252</ContactValue>
              </ContactItem>
              <ContactItem href="mailto:support@vintrastudio.com">
                <ContactLabel>Email</ContactLabel>
                <ContactValue>support@vintrastudio.com</ContactValue>
              </ContactItem>
            </ContactGrid>
          </ContactCard>
        </ContactSection>

        <Footer />
      </AppContainer>
    </>
  );
}

export default App;
