import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import Vintra from '../images/VINTRA.png';
import Studio from '../images/STUDIO.png';
import VOTE_V from '../images/Vote_V.png';

/* ===================== TIMING CONSTANTS ===================== */
/* ENKLE TIMINGS - Juster disse for å endre animasjonshastighet */
const TIMING = {
  // Fase 1: VINTRA og STUDIO forsvinner
  LOGO_FADE_OUT: 500,           // Hvor raskt VINTRA/STUDIO forsvinner (ms)
  
  // Fase 2: Pause før V kommer
  V_DELAY: 50,                 // Pause mellom fade out og V animasjon (ms)
  
  // Fase 3: V kommer inn
  V_SPIN_IN: 700,               // Hvor raskt V spinner inn (ms)
  
  // Fase 4: Tilbake - V forsvinner
  V_SPIN_OUT: 700,              // Hvor raskt V spinner ut (ms)
  
  // Fase 5: Pause før logoer kommer tilbake
  LOGO_DELAY_BACK: 150,         // Pause før VINTRA/STUDIO kommer tilbake (ms)
  
  // Fase 6: VINTRA og STUDIO kommer tilbake
  LOGO_FADE_IN: 700,            // Hvor raskt VINTRA/STUDIO kommer tilbake (ms)
};

/* Justér V-ens posisjon (i px) */
const V_POSITION = {
  X: -14,  // Horisontal offset
  Y: -2,   // Vertikal offset
};

/* ===================== Header Shell ===================== */

const HeaderContainer = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* Solid background for nav area */
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 70%,
    rgba(0, 0, 0, 0.8) 85%,
    rgba(0, 0, 0, 0) 100%
  );
  
  /* Blur effect for smooth fade */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* Smooth transition */
  transition: all 0.3s ease-in-out;
  
  @media (max-width: 768px) { 
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
  }
`;

const Logo = styled.a`
  margin-top: ${({ isScrolled }) => (isScrolled ? '-10px' : '0')};
  color: ${({ textColor }) => textColor};
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

/* A liten scene slik at V-en kan ligge absolutti forhold til logoen */
const LogoStage = styled.div`
  position: relative;
  height: 55px;            /* høyeste av de tre elementene */
  display: flex;
  align-items: flex-end;
`;

/* ===================== Nav Menu ===================== */

const NavMenu = styled.nav`
  margin-top: ${({ isScrolled }) => (isScrolled ? '-10px' : '0')};
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
  color: ${({ textColor }) => textColor};
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 0;
  transition: color 0.25s ease;
  overflow: hidden;

  &:hover {
    color: ${({ textColor }) => (textColor === 'black' ? '#333' : '#f0f0f0')};
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
  z-index: 1002;
  width: 30px; height: 20px;
  position: relative;
  @media (max-width: 768px) { display: block; }

  span {
    display: block;
    position: absolute;
    height: 2px; width: 100%;
    background: ${({ isOpen, textColor }) => (isOpen ? 'white' : textColor)};
    border-radius: 2px;
    transition: all 0.25s ease-in-out;
  }
  span:nth-child(1){ top: ${({ isOpen }) => (isOpen ? '9px' : '0')};
    transform: ${({ isOpen }) => (isOpen ? 'rotate(45deg)' : 'none')}; }
  span:nth-child(2){ top: 9px; opacity: ${({ isOpen }) => (isOpen ? 0 : 1)}; }
  span:nth-child(3){ top: ${({ isOpen }) => (isOpen ? '9px' : '18px')};
    transform: ${({ isOpen }) => (isOpen ? 'rotate(-45deg)' : 'none')}; }
`;

/* ===================== Mobile Menu ===================== */

const fadeIn = keyframes`from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}`;
const fadeOut = keyframes`from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}`;

const MobileNavMenu = styled.nav`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
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
  animation: ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} 0.3s ease-out;
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
  position: absolute;
  top: 100%;
  right: 4rem;
  margin-top: 0.5rem;
  width: 2.8rem; height: 2.8rem;
  background: transparent; border: none; cursor: pointer;
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  align-items: center; justify-content: center;
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-2px); }
  svg { width: 3.4rem; height: 3.4rem; fill: #fff; }
`;

/* ===================== VINTRA/STUDIO <-> V overgang ===================== */

/* Animasjoner for V */
const spinGrow = keyframes`
  from { 
    opacity: 0; 
    transform: translate(${V_POSITION.X}px, ${V_POSITION.Y}px) rotate(0deg) scale(1); 
  }
  to { 
    opacity: 1; 
    transform: translate(${V_POSITION.X}px, ${V_POSITION.Y}px) rotate(360deg) scale(1.25); 
  }
`;

const spinBack = keyframes`
  from { 
    opacity: 1; 
    transform: translate(${V_POSITION.X}px, ${V_POSITION.Y}px) rotate(360deg) scale(1.25); 
  }
  to { 
    opacity: 0; 
    transform: translate(${V_POSITION.X}px, ${V_POSITION.Y}px) rotate(0deg) scale(1); 
  }
`;

/* VINTRA bilde - forsvinner og kommer tilbake */
const VintraImg = styled.img`
  height: 50px;
  margin-bottom: 10px;
  opacity: ${({ isScrolled }) => (isScrolled ? 0 : 1)};
  visibility: ${({ isScrolled }) => (isScrolled ? 'hidden' : 'visible')};
  transition: 
    opacity ${({ isScrolled }) => (isScrolled ? TIMING.LOGO_FADE_OUT : TIMING.LOGO_FADE_IN)}ms ease-in-out,
    visibility 0ms ${({ isScrolled }) => (isScrolled ? TIMING.LOGO_FADE_OUT : TIMING.LOGO_FADE_IN)}ms;
  transition-delay: ${({ isScrolled }) => (isScrolled ? '0ms' : `${TIMING.V_SPIN_OUT + TIMING.LOGO_DELAY_BACK}ms`)};
  pointer-events: none;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

/* STUDIO bilde - forsvinner og kommer tilbake */
const StudioImg = styled.img`
  height: 45px;
  opacity: ${({ isScrolled }) => (isScrolled ? 0 : 1)};
  visibility: ${({ isScrolled }) => (isScrolled ? 'hidden' : 'visible')};
  transition: 
    opacity ${({ isScrolled }) => (isScrolled ? TIMING.LOGO_FADE_OUT : TIMING.LOGO_FADE_IN)}ms ease-in-out,
    visibility 0ms ${({ isScrolled }) => (isScrolled ? TIMING.LOGO_FADE_OUT : TIMING.LOGO_FADE_IN)}ms;
  transition-delay: ${({ isScrolled }) => (isScrolled ? '0ms' : `${TIMING.V_SPIN_OUT + TIMING.LOGO_DELAY_BACK}ms`)};
  pointer-events: none;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

/* V-en som spinner og skaleres - kommer først etter logoene er borte */
const VoteVImg = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  height: 55px;
  pointer-events: none;
  transform-origin: center;

  /* Default: completely hidden */
  opacity: 0;
  visibility: hidden;

  /* Animasjonslogikk */
  ${({ isScrolled, $hasScrolledFromTop }) => {
    if (isScrolled && $hasScrolledFromTop) {
      // Scrollet ned - V kommer inn ETTER logoene er borte
      const totalDelay = TIMING.LOGO_FADE_OUT + TIMING.V_DELAY;
      return css`
        visibility: visible;
        animation: ${spinGrow} ${TIMING.V_SPIN_IN}ms ease-out ${totalDelay}ms forwards;
      `;
    } else if ($hasScrolledFromTop) {
      // Scrollet opp - V forsvinner FØRST, så kommer logoene
      return css`
        visibility: visible;
        animation: ${spinBack} ${TIMING.V_SPIN_OUT}ms ease-in forwards;
      `;
    }
    return css`
      opacity: 0;
      visibility: hidden;
      animation: none;
    `;
  }}

  @media (max-width: 768px) {
    position: static;
    height: 45px;
    opacity: 1 !important;
    visibility: visible !important;
    animation: none !important;
    transform: none !important;
  }
`;

/* ===================== Component ===================== */

const Header = () => {
  const location = useLocation();
  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasScrolledFromTop, setHasScrolledFromTop] = useState(false);
  const [showTop, setShowTop] = useState(false);

  // Desktop hover state - using refs for independent animations
  const navItemRefs = useRef({});

  // Mobile menu ref
  const mobileContainerRef = useRef(null);

  // Track if user has scrolled from the very top
  const hasScrolledFromTopRef = useRef(false);

  // Reset scroll state when navigating to new pages
  useEffect(() => {
    setHasScrolledFromTop(false);
    setIsScrolled(false);
    setShowTop(false);
    hasScrolledFromTopRef.current = false;

    // Ensure we're at the top when navigating to new pages
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;

      // Always check current scroll position first
      setIsScrolled(scrollY >= 50);

      // Only enable V animation if user scrolls from the very top (0) to > 0
      if (scrollY === 0) {
        setIsScrolled(false);
        // Don't reset hasScrolledFromTop immediately - let CSS animation complete
      } else if (hasScrolledFromTopRef.current === false && scrollY > 0) {
        // Only trigger when user actively scrolls from 0 to > 0
        setHasScrolledFromTop(true);
        hasScrolledFromTopRef.current = true;
      }

      setShowTop(scrollY >= 200);
    };

    // More robust initialization - ensure V is hidden on load
    const initializeScroll = () => {
      // CRITICAL: Always start with V hidden, regardless of scroll position
      setHasScrolledFromTop(false);
      setIsScrolled(false);
      hasScrolledFromTopRef.current = false;

      // Check current scroll position
      const scrollY = window.scrollY;
      setIsScrolled(scrollY >= 50);
      setShowTop(scrollY >= 200);

      // V logo should NEVER be visible on page load/refresh
      // Animation only triggers when user scrolls from 0 to > 0
      // If scrollY > 0 on load, keep V hidden - user didn't scroll from top
    };

    // Use requestAnimationFrame for more reliable initialization
    requestAnimationFrame(initializeScroll);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Separate effect to handle state reset after reverse animation
  useEffect(() => {
    if (hasScrolledFromTop && !isScrolled) {
      // User scrolled back to top - reset state after ALL animations complete
      const totalAnimationTime = TIMING.V_SPIN_OUT + TIMING.LOGO_DELAY_BACK + TIMING.LOGO_FADE_IN;
      const timer = setTimeout(() => {
        setHasScrolledFromTop(false);
        hasScrolledFromTopRef.current = false;
      }, totalAnimationTime + 100);

      return () => clearTimeout(timer);
    }
  }, [hasScrolledFromTop, isScrolled]);

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

  // Uavhengige animasjoner - direkte DOM-manipulasjon
  const handleMouseEnter = (idx) => {
    const el = navItemRefs.current[idx];
    if (!el) return;

    // Fjern exit-animasjonen hvis den kjører
    el.classList.remove('nav-slide-out');

    // Hvis enter-animasjon allerede kjører, restart den
    if (el.classList.contains('nav-slide-in')) {
      el.classList.remove('nav-slide-in');
      // Dobbel requestAnimationFrame sikrer restart
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add('nav-slide-in');
        });
      });
    } else {
      // Første gang - bare legg til klassen
      el.classList.add('nav-slide-in');
    }
  };

  const handleMouseLeave = (idx) => {
    const el = navItemRefs.current[idx];
    if (!el) return;

    // Fjern enter-animasjonen hvis den kjører
    el.classList.remove('nav-slide-in');

    // Hvis exit-animasjon allerede kjører, restart den
    if (el.classList.contains('nav-slide-out')) {
      el.classList.remove('nav-slide-out');
      // Dobbel requestAnimationFrame sikrer restart
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add('nav-slide-out');
        });
      });
    } else {
      // Første gang - bare legg til klassen
      el.classList.add('nav-slide-out');
    }
  };

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <Logo href="/" textColor={textColor} isScrolled={isScrolled} onClick={() => window.location.href = '/'}>
        <Logodiv isScrolled={isScrolled}>
          <LogoStage>
            <VintraImg src={Vintra} alt="Vintra" isScrolled={isScrolled} />
            <StudioImg src={Studio} alt="Studio" isScrolled={isScrolled} />
            <VoteVImg src={VOTE_V} alt="V" isScrolled={isScrolled} $hasScrolledFromTop={hasScrolledFromTopRef.current} />
          </LogoStage>
        </Logodiv>
      </Logo>

      {/* DESKTOP NAV */}
      <NavMenu isScrolled={isScrolled}>
        {items.map((item, idx) => (
          <NavItem
            key={item.href}
            ref={el => navItemRefs.current[idx] = el}
            href={item.href}
            textColor={textColor}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
          >
            {item.label}
          </NavItem>
        ))}
      </NavMenu>

      <ScrollTopButton
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        visible={showTop}
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#ffffff" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ScrollTopButton>

      {/* HAMBURGER (mobile) */}
      <HamburgerButton onClick={toggleMenu} isOpen={menuState.isOpen} textColor={textColor}>
        <span /><span /><span />
      </HamburgerButton>

      {/* MOBILE NAV */}
      <MobileNavMenu
        isOpen={menuState.isOpen}
        isVisible={menuState.isVisible}
      >
        {items.map((item, idx) => (
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
  );
};

export default Header;