import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AboutContainer = styled.div`
  padding: 120px 40px 80px;
  background-color: #0a0a0a;
  color: #ffffff;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  text-align: center;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: 1px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto 80px auto;
  line-height: 1.7;
  color: #b0b0b0;
  animation: ${fadeIn} 0.8s ease-out 0.2s;
  animation-fill-mode: backwards;
`;

const ContentSection = styled.div`
  max-width: 900px;
  margin: 0 auto;
  text-align: left;
  animation: ${fadeIn} 1s ease-out 0.4s;
  animation-fill-mode: backwards;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #4285F4;
  margin-bottom: 24px;
  border-left: 4px solid #4285F4;
  padding-left: 20px;
`;

const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #c0c0c0;
  margin-bottom: 24px;
`;

const AboutUs = () => {
  return (
    <AboutContainer>
      <Title>About Us</Title>
      <Subtitle>
        At Whisper Studio, we believe in the power of technology to craft exceptional digital experiences. We are a passionate collective of developers, designers, and strategists dedicated to pushing the boundaries of what's possible.
      </Subtitle>
      <ContentSection>
        <SectionTitle>Our Philosophy</SectionTitle>
        <Paragraph>
          Our mission is to merge elegant design with powerful technology to solve complex challenges and deliver groundbreaking solutions. We approach every project with a commitment to innovation, quality, and a deep understanding of our clients' needs. We don't just build products; we build partnerships.
        </Paragraph>
        <SectionTitle>Our Vision</SectionTitle>
        <Paragraph>
          We envision a digital world that is more intuitive, efficient, and beautiful. Through our work, we aim to set new standards for user experience and digital craftsmanship, creating platforms and tools that empower users and drive meaningful change. Our goal is to be at the forefront of the next wave of digital innovation.
        </Paragraph>
      </ContentSection>
    </AboutContainer>
  );
};

export default AboutUs;
