import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiCopy, FiDollarSign, FiPackage, FiRefreshCw, FiShare2, FiSliders, FiZap, FiMessageCircle } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import Header from '../components/header';
import Footer from '../components/footer';

// ---------- Global Styles & Theme ----------
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #0b1121;
    color: #e2e8f0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const PreviewContent = styled.div`
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
`;

// Layout and actions for premium hero
const ButtonRow = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 0.6rem;
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #4338ca;
  border: 1px solid #818cf8;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  ${({ design }) => design === 'elite' && css`
    color: #a78bfa;
    border-color: rgba(167, 139, 250, 0.6);
  `}
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 1.25rem;
  align-items: center;
`;

const IllustrationBlock = styled.div`
  height: 180px;
  border-radius: 14px;
  border: 1px solid rgba(99,102,241,0.25);
  background:
    radial-gradient(100px 60px at 20% 30%, rgba(99,102,241,0.35), transparent),
    radial-gradient(120px 70px at 70% 60%, rgba(244,114,182,0.35), transparent),
    linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  box-shadow: inset 0 0 40px rgba(99,102,241,0.12), 0 10px 30px rgba(0,0,0,0.08);
  backdrop-filter: blur(2px);
  @media (max-width: 640px) { display: none; }
  ${({ design }) => design === 'elite' && css`
    border: 1px solid rgba(148, 163, 184, 0.3);
    background:
      radial-gradient(120px 70px at 20% 30%, rgba(167,139,250,0.35), transparent),
      radial-gradient(140px 90px at 70% 60%, rgba(244,114,182,0.35), transparent),
      linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    box-shadow: inset 0 0 50px rgba(167,139,250,0.18), 0 14px 40px rgba(0,0,0,0.18);
  `}
`;

// Premium benefits list and trust indicators, Standard info strip
const BenefitsList = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 0.5rem 0.75rem;
  margin-top: 0.75rem;
  padding: 0;
  list-style: none;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 600;
  svg { color: #6366f1; }
`;

const TrustBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const TrustBadge = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  color: #1e293b;
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
`;

const InfoStrip = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #475569;
`;

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

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ---------- Styled Components ----------
const PageWrapper = styled.div`
  background: radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,0.15), transparent),
              radial-gradient(900px 500px at 90% 20%, rgba(236,72,153,0.12), transparent),
              #0b1121;
  min-height: 100vh;
  overflow-x: hidden;
`;

const ContentContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 2rem 4rem;
  animation: ${css`${fadeIn}`} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 5rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #94a3b8;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const EstimatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GlassPanel = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  padding: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;

const CalculatorForm = styled(GlassPanel)``;
const ResultsPanel = styled(GlassPanel)`
  position: sticky;
  top: 100px;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ControlGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ValueDisplay = styled.span`
  font-weight: 600;
  color: #a78bfa;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 3px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #a78bfa;
    cursor: pointer;
    border-radius: 50%;
    border: 3px solid #0b1121;
    transition: background 0.2s;

    &:hover {
      background: #c4b5fd;
    }
  }
`;

const ToggleGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ToggleLabel = styled.label`
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:hover {
    background: rgba(148, 163, 184, 0.2);
  }

  ${({ checked }) => checked && `
    background: rgba(167, 139, 250, 0.2);
    border-color: rgba(167, 139, 250, 0.5);
  `}
`;

const ToggleCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const ToggleTitle = styled.span`
  font-weight: 600;
  color: #fff;
`;

const ToggleDescription = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const TotalDisplay = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const PriceLabel = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin: 0 0 0.5rem;
`;

const PriceValue = styled.h3`
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PriceQualifier = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
`;

const ActionButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
`;

const SmallActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

// Language toggle UI
const LangSwitchWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const LangToggle = styled.button`
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 0.3rem 0.55rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &.active {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    border-color: transparent;
    color: #fff;
  }
`;

const PreviewPanel = styled(GlassPanel)`
  height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    height: 500px;
    margin-top: 2rem;
  }
`;

const MockBrowserHeader = styled.div`
  background: #1e293b;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const MockBrowserButton = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`;

const MockWebsite = styled.div`
  position: relative;
  flex-grow: 1;
  padding: 1.5rem;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  background: #e2e8f0; /* Standard */

  ${({ design }) => design === 'premium' && css`
    /* Premium: subtil topp-grad, pattern-overlay og aksentkant for mer polert uttrykk */
    background:
      radial-gradient(800px 180px at 10% 0%, rgba(99,102,241,0.10), transparent 60%),
      linear-gradient(180deg, rgba(67, 56, 202, 0.06), rgba(67, 56, 202, 0) 220px),
      #f0f2f5;
    border-top: 4px solid rgba(67, 56, 202, 0.2);
    border-radius: 14px;
  `}

  ${({ design }) => design === 'elite' && css`
    /* Elite: mørk, levende gradient med animasjon og glassfølelse */
    background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
    background-size: 400% 400%;
    animation: ${gradientAnimation} 15s ease-in-out infinite;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 16px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 16px;
      pointer-events: none;
      background:
        radial-gradient(600px 200px at 80% -10%, rgba(167,139,250,0.15), transparent),
        radial-gradient(400px 150px at 10% 110%, rgba(244,114,182,0.12), transparent);
      animation: ${glowPulse} 8s ease-in-out infinite;
    }
  `}
`;

const MockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  transition: all 0.4s ease-in-out;

  ${({ design }) => design === 'premium' && css`
    background: rgba(67, 56, 202, 0.08);
    padding: 1rem 1.25rem;
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.2);
  `}

  ${({ design }) => design === 'elite' && css`
    background: rgba(15, 23, 42, 0.35);
    padding: 1rem 1.25rem;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    backdrop-filter: blur(4px);
  `}
`;

const MockLogo = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  color: ${props => props.color || '#1e293b'};
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, #6366f1, #4338ca);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

const MockNav = styled.div`
  display: flex;
  gap: 1rem;
`;

const MockNavLink = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.color || '#475569'};

  ${({ design }) => design === 'premium' && css`
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.2);
    padding: 0.3rem 0.6rem;
    border-radius: 9999px;
  `}

  ${({ design }) => design === 'elite' && css`
    letter-spacing: 0.02em;
    opacity: 0.95;
    position: relative;
    &:after {
      content: '';
      position: absolute;
      left: 0; right: 0; bottom: -2px;
      height: 2px;
      background: linear-gradient(90deg, #a78bfa, #f472b6);
      opacity: 0.5;
    }
  `}
`;

const MockHero = styled.div`
  text-align: center;
  padding: 2rem 0;

  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(180deg, rgba(67,56,202,0.07), rgba(67,56,202,0) 85%);
    border: 1px solid rgba(99,102,241,0.18);
    border-radius: 14px;
    padding: 2.25rem 1.5rem;
    text-align: center;
  `}

  ${({ design }) => design === 'elite' && css`
    background: rgba(148, 163, 184, 0.06);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 16px;
    padding: 2.25rem 1.5rem;
    backdrop-filter: blur(4px);
  `}
`;

const MockTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  color: #1e293b; /* Standard */
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  ${({ design }) => design === 'premium' && css`
    /* Premium: tydeligere typografi med subtil glød */
    color: #1e293b;
    text-shadow: 0 4px 14px rgba(67, 56, 202, 0.18);
    letter-spacing: -0.01em;
  `}

  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #c4b5fd, #f9a8d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
  `}
`;

const MockSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.color || '#64748b'};
  margin: 0 auto 1.5rem;
  max-width: 80%;
`;

const MockButton = styled.div`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  color: #fff;
  background: #4f46e5; /* Standard */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  ${({ design }) => design === 'standard' && css`
    background: transparent;
    color: #475569;
    border: 1px solid #94a3b8;
    box-shadow: none;
  `}

  ${({ design }) => design === 'premium' && css`
    /* Premium: gradient CTA med kraftigere skygge */
    background: linear-gradient(135deg, #6366f1, #4338ca);
    box-shadow: 0 15px 30px rgba(67, 56, 202, 0.35);
    border: 0;
    background-size: 200% 200%;
    &:hover { background-position: 100% 50%; }
  `}

  ${({ design }) => design === 'elite' && css`
    /* Elite: neon-aktig CTA med lett skalering */
    background: linear-gradient(135deg, #a78bfa, #f472b6);
    box-shadow: 0 0 25px rgba(167, 139, 250, 0.5), 0 0 10px rgba(244, 114, 182, 0.3);
    transform: scale(1.05);
    filter: saturate(1.1);
  `}
`;

// Extra tier-specific UI elements
const FeatureChips = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 0.75rem 0 0;
`;

const Chip = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  background: #c7d2fe;
  border: 1px solid #a5b4fc;
  padding: 0.35rem 0.6rem;
  border-radius: 9999px;
  ${({ design }) => design === 'elite' && css`
    color: #e2e8f0;
    background: rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.5);
  `}
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Stat = styled.div`
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: inset 0 0 20px rgba(167, 139, 250, 0.08);
`;

const Ribbon = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  border-radius: 9999px;
  color: #0b1121;

  ${({ variant }) => variant === 'premium' && css`
    background: linear-gradient(135deg, #c7d2fe, #a5b4fc);
    border: 1px solid #818cf8;
  `}

  ${({ variant }) => variant === 'elite' && css`
    background: linear-gradient(135deg, #a78bfa, #f472b6);
    border: 1px solid rgba(244, 114, 182, 0.7);
    color: #0b1121;
  `}

  ${({ variant }) => (!variant || variant === 'standard') && css`
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    color: #0b1121;
  `}
`;

const MockCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const MockCard = styled.div`
  background: #fff; /* Standard */
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  ${({ design }) => design === 'premium' && css`
    border-color: #e0e7ff;
    box-shadow: 0 12px 25px rgba(0,0,0,0.1); /* Premium - Tydeligere skygge */
    border-top: 3px solid #c7d2fe;
    border-radius: 12px;
    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 18px 35px rgba(67, 56, 202, 0.2);
    }
  `}

  ${({ design }) => design === 'elite' && css`
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.12);
    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
    backdrop-filter: blur(6px);
    border-radius: 14px;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    }
  `}
`;

const MockSidebar = styled.div`
  width: 200px;
  background: rgba(30, 41, 59, 0.5);
  padding: 1.5rem;
  flex-shrink: 0;
`;

const MockMainContent = styled.div`
  flex-grow: 1;
  padding: 1.5rem;
`;

const MockCardContent = styled.div`
  height: 60px;
  background: ${props => props.color || '#e2e8f0'};
  border-radius: 4px;

  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.0)), ${props => props.color || '#e2e8f0'};
  `}

  ${({ design }) => design === 'elite' && css`
    border: 1px solid rgba(148, 163, 184, 0.18);
  `}
`;

const MockCookieBanner = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  backdrop-filter: blur(5px);
  animation: ${css`${fadeIn}`} 0.5s 0.5s backwards;
`;

const MockPaymentWrapper = styled.div`
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  text-align: center;
  animation: ${css`${fadeIn}`} 0.5s 0.7s backwards;

  ${({ design }) => design === 'premium' && css`
    background: rgba(99, 102, 241, 0.06);
    border: 1px solid rgba(99, 102, 241, 0.18);
    border-radius: 12px;
  `}

  ${({ design }) => design === 'elite' && css`
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 12px;
  `}
`;

const MockPaymentText = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.color || '#64748b'};
  margin: 0 0 0.5rem;
`;

const MockPaymentIcons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: ${props => props.color || '#94a3b8'};
`;

const PaymentPill = styled.span`
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
  background: #ff5b24; /* Vipps orange */
  border-radius: 6px;
  padding: 0.15rem 0.4rem;
  line-height: 1;
`;

// Ecommerce-only helpers (used only when Nettbutikk er valgt)
const MockFilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;

  ${({ design }) => design === 'premium' && css`
    justify-content: flex-start;
  `}
`;

const CategoryBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e293b;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  padding: 0.35rem 0.6rem;
  border-radius: 9999px;

  ${({ design }) => design === 'premium' && css`
    background: #e0e7ff;
    border-color: #c7d2fe;
  `}

  ${({ design }) => design === 'elite' && css`
    background: rgba(148, 163, 184, 0.15);
    border-color: rgba(148, 163, 184, 0.25);
    color: #e2e8f0;
  `}
`;

const CartBar = styled.div`
  margin-top: 0.75rem;
  padding: 0.6rem 0.75rem;
  text-align: center;
  font-weight: 700;
  color: #334155;
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;

  ${({ design }) => design === 'premium' && css`
    background: rgba(99, 102, 241, 0.06);
    border-color: rgba(99, 102, 241, 0.18);
  `}

  ${({ design }) => design === 'elite' && css`
    background: rgba(148, 163, 184, 0.08);
    border-color: rgba(148, 163, 184, 0.18);
    color: #e2e8f0;
  `}
`;

const AddToCartButton = styled.button`
  margin-top: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 0;
  font-weight: 800;
  cursor: pointer;
  background: #475569;
  color: #fff;

  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, #6366f1, #4338ca);
  `}

  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #a78bfa, #f472b6);
  `}
`;

const MockChatButton = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);
  animation: ${css`${fadeIn}`} 0.5s 0.5s backwards;
`;

const SmallButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

// ---------- Price Calculator Logic ----------
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0 }).format(amount);
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

  // Language (en/no) and translations
  const [lang, setLang] = useState('en');
  const translations = {
    en: {
      heroTitle: 'Modern websites that convert',
      heroSubtitle: 'From idea to launch. We build custom, blazing-fast and user-friendly websites that strengthen your brand and deliver results. Try our price estimator for an instant quote.',
      configureProject: 'Configure your project',
      pageCount: 'Number of pages',
      designComplexity: 'Design & complexity',
      addons: 'Add-ons',
      ecommerceTitle: 'E-commerce',
      ecommerceDesc: 'Sell products or services.',
      seoTitle: 'SEO & Analytics',
      seoDesc: 'Be found on Google.',
      careTitle: 'Care & Maintenance',
      careDesc: 'Monthly follow-up.',
      standardTitle: 'Modern website',
      standardSubtitle: 'Affordable and easy to get started.',
      premiumTitle: 'Premium experience',
      premiumSubtitle: 'More polished design, better conversions and more details.',
      eliteTitle: 'Elite performance',
      eliteSubtitle: 'High-end animations, maximum performance and exclusive finish.',
      ctaStart: 'Get started',
      ctaDemo: 'See demo',
      ctaTalk: 'Talk to us',
      ctaExamples: 'See examples',
      securePayments: 'Secure payments with:',
      cookieBanner: 'This website uses cookies to ensure you get the best experience.',
      catAll: 'All',
      catNew: 'New',
      catSale: 'Sale',
      addToCart: 'Add to cart',
      cartEmpty: 'Cart – 0 products',
      estimateTitle: 'Your Price Estimate',
      oneTimeLabel: 'One-time cost (ex. VAT)',
      monthlyLabel: 'Monthly cost',
      perMonth: '/mo',
      timeline: 'Estimated timeline',
      weeks: 'weeks',
      startProject: 'Start Project',
      copy: 'Copy',
      reset: 'Reset',
      ribbonStandard: 'STANDARD',
      ribbonPremium: 'BESTSELLER',
      ribbonElite: 'ELITE',
      chipCustom: 'Custom design',
      chipFastHosting: 'Fast hosting',
      chipSEOReady: 'SEO-ready',
      ssl: 'SSL',
      mobileFriendly: 'Mobile-friendly',
      googleReady: 'Google-ready',
      ticketTitle: 'Website project request',
      ticketDesc: 'Tell us about your project and we will get back to you quickly.'
    },
    no: {
      heroTitle: 'Moderne Nettsider som Konverterer',
      heroSubtitle: 'Fra idé til lansering. Vi bygger skreddersydde, lynraske og brukervennlige nettsider som styrker din merkevare og gir resultater. Prøv vår priskalkulator for å få et umiddelbart estimat.',
      configureProject: 'Konfigurer ditt prosjekt',
      pageCount: 'Antall sider',
      designComplexity: 'Design & kompleksitet',
      addons: 'Tilleggsfunksjoner',
      ecommerceTitle: 'Nettbutikk',
      ecommerceDesc: 'Selg produkter eller tjenester.',
      seoTitle: 'SEO & Analyse',
      seoDesc: 'Bli funnet på Google.',
      careTitle: 'Drift & Vedlikehold',
      careDesc: 'Månedlig oppfølging.',
      standardTitle: 'Moderne nettside',
      standardSubtitle: 'Rimelig og enkelt å komme i gang.',
      premiumTitle: 'Premium opplevelse',
      premiumSubtitle: 'Mer polert design, bedre konvertering og flere detaljer.',
      eliteTitle: 'Elite performance',
      eliteSubtitle: 'High-end animasjoner, maksimal ytelse og eksklusiv finish.',
      ctaStart: 'Kom i gang',
      ctaDemo: 'Se demo',
      ctaTalk: 'Snakk med oss',
      ctaExamples: 'Se eksempler',
      securePayments: 'Sikre betalinger med:',
      cookieBanner: 'Dette nettstedet bruker informasjonskapsler for å sikre best mulig opplevelse.',
      catAll: 'Alle',
      catNew: 'Nyheter',
      catSale: 'Salg',
      addToCart: 'Legg i handlekurv',
      cartEmpty: 'Handlekurv – 0 produkter',
      estimateTitle: 'Ditt Prisestimat',
      oneTimeLabel: 'Engangskostnad (eks. mva)',
      monthlyLabel: 'Månedlig kostnad',
      perMonth: '/mnd',
      timeline: 'Estimert tidslinje',
      weeks: 'uker',
      startProject: 'Start Prosjektet',
      copy: 'Kopier',
      reset: 'Nullstill',
      ribbonStandard: 'STANDARD',
      ribbonPremium: 'BESTSELGER',
      ribbonElite: 'ELITE',
      chipCustom: 'Tilpasset design',
      chipFastHosting: 'Rask hosting',
      chipSEOReady: 'SEO-klar',
      ssl: 'SSL',
      mobileFriendly: 'Mobilvennlig',
      googleReady: 'Google-klar',
      ticketTitle: 'Forespørsel om nettsideprosjekt',
      ticketDesc: 'Fortell oss om prosjektet ditt, så tar vi kontakt raskt.'
    }
  };
  const t = translations[lang];
  const openSupport = () => {
    try {
      window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: t.ticketTitle, description: t.ticketDesc, category: 'general', priority: 'medium' } } }));
    } catch {}
  };
  // ---------- Estimator State ----------
  const [ccy, setCcy] = useState('NOK');
  const rates = { NOK: 1, EUR: 0.085, USD: 0.092 }; // enkle multipliers

  const [inputs, setInputs] = useState({
    pages: 5,
    design: 'premium',
    ecommerce: false,
    seo: true,
    carePlan: false,
  });

  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatRate, setVatRate] = useState(25);
  const update = patch => setInputs(v => ({ ...v, ...patch }));

  useEffect(() => {
    try { localStorage.setItem('estimator_v3', JSON.stringify(inputs)); } catch {}
  }, [inputs]);

  const priceMap = {
  base: 2200,
  perPage: 1300,
  design: { standard: 1, premium: 1.3, elite: 2.0 },
  ecommerce: 9000,
  seo: 4500,
  carePlan: 1000, // per month
};


  const discountCodes = { LAUNCH10: 0.1, FRIENDS15: 0.15, VIP20: 0.2 };

  const breakdown = useMemo(() => {
    const { pages, design, ecommerce, seo, carePlan } = inputs;

    const designMultiplier = priceMap.design[design] || 1;

    let oneTimeCost = priceMap.base;
    oneTimeCost += pages * priceMap.perPage * designMultiplier;
    if (ecommerce) oneTimeCost += priceMap.ecommerce;
    if (seo) oneTimeCost += priceMap.seo;

    const monthlyCost = carePlan ? priceMap.carePlan : 0;

    const weeks = Math.round(2 + (pages / 4) + (ecommerce ? 3 : 0) + (seo ? 1 : 0));

    return {
      oneTimeCost,
      monthlyCost,
      weeks,
    };
  }, [inputs]);

  const copyEstimate = () => {
    const text = `
      Estimat for nettsideprosjekt:
      -----------------------------
      Engangskostnad: ${formatCurrency(breakdown.oneTimeCost)}
      Månedlig kostnad: ${formatCurrency(breakdown.monthlyCost)}/mnd
      Estimert tidslinje: ~${breakdown.weeks} uker
      
      Konfigurasjon:
      - Sider: ${inputs.pages}
      - Design: ${inputs.design}
      - Nettbutikk: ${inputs.ecommerce ? 'Ja' : 'Nei'}
      - SEO & Analyse: ${inputs.seo ? 'Ja' : 'Nei'}
      - Drift & Vedlikehold: ${inputs.carePlan ? 'Ja' : 'Nei'}
    `;
    navigator.clipboard.writeText(text.trim());
    alert('Estimat kopiert til utklippstavlen!');
  };

  const resetCalculator = () => {
    setInputs({
      pages: 5,
      design: 'premium',
      ecommerce: false,
      seo: true,
      carePlan: false,
    });
  };

  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <GlobalStyle />
      <Header />
      <PageWrapper>
        <ContentContainer>
          <LangSwitchWrapper>
            <LangToggle className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangToggle>
            <LangToggle className={lang === 'no' ? 'active' : ''} onClick={() => setLang('no')}>NO</LangToggle>
          </LangSwitchWrapper>
          <HeroSection>
            <HeroTitle>{t.heroTitle}</HeroTitle>
            <HeroSubtitle>
              {t.heroSubtitle}
            </HeroSubtitle>
          </HeroSection>

          <EstimatorGrid>
            <CalculatorForm>
              <SectionTitle><FiSliders />{t.configureProject}</SectionTitle>
              
              <ControlGroup>
                <Label htmlFor="pages">
                  {t.pageCount}
                  <ValueDisplay>{inputs.pages}</ValueDisplay>
                </Label>
                <Slider 
                  id="pages" 
                  min="1" 
                  max="20" 
                  value={inputs.pages} 
                  onChange={(e) => updateInput('pages', parseInt(e.target.value))}
                />
              </ControlGroup>

              <ControlGroup>
                <Label>{t.designComplexity}</Label>
                <ToggleGroup>
                  {Object.keys(priceMap.design).map(level => (
                    <ToggleLabel key={level} checked={inputs.design === level}>
                      <ToggleCheckbox 
                        name="design" 
                        checked={inputs.design === level} 
                        onChange={() => updateInput('design', level)} 
                      />
                      <ToggleTitle style={{textTransform: 'capitalize'}}>{level}</ToggleTitle>
                    </ToggleLabel>
                  ))}
                </ToggleGroup>

                              </ControlGroup>

              <ControlGroup>
                <Label>{t.addons}</Label>
                <ToggleGroup>
                  <ToggleLabel checked={inputs.ecommerce}>
                    <ToggleCheckbox 
                      checked={inputs.ecommerce} 
                      onChange={(e) => updateInput('ecommerce', e.target.checked)} 
                    />
                    <ToggleTitle>{t.ecommerceTitle} <FiPackage /></ToggleTitle>
                    <ToggleDescription>{t.ecommerceDesc}</ToggleDescription>
                  </ToggleLabel>
                  <ToggleLabel checked={inputs.seo}>
                    <ToggleCheckbox 
                      checked={inputs.seo} 
                      onChange={(e) => updateInput('seo', e.target.checked)} 
                    />
                    <ToggleTitle>{t.seoTitle} <FiZap /></ToggleTitle>
                    <ToggleDescription>{t.seoDesc}</ToggleDescription>
                  </ToggleLabel>
                  <ToggleLabel checked={inputs.carePlan}>
                    <ToggleCheckbox 
                      checked={inputs.carePlan} 
                      onChange={(e) => updateInput('carePlan', e.target.checked)} 
                    />
                    <ToggleTitle>{t.careTitle} <FiCheck /></ToggleTitle>
                    <ToggleDescription>{t.careDesc}</ToggleDescription>
                  </ToggleLabel>
                </ToggleGroup>
              </ControlGroup>
            </CalculatorForm>

            <>
            <PreviewPanel>
              <MockBrowserHeader>
                <MockBrowserButton color="#f87171" />
                <MockBrowserButton color="#fbbf24" />
                <MockBrowserButton color="#34d399" />
              </MockBrowserHeader>
              <MockWebsite design={inputs.design}>
                <Ribbon variant={inputs.design}>
                  {inputs.design === 'standard' ? t.ribbonStandard : inputs.design === 'premium' ? t.ribbonPremium : t.ribbonElite}
                </Ribbon>
                <PreviewContent>
                  <MockHeader design={inputs.design}>
                    <MockLogo design={inputs.design} color={inputs.design === 'elite' ? '#fff' : '#1e293b'}>Logo</MockLogo>
                    <MockNav>
                      {[...Array(5)].map((_, i) => (
                        <MockNavLink key={i} design={inputs.design} color={inputs.design === 'elite' ? '#94a3b8' : (inputs.design === 'premium' ? '#475569' : '#64748b')}>Link</MockNavLink>
                      ))}
                    </MockNav>
                  </MockHeader>
                  <MockHero design={inputs.design}>
                  {inputs.design === 'elite' ? (
                    <HeroGrid>
                      <div style={{ textAlign: 'center' }}>
                        <MockTitle design={inputs.design}>{t.eliteTitle}</MockTitle>
                        <MockSubtitle color="#94a3b8">{t.eliteSubtitle}</MockSubtitle>
                        <ButtonRow design={inputs.design}>
                          <MockButton design={inputs.design}>{t.ctaTalk}</MockButton>
                          <SecondaryButton design={inputs.design}>{t.ctaDemo}</SecondaryButton>
                        </ButtonRow>
                        <FeatureChips>
                          <Chip design={inputs.design}>Headless CMS</Chip>
                          <Chip design={inputs.design}>Custom animations</Chip>
                          <Chip design={inputs.design}>Enterprise SEO</Chip>
                          <Chip design={inputs.design}>Priority support</Chip>
                        </FeatureChips>
                        <StatsRow>
                          <Stat>0.8s LCP</Stat>
                          <Stat>99.99% SLA</Stat>
                          <Stat>A+ SEO</Stat>
                        </StatsRow>
                        <TrustBar>
                          <TrustBadge>GDPR</TrustBadge>
                          <TrustBadge>SSL</TrustBadge>
                          <TrustBadge>Analytics</TrustBadge>
                        </TrustBar>
                      </div>
                      <IllustrationBlock design={inputs.design} />
                    </HeroGrid>
                  ) : inputs.design === 'premium' ? (
                    <>
                      <MockTitle design={inputs.design}>{t.premiumTitle}</MockTitle>
                      <MockSubtitle color="#475569">{t.premiumSubtitle}</MockSubtitle>
                      <MockButton design={inputs.design}>{t.ctaStart}</MockButton>
                      <FeatureChips>
                        <Chip>{t.chipCustom}</Chip>
                        <Chip>{t.chipFastHosting}</Chip>
                        <Chip>{t.chipSEOReady}</Chip>
                      </FeatureChips>
                    </>
                  ) : (
                    <>
                      <MockTitle design={inputs.design}>{t.standardTitle}</MockTitle>
                      <MockSubtitle color="#64748b">{t.standardSubtitle}</MockSubtitle>
                      <MockButton design={inputs.design}>{t.ctaExamples}</MockButton>
                      <InfoStrip>
                        <span>{t.ssl}</span>
                        <span>{t.mobileFriendly}</span>
                        <span>{t.googleReady}</span>
                      </InfoStrip>
                    </>
                  )}
                  </MockHero>

                  {!inputs.ecommerce && (
                    <MockCardGrid design={inputs.design}>
                      {[...Array(inputs.design === 'standard' ? 3 : 4)].map((_, i) => (
                        <MockCard key={i} design={inputs.design}>
                          <MockCardContent design={inputs.design} color={inputs.design === 'elite' ? 'rgba(255,255,255,0.08)' : (inputs.design === 'premium' ? '#e0e7ff' : '#e2e8f0')} />
                        </MockCard>
                      ))}
                    </MockCardGrid>
                  )}
                  {inputs.ecommerce && (
                    <>
                      <MockFilterBar design={inputs.design}>
                        <CategoryBadge design={inputs.design}>{t.catAll}</CategoryBadge>
                        <CategoryBadge design={inputs.design}>{t.catNew}</CategoryBadge>
                        <CategoryBadge design={inputs.design}>{t.catSale}</CategoryBadge>
                      </MockFilterBar>
                      <MockCardGrid design={inputs.design}>
                        {[...Array(3)].map((_, i) => (
                          <MockCard key={i} design={inputs.design}>
                            <MockCardContent design={inputs.design} color={inputs.design === 'elite' ? 'rgba(255,255,255,0.1)' : (inputs.design === 'premium' ? '#e2e8f0' : '#cbd5e1')} />
                            <AddToCartButton design={inputs.design}>{t.addToCart}</AddToCartButton>
                          </MockCard>
                        ))}
                      </MockCardGrid>
                      <CartBar design={inputs.design}>{t.cartEmpty}</CartBar>
                      {(inputs.design === 'premium' || inputs.design === 'elite') && (
                        <MockPaymentWrapper design={inputs.design}>
                          <MockPaymentText color={inputs.design === 'elite' ? '#94a3b8' : '#475569'}>{t.securePayments}</MockPaymentText>
                          <MockPaymentIcons color={inputs.design === 'elite' ? '#cbd5e1' : '#334155'}>
                            <FaCcVisa />
                            <FaCcMastercard />
                            <PaymentPill>Vipps</PaymentPill>
                            {inputs.design === 'elite' && <FaPaypal />}
                          </MockPaymentIcons>
                        </MockPaymentWrapper>
                      )}
                    </>
                  )}
                </PreviewContent>
                {inputs.design === 'premium' && <MockCookieBanner>{t.cookieBanner}</MockCookieBanner>}
                {inputs.design === 'elite' && <MockChatButton><FiMessageCircle color="#fff" size={24} /></MockChatButton>}
              </MockWebsite>
            </PreviewPanel>
            <ResultsPanel>
              <SectionTitle><FiDollarSign />{t.estimateTitle}</SectionTitle>
              <TotalDisplay>
                <PriceLabel>{t.oneTimeLabel}</PriceLabel>
                <PriceValue>{formatCurrency(breakdown.oneTimeCost)}</PriceValue>
              </TotalDisplay>
              <TotalDisplay>
                <PriceLabel>{t.monthlyLabel}</PriceLabel>
                <PriceValue>
                  {formatCurrency(breakdown.monthlyCost)}
                  <PriceQualifier>{t.perMonth}</PriceQualifier>
                </PriceValue>
              </TotalDisplay>
              <hr style={{ border: 'none', height: '1px', background: 'rgba(148,163,184,0.12)', margin: '2rem 0' }} />
              <p style={{textAlign: 'center', color: '#94a3b8'}}>{t.timeline}: <strong>~{breakdown.weeks} {t.weeks}</strong></p>
              <ActionButton onClick={openSupport}>
                {t.startProject} <FiArrowRight />
              </ActionButton>
              <SmallActions>
                <SmallButton onClick={copyEstimate}><FiCopy />{t.copy}</SmallButton>
                <SmallButton onClick={resetCalculator}><FiRefreshCw />{t.reset}</SmallButton>
              </SmallActions>
            </ResultsPanel>
          </>
          </EstimatorGrid>
        </ContentContainer>
      </PageWrapper>
      <Footer />
    </>
  );
}
