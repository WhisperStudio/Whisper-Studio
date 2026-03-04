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
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
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

/* Scene for logo-elements */
const LogoStage = styled.div`
  position: relative;
  height: 55px;
  display: flex;
  align-items: flex-end;
`;

/* ===================== Nav Menu ===================== */

const NavMenu = styled.nav`
  margin-top: ${({ $isScrolled }) => ($isScrolled ? '-10px' : '0')};
  display: flex;
  gap: 2.5rem;
  transition: margin-top 0.1s ease-in-out;
  @media (max-width: 768px) { display: none; }
`;

/* Underline animations */
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

  &:hover {
    color: ${({ $textColor }) => ($textColor === 'black' ? '#333' : '#f0f0f0')};
  }

  &::before{
    content:"";
    position:absolute;
    left:0; bottom:0;
    width:100%; height:2px;
    background: white;
    transform: scaleX(0);
    transform-origin:left center;
    border-radius:1px;
  }

  &.nav-slide-in::before{
    animation: ${slideInFromLeft} 0.45s cubic-bezier(.25,.46,.45,.94) forwards;
  }
  &.nav-slide-out::before{
    animation: ${slideOutToRight} 0.55s cubic-bezier(.25,.46,.45,.94) forwards;
  }
`;

/* ===================== Hamburger ===================== */

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 902;
  width: 30px; height: 20px;
  position: relative;
  @media (max-width: 768px) { display: block; }

  span {
    display: block;
    position: absolute;
    height: 2px; width: 100%;
    background: ${({ $isOpen, $textColor }) => ($isOpen ? 'white' : $textColor)};
    border-radius: 2px;
    transition: all 0.25s ease-in-out;
  }
  span:nth-child(1){ top: ${({ $isOpen }) => ($isOpen ? '9px' : '0')};
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(45deg)' : 'none')}; }
  span:nth-child(2){ top: 9px; opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)}; }
  span:nth-child(3){ top: ${({ $isOpen }) => ($isOpen ? '9px' : '18px')};
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(-45deg)' : 'none')}; }
`;

/* ===================== Mobile Menu ===================== */

const fadeIn = keyframes`from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}`;
const fadeOut = keyframes`from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}`;

const MobileNavMenu = styled.nav`
  display: ${({ $isVisible }) => ($isVisible ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  background: #000000;
  padding: 100px 1.5rem 2rem 1.5rem;
  gap: 0;
  z-index: 999;
  animation: ${({ $isOpen }) => ($isOpen ? fadeIn : fadeOut)} 0.3s ease-out;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const MobileNavItem = styled.a`
  font-size: 1.4rem;
  padding: 1.2rem 0.5rem;
  color: #ffffff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-of-type {
    border-bottom: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0; bottom: 0;
    width: 0; height: 2px;
    background: white;
    transition: width 0.3s ease;
  }
  &:hover::after { width: 100%; }
`;

/* ===================== Scroll to top ===================== */

const ScrollTopButton = styled.button`
  position: fixed !important;
  inset: unset !important;
  top: 6.25rem !important;
  right: 2rem !important;
  left: unset !important;
  bottom: unset !important;
  transform: none;
  margin: 0;
  padding: 0;
  width: fit-content;
  background: transparent; border: none; cursor: pointer;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center; justify-content: center;
  transition: transform 0.2s ease;
  z-index: 950;
  &:hover { transform: translateY(-2px); }
  svg { fill: #fff; }

  @media (max-width: 768px) {
    top: 5rem;
    right: 1rem;
  }
`;

/* ===================== Letter logo animations ===================== */

const wordIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(2px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
`;

const wordOut = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
  to   { opacity: 0; transform: translateY(-8px) scale(0.98); filter: blur(2px); }
`;

const LetterLogoWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 6px;
  pointer-events: none;
`;

/* ✅ Nå kan du flytte hele raden med $y */
const LetterRow = styled.div`
  position: relative;
  height: 42px;
  width: ${({ $width }) => `${$width}px`};
  line-height: 0;
  transform: translateY(${({ $y }) => `${$y ?? 0}px`});
`;

/* ✅ Studio kan flyttes både X og Y */
const StudioIndent = styled.div`
  transform: translate(${({ $x }) => `${$x ?? 0}px`}, ${({ $y }) => `${$y ?? 0}px`});
`;

const LetterImg = styled.img`
  position: absolute;
  left: ${({ $x }) => `${$x}px`};

  /* ✅ Bokstavens egen top-offset (kombineres med row sin translateY) */
  top: ${({ $y }) => `${$y ?? 0}px`};

  height: ${({ $height }) => ($height ? `${$height}px` : '36px')};
  width: auto;
  display: block;
  opacity: 0;
  transform-origin: center;

  ${({ $phase, $delay }) =>
    $phase === 'enter'
      ? css`animation: ${wordIn} 650ms cubic-bezier(.2,.8,.2,1) ${$delay}ms forwards;`
      : css`animation: ${wordOut} 450ms cubic-bezier(.4,0,.2,1) ${$delay}ms forwards;`}

  @media (max-width: 768px) {
    height: ${({ $height }) =>
      $height ? `${Math.max(16, Math.round($height * 0.6))}px` : '18px'};
  }
`;

/* ===================== Component ===================== */

const Header = () => {
  const location = useLocation();
  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const [logoPhase, setLogoPhase] = useState('enter'); // 'enter' | 'exit'
  const [logoCycle, setLogoCycle] = useState(0);

  const [scrollTopPortalEl] = useState(() => {
    const el = document.createElement('div');
    el.setAttribute('data-scrolltop-portal', '');
    return el;
  });

  const navItemRefs = useRef({});

  const letterMap = {
    V: Vote_V,
    I: Vote_I,
    N: Vote_N,
    T: Vote_T,
    R: Vote_R,
    A: Vote_A,
    S: Vote_S,
    U: Vote_U,
    D: Vote_D,
    O: Vote_O,
  };

  const topWord = ['V', 'I', 'N', 'T', 'R', 'A'];
  const bottomWord = ['S', 'T', 'U', 'D', 'I', 'O'];

  /* ========= YOU CAN TWEAK THESE ========= */

  // ✅ Flytt hele VINTRA-raden opp/ned
  const VINTRA_ROW_Y = 20;

  // ✅ Flytt hele STUDIO-raden opp/ned (i tillegg til indent)
  const STUDIO_ROW_Y = 6;

  // ✅ Flytt hele STUDIO-blokken til høyre/opp/ned
  const STUDIO_SHIFT_X = 114;
  const STUDIO_SHIFT_Y = 0;

  // ✅ Tracking (negativ = tettere)
  const TRACKING_TOP = -10;
  const TRACKING_BOT = -10;

  // ✅ Kerning (x justering)
  const KERN_TOP = { V: 0, I: -14, N: -20, T: -33, R: -44, A: -45 };
  const KERN_BOT = { S: 0, T: -6, U: -8, D: -10, I: -20, O: -30 };

  // ✅ Bokstav-spesifikk størrelse + x/y
  const DEFAULT_H = 36;
  const SPECIAL = {
    V: { h: 64, y: -10, x: 2 },
    O: { h: 44, y: 0, x: 0 },
    I: {h: 32, y: 6},
    N: {h: 33, y: 6},
    T: {h: 48, y: -8},
    R: {h: 33, y:6},
    A: {y: 3},

    // Eksempel: juster topp per bokstav (legg til flere her)
    // I: { h: 36, y: 2, x: 0 },
    // T: { h: 36, y: -1, x: 0 },
  };

  // ✅ Alternativ: egen Y-map (hvis du vil utenfor SPECIAL)
  const Y_TOP = { /* V: -2, I: 0, ... */ };
  const Y_BOT = { /* S: 0, T: 1, ... */ };

  const [measures, setMeasures] = useState({
    top: Array(topWord.length).fill(0),
    bot: Array(bottomWord.length).fill(0),
  });

  const handleMeasure = (row, index, ch, e) => {
    const img = e.currentTarget;

    const spec = SPECIAL[ch];
    const h = spec?.h ?? DEFAULT_H;

    const ratio = img.naturalWidth / img.naturalHeight;
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
      const spec = SPECIAL[ch];
      const h = spec?.h ?? DEFAULT_H;

      // ✅ bokstavens y kommer fra SPECIAL.y + evt yMap
      const y = (spec?.y ?? 0) + (yMap?.[ch] ?? 0);

      const kern = kernMap[ch] ?? 0;
      const extraX = spec?.x ?? 0;

      const pos = { ch, x: x + kern + extraX, y, h };

      const w = widths[i] || 22; // fallback før vi har målt
      x += w + tracking;

      return pos;
    });
  };

  const topPositions = computePositionsMeasured(topWord, measures.top, KERN_TOP, TRACKING_TOP, Y_TOP);
  const botPositions = computePositionsMeasured(bottomWord, measures.bot, KERN_BOT, TRACKING_BOT, Y_BOT);

  const ROW_WIDTH =
    Math.max(
      topPositions.length
        ? (topPositions[topPositions.length - 1].x + (measures.top[topWord.length - 1] || 40))
        : 260,
      botPositions.length
        ? (botPositions[botPositions.length - 1].x + (measures.bot[bottomWord.length - 1] || 40))
        : 260
    ) + 40;

  /* ===================== Effects ===================== */

  useEffect(() => {
    setIsScrolled(false);
    setShowTop(false);
    setLogoPhase('enter');
    setLogoCycle(c => c + 1);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.appendChild(scrollTopPortalEl);
    return () => {
      scrollTopPortalEl.remove();
    };
  }, [scrollTopPortalEl]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      setIsScrolled(y >= 50);
      setShowTop(y >= 200);

      if (y >= 50 && logoPhase !== 'exit') {
        setLogoPhase('exit');
        setLogoCycle(c => c + 1);
      } else if (y === 0 && logoPhase !== 'enter') {
        setLogoPhase('enter');
        setLogoCycle(c => c + 1);
      }
    };

    requestAnimationFrame(() => {
      const y = window.scrollY;
      setIsScrolled(y >= 50);
      setShowTop(y >= 200);

      if (y >= 50) {
        setLogoPhase('exit');
      } else {
        setLogoPhase('enter');
        setLogoCycle(c => c + 1);
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [logoPhase]);

  const toggleMenu = () => {
    if (menuState.isOpen) {
      setMenuState(s => ({ ...s, isOpen: false }));
      setTimeout(() => setMenuState({ isOpen: false, isVisible: false }), 300);
    } else {
      setMenuState({ isOpen: true, isVisible: true });
    }
  };

  const textColor = 'white';
  const items = [
    { href: '/vote',                label: 'Vote' },
    { href: '/services/websites',   label: 'Websites' },
    { href: '/about-us',            label: 'About Us' },
    { href: '/careers',             label: 'Careers' },
    { href: '/contact',             label: 'Support' },
  ];

  const handleMouseEnter = (idx) => {
    const el = navItemRefs.current[idx];
    if (!el) return;

    el.classList.remove('nav-slide-out');

    if (el.classList.contains('nav-slide-in')) {
      el.classList.remove('nav-slide-in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('nav-slide-in'));
      });
    } else {
      el.classList.add('nav-slide-in');
    }
  };

  const handleMouseLeave = (idx) => {
    const el = navItemRefs.current[idx];
    if (!el) return;

    el.classList.remove('nav-slide-in');

    if (el.classList.contains('nav-slide-out')) {
      el.classList.remove('nav-slide-out');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('nav-slide-out'));
      });
    } else {
      el.classList.add('nav-slide-out');
    }
  };

  const letterDelay = (rowIdx, letterIdx) => {
    const base = rowIdx === 0 ? 0 : 120;
    const step = 55;
    return base + letterIdx * step;
  };

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
              <LetterLogoWrap aria-label="Vintra Studio">
                {/* ✅ VINTRA row with adjustable Y */}
                <LetterRow $width={ROW_WIDTH} $y={VINTRA_ROW_Y}>
                  {topPositions.map((p, i) => (
                    <LetterImg
                      key={`top-${logoCycle}-${p.ch}-${i}`}
                      src={letterMap[p.ch]}
                      alt={p.ch}
                      $phase={logoPhase}
                      $delay={letterDelay(0, i)}
                      $x={p.x}
                      $y={p.y}
                      $height={p.h}
                      draggable={false}
                      onLoad={(e) => handleMeasure('top', i, p.ch, e)}
                    />
                  ))}
                </LetterRow>

                {/* ✅ STUDIO block with adjustable X and Y + row Y */}
                <StudioIndent $x={STUDIO_SHIFT_X} $y={STUDIO_SHIFT_Y}>
                  <LetterRow $width={ROW_WIDTH} $y={STUDIO_ROW_Y}>
                    {botPositions.map((p, i) => (
                      <LetterImg
                        key={`bot-${logoCycle}-${p.ch}-${i}`}
                        src={letterMap[p.ch]}
                        alt={p.ch}
                        $phase={logoPhase}
                        $delay={letterDelay(1, i)}
                        $x={p.x}
                        $y={p.y}
                        $height={p.h}
                        draggable={false}
                        onLoad={(e) => handleMeasure('bot', i, p.ch, e)}
                      />
                    ))}
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
              href={item.href}
              $textColor={textColor}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
            >
              {item.label}
            </NavItem>
          ))}
        </NavMenu>

        {/* HAMBURGER (mobile) */}
        <HamburgerButton onClick={toggleMenu} $isOpen={menuState.isOpen} $textColor={textColor}>
          <span /><span /><span />
        </HamburgerButton>

        {/* MOBILE NAV */}
        <MobileNavMenu $isOpen={menuState.isOpen} $isVisible={menuState.isVisible}>
          {items.map((item) => (
            <MobileNavItem
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                setTimeout(() => { window.location.href = item.href; }, 300);
              }}
            >
              {item.label}
            </MobileNavItem>
          ))}
        </MobileNavMenu>
      </HeaderContainer>

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