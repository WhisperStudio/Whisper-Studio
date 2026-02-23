import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CountdownWrapper = styled.div`
  font-size: 1.5rem;
  color: #C7A44C;
  text-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.8),
    0 0 12px rgba(199, 164, 76, 0.3);
  margin-top: 1rem;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 1px;
  
  span {
    background: linear-gradient(135deg, rgba(199,164,76,0.1), rgba(199,164,76,0.05));
    padding: 0.5rem 1rem;
    border: 1px solid rgba(199,164,76,0.3);
    border-radius: 6px;
    min-width: 60px;
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  }
  
  span:hover {
    background: linear-gradient(135deg, rgba(199,164,76,0.15), rgba(199,164,76,0.08));
    border-color: rgba(199,164,76,0.5);
    box-shadow: 
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 0 8px rgba(199,164,76,0.2);
  }
`;

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Sett måldatoen her
    const targetDate = new Date('December 1, 2026 00:00:00').getTime();

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // Hvis vi har passert måldatoen
      if (distance < 0) {
        clearInterval(intervalId);
        return;
      }

      // Kalkuler dager, timer, minutter og sekunder som er igjen
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CountdownWrapper>
      <span>{timeLeft.days}d</span>
      <span>{timeLeft.hours}h</span>
      <span>{timeLeft.minutes}m</span>
      <span>{timeLeft.seconds}s</span>
    </CountdownWrapper>
  );
};

export default Countdown;
