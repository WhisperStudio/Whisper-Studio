import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CountdownWrapper = styled.div`
  font-size: 1.5rem;
  color: rgba(200, 200, 200, 0.8);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  margin-top: 1rem;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 1rem; /* Gir mellomrom mellom hvert <span> */
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
