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

const CareersContainer = styled.div`
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

const JobListings = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const JobListing = styled.div`
  background-color: #1c1c1c;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  text-align: left;
  border: 1px solid #2a2a2a;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  animation: ${fadeIn} 0.8s ease-out;
  animation-fill-mode: backwards;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const JobInfo = styled.div``;

const JobTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const JobDetails = styled.p`
  font-size: 1rem;
  color: #a0a0a0;
`;

const ApplyButton = styled.a`
  display: inline-block;
  padding: 14px 28px;
  background-color: #4285F4;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease, transform 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: #3367d6;
    transform: scale(1.05);
  }
`;

const Careers = () => {
  return (
    <CareersContainer>
      <Title>Work With Us</Title>
      <Subtitle>
        Join our growing team and help shape the future of the digital landscape. We are looking for talented and motivated individuals who share our passion for innovation.
      </Subtitle>
      <JobListings>
        <JobListing style={{ animationDelay: '0.4s' }}>
          <JobInfo>
            <JobTitle>Frontend Developer (React)</JobTitle>
            <JobDetails>Oslo, Norway | Full-time</JobDetails>
            <JobDetails>1 Positions avaiable</JobDetails>
          </JobInfo>
          <ApplyButton href="mailto:jobs@vintrastudio.com?subject=Application for Frontend Developer">Apply Now</ApplyButton>
        </JobListing>
        <JobListing style={{ animationDelay: '0.6s' }}>
          <JobInfo>
            <JobTitle>Backend Developer (Node.js)</JobTitle>
            <JobDetails>Oslo, Norway | Full-time</JobDetails>
            <JobDetails>2 Positions avaiable</JobDetails>
          </JobInfo>
          <ApplyButton href="mailto:jobs@vintrastudio.com?subject=Application for Backend Developer">Apply Now</ApplyButton>
        </JobListing>
        <JobListing style={{ animationDelay: '0.8s' }}>
          <JobInfo>
            <JobTitle>UI/UX/Blender Designer</JobTitle>
            <JobDetails>Remote | Part-time</JobDetails>
            <JobDetails>2 Positions avaiable</JobDetails>
          </JobInfo>
          <ApplyButton href="mailto:jobs@vintrastudio.com?subject=Application for UI/UX Designer">Apply Now</ApplyButton>
        </JobListing>
                <JobListing style={{ animationDelay: '1s' }}>
          <JobInfo>
            <JobTitle>Game Developer "Unreal Engine"</JobTitle>
            <JobDetails>Oslo, Norway | Full-time</JobDetails>
            <JobDetails>2 Positions avaiable</JobDetails>
          </JobInfo>
          <ApplyButton href="mailto:jobs@vintrastudio.com?subject=Application for Game Developer">Apply Now</ApplyButton>
        </JobListing>
      </JobListings>
    </CareersContainer>
  );
};

export default Careers;
