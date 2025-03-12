// src/components/Bifrost.js
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaQuestionCircle, FaInfoCircle, FaGamepad, FaPhone } from 'react-icons/fa';

const BUTTON_IMAGE = 'https://i.ibb.co/yFxWgc0s/AJxt1-KNy-Zw-Rvqjji1-Teum-EKW2-C4qw-Tpl-RTJVy-M5s-Zx-VCwbq-Ogpyhnpz-T44-QB9-RF51-XVUc1-Ci-Pf8-N0-Bp.png';

const popUp = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const FloatingButtonWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CurvedText = styled.svg`
  width: 120px;
  height: 40px;
  margin-bottom: -10px;
  
  text {
    font-size: 0.9rem;
    fill: rgb(255, 255, 255);
    font-weight: 600;
  }
`;

const FloatingButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
  ${props =>
    !props.isOpen &&
    css`
      animation: ${pulse} 2s infinite;
    `}
  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const TicketPanel = styled.div`
  position: fixed;
  bottom: 160px;
  right: 20px;
  width: 400px;
  max-width: 90%;
  background: #f0f4f8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  animation: ${popUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform-origin: bottom right;
  z-index: 1200;
`;

const PanelHeader = styled.div`
  background: linear-gradient(135deg, rgb(255, 255, 255), rgb(255, 255, 255));
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  color: black;
  font-size: 1.8rem;
  letter-spacing: 2px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 15px;
  background: transparent;
  border: none;
  color: black;
  font-size: 1.8rem;
  cursor: pointer;
`;

const PanelBody = styled.div`
  padding: 20px;
  background: #e2e8f0;
`;

const FormField = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: #0055aa;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: #0055aa;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #a0aec0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: #0055aa;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: rgb(0, 0, 0);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgb(0, 0, 0);
  }
`;

const NextButton = styled(SubmitButton)`
  background-color: rgb(0, 0, 0);
  &:hover {
    background-color: #004488;
  }
`;

const GameLinks = styled.ul`
  margin: 10px 0 18px 0;
  padding-left: 20px;
`;

const GameLinkItem = styled.li`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
`;

const IconWrapper = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const LinkText = styled.a`
  color: #003366;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const Bifrost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [ticket, setTicket] = useState({
    category: '',
    email: '',
    name: '',
    message: '',
    subCategory: ''
  });

  const openPanel = () => {
    setTicket({
      category: '',
      email: '',
      name: '',
      message: '',
      subCategory: ''
    });
    setStep(1);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = e => {
    e.preventDefault();
    if (ticket.category) {
      setStep(2);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      if (!response.ok) {
        throw new Error('Noe gikk galt ved innsending av ticket');
      }
      const data = await response.json();
      console.log('Ticket submitted:', data);
      closePanel();
    } catch (error) {
      console.error('Feil under innsending:', error);
    }
  };

  return (
    <>
      <FloatingButtonWrapper>
        <CurvedText viewBox="0 0 120 40">
          <defs>
            <path id="curve" d="M10,30 Q60,0 110,30" />
          </defs>
          <text>
            <textPath href="#curve" startOffset="50%" textAnchor="middle">
              Need help?
            </textPath>
          </text>
        </CurvedText>
        <FloatingButton onClick={isOpen ? closePanel : openPanel} isOpen={isOpen}>
          <img src={BUTTON_IMAGE} alt="Ticket Icon" />
        </FloatingButton>
      </FloatingButtonWrapper>
      {isOpen && (
        <TicketPanel>
          <PanelHeader>
            <HeaderTitle>BIFROST SUPPORT</HeaderTitle>
            <CloseButton onClick={closePanel}>×</CloseButton>
          </PanelHeader>
          <PanelBody>
            {step === 1 && (
              <form onSubmit={handleCategorySubmit}>
                <FormField>
                  <Label htmlFor="category">Choose Category</Label>
                  <Select
                    id="category"
                    name="category"
                    value={ticket.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>-- Choose Category --</option>
                    <option value="Games">Games</option>
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Billing">Billing</option>
                    <option value="Support">Support</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormField>
                {/* Eksempel på sub-kategori for 'Games' */}
                {ticket.category === 'Games' && (
                  <>
                    <GameLinks>
                      <GameLinkItem>
                        <IconWrapper>
                          <FaQuestionCircle color="#003366" />
                        </IconWrapper>
                        <LinkText href="#help">Are you stuck?</LinkText>
                      </GameLinkItem>
                      <GameLinkItem>
                        <IconWrapper>
                          <FaInfoCircle color="#003366" />
                        </IconWrapper>
                        <LinkText href="#faq">Check our FAQ</LinkText>
                      </GameLinkItem>
                      <GameLinkItem>
                        <IconWrapper>
                          <FaGamepad color="#003366" />
                        </IconWrapper>
                        <LinkText href="#tips">Game Tips & Tricks</LinkText>
                      </GameLinkItem>
                      <GameLinkItem>
                        <IconWrapper>
                          <FaPhone color="#003366" />
                        </IconWrapper>
                        <LinkText href="#support">Contact Game Support</LinkText>
                      </GameLinkItem>
                    </GameLinks>
                    <FormField>
                      <Label htmlFor="subCategory">Game Sub-Category</Label>
                      <Input
                        type="text"
                        id="subCategory"
                        name="subCategory"
                        placeholder="E.g. 'Level 10 help'"
                        value={ticket.subCategory}
                        onChange={handleChange}
                      />
                    </FormField>
                  </>
                )}
                <NextButton type="submit">Next</NextButton>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <FormField>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={ticket.email}
                    onChange={handleChange}
                    required
                  />
                </FormField>
                <FormField>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={ticket.name}
                    onChange={handleChange}
                    required
                  />
                </FormField>
                <FormField>
                  <Label htmlFor="message">Message</Label>
                  <TextArea
                    id="message"
                    name="message"
                    rows="4"
                    value={ticket.message}
                    onChange={handleChange}
                    required
                  />
                </FormField>
                <SubmitButton type="submit">Submit</SubmitButton>
              </form>
            )}
          </PanelBody>
        </TicketPanel>
      )}
    </>
  );
};

export default Bifrost;
