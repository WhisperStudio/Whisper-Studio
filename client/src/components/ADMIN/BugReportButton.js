import { useState } from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import BugReport from './BugReport';

const FloatingButton = styled.button`
  position: fixed;
  bottom: 6rem;
  right: 1rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 
    0 8px 25px rgba(255, 107, 107, 0.4),
    0 0 0 1px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
  z-index: 40;
  animation: pulse 2s infinite;

  &:hover {
    transform: scale(1.1);
    box-shadow: 
      0 12px 35px rgba(255, 107, 107, 0.5),
      0 0 0 1px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  @keyframes pulse {
    0%, 100% { 
      box-shadow: 
        0 8px 25px rgba(255, 107, 107, 0.4),
        0 0 0 1px rgba(255, 107, 107, 0.2);
    }
    50% { 
      box-shadow: 
        0 8px 25px rgba(255, 107, 107, 0.6),
        0 0 0 8px rgba(255, 107, 107, 0.1);
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background: #ff6b6b;
    transform: scale(1.1);
  }
`;

const BugReportButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <FloatingButton 
        onClick={() => setShowModal(true)}
        title="Rapporter problem eller bug"
      >
        <FiAlertTriangle />
      </FloatingButton>

      <Modal show={showModal}>
        <ModalContent>
          <CloseButton onClick={() => setShowModal(false)}>
            <FiX />
          </CloseButton>
          <BugReport />
        </ModalContent>
      </Modal>
    </>
  );
};

export default BugReportButton;
