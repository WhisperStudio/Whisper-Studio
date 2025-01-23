import React from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaPhone, FaGithub, FaDiscord } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #0a0a0a;
  color: white;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #03A9F4, #2196F3, #8E24AA, #7B1FA2);
    animation: fade 5s ease-in-out infinite;
  }

  @keyframes fade {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @media (max-width: 768px) {
    padding: 20px 10px;
    gap: 20px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 10px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 30px;
    height: 2px;
    background-color: #8E24AA;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    gap: 5px;
  }
`;

const Link = styled.a`
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #7B1FA2;
  }
`;

const Copyright = styled.p`
  font-size: 0.9rem;
  opacity: 0.7;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <ContentWrapper>
        <Column>
          <Title>About Whisper Studio</Title>
          <p>Empowering game development through creative and immersive experiences.</p>
        </Column>
        <Column>
          <Title>Get in Touch</Title>
          <ContactItem>
            <FaEnvelope />
            <Link href="mailto:info@whisperstudio.com">info@whisperstudio.com</Link>
          </ContactItem>
          <ContactItem>
            <FaPhone />
            <Link href="tel:+1234567890">+1234567890</Link>
          </ContactItem>
        </Column>
        <Column>
          <Title>Connect</Title>
          <ContactItem>
            <FaGithub />
            <Link href="https://github.com/whisperstudio" target="_blank" rel="noopener noreferrer">github.com/whisperstudio</Link>
          </ContactItem>
          <ContactItem>
            <FaDiscord />
            <Link href="https://discord.com/invite/whisperstudio" target="_blank" rel="noopener noreferrer">discord.com/invite/whisperstudio</Link>
          </ContactItem>
        </Column>
      </ContentWrapper>
      <Copyright> 2025 Whisper Studio. All rights reserved.</Copyright>
    </FooterContainer>
  );
};

export default Footer;
