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
      isScrolled
        ? 'black, black, transparent'
        : 'black, black, black, transparent'}
  );
  transition: background-image 0.3s ease-in-out;
  @media (max-width: 768px) {
    padding: 1rem 2rem;
  }
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

const NavItem = styled.a`
  color: ${({ textColor }) => textColor};
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 1rem;
  position: relative;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 0; height: 2px;
    background-color: ${({ textColor }) => textColor};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${({ textColor }) => (textColor === 'black' ? '#333' : '#f0f0f0')};
    &::after {
      width: 100%;
    }
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

  @media (max-width: 768px) {
    display: block;
  }

  span {
    display: block;
    position: absolute;
    height: 2px; width: 100%;
    background: ${({ isOpen, textColor }) => (isOpen ? 'black' : textColor)};
    border-radius: 2px;
    transition: all 0.25s ease-in-out;

    &:nth-child(1) {
      top: ${({ isOpen }) => (isOpen ? '9px' : '0')};
      transform: ${({ isOpen }) => (isOpen ? 'rotate(45deg)' : 'none')};
    }
    &:nth-child(2) {
      top: 9px;
      opacity: ${({ isOpen }) => (isOpen ? 0 : 1)};
    }
    &:nth-child(3) {
      top: ${({ isOpen }) => (isOpen ? '9px' : '18px')};
      transform: ${({ isOpen }) => (isOpen ? 'rotate(-45deg)' : 'none')};
    }
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px) }
  to   { opacity: 1; transform: translateY(0) }
`;
const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0) }
  to   { opacity: 0; transform: translateY(-20px) }
`;

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
  width: 2.8;
  height: 2.8;
  background: transparent;
  border: none;
  cursor: pointer;
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  svg {
    width: 3.4rem;
    height: 3.4rem;
    fill: #fff;
  }
`;



const Header = () => {
  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const textColor = 'white';

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <Logo href="/" textColor={textColor} isScrolled={isScrolled}>
        Vintra Studios
      </Logo>

      <NavMenu isScrolled={isScrolled}>
        <NavItem href="/vote" textColor={textColor}>VOTE</NavItem>
        <NavItem href="/who-we-are" textColor={textColor}>Who we are</NavItem>
        <NavItem href="/work-with-us" textColor={textColor}>Work with us</NavItem>
        <NavItem href="/contact" textColor={textColor}>Support</NavItem>
      </NavMenu>

      <ScrollTopButton
        onClick={scrollToTop}
        visible={showTop}
        aria-label="Scroll to top"
      >
<svg  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>      </ScrollTopButton>



      <HamburgerButton
        onClick={toggleMenu}
        isOpen={menuState.isOpen}
        textColor={textColor}
      >
        <span />
        <span />
        <span />
      </HamburgerButton>

      <MobileNavMenu
        isOpen={menuState.isOpen}
        isVisible={menuState.isVisible}
      >
        <MobileNavItem href="/vote"   onClick={toggleMenu}>VOTE</MobileNavItem>
        <MobileNavItem href="/who-we-are" onClick={toggleMenu}>Who we are</MobileNavItem>
        <MobileNavItem href="/work-with-us" onClick={toggleMenu}>Work with us</MobileNavItem>
        <MobileNavItem href="/contact" onClick={toggleMenu}>Support</MobileNavItem>
      </MobileNavMenu>
    </HeaderContainer>
  );
};

export default Header;
