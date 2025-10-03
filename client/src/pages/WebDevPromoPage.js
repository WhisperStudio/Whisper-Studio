import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiCopy, FiDollarSign, FiPackage, FiRefreshCw, FiSliders, FiZap, FiMessageCircle, FiChevronDown, FiChevronUp, FiDatabase, FiShield, FiGlobe } from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import Header from '../components/header';
import Footer from '../components/footer';

// ---------- Global Styles ----------
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #0b1121;
    color: #e2e8f0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// ---------- Animations ----------
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`;

// ---------- Styled Components ----------
const PageWrapper = styled.div`
  background: radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,0.15), transparent),
              radial-gradient(900px 500px at 90% 20%, rgba(236,72,153,0.12), transparent),
              #0b1121;
  min-height: 100vh;
  overflow-x: hidden;
`;

const ContentContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 2rem 4rem;
  animation: ${fadeIn} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 5rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #94a3b8;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const EstimatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GlassPanel = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  padding: 2rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
`;

const CalculatorForm = styled(GlassPanel)``;
const ResultsPanel = styled(GlassPanel)`
  position: sticky;
  top: 100px;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DisclaimerText = styled.p`
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: rgba(148, 163, 184, 0.1);
  border-left: 3px solid #a78bfa;
  border-radius: 4px;
`;

const EstimateNote = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
  display: block;
  margin-top: 0.25rem;
`;

const ControlGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ValueDisplay = styled.span`
  font-weight: 600;
  color: #a78bfa;
`;

const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 3px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #a78bfa;
    cursor: pointer;
    border-radius: 50%;
    border: 3px solid #0b1121;
    transition: background 0.2s;

    &:hover {
      background: #c4b5fd;
    }
  }
`;

const ToggleGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ToggleLabel = styled.label`
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:hover {
    background: rgba(148, 163, 184, 0.2);
  }

  ${({ checked }) => checked && `
    background: rgba(167, 139, 250, 0.2);
    border-color: rgba(167, 139, 250, 0.5);
  `}
  
  ${({ disabled }) => disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const ToggleCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const ToggleTitle = styled.span`
  font-weight: 600;
  color: #fff;
`;

const ToggleDescription = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const TotalDisplay = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const PriceLabel = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin: 0 0 0.5rem;
`;

const PriceValue = styled.h3`
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PriceQualifier = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
`;

const ActionButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
`;

const SmallActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SmallButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

// Language switcher
const LangSwitchWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const LangToggle = styled.button`
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
  padding: 0.3rem 0.55rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &.active {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    border-color: transparent;
    color: #fff;
  }
`;

// Preview Panel
const PreviewPanel = styled(GlassPanel)`
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    margin-top: 2rem;
  }
`;

const MockBrowserHeader = styled.div`
  background: #1e293b;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const MockBrowserButton = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

// View Switcher for Admin Panel
const ViewSwitcher = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 4px;
  margin: 1rem;
  animation: ${slideIn} 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const ViewButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? '#fff' : '#94a3b8'};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  
  &:hover {
    color: ${props => props.active ? '#fff' : '#cbd5e1'};
  }
  
  ${props => props.active && css`
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  `}
`;

// Admin Panel
const AdminPanel = styled.div`
  padding: 1.5rem;
  background: linear-gradient(135deg, #1e293b, #334155);
  animation: ${fadeIn} 0.5s ease-out;
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
`;

const AdminTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 8px;
  padding: 1rem;
  
  h4 {
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
    margin: 0 0 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  p {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
  }
`;

const AdminMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AdminMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: #cbd5e1;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateX(4px);
  }
`;

// Website Mock
const MockWebsite = styled.div`
  position: relative;
  flex-grow: 1;
  padding: 1.5rem;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  background: #e2e8f0;

  ${({ design }) => design === 'premium' && css`
    background:
      radial-gradient(800px 180px at 10% 0%, rgba(99,102,241,0.10), transparent 60%),
      linear-gradient(180deg, rgba(67, 56, 202, 0.06), rgba(67, 56, 202, 0) 220px),
      #f0f2f5;
    border-top: 4px solid rgba(67, 56, 202, 0.2);
    border-radius: 14px;
  `}

  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
    background-size: 400% 400%;
    animation: ${gradientAnimation} 15s ease-in-out infinite;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 16px;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 16px;
      pointer-events: none;
      background:
        radial-gradient(600px 200px at 80% -10%, rgba(167,139,250,0.15), transparent),
        radial-gradient(400px 150px at 10% 110%, rgba(244,114,182,0.12), transparent);
      animation: ${glowPulse} 8s ease-in-out infinite;
    }
  `}
`;

const MockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
`;

const MockLogo = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  color: ${props => props.color || '#1e293b'};
`;

const MockNav = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  position: relative;
`;

const MockNavLink = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.color || '#475569'};
  transition: all 0.3s ease;
  
  ${({ design }) => design === 'premium' && css`
    padding: 0.4rem 0.8rem;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(99, 102, 241, 0.2);
    
    &:hover {
      background: rgba(99, 102, 241, 0.2);
      transform: translateY(-2px);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    padding: 0.4rem 0.8rem;
    background: rgba(167, 139, 250, 0.15);
    border-radius: 6px;
    border: 1px solid rgba(167, 139, 250, 0.3);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.3), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
    }
  `}
`;

const MockHero = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const MockTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  color: #1e293b;
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #c4b5fd, #f9a8d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

const MockSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.color || '#64748b'};
  margin: 0 auto 1.5rem;
  max-width: 80%;
`;

const MockButton = styled.div`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  color: #fff;
  background: #4f46e5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, #6366f1, #4338ca);
    box-shadow: 0 15px 30px rgba(67, 56, 202, 0.35);
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #a78bfa, #f472b6);
    box-shadow: 0 0 25px rgba(167, 139, 250, 0.5);
  `}
`;

const MockCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const MockCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  
  ${({ design }) => design === 'elite' && css`
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.12);
  `}
`;

const MockCardContent = styled.div`
  height: 60px;
  background: ${props => props.color || '#e2e8f0'};
  border-radius: 4px;
`;

// Database Visualization
const DatabaseVisualization = styled.div`
  margin: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(51, 65, 85, 0.7));
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  backdrop-filter: blur(12px);
  animation: ${fadeIn} 0.6s 0.2s backwards;
`;

const DatabaseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  
  svg {
    color: #8b5cf6;
  }
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const TableCard = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 0.75rem;
  
  h4 {
    font-size: 0.8rem;
    font-weight: 600;
    color: #a78bfa;
    margin: 0 0 0.5rem;
  }
  
  p {
    font-size: 0.7rem;
    color: #94a3b8;
    margin: 0;
  }
`;

// Enhanced Results Panel components
const BreakdownSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
`;

const BreakdownHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(148, 163, 184, 0.1);
  }
  
  span {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const BreakdownList = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  animation: ${props => props.show ? fadeIn : ''} 0.3s ease-out;
  padding: 0 0.75rem;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: #94a3b8;
  font-size: 0.9rem;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }
  
  span:last-child {
    font-weight: 600;
    color: #cbd5e1;
  }
`;

const VatSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
`;

const CountrySelector = styled.select`
  width: 100%;
  padding: 0.5rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const TaxSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
`;

const TaxRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  
  &.total {
    font-weight: 700;
    font-size: 1.1rem;
    color: #f1f5f9;
    padding-top: 0.5rem;
    border-top: 2px solid rgba(148, 163, 184, 0.3);
  }
`;

const MockChatButton = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);
  animation: ${fadeIn} 0.5s 0.5s backwards;
`;

// E-commerce Components
const ShoppingCart = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${({ design }) => design === 'standard' && css`
    background: #fff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `}
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, #fff, #f8fafc);
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.25);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
    border: 1px solid rgba(167, 139, 250, 0.4);
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.3), 0 4px 15px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    
    &:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 0 30px rgba(167, 139, 250, 0.5), 0 6px 20px rgba(0, 0, 0, 0.4);
    }
  `}
`;

const CartIcon = styled.div`
  font-size: 1rem;
  color: ${props => props.color || '#475569'};
  position: relative;
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
    animation: ${glowPulse} 2s ease-in-out infinite;
  `}
`;

const CartText = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.color || '#1e293b'};
`;

const ProductCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  ${({ design }) => design === 'premium' && css`
    border: 1px solid rgba(99, 102, 241, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.3);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(6px);
    
    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 8px 25px rgba(167, 139, 250, 0.3), 0 0 20px rgba(167, 139, 250, 0.2);
      border-color: rgba(167, 139, 250, 0.4);
    }
  `}
`;

const ProductImage = styled.div`
  height: 120px;
  background: ${props => props.color || '#e2e8f0'};
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, ${props => props.color || '#e0e7ff'}, ${props => props.color2 || '#ddd6fe'});
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(244, 114, 182, 0.15));
    border: 1px solid rgba(148, 163, 184, 0.2);
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }
  `}
  
  &:hover::after {
    transform: translateX(100%);
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.color || '#1e293b'};
  margin: 0;
`;

const ProductPrice = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.color || '#4f46e5'};
  margin: 0;
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

const AddToCartBtn = styled.button`
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${({ design }) => design === 'standard' && css`
    background: #4f46e5;
    color: #fff;
    
    &:hover {
      background: #4338ca;
    }
  `}
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, #6366f1, #4338ca);
    color: #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #a78bfa, #f472b6);
    color: #fff;
    box-shadow: 0 0 15px rgba(167, 139, 250, 0.4);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(167, 139, 250, 0.6), 0 0 15px rgba(244, 114, 182, 0.4);
    }
    
    &:hover::before {
      width: 300px;
      height: 300px;
    }
  `}
`;

const PaymentMethods = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  
  ${({ design }) => design === 'standard' && css`
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid #e2e8f0;
  `}
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(79, 70, 229, 0.08));
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.5));
    border: 1px solid rgba(167, 139, 250, 0.3);
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.2), inset 0 0 20px rgba(167, 139, 250, 0.05);
    backdrop-filter: blur(10px);
  `}
`;

const PaymentLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.color || '#64748b'};
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PaymentIcons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PaymentIcon = styled.div`
  font-size: 1.8rem;
  color: ${props => props.color || '#94a3b8'};
  transition: all 0.3s ease;
  
  ${({ design }) => design === 'premium' && css`
    &:hover {
      transform: scale(1.2) translateY(-2px);
      filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.3));
    
    &:hover {
      transform: scale(1.3) translateY(-4px) rotate(5deg);
      filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.6));
    }
  `}
`;

const VippsLogo = styled.span`
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
  background: #ff5b24;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  transition: all 0.3s ease;
  
  ${({ design }) => design === 'premium' && css`
    box-shadow: 0 2px 8px rgba(255, 91, 36, 0.3);
    
    &:hover {
      transform: scale(1.2) translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 91, 36, 0.5);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    box-shadow: 0 0 15px rgba(255, 91, 36, 0.5);
    
    &:hover {
      transform: scale(1.3) translateY(-4px);
      box-shadow: 0 0 25px rgba(255, 91, 36, 0.8);
    }
  `}
`;

// AI Chatbot (replaces MockChatButton when AI is enabled)
const AIChatButton = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s 0.5s backwards;
  z-index: 20;
  
  ${({ design }) => design === 'standard' && css`
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
  `}
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    
    &:hover {
      transform: scale(1.15) translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, #a78bfa, #f472b6);
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.5), 0 4px 15px rgba(244, 114, 182, 0.4);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: linear-gradient(45deg, #a78bfa, #f472b6, #a78bfa);
      background-size: 200% 200%;
      animation: ${gradientAnimation} 3s ease infinite;
      opacity: 0.5;
      z-index: -1;
      filter: blur(8px);
    }
    
    &:hover {
      transform: scale(1.2) translateY(-4px) rotate(5deg);
      box-shadow: 0 0 30px rgba(167, 139, 250, 0.7), 0 0 20px rgba(244, 114, 182, 0.6);
    }
  `}
`;

const AIIcon = styled.span`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  
  ${({ design }) => design === 'elite' && css`
    animation: ${glowPulse} 2s ease-in-out infinite;
  `}
`;

// Hamburger Menu Components
const HamburgerButton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  
  ${({ design }) => design === 'standard' && css`
    background: transparent;
    border: 1px solid #cbd5e1;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  `}
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.15));
    border: 1px solid rgba(99, 102, 241, 0.3);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
    
    &:hover {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.25));
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(244, 114, 182, 0.15));
    border: 1px solid rgba(167, 139, 250, 0.4);
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.3), inset 0 0 10px rgba(167, 139, 250, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 6px;
      background: linear-gradient(45deg, #a78bfa, #f472b6, #a78bfa);
      background-size: 200% 200%;
      animation: ${gradientAnimation} 3s ease infinite;
      opacity: 0;
      z-index: -1;
      transition: opacity 0.3s;
    }
    
    &:hover {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 0 30px rgba(167, 139, 250, 0.5), 0 0 15px rgba(244, 114, 182, 0.3);
    }
    
    &:hover::before {
      opacity: 0.3;
    }
  `}
`;

const HamburgerLine = styled.div`
  width: 20px;
  height: 2px;
  background: ${props => props.color || '#475569'};
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  ${({ isOpen, design, lineNumber }) => isOpen && design === 'elite' && css`
    ${lineNumber === 1 && css`
      transform: rotate(45deg) translate(6px, 6px);
      background: linear-gradient(90deg, #a78bfa, #f472b6);
      box-shadow: 0 0 10px rgba(167, 139, 250, 0.6);
    `}
    
    ${lineNumber === 2 && css`
      opacity: 0;
      transform: translateX(20px);
    `}
    
    ${lineNumber === 3 && css`
      transform: rotate(-45deg) translate(6px, -6px);
      background: linear-gradient(90deg, #f472b6, #a78bfa);
      box-shadow: 0 0 10px rgba(244, 114, 182, 0.6);
    `}
  `}
  
  ${({ isOpen, design, lineNumber }) => isOpen && design === 'premium' && css`
    ${lineNumber === 1 && css`
      transform: rotate(45deg) translate(5px, 5px);
    `}
    
    ${lineNumber === 2 && css`
      opacity: 0;
    `}
    
    ${lineNumber === 3 && css`
      transform: rotate(-45deg) translate(5px, -5px);
    `}
  `}
  
  ${({ isOpen, design, lineNumber }) => isOpen && design === 'standard' && css`
    ${lineNumber === 1 && css`
      transform: rotate(45deg) translate(5px, 5px);
    `}
    
    ${lineNumber === 2 && css`
      opacity: 0;
    `}
    
    ${lineNumber === 3 && css`
      transform: rotate(-45deg) translate(5px, -5px);
    `}
  `}
`;

const dropdownSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const eliteDropdownEntry = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px) rotateX(-90deg);
  }
  50% {
    transform: translateY(5px) rotateX(10deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  border-radius: 8px;
  padding: 0.5rem;
  min-width: 200px;
  backdrop-filter: blur(10px);
  z-index: 100;
  transform-origin: top right;
  
  ${({ design }) => design === 'standard' && css`
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    animation: ${dropdownSlide} 0.2s ease-out;
  `}
  
  ${({ design }) => design === 'premium' && css`
    background: linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.98));
    border: 1px solid rgba(99, 102, 241, 0.3);
    box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1);
    animation: ${dropdownSlide} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `}
  
  ${({ design }) => design === 'elite' && css`
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
    border: 2px solid transparent;
    background-clip: padding-box;
    position: relative;
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 30px rgba(167, 139, 250, 0.3),
      inset 0 0 20px rgba(167, 139, 250, 0.1);
    animation: ${eliteDropdownEntry} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 8px;
      background: linear-gradient(135deg, #a78bfa, #f472b6, #a78bfa);
      background-size: 200% 200%;
      animation: ${gradientAnimation} 4s ease infinite;
      z-index: -1;
    }
  `}
`;

const MenuItem = styled.div`
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  ${({ design }) => design === 'standard' && css`
    color: #475569;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
      transform: translateX(4px);
    }
  `}
  
  ${({ design }) => design === 'premium' && css`
    color: #475569;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: linear-gradient(180deg, #6366f1, #4338ca);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
      color: #4338ca;
      transform: translateX(8px);
      padding-left: 1rem;
    }
    
    &:hover::before {
      transform: scaleY(1);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    color: #cbd5e1;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &::before {
      content: '';
      position: absolute;
      left: -100%;
      top: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.3), transparent);
      transition: left 0.6s ease;
    }
    
    &:hover {
      background: linear-gradient(90deg, rgba(167, 139, 250, 0.25), rgba(244, 114, 182, 0.15));
      color: #c4b5fd;
      transform: translateX(10px) scale(1.02);
      box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
    }
    
    &:hover::before {
      left: 100%;
    }
  `}
`;

const SubMenu = styled.div`
  margin-left: 1rem;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
  position: relative;
  
  ${({ design }) => design === 'standard' && css`
    border-left: 2px solid rgba(203, 213, 225, 0.5);
    animation: ${fadeIn} 0.2s ease-out;
  `}
  
  ${({ design }) => design === 'premium' && css`
    border-left: 2px solid rgba(99, 102, 241, 0.4);
    animation: ${fadeIn} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &::before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      width: 2px;
      height: 100%;
      background: linear-gradient(180deg, #6366f1, transparent);
      animation: ${fadeIn} 0.5s ease-out;
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    border-left: 2px solid rgba(167, 139, 250, 0.5);
    animation: ${fadeIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &::before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      width: 2px;
      height: 0;
      background: linear-gradient(180deg, #a78bfa, #f472b6);
      box-shadow: 0 0 10px rgba(167, 139, 250, 0.6);
      animation: ${css`
        ${keyframes`
          to { height: 100%; }
        `}
      `} 0.5s ease-out forwards;
    }
  `}
`;

const SubMenuItem = styled.div`
  padding: 0.5rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  
  ${({ design }) => design === 'standard' && css`
    color: #64748b;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
      color: #475569;
      transform: translateX(4px);
    }
  `}
  
  ${({ design }) => design === 'premium' && css`
    color: #64748b;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(99, 102, 241, 0.1);
      color: #4338ca;
      transform: translateX(6px);
    }
  `}
  
  ${({ design }) => design === 'elite' && css`
    color: #94a3b8;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    
    &::before {
      content: '▸';
      position: absolute;
      left: 0.3rem;
      opacity: 0;
      transition: all 0.3s ease;
      color: #a78bfa;
    }
    
    &:hover {
      background: linear-gradient(90deg, rgba(167, 139, 250, 0.15), transparent);
      color: #cbd5e1;
      transform: translateX(8px);
      padding-left: 1.2rem;
    }
    
    &:hover::before {
      opacity: 1;
      left: 0.5rem;
    }
  `}
`;

// ---------- Utils ----------
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('nb-NO', { 
    style: 'currency', 
    currency: 'NOK', 
    minimumFractionDigits: 0 
  }).format(amount);
};

// ---------- Component ----------
export default function WebDevPromoPage() {
  // State
  const [lang, setLang] = useState('no');
  const [country, setCountry] = useState('NO');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [previewMode, setPreviewMode] = useState('webside');
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const [inputs, setInputs] = useState({
    pages: 5,
    design: 'premium',
    ecommerce: false,
    ecommerceLevel: 5, // 1-10 scale
    seo: true,
    carePlan: false,
    admin: false,
    adminLevel: 5, // 1-10 scale
    database: false,
    databaseLevel: 5, // 1-10 scale
    ai: false,
  });
  
  // Translations
  const translations = {
    no: {
      heroTitle: 'Moderne nettsider som konverterer',
      heroSubtitle: 'Fra idé til lansering. Vi bygger skreddersydde, lynraske og brukervennlige nettsider som styrker din merkevare og gir resultater.',
      configureProject: 'Konfigurer ditt prosjekt',
      pageCount: 'Antall sider',
      designComplexity: 'Design & kompleksitet',
      addons: 'Tilleggsfunksjoner',
      configuration: 'Konfigurasjon',
      ecommerceTitle: 'Nettbutikk',
      ecommerceDesc: 'Selg produkter eller tjenester',
      seoTitle: 'SEO & Analyse',
      seoDesc: 'Bli funnet på Google',
      careTitle: 'Drift & Vedlikehold',
      careDesc: 'Månedlig oppfølging',
      adminTitle: 'Admin Panel',
      adminDesc: 'Administrer innhold og brukere',
      databaseTitle: 'Database',
      databaseDesc: 'Lagre og håndtere data',
      databaseDescRequired: 'Påkrevd for nettbutikk',
      databaseComplexity: 'Database kompleksitet',
      aiTitle: 'AI Assistent',
      aiDesc: 'Smart chatbot og automatisering',
      ecommerceComplexity: 'Nettbutikk kompleksitet',
      adminComplexity: 'Admin panel kompleksitet',
      basic: 'Grunnleggende',
      advanced: 'Avansert',
      priceDisclaimer: 'Prisene kan variere basert på prosjektets kompleksitet. Send inn prosjektet ditt om du er usikker, så finner vi riktig konfigurasjon for deg.',
      estimateNote: 'Dette er et prisestimat',
      estimateTitle: 'Ditt prisestimat',
      estimatedCost: 'Estimert kostnad',
      estimatedWaitTime: 'Estimert ventetid',
      monthlyLabel: 'Månedlig kostnad',
      perMonth: '/mnd',
      weeks: 'uker',
      startProject: 'Start prosjektet',
      copy: 'Kopier',
      reset: 'Nullstill',
      costBreakdown: 'Kostnadsfordeling',
      selectCountry: 'Velg land for MVA-beregning:',
      priceBeforeVat: 'Pris før MVA:',
      vat: 'MVA',
      totalInclVat: 'Total inkl. MVA:',
      exVat: 'eks. mva',
      webside: 'Webside',
      adminPanel: 'Admin Panel'
    },
    en: {
      heroTitle: 'Modern websites that convert',
      heroSubtitle: 'From idea to launch. We build custom, blazing-fast and user-friendly websites that strengthen your brand and deliver results.',
      configureProject: 'Configure your project',
      pageCount: 'Number of pages',
      designComplexity: 'Design & complexity',
      addons: 'Add-ons',
      configuration: 'Configuration',
      ecommerceTitle: 'E-commerce',
      ecommerceDesc: 'Sell products or services',
      seoTitle: 'SEO & Analytics',
      seoDesc: 'Be found on Google',
      careTitle: 'Care & Maintenance',
      careDesc: 'Monthly follow-up',
      adminTitle: 'Admin Panel',
      adminDesc: 'Manage content and users',
      databaseTitle: 'Database',
      databaseDesc: 'Store and manage data',
      databaseDescRequired: 'Required for e-commerce',
      databaseComplexity: 'Database complexity',
      aiTitle: 'AI Assistant',
      aiDesc: 'Smart chatbot and automation',
      ecommerceComplexity: 'E-commerce complexity',
      adminComplexity: 'Admin panel complexity',
      basic: 'Basic',
      advanced: 'Advanced',
      priceDisclaimer: 'Prices may vary based on project complexity. Submit your project if you\'re unsure, and we\'ll find the right configuration for you.',
      estimateNote: 'This is a price estimate',
      estimateTitle: 'Your Price Estimate',
      estimatedCost: 'Estimated cost',
      estimatedWaitTime: 'Estimated wait time',
      monthlyLabel: 'Monthly cost',
      perMonth: '/mo',
      weeks: 'weeks',
      startProject: 'Start Project',
      copy: 'Copy',
      reset: 'Reset',
      costBreakdown: 'Cost breakdown',
      selectCountry: 'Select country for VAT calculation:',
      priceBeforeVat: 'Price before VAT:',
      vat: 'VAT',
      totalInclVat: 'Total incl. VAT:',
      exVat: 'ex. VAT',
      webside: 'Website',
      adminPanel: 'Admin Panel'
    }
  };
  
  const t = translations[lang];
  
  // VAT rates by country
  const vatRates = {
    NO: 25,
    SE: 25,
    DK: 25,
    FI: 24,
    DE: 19,
    FR: 20,
    UK: 20,
    US: 0
  };
  const vatRate = vatRates[country] || 25;
  
  // Price map
  const priceMap = {
    base: 2200,
    perPage: 1300,
    design: { standard: 1, premium: 1.3, elite: 2.0 },
    ecommerce: { min: 2300, max: 9999 },
    seo: 4500,
    carePlan: 1000,
    admin: { min: 2500, max: 9999 },
    database: { min: 2000, max: 9999 },
    ai: 6500,
  };
  
  // Calculate dynamic price based on level (1-10)
  const calculateDynamicPrice = (min, max, level) => {
    return Math.round(min + ((max - min) * (level - 1) / 9));
  };
  
  // Calculate breakdown
  const breakdown = useMemo(() => {
    const { pages, design, ecommerce, ecommerceLevel, seo, carePlan, admin, adminLevel, database, databaseLevel, ai } = inputs;
    const designMultiplier = priceMap.design[design] || 1;
    
    let oneTimeCost = priceMap.base;
    oneTimeCost += pages * priceMap.perPage * designMultiplier;
    
    const ecommerceCost = ecommerce ? calculateDynamicPrice(priceMap.ecommerce.min, priceMap.ecommerce.max, ecommerceLevel) : 0;
    const adminCost = admin ? calculateDynamicPrice(priceMap.admin.min, priceMap.admin.max, adminLevel) : 0;
    const databaseCost = database ? calculateDynamicPrice(priceMap.database.min, priceMap.database.max, databaseLevel) : 0;
    
    if (ecommerce) oneTimeCost += ecommerceCost;
    if (seo) oneTimeCost += priceMap.seo;
    if (admin) oneTimeCost += adminCost;
    if (database) oneTimeCost += databaseCost;
    if (ai) oneTimeCost += priceMap.ai;
    
    const monthlyCost = carePlan ? priceMap.carePlan : 0;
    
    const weeks = Math.round(2 + (pages / 4) + (ecommerce ? 3 : 0) + (seo ? 1 : 0) + (admin ? 2 : 0) + (database ? 1 : 0) + (ai ? 2 : 0));
    
    // Calculate individual costs for breakdown
    const items = [
      { name: 'Grunnpakke', cost: priceMap.base },
      { name: `${pages} sider (${design})`, cost: pages * priceMap.perPage * designMultiplier },
    ];
    if (ecommerce) items.push({ name: 'Nettbutikk', cost: ecommerceCost });
    if (seo) items.push({ name: 'SEO & Analyse', cost: priceMap.seo });
    if (admin) items.push({ name: 'Admin Panel', cost: adminCost });
    if (database) items.push({ name: 'Database', cost: databaseCost });
    if (ai) items.push({ name: 'AI Assistent', cost: priceMap.ai });
    
    const vatAmount = oneTimeCost * (vatRate / 100);
    const totalWithVat = oneTimeCost + vatAmount;
    
    return {
      oneTimeCost,
      monthlyCost,
      weeks,
      items,
      vatAmount,
      totalWithVat,
      vatRate
    };
  }, [inputs, vatRate]);
  
  // Update input handler
  const updateInput = (key, value) => {
    setInputs(prev => {
      const newInputs = { ...prev, [key]: value };
      
      // If e-commerce is selected, database must be selected
      if (key === 'ecommerce' && value === true) {
        newInputs.database = true;
      }
      
      // If database is deselected and e-commerce is on, turn off e-commerce
      if (key === 'database' && value === false && prev.ecommerce) {
        newInputs.ecommerce = false;
      }
      
      return newInputs;
    });
  };
  
  const copyEstimate = () => {
    const text = `Estimat for nettsideprosjekt:
-----------------------------
Engangskostnad: ${formatCurrency(breakdown.oneTimeCost)} eks. mva
Total inkl. MVA: ${formatCurrency(breakdown.totalWithVat)}
Månedlig kostnad: ${formatCurrency(breakdown.monthlyCost)}/mnd
Estimert tidslinje: ~${breakdown.weeks} uker

Konfigurasjon:
- Sider: ${inputs.pages}
- Design: ${inputs.design}
- Nettbutikk: ${inputs.ecommerce ? 'Ja' : 'Nei'}
- SEO & Analyse: ${inputs.seo ? 'Ja' : 'Nei'}
- Admin Panel: ${inputs.admin ? 'Ja' : 'Nei'}
- Database: ${inputs.database ? 'Ja' : 'Nei'}
- Drift & Vedlikehold: ${inputs.carePlan ? 'Ja' : 'Nei'}`;
    
    navigator.clipboard.writeText(text.trim());
    alert('Estimat kopiert til utklippstavlen!');
  };
  
  const resetCalculator = () => {
    setInputs({
      pages: 5,
      design: 'premium',
      ecommerce: false,
      ecommerceLevel: 5,
      seo: true,
      carePlan: false,
      admin: false,
      adminLevel: 5,
      database: false,
      databaseLevel: 5,
      ai: false,
    });
    setShowBreakdown(false);
    setPreviewMode('webside');
    setMenuOpen(false);
    setExpandedCategory(null);
  };
  
  // Generate menu items based on page count (excluding home page)
  const generateMenuItems = (pageCount) => {
    const actualPages = pageCount - 1; // Subtract home page
    
    if (actualPages <= 10) {
      return Array.from({ length: actualPages }, (_, i) => ({
        id: i + 2, // Start from 2 since 1 is home
        label: `Side ${i + 2}`,
        type: 'page'
      }));
    } else {
      // Group pages into categories for 11+ pages
      const categories = [];
      const pagesPerCategory = Math.ceil(actualPages / 3);
      
      for (let i = 0; i < 3; i++) {
        const start = i * pagesPerCategory + 2; // Start from 2
        const end = Math.min((i + 1) * pagesPerCategory + 1, pageCount);
        const subPages = [];
        
        for (let j = start; j <= end; j++) {
          subPages.push({
            id: j,
            label: `Side ${j}`
          });
        }
        
        categories.push({
          id: `cat-${i}`,
          label: `Sider ${start}-${end}`,
          type: 'category',
          subPages
        });
      }
      
      return categories;
    }
  };
  
  const toggleCategory = (categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };
  
  return (
    <>
      <GlobalStyle />
      <Header />
      <PageWrapper>
        <ContentContainer>
          <LangSwitchWrapper>
            <LangToggle className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangToggle>
            <LangToggle className={lang === 'no' ? 'active' : ''} onClick={() => setLang('no')}>NO</LangToggle>
          </LangSwitchWrapper>
          
          <HeroSection>
            <HeroTitle>{t.heroTitle}</HeroTitle>
            <HeroSubtitle>{t.heroSubtitle}</HeroSubtitle>
          </HeroSection>
          
          <EstimatorGrid>
            <CalculatorForm>
              <SectionTitle><FiSliders />{t.configureProject}</SectionTitle>
              
              <ControlGroup>
                <Label htmlFor="pages">
                  {t.pageCount}
                  <ValueDisplay>{inputs.pages}</ValueDisplay>
                </Label>
                <Slider 
                  id="pages" 
                  min="1" 
                  max="20" 
                  value={inputs.pages} 
                  onChange={(e) => updateInput('pages', parseInt(e.target.value))}
                />
              </ControlGroup>
              
              <ControlGroup>
                <Label>{t.designComplexity}</Label>
                <ToggleGroup>
                  {Object.keys(priceMap.design).map(level => (
                    <ToggleLabel key={level} checked={inputs.design === level}>
                      <ToggleCheckbox 
                        name="design" 
                        checked={inputs.design === level} 
                        onChange={() => updateInput('design', level)} 
                      />
                      <ToggleTitle style={{textTransform: 'capitalize'}}>{level}</ToggleTitle>
                    </ToggleLabel>
                  ))}
                </ToggleGroup>
              </ControlGroup>
              
              <ControlGroup>
                <Label>{t.addons}</Label>
                <ToggleGroup>
                  <ToggleLabel checked={inputs.ecommerce}>
                    <ToggleCheckbox 
                      checked={inputs.ecommerce} 
                      onChange={(e) => updateInput('ecommerce', e.target.checked)} 
                    />
                    <ToggleTitle>{t.ecommerceTitle} <FiPackage /></ToggleTitle>
                    <ToggleDescription>{t.ecommerceDesc}</ToggleDescription>
                  </ToggleLabel>
                  <ToggleLabel checked={inputs.seo}>
                    <ToggleCheckbox 
                      checked={inputs.seo} 
                      onChange={(e) => updateInput('seo', e.target.checked)} 
                    />
                    <ToggleTitle>{t.seoTitle} <FiZap /></ToggleTitle>
                    <ToggleDescription>{t.seoDesc}</ToggleDescription>
                  </ToggleLabel>
                  <ToggleLabel checked={inputs.carePlan}>
                    <ToggleCheckbox 
                      checked={inputs.carePlan} 
                      onChange={(e) => updateInput('carePlan', e.target.checked)} 
                    />
                    <ToggleTitle>{t.careTitle} <FiCheck /></ToggleTitle>
                    <ToggleDescription>{t.careDesc}</ToggleDescription>
                  </ToggleLabel>
                </ToggleGroup>
              </ControlGroup>
              
              <ControlGroup>
                <Label>{t.configuration}</Label>
                <ToggleGroup>
                  <ToggleLabel checked={inputs.admin}>
                    <ToggleCheckbox 
                      checked={inputs.admin} 
                      onChange={(e) => updateInput('admin', e.target.checked)} 
                    />
                    <ToggleTitle>{t.adminTitle} <FiShield /></ToggleTitle>
                    <ToggleDescription>{t.adminDesc}</ToggleDescription>
                  </ToggleLabel>
                  <ToggleLabel checked={inputs.database} disabled={inputs.ecommerce}>
                    <ToggleCheckbox 
                      checked={inputs.database} 
                      onChange={(e) => updateInput('database', e.target.checked)}
                      disabled={inputs.ecommerce}
                    />
                    <ToggleTitle>{t.databaseTitle} <FiDatabase /></ToggleTitle>
                    <ToggleDescription>{inputs.ecommerce ? t.databaseDescRequired : t.databaseDesc}</ToggleDescription>
                  </ToggleLabel>
                  <ToggleLabel checked={inputs.ai}>
                    <ToggleCheckbox 
                      checked={inputs.ai} 
                      onChange={(e) => updateInput('ai', e.target.checked)} 
                    />
                    <ToggleTitle>{t.aiTitle} <FiZap /></ToggleTitle>
                    <ToggleDescription>{t.aiDesc}</ToggleDescription>
                  </ToggleLabel>
                </ToggleGroup>
              </ControlGroup>
              
              {(inputs.ecommerce || inputs.admin || inputs.database) && (
                <ControlGroup>
                  {inputs.ecommerce && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <Label htmlFor="ecommerceLevel">
                        {t.ecommerceComplexity}
                        <ValueDisplay>{formatCurrency(calculateDynamicPrice(priceMap.ecommerce.min, priceMap.ecommerce.max, inputs.ecommerceLevel))}</ValueDisplay>
                      </Label>
                      <Slider 
                        id="ecommerceLevel" 
                        min="1" 
                        max="10" 
                        value={inputs.ecommerceLevel} 
                        onChange={(e) => updateInput('ecommerceLevel', parseInt(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        <span>{t.basic}</span>
                        <span>{t.advanced}</span>
                      </div>
                    </div>
                  )}
                  {inputs.admin && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <Label htmlFor="adminLevel">
                        {t.adminComplexity}
                        <ValueDisplay>{formatCurrency(calculateDynamicPrice(priceMap.admin.min, priceMap.admin.max, inputs.adminLevel))}</ValueDisplay>
                      </Label>
                      <Slider 
                        id="adminLevel" 
                        min="1" 
                        max="10" 
                        value={inputs.adminLevel} 
                        onChange={(e) => updateInput('adminLevel', parseInt(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        <span>{t.basic}</span>
                        <span>{t.advanced}</span>
                      </div>
                    </div>
                  )}
                  {inputs.database && !inputs.ecommerce && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <Label htmlFor="databaseLevel">
                        {t.databaseComplexity}
                        <ValueDisplay>{formatCurrency(calculateDynamicPrice(priceMap.database.min, priceMap.database.max, inputs.databaseLevel))}</ValueDisplay>
                      </Label>
                      <Slider 
                        id="databaseLevel" 
                        min="1" 
                        max="10" 
                        value={inputs.databaseLevel} 
                        onChange={(e) => updateInput('databaseLevel', parseInt(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        <span>{t.basic}</span>
                        <span>{t.advanced}</span>
                      </div>
                    </div>
                  )}
                </ControlGroup>
              )}
              
              <DisclaimerText>
                💡 {t.priceDisclaimer}
              </DisclaimerText>
            </CalculatorForm>
            
            <div>
              <PreviewPanel>
                <MockBrowserHeader>
                  <MockBrowserButton color="#f87171" />
                  <MockBrowserButton color="#fbbf24" />
                  <MockBrowserButton color="#34d399" />
                </MockBrowserHeader>
                
                {inputs.admin && (
                  <ViewSwitcher>
                    <ViewButton 
                      active={previewMode === 'webside'}
                      onClick={() => setPreviewMode('webside')}
                    >
                      <FiGlobe /> {t.webside}
                    </ViewButton>
                    <ViewButton 
                      active={previewMode === 'admin'}
                      onClick={() => setPreviewMode('admin')}
                    >
                      <FiShield /> {t.adminPanel}
                    </ViewButton>
                  </ViewSwitcher>
                )}
                
                {previewMode === 'admin' && inputs.admin ? (
                  <AdminPanel>
                    <AdminHeader>
                      <AdminTitle>Admin Dashboard</AdminTitle>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>v2.0</span>
                    </AdminHeader>
                    <StatsGrid>
                      <StatCard>
                        <h4>Besøkende i dag</h4>
                        <p>1,284</p>
                      </StatCard>
                      <StatCard>
                        <h4>Ordrer</h4>
                        <p>47</p>
                      </StatCard>
                      <StatCard>
                        <h4>Omsetning</h4>
                        <p>kr 28,450</p>
                      </StatCard>
                      <StatCard>
                        <h4>Konvertering</h4>
                        <p>3.7%</p>
                      </StatCard>
                    </StatsGrid>
                    <AdminMenu>
                      <AdminMenuItem>
                        <FiPackage /> Produkter
                      </AdminMenuItem>
                      <AdminMenuItem>
                        <FiSliders /> Innstillinger
                      </AdminMenuItem>
                      <AdminMenuItem>
                        <FiDatabase /> Database
                      </AdminMenuItem>
                    </AdminMenu>
                  </AdminPanel>
                ) : (
                  <MockWebsite design={inputs.design}>
                    <MockHeader>
                      <MockLogo color={inputs.design === 'elite' ? '#fff' : '#1e293b'}>Logo</MockLogo>
                      <MockNav>
                        {inputs.pages === 1 ? (
                          // No nav for single page
                          null
                        ) : inputs.pages >= 2 && inputs.pages <= 5 ? (
                          // Show individual nav links for 2-5 pages (minus home page)
                          [...Array(inputs.pages - 1)].map((_, i) => (
                            <MockNavLink 
                              key={i} 
                              design={inputs.design}
                              color={inputs.design === 'elite' ? '#94a3b8' : '#475569'}
                            >
                              Side {i + 2}
                            </MockNavLink>
                          ))
                        ) : (
                          // Show hamburger menu for 6+ pages
                          <div style={{ position: 'relative' }}>
                            <HamburgerButton 
                              design={inputs.design}
                              onClick={() => setMenuOpen(!menuOpen)}
                            >
                              <HamburgerLine 
                                color={inputs.design === 'elite' ? '#cbd5e1' : '#475569'} 
                                isOpen={menuOpen}
                                design={inputs.design}
                                lineNumber={1}
                              />
                              <HamburgerLine 
                                color={inputs.design === 'elite' ? '#cbd5e1' : '#475569'} 
                                isOpen={menuOpen}
                                design={inputs.design}
                                lineNumber={2}
                              />
                              <HamburgerLine 
                                color={inputs.design === 'elite' ? '#cbd5e1' : '#475569'} 
                                isOpen={menuOpen}
                                design={inputs.design}
                                lineNumber={3}
                              />
                            </HamburgerButton>
                            
                            {menuOpen && (
                              <DropdownMenu design={inputs.design}>
                                {generateMenuItems(inputs.pages).map((item) => (
                                  <div key={item.id}>
                                    {item.type === 'category' ? (
                                      <>
                                        <MenuItem 
                                          design={inputs.design}
                                          onClick={() => toggleCategory(item.id)}
                                        >
                                          {item.label}
                                          <span style={{ fontSize: '0.7rem' }}>
                                            {expandedCategory === item.id ? '▼' : '▶'}
                                          </span>
                                        </MenuItem>
                                        {expandedCategory === item.id && (
                                          <SubMenu design={inputs.design}>
                                            {item.subPages.map((subPage) => (
                                              <SubMenuItem 
                                                key={subPage.id}
                                                design={inputs.design}
                                              >
                                                {subPage.label}
                                              </SubMenuItem>
                                            ))}
                                          </SubMenu>
                                        )}
                                      </>
                                    ) : (
                                      <MenuItem design={inputs.design}>
                                        {item.label}
                                      </MenuItem>
                                    )}
                                  </div>
                                ))}
                              </DropdownMenu>
                            )}
                          </div>
                        )}
                        
                        {inputs.ecommerce && (
                          <ShoppingCart design={inputs.design}>
                            <CartIcon color={inputs.design === 'elite' ? '#cbd5e1' : '#475569'}>
                              🛒
                              <CartBadge design={inputs.design}>3</CartBadge>
                            </CartIcon>
                            <CartText color={inputs.design === 'elite' ? '#cbd5e1' : '#1e293b'}>
                              kr 2,499
                            </CartText>
                          </ShoppingCart>
                        )}
                      </MockNav>
                    </MockHeader>
                    
                    <MockHero>
                      <MockTitle design={inputs.design}>
                        {inputs.ecommerce ? 'Nettbutikk' :
                         inputs.design === 'standard' ? 'Moderne Nettside' : 
                         inputs.design === 'premium' ? 'Premium Opplevelse' : 
                         'Elite Performance'}
                      </MockTitle>
                      <MockSubtitle color={inputs.design === 'elite' ? '#94a3b8' : '#64748b'}>
                        {inputs.ecommerce ? 'Handle trygt og enkelt online' : 'Profesjonell nettside for din bedrift'}
                      </MockSubtitle>
                      <MockButton design={inputs.design}>
                        {inputs.ecommerce ? 'Se produkter' : 'Kom i gang'}
                      </MockButton>
                    </MockHero>
                    
                    {inputs.ecommerce ? (
                      <>
                        <MockCardGrid>
                          {[
                            { name: 'Produkt 1', price: 'kr 799', color: '#ddd6fe', color2: '#e0e7ff' },
                            { name: 'Produkt 2', price: 'kr 899', color: '#fce7f3', color2: '#fbcfe8' },
                            { name: 'Produkt 3', price: 'kr 699', color: '#dbeafe', color2: '#bfdbfe' }
                          ].map((product, i) => (
                            <ProductCard key={i} design={inputs.design}>
                              <ProductImage 
                                design={inputs.design}
                                color={product.color}
                                color2={product.color2}
                              />
                              <ProductInfo>
                                <ProductName color={inputs.design === 'elite' ? '#cbd5e1' : '#1e293b'}>
                                  {product.name}
                                </ProductName>
                                <ProductPrice design={inputs.design}>
                                  {product.price}
                                </ProductPrice>
                              </ProductInfo>
                              <AddToCartBtn design={inputs.design}>
                                Legg i handlekurv
                              </AddToCartBtn>
                            </ProductCard>
                          ))}
                        </MockCardGrid>
                        
                        <PaymentMethods design={inputs.design}>
                          <PaymentLabel color={inputs.design === 'elite' ? '#94a3b8' : '#64748b'}>
                            Sikre betalingsmetoder
                          </PaymentLabel>
                          <PaymentIcons>
                            <PaymentIcon design={inputs.design} color={inputs.design === 'elite' ? '#cbd5e1' : '#1e3a8a'}>
                              <FaCcVisa />
                            </PaymentIcon>
                            <PaymentIcon design={inputs.design} color={inputs.design === 'elite' ? '#cbd5e1' : '#eb001b'}>
                              <FaCcMastercard />
                            </PaymentIcon>
                            <VippsLogo design={inputs.design}>Vipps</VippsLogo>
                            {(inputs.design === 'premium' || inputs.design === 'elite') && (
                              <PaymentIcon design={inputs.design} color={inputs.design === 'elite' ? '#cbd5e1' : '#003087'}>
                                <FaPaypal />
                              </PaymentIcon>
                            )}
                          </PaymentIcons>
                        </PaymentMethods>
                      </>
                    ) : (
                      <MockCardGrid>
                        {[...Array(3)].map((_, i) => (
                          <MockCard key={i} design={inputs.design}>
                            <MockCardContent 
                              design={inputs.design} 
                              color={inputs.design === 'elite' ? 'rgba(255,255,255,0.08)' : '#e2e8f0'} 
                            />
                          </MockCard>
                        ))}
                      </MockCardGrid>
                    )}
                    {inputs.ai ? (
                      <AIChatButton design={inputs.design}>
                        <AIIcon design={inputs.design}>🤖</AIIcon>
                      </AIChatButton>
                    ) : inputs.design === 'elite' && (
                      <MockChatButton>
                        <FiMessageCircle color="#fff" size={24} />
                      </MockChatButton>
                    )}
                  </MockWebsite>
                )}
              </PreviewPanel>
              
              {inputs.database && (
                <DatabaseVisualization>
                  <DatabaseHeader>
                    <FiDatabase size={20} />
                    <h3>Database Structure</h3>
                  </DatabaseHeader>
                  <TableGrid>
                    <TableCard>
                      <h4>users</h4>
                      <p>1,847 records</p>
                    </TableCard>
                    <TableCard>
                      <h4>products</h4>
                      <p>324 records</p>
                    </TableCard>
                    <TableCard>
                      <h4>orders</h4>
                      <p>2,156 records</p>
                    </TableCard>
                    <TableCard>
                      <h4>categories</h4>
                      <p>18 records</p>
                    </TableCard>
                    <TableCard>
                      <h4>reviews</h4>
                      <p>892 records</p>
                    </TableCard>
                    <TableCard>
                      <h4>analytics</h4>
                      <p>45,231 records</p>
                    </TableCard>
                  </TableGrid>
                </DatabaseVisualization>
              )}
              
              <ResultsPanel>
                <SectionTitle><FiDollarSign />{t.estimateTitle}</SectionTitle>
                <EstimateNote>{t.estimateNote}</EstimateNote>
                
                <TotalDisplay>
                  <PriceLabel>{t.estimatedCost}</PriceLabel>
                  <PriceValue>{formatCurrency(breakdown.oneTimeCost)}</PriceValue>
                  <PriceQualifier>{t.exVat}</PriceQualifier>
                </TotalDisplay>
                
                <TotalDisplay>
                  <PriceLabel>{t.estimatedWaitTime}</PriceLabel>
                  <p style={{fontSize: '2rem', fontWeight: '700', color: '#a78bfa', margin: '0'}}>
                    ~{breakdown.weeks} {t.weeks}
                  </p>
                </TotalDisplay>
                
                {breakdown.monthlyCost > 0 && (
                  <TotalDisplay>
                    <PriceLabel>{t.monthlyLabel}</PriceLabel>
                    <PriceValue>
                      {formatCurrency(breakdown.monthlyCost)}
                      <PriceQualifier>{t.perMonth}</PriceQualifier>
                    </PriceValue>
                  </TotalDisplay>
                )}
                
                <BreakdownSection>
                  <BreakdownHeader onClick={() => setShowBreakdown(!showBreakdown)} >
                    <span>
                      {t.costBreakdown} 
                      {showBreakdown ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </BreakdownHeader>
                  <BreakdownList show={showBreakdown}>
                    {breakdown.items.map((item, index) => (
                      <BreakdownItem key={index}>
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.cost)}</span>
                      </BreakdownItem>
                    ))}
                  </BreakdownList>
                </BreakdownSection>
                
                <VatSection>
                  <Label style={{ marginBottom: '0.5rem' }}>{t.selectCountry}</Label>
                  <CountrySelector 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="NO">Norge (25% MVA)</option>
                    <option value="SE">Sverige (25% moms)</option>
                    <option value="DK">Danmark (25% moms)</option>
                    <option value="FI">Finland (24% ALV)</option>
                    <option value="DE">Tyskland (19% MwSt)</option>
                    <option value="FR">Frankrike (20% TVA)</option>
                    <option value="UK">Storbritannia (20% VAT)</option>
                    <option value="US">USA (0% tax)</option>
                  </CountrySelector>
                  
                  <TaxSummary>
                    <TaxRow>
                      <span>{t.priceBeforeVat}</span>
                      <span>{formatCurrency(breakdown.oneTimeCost)}</span>
                    </TaxRow>
                    <TaxRow>
                      <span>{t.vat} ({breakdown.vatRate}%):</span>
                      <span>{formatCurrency(breakdown.vatAmount)}</span>
                    </TaxRow>
                    <TaxRow className="total">
                      <span>{t.totalInclVat}</span>
                      <span>{formatCurrency(breakdown.totalWithVat)}</span>
                    </TaxRow>
                  </TaxSummary>
                </VatSection>
                
                <ActionButton onClick={() => alert('Kontakt oss for å starte prosjektet!')} style={{ marginTop: '2rem' }}>
                  {t.startProject} <FiArrowRight />
                </ActionButton>
                <SmallActions>
                  <SmallButton onClick={copyEstimate}><FiCopy />{t.copy}</SmallButton>
                  <SmallButton onClick={resetCalculator}><FiRefreshCw />{t.reset}</SmallButton>
                </SmallActions>
              </ResultsPanel>
            </div>
          </EstimatorGrid>
        </ContentContainer>
      </PageWrapper>
      <Footer />
    </>
  );
}
