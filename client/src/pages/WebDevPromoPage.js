import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
// Behold dine egne Header/Footer
import Header from '../components/header';
import Footer from '../components/footer';

// ---------- Utils ----------
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const ease = t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
const throttle = (func, limit) => {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
const visibleProgress = el => {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const start = vh * 0.8;
  const end = -r.height * 0.2;
  return clamp((start - r.top) / (start - end), 0, 1);
};

// ---------- Global ----------
const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  :root{
    --bg:#0e0c0d;
    --txt:#fff;
    --muted:rgba(255,255,255,.86);
    --glass:rgba(255,255,255,.08);
    --glass-2:rgba(255,255,255,.12);
    --stroke:rgba(255,255,255,.12);
    --primary-from:#ff6b6b;
    --primary-to:#ff8787;
    --acc-from:#4a86ff;
    --acc-to:#6c5ce7;
    --success:#3ad29f;
  }
  body {
    cursor: default;
    margin: 0; padding: 0; overflow-x: hidden; background: var(--bg);
    color: var(--txt); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
  }
  html { scroll-behavior: auto; }
  @media (prefers-reduced-motion: reduce){
    * { animation: none !important; transition: none !important; }
  }
`;

// ---------- Animations ----------
const heroIn = keyframes`
  0% { opacity: 0; transform: translate3d(0, 40px, 0) scale(0.96); filter: blur(6px); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1.0); filter: blur(0); }
`;
const floaty = keyframes`
  0% { transform: translateY(0) }
  50% { transform: translateY(-6px) }
  100% { transform: translateY(0) }
`;
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const auroraDrift = keyframes`
  0% { transform: translate(-10%, -8%) rotate(0deg); }
  50% { transform: translate(6%, 4%) rotate(10deg); }
  100% { transform: translate(-10%, -8%) rotate(0deg); }
`;

// ---------- Layout ----------
const AppContainer = styled.div`
  min-height: 100vh; width: 100vw; display: flex; flex-direction: column; overflow-x: hidden; position: relative;
`;

const StyledHeader = styled.header`
  position: fixed; inset: 0 auto auto 0; right: 0; z-index: 1000; backdrop-filter: blur(10px);
`;

const FixedBackground = styled.div`
  position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none;
`;

/** EXTREMT FANCY LAYERS **/
const GradientLayer = styled.div`
  position:absolute; inset:-10%;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  background-size: 400% 400%;
  filter: saturate(1.15) brightness(0.9) contrast(1.05);
  animation: ${gradientShift} 18s ease-in-out infinite;
  will-change: transform, background-position, filter;
`;

const AuroraLayer = styled.div`
  position:absolute; inset:-30%;
  mix-blend-mode: screen;
  background:
    radial-gradient(40% 60% at 25% 35%, rgba(255,107,107,.28), transparent 70%),
    radial-gradient(60% 40% at 70% 65%, rgba(74,134,255,.24), transparent 70%),
    radial-gradient(30% 50% at 55% 50%, rgba(58,210,159,.22), transparent 72%);
  filter: blur(30px);
  animation: ${auroraDrift} 22s ease-in-out infinite;
`;

const GridDots = styled.canvas`
  position:absolute; inset:0; opacity:.16;
`;

const ParticleCanvas = styled.canvas`
  position:absolute; inset:0; opacity:.5;
`;

const NoiseLayer = styled.div`
  position:absolute; inset:0; opacity:.08; mix-blend-mode:soft-light;
  background-image: url('data:image/svg+xml;utf8,\
  <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">\
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>\
    <rect width="100%" height="100%" filter="url(%23n)" opacity="0.35"/>\
  </svg>');
  background-size: 320px 320px;
  pointer-events:none;
`;

const Spotlight = styled.div`
  position: absolute; top: 0; left: 0; width: 300px; height: 300px; border-radius: 50%;
  pointer-events: none; mix-blend-mode: screen; opacity: .55;
  background: radial-gradient(closest-side, rgba(255,255,255,.20), rgba(255,255,255,0) 70%);
  transform: translate3d(var(--x, -9999px), var(--y, -9999px), 0);
  transition: opacity .2s ease;
`;

const ScrollProgress = styled.div`
  position: fixed; top: 0; left: 0; height: 3px; width: ${({$w}) => $w}%; z-index: 2000;
  background: linear-gradient(90deg, var(--primary-from), var(--primary-to));
  box-shadow: 0 0 14px rgba(255,107,107,.6);
`;

// ---------- Hero ----------
const Hero = styled.section`
  position: relative; z-index: 1; height: 100vh; width: 100vw; display: grid; align-items: center;
  padding: 80px 5% 0; grid-template-columns: 1fr; grid-template-rows: auto;
`;

const Eyebrow = styled.span`
  display: inline-block; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(8px); font-weight: 800; letter-spacing: 1.1px;
`;

const HeroTitle = styled.h1`
  margin: 18px 0 10px; font-size: clamp(2.8rem, 8vw, 7.2rem); font-weight: 1000; letter-spacing: 0.04em;
  text-shadow: 0 6px 30px rgba(0,0,0,0.55); line-height: 0.94;
  opacity: ${p => p.$opacity}; transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); animation: ${heroIn} 900ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
`;

const HeroSub = styled.p`
  max-width: 900px; font-size: clamp(1.1rem, 2.6vw, 1.6rem); color: rgba(255,255,255,0.92); line-height: 1.6;
  opacity: ${p => p.$opacity}; transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); animation: ${heroIn} 1050ms 80ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
`;

const HeroCTAs = styled.div`
  margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
  opacity: ${p => p.$opacity}; transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); animation: ${heroIn} 1150ms 120ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
`;

// ---------- Buttons (magnetic/tilt-ready) ----------
const PrimaryBtn = styled.button`
  padding: 16px 28px; font-size: 1.15rem; font-weight: 900; letter-spacing: 0.4px; border-radius: 999px; border: none; cursor: pointer;
  color: #fff; background: linear-gradient(135deg, var(--primary-from), var(--primary-to)); box-shadow: 0 12px 36px rgba(255,107,107,0.45);
  transition: transform .25s cubic-bezier(.25,.46,.45,.94), box-shadow .25s, filter .25s;
  will-change: transform;
  &:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 20px 50px rgba(255,107,107,.6); filter: saturate(1.1); }
  &:active { transform: translateY(-1px) scale(1.01); }
`;

const GhostBtn = styled.button`
  padding: 16px 28px; font-size: 1.1rem; font-weight: 800; border-radius: 999px; cursor: pointer; background: rgba(255,255,255,.08);
  color: #fff; border: 2px solid rgba(255,255,255,.8); backdrop-filter: blur(8px); transition: all .25s cubic-bezier(.25,.46,.45,.94);
  &:hover { background:#fff; color:#000; transform: translateY(-4px) scale(1.05); box-shadow:0 18px 48px rgba(255,255,255,.35); }
`;

// ---------- Sections ----------
const Section = styled.section`
  position: relative; width: 100%; padding: ${p => p.tight ? '40px 5% 40px' : '120px 5% 100px'}; box-sizing: border-box;
  background: ${p => p.alt ? 'linear-gradient(180deg, rgba(14,12,13,0.88) 0%, rgba(14,12,13,0.94) 100%)' : 'transparent'};
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.2rem, 6vw, 4.4rem); margin: 0 0 22px; text-align: center; font-weight: 1000; letter-spacing: .02em;
  opacity: 0; transform: translateY(40px); transition: all .6s cubic-bezier(.25,.46,.45,.94); text-shadow: 0 4px 18px rgba(0,0,0,.45);
`;

const FeatureGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; max-width: 1400px; margin: 40px auto 0;
  @media (max-width: 1100px){ grid-template-columns: repeat(2, 1fr);} 
  @media (max-width: 720px){ grid-template-columns: 1fr;}
`;

const FeatureCard = styled.div`
  background: linear-gradient(145deg, rgba(26,26,26,.85), rgba(40,40,40,.9));
  color: #fff; border-radius: 22px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); padding: 26px; display:flex; flex-direction:column; gap:12px;
  opacity:0; transform: translateY(40px); transition: transform .35s cubic-bezier(.25,.46,.45,.94), box-shadow .35s, border-color .35s, opacity .6s;
  backdrop-filter: blur(16px);
  animation: ${floaty} 6s ease-in-out infinite;
  will-change: transform;
  transform-style: preserve-3d;
  perspective: 800px;

  &:hover { transform: translateY(-10px) scale(1.015) rotateX(1deg) rotateY(-1deg);
    box-shadow: 0 30px 80px rgba(0,0,0,.6); border-color: rgba(255,255,255,.2); }

  &::after{
    content:''; position:absolute; inset:-1px; border-radius:22px;
    background: radial-gradient(120px 80px at var(--mx, 50%) var(--my, 20%), rgba(255,255,255,.12), transparent 60%);
    pointer-events:none;
  }
`;
const FeatureIcon = styled.div`
  width: 52px; height: 52px; border-radius: 14px; background: rgba(255,255,255,.08); display:grid; place-items:center;
  font-weight: 900; font-size: 1.1rem; letter-spacing: .06em;
`;
const FeatureTitle = styled.h3` margin: 4px 0; font-size: 1.4rem; letter-spacing: .01em; `;
const FeatureText = styled.p` margin: 0; color: rgba(255,255,255,.86); line-height: 1.6; font-size: 1.05rem; `;

// ---------- Estimator ----------
const EstimatorWrap = styled.div`
  margin: 32px auto 0; max-width: 1200px; display: grid; grid-template-columns: 1.2fr .8fr; gap: 28px;
  @media (max-width: 1100px){ grid-template-columns: 1fr; }
`;

const Panel = styled.div`
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(58,210,159,.12), transparent 70%),
    radial-gradient(120% 120% at 100% 100%, rgba(74,134,255,.12), transparent 70%),
    linear-gradient(145deg, rgba(26,26,26,.88), rgba(40,40,40,.92));
  border: 1px solid rgba(255,255,255,.12); border-radius: 18px; padding: 22px 22px 10px; box-shadow: 0 16px 50px rgba(0,0,0,.35);
`;

const PanelTitle = styled.h3`
  margin: 0 0 14px; font-size: 1.4rem; letter-spacing: .02em; display:flex; align-items:center; justify-content:space-between;
`;

const Row = styled.div`
  display:grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0;
  @media (max-width: 680px){ grid-template-columns: 1fr; }
`;

const Field = styled.label`
  display:flex; flex-direction:column; gap: 8px; background: rgba(255,255,255,.04); padding: 14px; border-radius: 12px; border:1px solid rgba(255,255,255,.06);
`;
const FieldRow = styled.div` display:flex; gap: 12px; align-items:center; flex-wrap: wrap; `;
const Input = styled.input`
  width: 100%; padding: 12px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.14); background: rgba(0,0,0,.35); color: #fff;
  &:focus{ outline: none; border-color: rgba(255,255,255,.6); box-shadow: 0 0 0 4px rgba(255,255,255,.08); }
`;
const Select = styled.select`
  width: 100%; padding: 12px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.14); background: rgba(0,0,0,.35); color: #fff;
  &:focus{ outline: none; border-color: rgba(255,255,255,.6); box-shadow: 0 0 0 4px rgba(255,255,255,.08); }
`;
const Range = styled.input.attrs({ type: 'range' })`
  width: 100%; accent-color: #ff6b6b; cursor: pointer; height: 2px; background: linear-gradient(90deg, var(--primary-from), var(--primary-to)); border-radius: 999px; appearance: none;
`;

const ToggleWrap = styled.div` display:flex; align-items:center; gap: 12px; cursor: pointer; `;
const Toggle = styled.input.attrs({ type: 'checkbox' })`
  appearance: none; width: 52px; height: 30px; border-radius: 999px; position: relative; background: rgba(255,255,255,.2); transition: background .25s; border:1px solid rgba(255,255,255,.2);
  &::after{ content:''; position:absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: transform .25s; }
  &:checked{ background: var(--success); }
  &:checked::after{ transform: translateX(22px); }
`;

const Meta = styled.div`
  display:flex; align-items:center; justify-content: space-between; gap: 12px; margin-top: 10px; flex-wrap: wrap; color: rgba(255,255,255,.8);
`;
const TotalBox = styled.div`
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(58,210,159,.18), transparent 70%),
    radial-gradient(120% 120% at 100% 100%, rgba(74,134,255,.18), transparent 70%),
    linear-gradient(145deg, rgba(26,26,26,.9), rgba(40,40,40,.9));
  border: 1px solid rgba(255,255,255,.12); border-radius: 18px; padding: 22px; box-shadow: 0 16px 50px rgba(0,0,0,.35);
`;
const TotalFigure = styled.div` font-weight: 1000; font-size: clamp(2rem, 5vw, 3rem); `;
const Small = styled.small` color: rgba(255,255,255,.7); `;
const Actions = styled.div` display:flex; gap: 12px; margin-top: 10px; flex-wrap: wrap; `;
const OutlineBtn = styled.button`
  padding: 12px 16px; border-radius: 12px; background: transparent; color:#fff; border:1px solid rgba(255,255,255,.3); cursor:pointer; font-weight:800;
  transition: transform .2s ease;
  &:hover{ background: rgba(255,255,255,.12); transform: translateY(-2px); }
`;
const Badge = styled.span`
  display:inline-block; padding:6px 10px; border-radius:999px; font-size:.8rem; font-weight:800;
  background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2);
`;

// ---------- Currency ----------
const formatCurrency = (amount, ccy) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: ccy }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${ccy}`;
  }
};

// ---------- Tiny confetti ----------
const burstConfetti = (parent) => {
  if (!parent) return;
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('span');
    el.style.position = 'fixed';
    el.style.left = (window.innerWidth/2 + (Math.random()*200-100)) + 'px';
    el.style.top = (window.innerHeight/2 + (Math.random()*80-40)) + 'px';
    el.style.width = '6px';
    el.style.height = '10px';
    el.style.background = `hsl(${Math.random()*360},90%,60%)`;
    el.style.transform = `rotate(${Math.random()*360}deg)`;
    el.style.zIndex = 9999;
    el.style.pointerEvents = 'none';
    el.style.opacity = '1';
    const dx = (Math.random()-0.5)*400;
    const dy = (Math.random()-0.6)*600 - 150;
    const rot = (Math.random()-0.5)*720;
    const dur = 800 + Math.random()*700;
    el.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
    setTimeout(() => el.remove(), dur);
    document.body.appendChild(el);
  }
};

// ---------- Component ----------
export default function WebDevPromoPage() {
  // Refs
  const sectionRefs = useRef([]);
  const titleRef = useRef(null);
  const confettiRef = useRef(null);
  const particleRef = useRef(null);
  const gridRef = useRef(null);
  const spotlightRef = useRef(null);

  // Hero anim state
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroShift, setHeroShift] = useState(0);
  const [heroScale, setHeroScale] = useState(1);
  const [scrollW, setScrollW] = useState(0);

  const getMaxScroll = () => Math.max(0, (document.documentElement?.scrollHeight || 0) - window.innerHeight);

  // Background: grid dots + particles + spotlight + parallax scroll
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Grid dots
    const grid = gridRef.current;
    const gctx = grid?.getContext('2d');

    // Particles
    const canvas = particleRef.current;
    const ctx = canvas?.getContext('2d');
    let particles = [];
    let rafId;

    const resize = () => {
      if (grid) { grid.width = window.innerWidth; grid.height = window.innerHeight; drawGrid(); }
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    };

    const drawGrid = () => {
      if (!gctx || !grid) return;
      gctx.clearRect(0,0,grid.width,grid.height);
      const gap = 26;
      const size = 1.25;
      gctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = gap/2; y < grid.height; y += gap) {
        for (let x = gap/2; x < grid.width; x += gap) {
          gctx.beginPath();
          gctx.arc(x, y, size, 0, Math.PI*2);
          gctx.fill();
        }
      }
    };

    const initParticles = () => {
      if (!canvas) return;
      const count = Math.max(50, Math.min(120, Math.floor((window.innerWidth*window.innerHeight)/20000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.2 + 0.8,
        dx: (Math.random() - 0.5) * 0.45,
        dy: (Math.random() - 0.5) * 0.45,
        hue: Math.random()*360
      }));
    };

    const drawParticles = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
        grd.addColorStop(0, `hsla(${p.hue}, 80%, 65%, .8)`);
        grd.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`);
        ctx.fillStyle = grd;
        ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
        ctx.fill();

        p.x += p.dx; p.y += p.dy;
        if (p.x < -10) p.x = canvas.width+10;
        if (p.x > canvas.width+10) p.x = -10;
        if (p.y < -10) p.y = canvas.height+10;
        if (p.y > canvas.height+10) p.y = -10;
        p.hue += 0.1; if (p.hue > 360) p.hue -= 360;
      }
      rafId = requestAnimationFrame(drawParticles);
    };

    const onMouseMove = throttle((e) => {
      const s = spotlightRef.current;
      if (!s) return;
      const x = e.clientX - 150;
      const y = e.clientY - 150;
      s.style.setProperty('--x', x+'px');
      s.style.setProperty('--y', y+'px');
    }, 10);

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    if (!prefersReduced) {
      initParticles();
      drawParticles();
    } else {
      // still draw static grid
      drawGrid();
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll handler for hero/motion + progress
  useEffect(() => {
    const handleScroll = throttle(() => {
      const maxScroll = getMaxScroll();
      const scrollY = window.scrollY || 0;
      const progress = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0;
      const eased = ease(progress);
      setHeroOpacity(Math.max(0, 1 - progress * 1.5));
      setHeroShift(progress * 60);
      setHeroScale(Math.max(0.9, 1 - progress * 0.1));
      setScrollW(progress * 100);
    }, 16);

    const animateElements = () => {
      const elements = [titleRef.current, ...sectionRefs.current].filter(Boolean);
      elements.forEach(el => {
        const p = visibleProgress(el); const e = ease(p);
        el.style.opacity = String(e);
        el.style.transform = `translateY(${(1 - e) * 40}px)`;
      });
      requestAnimationFrame(animateElements);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    animateElements();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const goContact = () => { window.location.href = '/contact'; };

  // ---------- Estimator State ----------
  const [ccy, setCcy] = useState('NOK');
  const rates = { NOK: 1, EUR: 0.085, USD: 0.092 }; // enkle multipliers

  const [inputs, setInputs] = useState(() => {
    const url = new URL(window.location.href);
    const share = url.searchParams.get('est');
    try {
      if (share) {
        const parsed = JSON.parse(decodeURIComponent(atob(share)));
        return { ...{
          pages: 5, design: 'premium', cms: true, ecommerce: false, products: 20,
          integrations: 1, seo: 'standard', copy: 1000, hosting: 'standard',
          maintenance: 'standard', animations: true, multilingual: 0,
          accessibility: 'aa', analytics: true, migration: 10, revisions: 2,
          qa: 'enhanced', rush: false, discount: ''
        }, ...parsed };
      }
    } catch {}
    try {
      const cached = localStorage.getItem('estimator_v3');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      pages: 5,
      design: 'premium',
      cms: true,
      ecommerce: false,
      products: 20,
      integrations: 1,
      seo: 'standard',
      copy: 1000,
      hosting: 'standard',
      maintenance: 'standard',
      animations: true,
      multilingual: 0,
      accessibility: 'aa',
      analytics: true,
      migration: 10,
      revisions: 2,
      qa: 'enhanced',
      rush: false,
      discount: '',
    };
  });

  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatRate, setVatRate] = useState(25);
  const update = patch => setInputs(v => ({ ...v, ...patch }));

  useEffect(() => {
    try { localStorage.setItem('estimator_v3', JSON.stringify(inputs)); } catch {}
  }, [inputs]);

  const priceMap = {
    basePerPage: { basic: 2500, standard: 4500, premium: 7000, elite: 12000 },
    cms: 8000,
    ecommerceBase: 15000,
    productPerItem: 300,
    integrationUnit: 4000,
    seo: { none: 0, basic: 3500, standard: 8000, advanced: 16000 },
    copyPerWord: 3,
    hosting: { basic: 150, standard: 300, pro: 600 },
    maintenance: { none: 0, basic: 1200, standard: 2800, pro: 6000 },
    animations: 6000,
    multilingualPerLang: 9000,
    accessibility: { none: 0, a: 4000, aa: 9000, aaa: 18000 },
    analytics: 1500,
    migrationPerPage: 800,
    revisionRound: 2000,
    qa: { basic: 0, enhanced: 5000 },
    rushMultiplier: 1.25,
  };

  const discountCodes = { LAUNCH10: 0.1, FRIENDS15: 0.15, VIP20: 0.2 };

  const breakdown = useMemo(() => {
    const r = rates[ccy] || 1;
    const pp = priceMap;
    const bpp = pp.basePerPage[inputs.design] || 0;

    const oneTime = {};
    oneTime['Pages & Design'] = inputs.pages * bpp * r;
    if (inputs.cms) oneTime['CMS Setup'] = pp.cms * r;

    if (inputs.ecommerce) {
      oneTime['E-commerce Base'] = pp.ecommerceBase * r;
      if (inputs.products > 0) oneTime['Products Setup'] = inputs.products * pp.productPerItem * r;
    }

    if (inputs.integrations > 0) oneTime['3rd-party Integrations'] = inputs.integrations * pp.integrationUnit * r;

    oneTime['SEO'] = (pp.seo[inputs.seo] || 0) * r;

    if (inputs.copy > 0) oneTime['Copywriting'] = inputs.copy * pp.copyPerWord * r;

    if (inputs.animations) oneTime['Custom Animations / Micro-interactions'] = pp.animations * r;

    if (inputs.multilingual > 0) oneTime['Additional Languages'] = inputs.multilingual * pp.multilingualPerLang * r;

    oneTime['Accessibility'] = (pp.accessibility[inputs.accessibility] || 0) * r;

    if (inputs.analytics) oneTime['Analytics & Tag Manager'] = pp.analytics * r;

    if (inputs.migration > 0) oneTime['Content Migration'] = inputs.migration * pp.migrationPerPage * r;

    if (inputs.revisions > 0) oneTime['Revision Rounds'] = inputs.revisions * pp.revisionRound * r;

    oneTime['QA & Testing'] = (pp.qa[inputs.qa] || 0) * r;

    let oneTimeTotal = Object.values(oneTime).reduce((a, b) => a + b, 0);

    // Discount
    let discountPct = 0;
    const code = (inputs.discount || '').toUpperCase().trim();
    if (code && discountCodes[code]) discountPct = discountCodes[code];
    const discountAmt = oneTimeTotal * discountPct;
    oneTimeTotal -= discountAmt;

    // Rush
    if (inputs.rush) oneTimeTotal *= pp.rushMultiplier;

    // VAT
    const vatAmount = vatEnabled ? (oneTimeTotal * (vatRate / 100)) : 0;
    const oneTimeWithVat = oneTimeTotal + vatAmount;

    // Monthlies
    const monthly = {};
    monthly['Hosting'] = (pp.hosting[inputs.hosting] || 0) * r;
    monthly['Care Plan'] = (pp.maintenance[inputs.maintenance] || 0) * r;

    const monthlyTotal = Object.values(monthly).reduce((a, b) => a + b, 0);

    // Timeline (weeks)
    const designFactor = { basic: 0.6, standard: 1, premium: 1.3, elite: 1.6 }[inputs.design] || 1;
    let weeks = 2 + inputs.pages * 0.5 * designFactor + inputs.integrations * 1.2;
    if (inputs.ecommerce) weeks += 2 + Math.min(6, inputs.products/50);
    if (inputs.multilingual > 0) weeks += inputs.multilingual * 0.8;
    if (inputs.rush) weeks *= 0.8;
    weeks = Math.max(2, Math.round(weeks));

    // Milestones 40/40/20
    const m1 = oneTimeWithVat * 0.4;
    const m2 = oneTimeWithVat * 0.4;
    const m3 = oneTimeWithVat * 0.2;

    return {
      oneTime,
      monthly,
      discountAmt,
      discountPct,
      oneTimeTotal,
      vatAmount,
      oneTimeWithVat,
      monthlyTotal,
      weeks,
      milestones: { m1, m2, m3 },
    };
  }, [inputs, ccy, vatEnabled, vatRate]);

  const copyBreakdown = () => {
    const lines = [];
    lines.push(`Currency: ${ccy}`);
    lines.push('One-time:');
    Object.entries(breakdown.oneTime).forEach(([k, v]) => lines.push(` • ${k}: ${formatCurrency(v, ccy)}`));
    if (breakdown.discountAmt > 0) lines.push(`Discount: -${formatCurrency(breakdown.discountAmt, ccy)} (${Math.round(breakdown.discountPct*100)}%)`);
    lines.push(`One-time Total${inputs.rush ? ' (rush incl.)' : ''}: ${formatCurrency(breakdown.oneTimeTotal, ccy)}`);
    if (vatEnabled) {
      lines.push(`VAT (${vatRate}%): ${formatCurrency(breakdown.vatAmount, ccy)}`);
      lines.push(`One-time incl. VAT: ${formatCurrency(breakdown.oneTimeWithVat, ccy)}`);
    }
    lines.push('Monthly:');
    Object.entries(breakdown.monthly).forEach(([k, v]) => lines.push(` • ${k}: ${formatCurrency(v, ccy)}/mo`));
    lines.push(`Monthly Total: ${formatCurrency(breakdown.monthlyTotal, ccy)}/mo`);
    lines.push('');
    lines.push(`Estimated timeline: ~${breakdown.weeks} weeks`);
    lines.push(`Milestones: 40% ${formatCurrency(breakdown.milestones.m1, ccy)} • 40% ${formatCurrency(breakdown.milestones.m2, ccy)} • 20% ${formatCurrency(breakdown.milestones.m3, ccy)}`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => burstConfetti(confettiRef.current)).catch(()=>{});
    alert('Breakdown copied to clipboard.');
  };

  const applyDiscount = () => {
    const code = (inputs.discount || '').toUpperCase().trim();
    if (code && (code in discountCodes)) { burstConfetti(confettiRef.current); }
    else { alert('Discount code not valid.'); }
  };

  const savePreset = () => {
    try { localStorage.setItem('estimator_v3', JSON.stringify(inputs)); alert('Preset saved on this device.'); }
    catch { alert('Could not save locally.'); }
  };
  const loadPreset = () => {
    try { const cached = localStorage.getItem('estimator_v3'); if (!cached) return alert('No preset found.'); setInputs(JSON.parse(cached)); }
    catch { alert('Could not load preset.'); }
  };
  const sharePreset = () => {
    try {
      const s = btoa(encodeURIComponent(JSON.stringify(inputs)));
      const url = new URL(window.location.href);
      url.searchParams.set('est', s);
      navigator.clipboard.writeText(url.toString()).then(() => { alert('Shareable link copied.'); });
    } catch { alert('Could not create share link.'); }
  };

  // Fancy hover (tilt highlight) for feature cards
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('[data-tilt-card]'));
    const onMove = (e) => {
      const t = e.currentTarget;
      const r = t.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      t.style.setProperty('--mx', `${mx}%`);
      t.style.setProperty('--my', `${my}%`);
    };
    cards.forEach(c => {
      c.addEventListener('mousemove', onMove);
    });
    return () => cards.forEach(c => c.removeEventListener('mousemove', onMove));
  }, []);

  return (
    <>
      <GlobalStyle />

      {/* Scroll progress */}
      <ScrollProgress $w={scrollW} />

      {/* EXTREMT FANCY BACKGROUND */}
      <FixedBackground aria-hidden>
        <GradientLayer />
        <AuroraLayer />
        <GridDots ref={gridRef} />
        <ParticleCanvas ref={particleRef} />
        <NoiseLayer />
        <Spotlight ref={spotlightRef} />
      </FixedBackground>

      <StyledHeader>
        <Header />
      </StyledHeader>

      <AppContainer ref={confettiRef}>
        <Hero>
          <div>
            <Eyebrow>We build beautiful, blazing-fast websites</Eyebrow>
            <HeroTitle $opacity={heroOpacity} $shift={heroShift} $scale={heroScale}>
              Bespoke Websites that Convert.
            </HeroTitle>
            <HeroSub $opacity={heroOpacity} $shift={heroShift} $scale={heroScale}>
              From idea to launch: design, development, copy, SEO, and care plans — all crafted to elevate your brand. Try our instant price estimator below to plan your project with confidence.
            </HeroSub>
            <HeroCTAs $opacity={heroOpacity} $shift={heroShift} $scale={heroScale}>
              <PrimaryBtn onClick={goContact}>Get a Proposal</PrimaryBtn>
              <a href="#estimator" style={{ textDecoration: 'none' }}>
                <GhostBtn>Estimate Your Project</GhostBtn>
              </a>
            </HeroCTAs>
          </div>
        </Hero>

        {/* Feature highlights */}
        <Section ref={el => (sectionRefs.current[0] = el)}>
          <SectionTitle ref={titleRef}>Why Choose Us</SectionTitle>
          <FeatureGrid>
            {[{ t: 'Strategy-first', d: 'We align design and development with your business goals to deliver measurable results.' },
              { t: 'Design that Sells', d: 'Premium visual identity, motion, and UX patterns that turn visitors into customers.' },
              { t: 'Performance Obsessed', d: 'We ship Core Web Vitals-friendly sites with lightning load times.' },
              { t: 'Editable by You', d: 'Modern CMS setups so your team can update content without breaking a sweat.' },
              { t: 'Secure & Scalable', d: 'Best-practice security, accessibility, and future-proof architecture.' },
              { t: 'Ongoing Care', d: 'Hosting, monitoring, analytics, and proactive improvements every month.' }].map((f, i) => (
              <FeatureCard key={i} data-tilt-card ref={el => (sectionRefs.current[1 + i] = el)}>
                <FeatureIcon>{String.fromCharCode(65 + i)}</FeatureIcon>
                <FeatureTitle>{f.t}</FeatureTitle>
                <FeatureText>{f.d}</FeatureText>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Section>

        {/* ----- Estimator ----- */}
        <Section id="estimator">
          <SectionTitle>Instant Price Estimator <Badge>Beta</Badge></SectionTitle>
          <EstimatorWrap>
            <Panel>
              <PanelTitle>
                Configure Your Project
                <FieldRow>
                  <Small>Currency</Small>
                  <Select value={ccy} onChange={e => setCcy(e.target.value)}>
                    <option value="NOK">NOK</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </Select>
                </FieldRow>
              </PanelTitle>

              <Row>
                <Field>
                  <Small>Number of pages: {inputs.pages}</Small>
                  <Range min={1} max={40} value={inputs.pages} onChange={e => update({ pages: Number(e.target.value) })} />
                </Field>
                <Field>
                  <Small>Design tier</Small>
                  <Select value={inputs.design} onChange={e => update({ design: e.target.value })}>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Elite</option>
                  </Select>
                </Field>
              </Row>

              <Row>
                <Field>
                  <ToggleWrap onClick={() => update({ cms: !inputs.cms })}>
                    <Toggle checked={inputs.cms} onChange={() => {}} />
                    <div>
                      <strong>Include CMS</strong>
                      <Small style={{ display: 'block' }}>Edit content yourself with ease</Small>
                    </div>
                  </ToggleWrap>
                </Field>
                <Field>
                  <ToggleWrap onClick={() => update({ ecommerce: !inputs.ecommerce })}>
                    <Toggle checked={inputs.ecommerce} onChange={() => {}} />
                    <div>
                      <strong>E-commerce</strong>
                      <Small style={{ display: 'block' }}>Sell products online</Small>
                    </div>
                  </ToggleWrap>
                </Field>
              </Row>

              {inputs.ecommerce && (
                <Row>
                  <Field>
                    <Small>Estimated number of products: {inputs.products}</Small>
                    <Range min={0} max={1000} step={10} value={inputs.products} onChange={e => update({ products: Number(e.target.value) })} />
                  </Field>
                  <Field>
                    <Small>3rd-party integrations: {inputs.integrations}</Small>
                    <Range min={0} max={5} value={inputs.integrations} onChange={e => update({ integrations: Number(e.target.value) })} />
                  </Field>
                </Row>
              )}

              {!inputs.ecommerce && (
                <Row>
                  <Field>
                    <Small>3rd-party integrations: {inputs.integrations}</Small>
                    <Range min={0} max={5} value={inputs.integrations} onChange={e => update({ integrations: Number(e.target.value) })} />
                  </Field>
                  <Field>
                    <Small>SEO package</Small>
                    <Select value={inputs.seo} onChange={e => update({ seo: e.target.value })}>
                      <option value="none">None</option>
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="advanced">Advanced</option>
                    </Select>
                  </Field>
                </Row>
              )}

              <Row>
                <Field>
                  <Small>Copywriting words: {inputs.copy.toLocaleString()}</Small>
                  <Range min={0} max={8000} step={100} value={inputs.copy} onChange={e => update({ copy: Number(e.target.value) })} />
                </Field>
                <Field>
                  <Small>Content migration pages: {inputs.migration}</Small>
                  <Range min={0} max={200} value={inputs.migration} onChange={e => update({ migration: Number(e.target.value) })} />
                </Field>
              </Row>

              <Row>
                <Field>
                  <Small>Accessibility target</Small>
                  <Select value={inputs.accessibility} onChange={e => update({ accessibility: e.target.value })}>
                    <option value="none">None</option>
                    <option value="a">WCAG A</option>
                    <option value="aa">WCAG AA</option>
                    <option value="aaa">WCAG AAA</option>
                  </Select>
                </Field>
                <Field>
                  <Small>Extra languages: {inputs.multilingual}</Small>
                  <Range min={0} max={10} value={inputs.multilingual} onChange={e => update({ multilingual: Number(e.target.value) })} />
                </Field>
              </Row>

              <Row>
                <Field>
                  <ToggleWrap onClick={() => update({ animations: !inputs.animations })}>
                    <Toggle checked={inputs.animations} onChange={() => {}} />
                    <div>
                      <strong>Custom animations</strong>
                      <Small style={{ display: 'block' }}>Delightful motion & micro-interactions</Small>
                    </div>
                  </ToggleWrap>
                </Field>
                <Field>
                  <ToggleWrap onClick={() => update({ analytics: !inputs.analytics })}>
                    <Toggle checked={inputs.analytics} onChange={() => {}} />
                    <div>
                      <strong>Analytics & tracking</strong>
                      <Small style={{ display: 'block' }}>GA4 + Tag Manager setup</Small>
                    </div>
                  </ToggleWrap>
                </Field>
              </Row>

              <Row>
                <Field>
                  <Small>Revision rounds: {inputs.revisions}</Small>
                  <Range min={0} max={6} value={inputs.revisions} onChange={e => update({ revisions: Number(e.target.value) })} />
                </Field>
                <Field>
                  <Small>QA & testing level</Small>
                  <Select value={inputs.qa} onChange={e => update({ qa: e.target.value })}>
                    <option value="basic">Basic</option>
                    <option value="enhanced">Enhanced</option>
                  </Select>
                </Field>
              </Row>

              <Row>
                <Field>
                  <Small>Discount code</Small>
                  <div style={{ display:'flex', gap:8 }}>
                    <Input placeholder="Enter code (e.g. TEST10)" value={inputs.discount} onChange={e => update({ discount: e.target.value })} />
                    <OutlineBtn type="button" onClick={applyDiscount}>Apply</OutlineBtn>
                  </div>
                </Field>
                <Field>
                  <Small>Rush delivery</Small>
                  <ToggleWrap onClick={() => update({ rush: !inputs.rush })}>
                    <Toggle checked={inputs.rush} onChange={() => {}} />
                    <div>
                      <strong>Prioritize timeline</strong>
                      <Small style={{ display: 'block' }}>~20% faster (+25% one-time)</Small>
                    </div>
                  </ToggleWrap>
                </Field>
              </Row>

              <Row>
                <Field>
                  <Small>Hosting tier (monthly)</Small>
                  <Select value={inputs.hosting} onChange={e => update({ hosting: e.target.value })}>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                  </Select>
                </Field>
                <Field>
                  <Small>Care plan (monthly)</Small>
                  <Select value={inputs.maintenance} onChange={e => update({ maintenance: e.target.value })}>
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                  </Select>
                </Field>
              </Row>

              <Row>
                <Field>
                  <Small>VAT enabled</Small>
                  <ToggleWrap onClick={() => setVatEnabled(v => !v)}>
                    <Toggle checked={vatEnabled} onChange={() => {}} />
                    <div>
                      <strong>Include VAT</strong>
                      <Small style={{ display:'block' }}>{vatEnabled ? `Rate: ${vatRate}%` : 'Excluded'}</Small>
                    </div>
                  </ToggleWrap>
                </Field>
                <Field>
                  <Small>VAT rate: {vatRate}%</Small>
                  <Range min={0} max={30} value={vatRate} onChange={e => setVatRate(Number(e.target.value))} />
                </Field>
              </Row>

              <Actions>
                <OutlineBtn type="button" onClick={savePreset}>Save Preset</OutlineBtn>
                <OutlineBtn type="button" onClick={loadPreset}>Load Preset</OutlineBtn>
                <OutlineBtn type="button" onClick={sharePreset}>Share Preset</OutlineBtn>
              </Actions>
            </Panel>

            <div>
              <TotalBox>
                <PanelTitle>Estimated Investment</PanelTitle>
                <Meta>
                  <div>
                    <Small>One-time total{inputs.rush ? ' (rush incl.)' : ''}</Small>
                    <TotalFigure>{formatCurrency(breakdown.oneTimeTotal, ccy)}</TotalFigure>
                    {vatEnabled && (
                      <div style={{ marginTop: 6 }}>
                        <Small>VAT ({vatRate}%): {formatCurrency(breakdown.vatAmount, ccy)}</Small><br/>
                        <strong>Incl. VAT: {formatCurrency(breakdown.oneTimeWithVat, ccy)}</strong>
                      </div>
                    )}
                  </div>
                  <div>
                    <Small>Monthly total</Small>
                    <TotalFigure>{formatCurrency(breakdown.monthlyTotal, ccy)}/mo</TotalFigure>
                  </div>
                </Meta>
                {breakdown.discountAmt > 0 && (
                  <p style={{ marginTop: 8, color: 'var(--success)', fontWeight: 800 }}>
                    Discount applied: −{formatCurrency(breakdown.discountAmt, ccy)} ({Math.round(breakdown.discountPct * 100)}%)
                  </p>
                )}
                <div style={{ marginTop: 12 }}>
                  <Small>Estimated timeline</Small>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>~{breakdown.weeks} weeks</div>
                  <Small>Milestones: 40% / 40% / 20%</Small>
                  <Meta>
                    <span>Deposit (40%)</span><strong>{formatCurrency(breakdown.milestones.m1, ccy)}</strong>
                  </Meta>
                  <Meta>
                    <span>Design/Build (40%)</span><strong>{formatCurrency(breakdown.milestones.m2, ccy)}</strong>
                  </Meta>
                  <Meta>
                    <span>Launch (20%)</span><strong>{formatCurrency(breakdown.milestones.m3, ccy)}</strong>
                  </Meta>
                </div>
                <Actions>
                  <PrimaryBtn onClick={copyBreakdown}>Copy Breakdown</PrimaryBtn>
                  <GhostBtn onClick={goContact}>Request Exact Quote</GhostBtn>
                  <OutlineBtn onClick={() => window.print()}>Print</OutlineBtn>
                </Actions>
              </TotalBox>

              <Panel style={{ marginTop: 18 }}>
                <PanelTitle>Itemized One-time Costs</PanelTitle>
                <div>
                  {Object.entries(breakdown.oneTime).map(([k, v]) => (
                    <Meta key={k}>
                      <span>{k}</span>
                      <strong>{formatCurrency(v, ccy)}</strong>
                    </Meta>
                  ))}
                </div>
              </Panel>

              <Panel style={{ marginTop: 18 }}>
                <PanelTitle>Monthly Costs</PanelTitle>
                <div>
                  {Object.entries(breakdown.monthly).map(([k, v]) => (
                    <Meta key={k}>
                      <span>{k}</span>
                      <strong>{formatCurrency(v, ccy)}/mo</strong>
                    </Meta>
                  ))}
                </div>
              </Panel>

              <Small style={{ display: 'block', marginTop: 12 }}>
                This is a non-binding estimate. Final pricing depends on detailed scope, timeline, and technical complexity.
              </Small>
            </div>
          </EstimatorWrap>
        </Section>

        <Footer />
      </AppContainer>
    </>
  );
}
