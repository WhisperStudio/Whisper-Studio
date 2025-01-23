import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  background-color: ${({ isScrolled }) => (isScrolled ? 'black' : 'transparent')};

  @media (max-width: 768px) {
    padding: 1rem 2rem;
  }
`;

const Logo = styled.a`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ textColor }) => textColor};
  text-decoration: none;
  letter-spacing: 2px;
`;

const NavMenu = styled.nav`
  display: flex;
  gap: 2.5rem;

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
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: ${({ textColor }) => textColor};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${({ textColor }) => textColor === 'black' ? '#333' : '#f0f0f0'};
    &::after {
      width: 100%;
      left: 0;
      right: auto;
    }
  }

  &:not(:hover) {
    &::after {
      left: auto;
      right: 0;
      width: 0;
    }
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
  width: 30px;
  height: 20px;
  position: relative;

  @media (max-width: 768px) {
    display: block;
  }

  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: ${({ isOpen, textColor }) => isOpen ? 'black' : textColor};
    border-radius: 2px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: .25s ease-in-out;

    &:nth-child(1) {
      top: ${({ isOpen }) => (isOpen ? '9px' : '0px')};
      transform: ${({ isOpen }) => (isOpen ? 'rotate(45deg)' : 'none')};
    }

    &:nth-child(2) {
      top: 9px;
      opacity: ${({ isOpen }) => (isOpen ? '0' : '1')};
    }

    &:nth-child(3) {
      top: ${({ isOpen }) => (isOpen ? '9px' : '18px')};
      transform: ${({ isOpen }) => (isOpen ? 'rotate(-45deg)' : 'none')};
    }
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const MobileNavMenu = styled.nav`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

  &::after {
    background-color: black;
  }

  &:hover {
    color: #333;
  }
`;

const Header = () => {
  const [menuState, setMenuState] = useState({ isOpen: false, isVisible: false });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Skift bakgrunn når du har scrollet 50px eller mer
      setIsScrolled(window.scrollY >= 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    if (menuState.isOpen) {
      setMenuState({ ...menuState, isOpen: false });
      setTimeout(() => setMenuState({ isOpen: false, isVisible: false }), 300);
    } else {
      setMenuState({ isOpen: true, isVisible: true });
    }
  };

  // Endre tekstfargen basert på scrolled status
  const textColor = isScrolled ? 'white' : 'white';

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <Logo href="/" textColor={textColor}>Whisper Studios</Logo>
      <NavMenu>
        <NavItem href="#" textColor={textColor}>Placeholder</NavItem>
        <NavItem href="#" textColor={textColor}>Placeholder</NavItem>
        <NavItem href="#" textColor={textColor}>Placeholder</NavItem>
        <NavItem href="#" textColor={textColor}>Placeholder</NavItem>
      </NavMenu>
      <HamburgerButton onClick={toggleMenu} isOpen={menuState.isOpen} textColor={textColor}>
        <span></span>
        <span></span>
        <span></span>
      </HamburgerButton>
      <MobileNavMenu isOpen={menuState.isOpen} isVisible={menuState.isVisible}>
        <MobileNavItem href="#" onClick={toggleMenu}>Placeholder</MobileNavItem>
        <MobileNavItem href="#" onClick={toggleMenu}>Placeholder</MobileNavItem>
        <MobileNavItem href="#" onClick={toggleMenu}>Placeholder</MobileNavItem>
        <MobileNavItem href="#" onClick={toggleMenu}>Placeholder</MobileNavItem>
      </MobileNavMenu>
    </HeaderContainer>
  );
};

export default Header;