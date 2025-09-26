import React from 'react';
import styled, { keyframes } from 'styled-components';
import { BsSpeedometer2 } from 'react-icons/bs';
import { FiLoader } from 'react-icons/fi';

// Animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const dots = keyframes`
  0%, 20% { color: rgba(255, 255, 255, 0.3); }
  40% { color: rgba(255, 255, 255, 1); }
  100% { color: rgba(255, 255, 255, 0.3); }
`;

// Styled Components
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: ${fadeInUp} 0.8s ease-out;
  z-index: 10;
`;

const LogoContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #60a5fa, #a78bfa, #f472b6, #60a5fa);
    border-radius: 32px;
    z-index: -1;
    animation: ${spin} 3s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: ${shimmer} 2s infinite;
    border-radius: 30px;
  }
`;

const LogoIcon = styled(BsSpeedometer2)`
  font-size: 48px;
  color: #60a5fa;
  z-index: 1;
`;

const LoadingTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.02em;
  text-align: center;
`;

const LoadingSubtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-align: center;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
`;

const SpinnerIcon = styled(FiLoader)`
  font-size: 24px;
  color: #60a5fa;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const LoadingDots = styled.span`
  &::after {
    content: '...';
    animation: ${dots} 1.5s infinite;
  }
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
    animation: ${shimmer} 1.5s infinite;
    border-radius: 2px;
  }
`;

const StatusIndicators = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)'};
  animation: ${props => props.active ? pulse : 'none'} 1s ease-in-out infinite;
  transition: all 0.3s ease;
`;

// Main Loading Component
export const AdminLoadingScreen = ({ 
  title = "Admin Panel", 
  subtitle = "Initializing secure dashboard...",
  showProgress = true,
  showDots = true 
}) => {
  return (
    <LoadingContainer>
      <LoadingContent>
        <LogoContainer>
          <LogoIcon />
        </LogoContainer>
        
        <div style={{ textAlign: 'center' }}>
          <LoadingTitle>{title}</LoadingTitle>
          <LoadingSubtitle>{subtitle}</LoadingSubtitle>
        </div>
        
        <LoadingSpinner>
          <SpinnerIcon />
          <LoadingText>
            Loading{showDots && <LoadingDots />}
          </LoadingText>
        </LoadingSpinner>
        
        {showProgress && <ProgressBar />}
        
        <StatusIndicators>
          <StatusDot active />
          <StatusDot />
          <StatusDot />
          <StatusDot />
        </StatusIndicators>
      </LoadingContent>
    </LoadingContainer>
  );
};

// Compact Loading Component for smaller sections
export const CompactLoader = ({ 
  size = 'medium', 
  text = 'Loading...', 
  color = '#60a5fa' 
}) => {
  const sizes = {
    small: { container: '120px', icon: '20px', text: '14px' },
    medium: { container: '200px', icon: '24px', text: '16px' },
    large: { container: '300px', icon: '32px', text: '18px' }
  };

  const CompactContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 32px;
    min-height: ${sizes[size].container};
    color: rgba(255, 255, 255, 0.8);
    animation: ${fadeInUp} 0.6s ease-out;
  `;

  const CompactSpinner = styled(FiLoader)`
    font-size: ${sizes[size].icon};
    color: ${color};
    animation: ${spin} 1s linear infinite;
  `;

  const CompactText = styled.span`
    font-size: ${sizes[size].text};
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  `;

  return (
    <CompactContainer>
      <CompactSpinner />
      <CompactText>{text}</CompactText>
    </CompactContainer>
  );
};

// Skeleton Loading Component for data tables
export const SkeletonLoader = ({ rows = 5, columns = 4 }) => {
  const SkeletonContainer = styled.div`
    padding: 24px;
    animation: ${fadeInUp} 0.6s ease-out;
  `;

  const SkeletonRow = styled.div`
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  `;

  const SkeletonItem = styled.div`
    height: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: ${shimmer} 1.5s infinite;
    }
  `;

  return (
    <SkeletonContainer>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonItem key={colIndex} />
          ))}
        </SkeletonRow>
      ))}
    </SkeletonContainer>
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({ 
  isVisible = false, 
  text = 'Processing...', 
  transparent = false 
}) => {
  if (!isVisible) return null;

  const OverlayContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${transparent ? 'rgba(0, 0, 0, 0.3)' : 'rgba(15, 23, 42, 0.95)'};
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: ${fadeInUp} 0.3s ease-out;
  `;

  const OverlayContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  `;

  return (
    <OverlayContainer>
      <OverlayContent>
        <SpinnerIcon style={{ fontSize: '32px' }} />
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
          {text}
        </span>
      </OverlayContent>
    </OverlayContainer>
  );
};

export default AdminLoadingScreen;
