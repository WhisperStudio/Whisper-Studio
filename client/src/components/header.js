import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import Vote_V from '../images/Vote_V.png';
import Vote_I from '../images/Vote-I.png';
import Vote_N from '../images/Vote-N.png';
import Vote_T from '../images/Vote-T.png';
import Vote_R from '../images/Vote-R.png';
import Vote_A from '../images/Vote-A.png';

import Vote_S from '../images/Vote-S.png';
import Vote_U from '../images/Vote-U.png';
import Vote_D from '../images/Vote-D.png';
import Vote_O from '../images/Vote-O.png';

import { StoneArrow } from './stonearrow';

/* ===================== Header Shell ===================== */

const HeaderContainer = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 900;
  height: ${({ $isScrolled }) => ($isScrolled ? '70px' : '100px')};
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  body[data-artwork-modal-open="true"] & {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    transform: translateY(-100%) !important;
    transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  }

  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 70%,
    rgba(0, 0, 0, 0.8) 85%,
    rgba(0, 0, 0, 0) 100%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.3s ease-in-out;

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    height: ${({ $isScrolled }) => ($isScrolled ? '56px' : '70px')};
    background: rgba(19, 14, 5, 0.97);
    backdrop-filter: blur(12px);
  }
`;

const Logo = styled.a`
  margin-top: ${({ $isScrolled }) => ($isScrolled ? '-10px' : '0')};
  color: ${({ $textColor }) => $textColor};
  transition: margin-top 0.1s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
  cursor: pointer;
  text-decoration: none;
`;

const Logodiv = styled.div`
  display: flex;
  align-items: center;
  z-index: 0;
`;

const LogoStage = styled.div`
  position: relative;
  height: 55px;
  display: flex;
  align-items: flex-end;
  overflow: visible;

  @media (max-width: 768px) {
    height: 44px;
  }
`;

/* ===================== Nav ===================== */

const NavMenu = styled.nav`
  margin-top: ${({ $isScrolled }) => ($isScrolled ? '-10px' : '0')};
  display: flex;
  gap: 2.5rem;
  transition: margin-top 0.1s ease-in-out;
  @media (max-width: 768px) { display: none; }
`;

const slideInFromLeft = keyframes`
  0%   { transform: scaleX(0); transform-origin: left center; }
  100% { transform: scaleX(1); transform-origin: left center; }
`;
const slideOutToRight = keyframes`
  0%   { transform: scaleX(1); transform-origin: right center; }
  100% { transform: scaleX(0); transform-origin: right center; }
`;

const NavItem = styled.a`
  position: relative;
  color: ${({ $textColor }) => $textColor};
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 0;
  transition: color 0.25s ease;
  overflow: hidden;
  &:hover { color: ${({ $textColor }) => ($textColor === 'black' ? '#333' : '#f0f0f0')}; }
  &::before {
    content: "";
    position: absolute;
    left: 0; bottom: 0;
    width: 100%; height: 2px;
    background: white;
    transform: scaleX(0);
    transform-origin: left center;
    border-radius: 1px;
  }
  &.nav-slide-in::before { animation: ${slideInFromLeft} 0.45s cubic-bezier(.25,.46,.45,.94) forwards; }
  &.nav-slide-out::before { animation: ${slideOutToRight} 0.55s cubic-bezier(.25,.46,.45,.94) forwards; }
`;

/* ===================== Hamburger ===================== */

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
  width: 36px;
  height: 36px;
  position: relative;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(200, 146, 42, 0.12);
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  span {
    display: block;
    height: 2px;
    border-radius: 2px;
    transition: all 0.28s cubic-bezier(.4,0,.2,1);
    transform-origin: center;
    background: ${({ $isOpen }) =>
      $isOpen ? '#c8922a' : 'rgba(235, 215, 165, 0.88)'};
  }

  span:nth-child(1) {
    width: ${({ $isOpen }) => ($isOpen ? '22px' : '22px')};
    transform: ${({ $isOpen }) => ($isOpen ? 'translateY(7px) rotate(45deg)' : 'none')};
  }
  span:nth-child(2) {
    width: 16px;
    align-self: ${({ $isOpen }) => ($isOpen ? 'center' : 'flex-end')};
    opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)};
    transform: ${({ $isOpen }) => ($isOpen ? 'scaleX(0)' : 'none')};
  }
  span:nth-child(3) {
    width: ${({ $isOpen }) => ($isOpen ? '22px' : '22px')};
    transform: ${({ $isOpen }) => ($isOpen ? 'translateY(-7px) rotate(-45deg)' : 'none')};
  }
`;

/* ===================== Mobile Menu ===================== */

const menuSlideIn = keyframes`
  0%   { opacity: 0; transform: translateX(100%); }
  100% { opacity: 1; transform: translateX(0); }
`;
const menuSlideOut = keyframes`
  0%   { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(100%); }
`;

const MobileNavMenu = styled.nav`
  display: ${({ $isVisible }) => ($isVisible ? 'flex' : 'none')};
  flex-direction: column;
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(320px, 88vw);
  height: 100dvh;            /* ✅ viktig: stabil høyde på mobil */
  z-index: 1000;

  background:
    linear-gradient(
      160deg,
      #1e1609 0%,
      #130e05 40%,
      #0d0904 100%
    );

  border-left: 1px solid rgba(200, 146, 42, 0.22);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.7), -2px 0 12px rgba(200, 146, 42, 0.08);

  padding: 0;
  overflow: hidden;

  min-height: 0;             /* ✅ viktig i flex layouts */
  animation: ${({ $isOpen }) => ($isOpen ? menuSlideIn : menuSlideOut)}
    0.32s cubic-bezier(.4,0,.2,1) forwards;
`;

/* Decorative top bar in the mobile menu */
const MenuTopBar = styled.div`
  height: 3px;
  background: linear-gradient(90deg, #7a5520 0%, #c8922a 40%, #f5cc48 70%, #c8922a 100%);
  flex-shrink: 0;
`;

/* Close button area at top of panel */
const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem 0.8rem 1.6rem;
  flex-shrink: 0;
`;

const MenuBrandLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(200, 146, 42, 0.7);
`;

const MenuCloseBtn = styled.button`
  background: none;
  border: 1px solid rgba(200, 146, 42, 0.25);
  border-radius: 6px;
  width: 32px; height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(235, 215, 165, 0.7);
  font-size: 1.1rem;
  line-height: 1;
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(200, 146, 42, 0.6);
    color: #c8922a;
    background: rgba(200, 146, 42, 0.08);
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  margin: 0 1.4rem;
  background: linear-gradient(90deg, rgba(200,146,42,0.3) 0%, rgba(200,146,42,0.08) 100%);
  flex-shrink: 0;
`;

const MenuItemsWrap = styled.div`
  flex: 1;
  min-height: 0;             /* ✅ THIS is the key */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  display: flex;             /* ✅ gjør at items stackes fint */
  flex-direction: column;
  gap: 2px;

  padding: 0.5rem 0 2rem 0;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(200,146,42,0.3); border-radius: 2px; }
`;

const mobileItemSlide = keyframes`
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const MobileNavItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem 1.6rem;
  color: rgba(235, 215, 165, 0.84);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.95rem;
  font-weight: 600;
  position: relative;
  transition: color 0.18s ease, background 0.18s ease, padding-left 0.18s ease;

  animation: ${({ $isOpen }) => ($isOpen ? mobileItemSlide : 'none')}
    0.35s cubic-bezier(.4,0,.2,1) both;
  animation-delay: ${({ $index }) => `${0.05 + $index * 0.055}s`};

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 3px; height: 60%;
    background: linear-gradient(180deg, #f5cc48, #c8922a);
    border-radius: 0 2px 2px 0;
    transition: transform 0.18s ease;
  }

  &:hover {
    color: #f5cc48;
    background: rgba(200, 146, 42, 0.07);
    padding-left: 1.9rem;

    &::before {
      transform: translateY(-50%) scaleY(1);
    }
  }

  &:active {
    background: rgba(200, 146, 42, 0.12);
    color: #f5cc48;
  }
`;

const MenuItemArrow = styled.span`
  margin-left: auto;
  color: rgba(200, 146, 42, 0.4);
  font-size: 0.7rem;
  transition: color 0.18s ease, transform 0.18s ease;

  ${MobileNavItem}:hover & {
    color: rgba(245, 204, 72, 0.7);
    transform: translateX(3px);
  }
`;

/* Bottom area with subtle branding */
const MenuFooter = styled.div`
  padding: 1rem 1.6rem 1.4rem;
  flex-shrink: 0;
  border-top: 1px solid rgba(200, 146, 42, 0.1);
`;

const MenuFooterText = styled.p`
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(200, 146, 42, 0.35);
  margin: 0;
`;

/* Overlay behind the panel */
const MobileOverlay = styled.div`
  display: ${({ $isVisible }) => ($isVisible ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 999;
  backdrop-filter: blur(2px);
  animation: ${({ $isOpen }) => ($isOpen
    ? css`${keyframes`from{opacity:0}to{opacity:1}`} 0.25s ease forwards`
    : css`${keyframes`from{opacity:1}to{opacity:0}`} 0.3s ease forwards`
  )};
`;

/* ===================== Scroll to top ===================== */

const ScrollTopButton = styled.button`
  position: fixed !important; inset: unset !important;
  top: 6.25rem !important; right: 2rem !important;
  left: unset !important; bottom: unset !important;
  transform: none; margin: 0; padding: 0; width: fit-content;
  background: transparent; border: none; cursor: pointer;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center; justify-content: center;
  transition: transform 0.2s ease; z-index: 950;
  &:hover { transform: translateY(-2px); }
  svg { fill: #fff; }
  @media (max-width: 768px) { top: 5rem; right: 1rem; }
`;

/* ===================== Logo layout ===================== */

const LetterLogoWrap = styled.div`
  --p: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 6px;
  pointer-events: none;

  @media (max-width: 768px) {
    gap: 0;
    padding-bottom: 2px;
  }
`;

const LetterRow = styled.div`
  position: relative;
  height: 42px;
  width: ${({ $width }) => `${$width}px`};
  line-height: 0;
  transform: translateY(${({ $y }) => `${$y ?? 0}px`});

  /* On mobile, only show V — hide the whole VINTRA row's non-V letters
     and the STUDIO row entirely via the StudioIndent wrapper */
  @media (max-width: 768px) {
    height: 36px;
  }
`;

/* Hide entire STUDIO row on mobile */
const StudioIndent = styled.div`
  transform: translate(${({ $x }) => `${$x ?? 0}px`}, ${({ $y }) => `${$y ?? 0}px`});

  @media (max-width: 768px) {
    display: none;
  }
`;

/* Individual non-V letter wrappers are hidden on mobile */
const MobileHide = styled.span`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

/* ===================== Intro keyframes ===================== */

const bounceInTop = keyframes`
  0%   { opacity: 0; transform: translateY(-40px) scale(0.7) rotate(-8deg); }
  55%  { opacity: 1; transform: translateY(6px)   scale(1.08) rotate(2deg); }
  75%  {             transform: translateY(-4px)  scale(0.97) rotate(-1deg); }
  90%  {             transform: translateY(2px)   scale(1.02) rotate(0.5deg); }
  100% { opacity: 1; transform: translateY(0)     scale(1)    rotate(0deg); }
`;

const bounceInSide = keyframes`
  0%   { opacity: 0; transform: translateX(-30px) scale(0.75) rotate(6deg); }
  55%  { opacity: 1; transform: translateX(5px)   scale(1.06) rotate(-1deg); }
  75%  {             transform: translateX(-3px)  scale(0.98) rotate(0.5deg); }
  90%  {             transform: translateX(2px)   scale(1.01); }
  100% { opacity: 1; transform: translateX(0)     scale(1)    rotate(0deg); }
`;

const vSlam = keyframes`
  0%   { opacity: 0; transform: translateY(-80px) scale(0.4) rotate(-180deg); }
  50%  { opacity: 1; transform: translateY(10px)  scale(1.18) rotate(10deg); }
  70%  {             transform: translateY(-6px)  scale(0.95) rotate(-4deg); }
  85%  {             transform: translateY(3px)   scale(1.04) rotate(1deg); }
  100% { opacity: 1; transform: translateY(0)     scale(1)    rotate(0deg); }
`;

const spinInRight = keyframes`
  0%   { opacity: 0; transform: translateX(35px) scale(0.6) rotate(120deg); }
  50%  { opacity: 1; transform: translateX(-6px) scale(1.1) rotate(-8deg); }
  72%  {             transform: translateX(3px)  scale(0.96) rotate(3deg); }
  88%  {             transform: translateX(-2px) scale(1.02) rotate(-1deg); }
  100% { opacity: 1; transform: translateX(0)    scale(1)    rotate(0deg); }
`;

const popInBottom = keyframes`
  0%   { opacity: 0; transform: translateY(35px) scale(0.5) rotate(-90deg); }
  55%  { opacity: 1; transform: translateY(-8px) scale(1.12) rotate(6deg); }
  75%  {             transform: translateY(4px)  scale(0.95) rotate(-2deg); }
  90%  {             transform: translateY(-2px) scale(1.03) rotate(1deg); }
  100% { opacity: 1; transform: translateY(0)    scale(1)    rotate(0deg); }
`;

/* ===================== Scroll-driven elements ===================== */

const ScrollDriven = styled.span`
  position: absolute;
  left: ${({ $x }) => `${$x}px`};
  display: block;
  transform-origin: center center;

  ${({ $isV, $y }) =>
    $isV
      ? css`
          top: calc(${$y ?? 0}px + var(--p) * ${22 - ($y ?? 0) + 10}px);
          opacity: 1;
          transform:
            translateY(calc(var(--p) * -18px))
            rotate(calc(var(--p) * 360deg))
            scale(calc(1.0 + var(--p) * 0.55));
          will-change: transform, top;
        `
      : css`
          top: ${$y ?? 0}px;
          --_sp: clamp(0.0, (var(--p) - (1.0 - var(--ls)) * 0.6) / 0.4, 1.0);
          opacity: calc(1.0 - var(--_sp));
          transform:
            translateY(calc(var(--_sp) * -220px))
            rotate(calc(var(--_sp) * var(--rot) * 1deg))
            scale(calc(1.0 - var(--_sp) * 0.2));
          will-change: transform, opacity;
        `}
`;

const IntroBounce = styled.span`
  display: block;
  transform-origin: center center;
  opacity: 0;

  animation: ${({ $introAnim }) => {
    switch ($introAnim) {
      case 'vSlam':        return css`${vSlam}        0.85s cubic-bezier(.22,1.4,.36,1) forwards`;
      case 'spinInRight':  return css`${spinInRight}  0.65s cubic-bezier(.22,1.4,.36,1) forwards`;
      case 'popInBottom':  return css`${popInBottom}  0.65s cubic-bezier(.22,1.4,.36,1) forwards`;
      case 'bounceInSide': return css`${bounceInSide} 0.55s cubic-bezier(.22,1.4,.36,1) forwards`;
      default:             return css`${bounceInTop}  0.60s cubic-bezier(.22,1.4,.36,1) forwards`;
    }
  }};
  animation-delay: ${({ $delay }) => `${$delay}ms`};
`;

const LetterImg = styled.img`
  display: block;
  height: ${({ $height }) => ($height ? `${$height}px` : '36px')};
  width: auto;

  @media (max-width: 768px) {
    height: ${({ $height, $isV }) =>
      $isV
        ? `${Math.round(($height ?? 36) * 0.72)}px`
        : $height
        ? `${Math.max(16, Math.round($height * 0.6))}px`
        : '18px'};
  }
`;

/* ===================== Component ===================== */

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const SCROLL_THRESHOLD = 50;
const SCROLL_RANGE     = 80;
const FOLLOW_SLOW      = 0.035;
const FOLLOW_COMPLETE  = 0.055;

const Header = () => {
  const location = useLocation();

  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY >= SCROLL_THRESHOLD);
  const [showTop, setShowTop]       = useState(() => window.scrollY >= 200);

  const [scrollTopPortalEl] = useState(() => {
    const el = document.createElement('div');
    el.setAttribute('data-scrolltop-portal', '');
    return el;
  });

  const navItemRefs     = useRef({});
  const logoWrapRef     = useRef(null);
  const progressRef     = useRef(0);
  const scrollYRef      = useRef(window.scrollY);
  const rafRef          = useRef(null);
  const prevPathnameRef = useRef(location.pathname);

  /* ===================== Letter map + words ===================== */

  const letterMap = {
    V: Vote_V, I: Vote_I, N: Vote_N, T: Vote_T, R: Vote_R, A: Vote_A,
    S: Vote_S, U: Vote_U, D: Vote_D, O: Vote_O,
  };

  const topWord    = ['V', 'I', 'N', 'T', 'R', 'A'];
  const bottomWord = ['S', 'T', 'U', 'D', 'I', 'O'];

  const VINTRA_ROW_Y   = 20;
  const STUDIO_ROW_Y   = 6;
  const STUDIO_SHIFT_X = 114;
  const STUDIO_SHIFT_Y = 0;
  const TRACKING_TOP   = -10;
  const TRACKING_BOT   = -10;

  const KERN_TOP = { V: 0, I: -14, N: -20, T: -33, R: -44, A: -45 };
  const KERN_BOT = { S: 16, T: 2, U: -11, D: -14, I: -22, O: -28 };

  const DEFAULT_H = 36;
  const SPECIAL = {
    V: { h: 64, y: -12, x: 4 },
    O: { h: 37 },
    I: { h: 32, y: 6 },
    N: { h: 33, y: 6 },
    T: { h: 48, y: -8 },
    R: { h: 33, y: 6 },
    A: { y: 3 },
    S: { h: 38 },
  };

  const Y_TOP = {};
  const Y_BOT = { S: 4, T: 2, U: 6, D: 6, I: 0, O: 5 };

  const [measures, setMeasures] = useState({
    top: Array(topWord.length).fill(0),
    bot: Array(bottomWord.length).fill(0),
  });

  const handleMeasure = (row, index, ch, e) => {
    const img     = e.currentTarget;
    const spec    = SPECIAL[ch];
    const h       = spec?.h ?? DEFAULT_H;
    const ratio   = img.naturalWidth / img.naturalHeight;
    const scaledW = Math.round(ratio * h);
    setMeasures(prev => {
      const next = { ...prev, [row]: [...prev[row]] };
      next[row][index] = scaledW;
      return next;
    });
  };

  const computePositionsMeasured = (letters, widths, kernMap, tracking, yMap) => {
    let x = 0;
    return letters.map((ch, i) => {
      const spec   = SPECIAL[ch];
      const h      = spec?.h ?? DEFAULT_H;
      const y      = (spec?.y ?? 0) + (yMap?.[ch] ?? 0);
      const kern   = kernMap[ch] ?? 0;
      const extraX = spec?.x ?? 0;
      const pos    = { ch, x: x + kern + extraX, y, h };
      x += (widths[i] || 22) + tracking;
      return pos;
    });
  };

  const topPositions = computePositionsMeasured(topWord, measures.top, KERN_TOP, TRACKING_TOP, Y_TOP);
  const botPositions = computePositionsMeasured(bottomWord, measures.bot, KERN_BOT, TRACKING_BOT, Y_BOT);

  const ROW_WIDTH =
    Math.max(
      topPositions.length ? topPositions[topPositions.length - 1].x + (measures.top[topWord.length - 1] || 40) : 260,
      botPositions.length ? botPositions[botPositions.length - 1].x + (measures.bot[bottomWord.length - 1] || 40) : 260
    ) + 40;

  /* ===================== rAF loop ===================== */

  useEffect(() => {
    const update = () => {
      const y = scrollYRef.current;
      const p = progressRef.current;

      let target, follow;
      if (y >= SCROLL_THRESHOLD) {
        target = 1.0; follow = FOLLOW_COMPLETE;
      } else if (p > 0.005) {
        target = 0.0; follow = FOLLOW_SLOW;
      } else {
        target = clamp01(y / SCROLL_RANGE); follow = FOLLOW_SLOW;
      }

      const next = p + (target - p) * follow;
      progressRef.current = next;
      if (logoWrapRef.current) {
        logoWrapRef.current.style.setProperty('--p', next.toFixed(5));
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ===================== Scroll listener ===================== */

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      scrollYRef.current = y;
      setIsScrolled(y >= SCROLL_THRESHOLD);
      setShowTop(y >= 200);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ===================== Route navigation reset ===================== */

  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      window.scrollTo(0, 0);
      scrollYRef.current  = 0;
      progressRef.current = 0;
      if (logoWrapRef.current) logoWrapRef.current.style.setProperty('--p', '0');
      setIsScrolled(false);
      setShowTop(false);
    }
  }, [location.pathname]);

  /* ===================== Portal ===================== */

  useEffect(() => {
    document.body.appendChild(scrollTopPortalEl);
    return () => { scrollTopPortalEl.remove(); };
  }, [scrollTopPortalEl]);

  /* ===================== Nav ===================== */

  const openMenu = () => setMenuState({ isOpen: true, isVisible: true });

  const closeMenu = () => {
    setMenuState(s => ({ ...s, isOpen: false }));
    setTimeout(() => setMenuState({ isOpen: false, isVisible: false }), 320);
  };

  const toggleMenu = () => menuState.isOpen ? closeMenu() : openMenu();

  const textColor = 'white';
  const items = [
    { href: '/vote',              label: 'Vote'     },
    { href: '/services/websites', label: 'Websites' },
    { href: '/about-us',          label: 'About Us' },
    { href: '/careers',           label: 'Careers'  },
    { href: '/contact',           label: 'Support'  },
  ];

  const handleMouseEnter = (idx) => {
    const el = navItemRefs.current[idx];
    if (!el) return;
    el.classList.remove('nav-slide-out');
    if (el.classList.contains('nav-slide-in')) {
      el.classList.remove('nav-slide-in');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('nav-slide-in')));
    } else { el.classList.add('nav-slide-in'); }
  };

  const handleMouseLeave = (idx) => {
    const el = navItemRefs.current[idx];
    if (!el) return;
    el.classList.remove('nav-slide-in');
    if (el.classList.contains('nav-slide-out')) {
      el.classList.remove('nav-slide-out');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('nav-slide-out')));
    } else { el.classList.add('nav-slide-out'); }
  };

  /* ===================== Letter configs ===================== */

  const topConfig = [
    /* V */ { delay: 350, introAnim: 'vSlam',       ls: null, rot: null },
    /* I */ { delay:   0, introAnim: 'bounceInTop',  ls: 0.0,  rot:  -9 },
    /* N */ { delay:  60, introAnim: 'bounceInTop',  ls: 0.25, rot:   7 },
    /* T */ { delay: 120, introAnim: 'bounceInTop',  ls: 0.5,  rot:  -8 },
    /* R */ { delay: 180, introAnim: 'bounceInTop',  ls: 0.75, rot:  10 },
    /* A */ { delay: 260, introAnim: 'spinInRight',  ls: 1.0,  rot:  -6 },
  ];

  const botConfig = [
    /* S */ { delay: 300, introAnim: 'bounceInSide', ls: 0.0,  rot:   8 },
    /* T */ { delay: 360, introAnim: 'bounceInSide', ls: 0.2,  rot:  -7 },
    /* U */ { delay: 420, introAnim: 'bounceInSide', ls: 0.4,  rot:   9 },
    /* D */ { delay: 480, introAnim: 'bounceInSide', ls: 0.6,  rot: -10 },
    /* I */ { delay: 540, introAnim: 'bounceInSide', ls: 0.8,  rot:   6 },
    /* O */ { delay: 620, introAnim: 'popInBottom',  ls: 1.0,  rot:  -8 },
  ];

  return (
    <>
      <HeaderContainer $isScrolled={isScrolled}>
        <Logo
          href="/"
          $textColor={textColor}
          $isScrolled={isScrolled}
          onClick={() => window.location.href = '/'}
        >
          <Logodiv>
            <LogoStage>
              <LetterLogoWrap ref={logoWrapRef} aria-label="Vintra Studio">

                <LetterRow $width={ROW_WIDTH} $y={VINTRA_ROW_Y}>
                  {topPositions.map((p, i) => {
                    const cfg = topConfig[i];
                    const isV = p.ch === 'V';

                    const inner = (
                      <ScrollDriven
                        key={`top-${p.ch}-${i}`}
                        $x={p.x} $y={p.y} $isV={isV}
                        style={!isV ? { '--ls': String(cfg.ls), '--rot': String(cfg.rot) } : undefined}
                      >
                        <IntroBounce $introAnim={cfg.introAnim} $delay={cfg.delay}>
                          <LetterImg
                            src={letterMap[p.ch]} alt={p.ch} $height={p.h} $isV={isV}
                            draggable={false}
                            onLoad={(e) => handleMeasure('top', i, p.ch, e)}
                          />
                        </IntroBounce>
                      </ScrollDriven>
                    );

                    /* Hide all non-V letters on mobile */
                    return isV ? inner : <MobileHide key={`top-hide-${p.ch}-${i}`}>{inner}</MobileHide>;
                  })}
                </LetterRow>

                {/* Entire STUDIO row hidden on mobile via StudioIndent */}
                <StudioIndent $x={STUDIO_SHIFT_X} $y={STUDIO_SHIFT_Y}>
                  <LetterRow $width={ROW_WIDTH} $y={STUDIO_ROW_Y}>
                    {botPositions.map((p, i) => {
                      const cfg = botConfig[i];
                      return (
                        <ScrollDriven
                          key={`bot-${p.ch}-${i}`}
                          $x={p.x} $y={p.y} $isV={false}
                          style={{ '--ls': String(cfg.ls), '--rot': String(cfg.rot) }}
                        >
                          <IntroBounce $introAnim={cfg.introAnim} $delay={cfg.delay}>
                            <LetterImg
                              src={letterMap[p.ch]} alt={p.ch} $height={p.h}
                              draggable={false}
                              onLoad={(e) => handleMeasure('bot', i, p.ch, e)}
                            />
                          </IntroBounce>
                        </ScrollDriven>
                      );
                    })}
                  </LetterRow>
                </StudioIndent>

              </LetterLogoWrap>
            </LogoStage>
          </Logodiv>
        </Logo>

        {/* DESKTOP NAV */}
        <NavMenu $isScrolled={isScrolled}>
          {items.map((item, idx) => (
            <NavItem
              key={item.href}
              ref={el => navItemRefs.current[idx] = el}
              href={item.href} $textColor={textColor}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
            >
              {item.label}
            </NavItem>
          ))}
        </NavMenu>

        {/* HAMBURGER */}
        <HamburgerButton
          onClick={toggleMenu}
          $isOpen={menuState.isOpen}
          aria-label="Toggle menu"
          aria-expanded={menuState.isOpen}
        >
          <span /><span /><span />
        </HamburgerButton>
      </HeaderContainer>

      {/* MOBILE OVERLAY */}
      <MobileOverlay
        $isOpen={menuState.isOpen}
        $isVisible={menuState.isVisible}
        onClick={closeMenu}
      />

      {/* MOBILE SLIDE-IN PANEL */}
      <MobileNavMenu $isOpen={menuState.isOpen} $isVisible={menuState.isVisible}>
        <MenuTopBar />

        <MenuHeader>
          <MenuBrandLabel>Vintra Studio</MenuBrandLabel>
          <MenuCloseBtn onClick={closeMenu} aria-label="Close menu">✕</MenuCloseBtn>
        </MenuHeader>

        <MenuDivider />

        <MenuItemsWrap>
          {items.map((item, idx) => (
            <MobileNavItem
              key={item.href}
              href={item.href}
              $isOpen={menuState.isOpen}
              $index={idx}
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                setTimeout(() => { window.location.href = item.href; }, 320);
              }}
            >
              {item.label}
              <MenuItemArrow>›</MenuItemArrow>
            </MobileNavItem>
          ))}
        </MenuItemsWrap>

        <MenuFooter>
          <MenuFooterText>© Vintra Studio</MenuFooterText>
        </MenuFooter>
      </MobileNavMenu>

      {createPortal(
        <ScrollTopButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          $visible={showTop}
          aria-label="Scroll to top"
        >
          <StoneArrow size={90} color="#ffffff" />
        </ScrollTopButton>,
        scrollTopPortalEl
      )}
    </>
  );
};

export default Header;