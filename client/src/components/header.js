import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: linear-gradient(
    ${({ isScrolled }) =>
      isScrolled ? 'black, black, transparent' : 'black, black, black, transparent'}
  );
  transition: background-image 0.3s ease-in-out;
  @media (max-width: 768px) { padding: 1rem 2rem; }
`;

const Logo = styled.a`
  margin-top: ${({ isScrolled }) => (isScrolled ? '-10px' : '0')};
  font-size: 2rem;
  font-weight: 700;
  color: ${({ textColor }) => textColor};
  text-decoration: none;
  letter-spacing: 2px;
  transition: margin-top 0.1s ease-in-out;
`;
const NavMenu = styled.nav`
  margin-top: ${({ isScrolled }) => (isScrolled ? '-10px' : '0')};
  display: flex;
  gap: 2.5rem;
  transition: margin-top 0.1s ease-in-out;

  @media (max-width: 768px) {
    display: none;
  }
`;
/* Desktop underline: glir inn fra venstre, sklir ut mot høyre med “spiss” hale */
const wipeRight = keyframes`
  0%   { transform: translateX(0) scaleX(1);   border-radius: 2px; filter: blur(0.3px); opacity: 1; }
  35%  { transform: translateX(30%) scaleX(0.8); border-radius: 1px; filter: blur(0.2px); }
  75%  { transform: translateX(92%) scaleX(0.22); border-radius: 0; filter: blur(0); opacity: .92; }
  100% { transform: translateX(100%) scaleX(0);  border-radius: 0; opacity: 0.75; }
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

  &:hover {
    color: ${({ textColor }) =>
      textColor === 'black' ? '#333' : '#f0f0f0'};
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px; /* litt tynnere enn originalen */
    background: currentColor;
    transform: scale3d(0,1,1);
    transform-origin: 0 50%;
    transition: transform 0.5s ease;
  }

  &:hover::before {
    transform: scale3d(1,1,1);
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
  width: 30px; height: 20px;
  position: relative;
  @media (max-width: 768px) { display: block; }

  span {
    display: block;
    position: absolute;
    height: 2px; width: 100%;
    background: ${({ isOpen, textColor }) => (isOpen ? 'black' : textColor)};
    border-radius: 2px;
    transition: all 0.25s ease-in-out;
    &:nth-child(1) { top: ${({ isOpen }) => (isOpen ? '9px' : '0')};
      transform: ${({ isOpen }) => (isOpen ? 'rotate(45deg)' : 'none')}; }
    &:nth-child(2) { top: 9px; opacity: ${({ isOpen }) => (isOpen ? 0 : 1)}; }
    &:nth-child(3) { top: ${({ isOpen }) => (isOpen ? '9px' : '18px')};
      transform: ${({ isOpen }) => (isOpen ? 'rotate(-45deg)' : 'none')}; }
  }
`;

const fadeIn = keyframes`from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}`;
const fadeOut = keyframes`from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}`;

/* Mobilmeny container med plass til en glidende indikator */
const MobileNavMenu = styled.nav`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  position: fixed; inset: 0;
  background: white;
  padding: 2rem 1.25rem 3.25rem; /* ekstra bunn-padding for indikator */
  gap: 1.5rem;
  z-index: 1000;
  animation: ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} 0.3s ease-out;

  /* gjør container relativ for indikatoren */
  position: fixed;
`;

/* Mobil elementer */
const MobileNavItem = styled.a`
  font-size: 1.5rem;
  padding: 0.75rem 0.25rem;
  color: black;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
`;

/* Mobil indikator som glir under aktiv kategori */
const MobileIndicator = styled.div`
  position: absolute;
  left: 0;
  bottom: 1.5rem;        /* litt over bunnen for “under” linjene */
  height: 4px;
  background: black;
  border-radius: 2px;
  transition:
    left 480ms cubic-bezier(.22,.61,.36,1),
    width 480ms cubic-bezier(.22,.61,.36,1);
  box-shadow: 0 0 0.5px currentColor, 0 0 6px rgba(0,0,0,.15);

  /* en liten “hale” ved bevegelse: rund mer når i transit (valgfritt) */
`;

/* Scroll-to-top knapp */
const ScrollTopButton = styled.button`
  position: absolute;
  top: 100%;
  right: 4rem;
  margin-top: 0.5rem;
  width: 2.8rem;
  height: 2.8rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  &:hover { transform: translateY(-2px); }
  svg { width: 3.4rem; height: 3.4rem; fill: #fff; }
`;

const Header = () => {
  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  // Desktop hover state
  const [activeIdx, setActiveIdx] = useState(null);
  const [leavingIdx, setLeavingIdx] = useState(null);

  // Mobil: aktivt punkt + glidende indikatorposisjon
  const [mobileActive, setMobileActive] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const mobileContainerRef = useRef(null);
  const mobileRefs = useRef([]); // element refs for hver MobileNavItem

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY >= 50);
      setShowTop(window.scrollY >= 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    if (menuState.isOpen) {
      setMenuState(s => ({ ...s, isOpen: false }));
      setTimeout(() => setMenuState({ isOpen: false, isVisible: false }), 300);
    } else {
      setMenuState({ isOpen: true, isVisible: true });
      // når vi åpner menyen, posisjoner indikatoren på aktivt element
      requestAnimationFrame(() => {
        updateIndicator(mobileActive);
      });
    }
  };

  const textColor = 'white';
  const items = [
    { href: '/vote', label: 'Vote' },
    { href: '/about-us', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Support' },
  ];

  // Beregn indikatorens left/width relativt til container
  const updateIndicator = (idx) => {
    const container = mobileContainerRef.current;
    const el = mobileRefs.current[idx];
    if (!container || !el) return;

    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const left = eRect.left - cRect.left;
    const width = eRect.width;

    setIndicator({ left, width });
  };

  // Oppdater indikator når aktiv mobil-index endres, eller menyen (re)åpnes
  useEffect(() => {
    updateIndicator(mobileActive);
    // reflow ved resize for sikkerhets skyld
    const onResize = () => updateIndicator(mobileActive);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileActive, menuState.isVisible]);

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <Logo href="/" textColor={textColor} isScrolled={isScrolled}>
        Vintra Studios
      </Logo>

      {/* DESKTOP NAV */}
      <NavMenu isScrolled={isScrolled}>
        {items.map((it, idx) => {
          const cls =
            (activeIdx === idx ? 'is-active ' : '') +
            (leavingIdx === idx ? 'is-leaving' : '');
          return (
            <NavItem
              key={it.href}
              href={it.href}
              textColor={textColor}
              className={cls}
              onMouseEnter={() => {
                setActiveIdx(idx);
                setLeavingIdx(null);
              }}
              onMouseLeave={() => {
                setActiveIdx(null);
                setLeavingIdx(idx);
                setTimeout(() => setLeavingIdx(null), 960); // la ut-animasjon spille ferdig
              }}
            >
              {it.label}
              <span className="underline" aria-hidden />
            </NavItem>
          );
        })}
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

      {/* HAMBURGER (mobil) */}
      <HamburgerButton onClick={toggleMenu} isOpen={menuState.isOpen} textColor={textColor}>
        <span /><span /><span />
      </HamburgerButton>

      {/* MOBIL NAV – med glidende indikator */}
      <MobileNavMenu
        isOpen={menuState.isOpen}
        isVisible={menuState.isVisible}
        ref={mobileContainerRef}
      >
        {items.map((it, idx) => (
          <MobileNavItem
            key={it.href}
            href={it.href}
            ref={el => (mobileRefs.current[idx] = el)}
            onClick={(e) => {
              // la animasjonen synes – ikke lukk menyen umiddelbart
              e.preventDefault();
              setMobileActive(idx);
              updateIndicator(idx);
              // naviger litt etter slik at bevegelsen synes (valgfritt):
              setTimeout(() => { window.location.href = it.href; }, 180);
            }}
          >
            {it.label}
          </MobileNavItem>
        ))}

        {/* Indikatorstrek nederst, glir til valgt punkt */}
        <MobileIndicator
          style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }}
        />
      </MobileNavMenu>
    </HeaderContainer>
  );
};

export default Header;
