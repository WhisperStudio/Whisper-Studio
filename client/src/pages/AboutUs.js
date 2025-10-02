import React from 'react';
import styled, { keyframes } from 'styled-components';
import ProfileCard from '../components/ProfileCard';
import imgMartin from '../bilder/SeckerrNo.png';
import imgSebastian from '../bilder/kuktus.png';
import imgOscar from '../bilder/perrr.png';

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

const TeamSection = styled.div`
  margin: 120px auto 100px;
  max-width: 1100px;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 80px 80px;
  align-items: stretch;
  justify-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const TeamItem = styled.div`
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  /* Constrain the profile card so three fit nicely with clear gaps */
  & .pc-card {
    width: 100%;
    max-width: 320px;
    height: 460px; /* ensure visible height since inner content is absolutely positioned */
    min-height: 420px;
  }

  /* Make avatars a bit smaller on About Us */
  & .pc-avatar-content .avatar {
    width: 86% !important;
  }

  /* Make Sebastian (kaktus) image a bit smaller than others */
  & .is-sebastian .pc-avatar-content .avatar {
    width: 60% !important;
    bottom: 90px !important; /* move a bit lower (default is 100px) */
  }

  @media (max-width: 900px) {
    & .pc-card {
      max-width: 360px;
    }
  }
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

      {/* Team section placed at the very bottom */}
      <TeamSection>
        <TeamGrid>
          <TeamItem>
          <ProfileCard
            name="Martin"
            title="Founder"
            handle="martin"
            status="Online"
            contactText="Contact"
            avatarUrl={imgMartin}
            miniAvatarUrl={imgMartin}
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => {
              try {
                window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: 'Contact: Martin', description: 'Hei! Jeg vil gjerne komme i kontakt med Martin om et prosjekt.', category: 'general', priority: 'medium' } } }));
              } catch {}
            }}
          />
          </TeamItem>
          <TeamItem>
          <ProfileCard
            name="Sebastian"
            title="Co-Founder"
            handle="sebastian"
            status="Online"
            contactText="Contact"
            avatarUrl={imgSebastian}
            miniAvatarUrl={imgSebastian}
            className="is-sebastian"
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => {
              try {
                window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: 'Contact: Sebastian', description: 'Hei! Jeg vil gjerne komme i kontakt med Sebastian om et prosjekt.', category: 'general', priority: 'medium' } } }));
              } catch {}
            }}
          />
          </TeamItem>
          <TeamItem>
          <ProfileCard
            name="Oscar"
            title="Co-Founder"
            handle="oscar"
            status="Online"
            contactText="Contact"
            avatarUrl={imgOscar}
            miniAvatarUrl={imgOscar}
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => {
              try {
                window.dispatchEvent(new CustomEvent('openTickets', { detail: { tab: 'create', formData: { title: 'Contact: Oscar', description: 'Hei! Jeg vil gjerne komme i kontakt med Oscar om et prosjekt.', category: 'general', priority: 'medium' } } }));
              } catch {}
            }}
          />
          </TeamItem>
        </TeamGrid>
      </TeamSection>
    </AboutContainer>
  );
};

export default AboutUs;
