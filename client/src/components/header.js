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
    width:100%; height:2px;      /* <- you said a bit thinner */
    background: white;
    transform: scaleX(0);
    transform-origin:left center;
    border-radius:1px;
  }

  &.is-active::before{
    animation: ${slideInFromLeft} 0.45s cubic-bezier(.25,.46,.45,.94) forwards;
  }
  &.is-leaving::before{
    animation: ${slideOutToRight} 0.55s cubic-bezier(.25,.46,.45,.94) forwards;
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
  }
  span:nth-child(1){ top: ${({ isOpen }) => (isOpen ? '9px' : '0')};
    transform: ${({ isOpen }) => (isOpen ? 'rotate(45deg)' : 'none')}; }
  span:nth-child(2){ top: 9px; opacity: ${({ isOpen }) => (isOpen ? 0 : 1)}; }
  span:nth-child(3){ top: ${({ isOpen }) => (isOpen ? '9px' : '18px')};
    transform: ${({ isOpen }) => (isOpen ? 'rotate(-45deg)' : 'none')}; }
`;

const fadeIn = keyframes`from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}`;
const fadeOut = keyframes`from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-20px)}`;

const MobileNavMenu = styled.nav`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  position: fixed; inset: 0;
  background: white;
  padding: 2rem 1.25rem 3.25rem;
  gap: 1.5rem;
  z-index: 1000;
  animation: ${({ isOpen }) => (isOpen ? fadeIn : fadeOut)} 0.3s ease-out;
`;

const MobileNavItem = styled.a`
  font-size: 1.5rem;
  padding: 0.75rem 0.25rem;
  color: black;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
`;

const MobileIndicator = styled.div`
  position: absolute;
  left: 0;
  bottom: 1.5rem;
  height: 4px;
  background: black;
  border-radius: 2px;
  transition: left 480ms cubic-bezier(.22,.61,.36,1),
              width 480ms cubic-bezier(.22,.61,.36,1);
  box-shadow: 0 0 0.5px currentColor, 0 0 6px rgba(0,0,0,.15);
`;

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

const Header = () => {
  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  // Desktop hover state (single index or null)
  const [activeIdx, setActiveIdx] = useState(null);
  const [leavingIdx, setLeavingIdx] = useState(null);

  // Mobile indicator
  const [mobileActive, setMobileActive] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const mobileContainerRef = useRef(null);
  const mobileRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY >= 50);
      setShowTop(window.scrollY >= 200);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => {
    if (menuState.isOpen) {
      setMenuState(s => ({ ...s, isOpen: false }));
      setTimeout(() => setMenuState({ isOpen: false, isVisible: false }), 300);
    } else {
      setMenuState({ isOpen: true, isVisible: true });
      requestAnimationFrame(() => updateIndicator(mobileActive));
    }
  };

  const textColor = 'white';
  const items = [
    { href: '/vote',     label: 'Vote' },
    { href: '/about-us', label: 'About Us' },
    { href: '/careers',  label: 'Careers' },
    { href: '/contact',  label: 'Support' },
  ];

  const updateIndicator = (idx) => {
    const container = mobileContainerRef.current;
    const el = mobileRefs.current[idx];
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setIndicator({ left: eRect.left - cRect.left, width: eRect.width });
  };

  useEffect(() => {
    updateIndicator(mobileActive);
    const onResize = () => updateIndicator(mobileActive);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileActive, menuState.isVisible]);

  const handleMouseEnter = (idx) => {
    setActiveIdx(idx);
    setLeavingIdx(null);
  };

  const handleMouseLeave = (idx) => {
    setActiveIdx(null);
    setLeavingIdx(idx);
    // clear after the out-animation completes
    setTimeout(() => setLeavingIdx(null), 600);
  };

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <Logo href="/" textColor={textColor} isScrolled={isScrolled}>
        Vintra Studios
      </Logo>

      {/* DESKTOP NAV */}
      <NavMenu isScrolled={isScrolled}>
        {items.map((item, idx) => {
          const className =
            (activeIdx === idx ? 'is-active ' : '') +
            (leavingIdx === idx ? 'is-leaving' : '');
        return (
          <NavItem
            key={item.href}
            href={item.href}
            textColor={textColor}
            className={className.trim()}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={() => handleMouseLeave(idx)}
          >
            {item.label}
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

      {/* MOBIL NAV */}
      <MobileNavMenu
        isOpen={menuState.isOpen}
        isVisible={menuState.isVisible}
        ref={mobileContainerRef}
      >
        {items.map((item, idx) => (
          <MobileNavItem
            key={item.href}
            href={item.href}
            ref={el => (mobileRefs.current[idx] = el)}
            onClick={(e) => {
              e.preventDefault();
              setMobileActive(idx);
              updateIndicator(idx);
              setTimeout(() => { window.location.href = item.href; }, 180);
            }}
          >
            {item.label}
          </MobileNavItem>
        ))}

        <MobileIndicator style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }} />
      </MobileNavMenu>
    </HeaderContainer>
  );
};

export default Header;
