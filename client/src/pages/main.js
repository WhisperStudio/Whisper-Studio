import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #fff 0%, #fff 100%);
  position: relative;
  overflow: hidden;
`;

const Text = styled(motion.h1)`
  font-size: 3em;
  color: #000;
  text-align: center;
  z-index: 10;
`;

const Star = styled(motion.div)`
  position: absolute;
  width: 2px;
  height: 2px;
  background: #000;
  border-radius: 50%;
`;

const Main = () => {
  const [stars, setStars] = useState([]);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const generateStars = () => {
      const starsArray = [];
      for (let i = 0; i < 200; i++) {
        starsArray.push({
          id: i,
          left: Math.random() * window.innerWidth,
          top: Math.random() * window.innerHeight,
          scale: Math.random() + 0.5,
          opacity: Math.random(),
        });
      }
      setStars(starsArray);
    };

    generateStars();
  }, []);

  const handleMouseMove = (event) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  };

  return (
    <Wrapper onMouseMove={handleMouseMove}>
      <Text
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Under Development by Whisper Studios
      </Text>
      {stars.map((star) => (
        <Star
          key={star.id}
          initial={{
            x: star.left, // Use initial star positions
            y: star.top,  // Use initial star positions
            scale: star.scale,
            opacity: star.opacity,
          }}
          animate={{
            x: star.left + (mousePosition.current.x - star.left) * 0.5, // Add to initial position
            y: star.top + (mousePosition.current.y - star.top) * 0.5,   // Add to initial position
            transition: {
              type: "spring",
              stiffness: 80,
              damping: 8,
              mass: 0.2,
            },
          }}
        />
      ))}
    </Wrapper>
  );
};

export default Main;