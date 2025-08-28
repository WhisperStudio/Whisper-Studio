import React, { useState, useEffect } from 'react';
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
  @media (max-width: 768px) { display: none; }
`;

/* ——— Effekter for underline ——— */
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
  padding: 0.75rem 1rem;
  transition: color .25s ease;

  &:hover {
    color: ${({ textColor }) => (textColor === 'black' ? '#333' : '#f0f0f0')};
  }

  /* Underline-linjen */
  .underline {
    position: absolute;
    left: 0; bottom: 0;
    height: 2px;
    width: 100%;
    background: currentColor;
    transform-origin: left center;
    transform: scaleX(0);
    opacity: 1;
    will-change: transform, opacity, filter, border-radius, clip-path, box-shadow;
    transition:
      transform 760ms cubic-bezier(.19,1,.22,1),
      filter   420ms ease,
      border-radius 420ms ease,
      box-shadow 420ms ease;
    /* litt glød i ro */
    box-shadow: 0 0 0.5px currentColor, 0 0 6px rgba(255,255,255,.15);

    /* “spiss” i bevegelse: smal midtseksjon */
    clip-path: polygon(0% 50%, 96% 0%, 100% 50%, 96% 100%, 0% 50%);
  }

  /* Hover INN – bygges fra venstre, roligere og blir flat i ro */
  &.is-active .underline {
    transform: scaleX(1);
    filter: blur(0);
    border-radius: 2px;
    /* flat når den står stille */
    clip-path: polygon(0% 0%,100% 0%,100% 100%,0% 100%);
  }

  /* Hover UT – sklir ut mot høyre ~0.95s og dør gradvis */
  &.is-leaving .underline {
    animation: ${wipeRight} 950ms cubic-bezier(.22,.61,.36,1) forwards;
    /* gjør kantene spisse mens den reiser */
    clip-path: polygon(0% 50%, 96% 0%, 100% 50%, 96% 100%, 0% 50%);
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

const MobileNavMenu = styled.nav`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed; inset: 0;
  background: white;
  padding: 2rem;
  gap: 2rem;
  z-index: 1000;
  animation: ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} 0.3s ease-out;
`;

const MobileNavItem = styled(NavItem)`
  font-size: 1.5rem;
  padding: 1rem;
  color: black;
  &::after { background-color: black; }
  &:hover { color: #333; }
`;

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

  // Hvilken item er aktiv/leaving (index)
  const [activeIdx, setActiveIdx] = useState(null);
  const [leavingIdx, setLeavingIdx] = useState(null);


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
    }
  };

  const textColor = 'white';
  const items = [
    { href: '/vote', label: 'Vote' },
    { href: '/about-us', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Support' },
  ];

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <Logo href="/" textColor={textColor} isScrolled={isScrolled}>
        Vintra Studios
      </Logo>

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
          // la ~0.95s ut-animasjon få spille helt ut
          setTimeout(() => setLeavingIdx(null), 960);
        }}
      >
        {it.label}
        <span className="underline" aria-hidden />
      </NavItem>
    );
  })}
</NavMenu>



      <ScrollTopButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        visible={showTop} aria-label="Scroll to top">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#ffffff" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ScrollTopButton>

      <HamburgerButton onClick={toggleMenu} isOpen={menuState.isOpen} textColor={textColor}>
        <span /><span /><span />
      </HamburgerButton>

      <MobileNavMenu isOpen={menuState.isOpen} isVisible={menuState.isVisible}>
        {items.map(it => (
          <MobileNavItem key={it.href} href={it.href} onClick={toggleMenu}>
            {it.label}
            <span className="underline" aria-hidden />
          </MobileNavItem>
        ))}
      </MobileNavMenu>
    </HeaderContainer>
  );
};

export default Header;
