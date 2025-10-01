import React, { useEffect, useRef } from 'react';

const CONFIG = {
  bubbleCount: 80,
  minRadius: 6,
  maxRadius: 26,
  minSpeed: 0.2,
  maxSpeed: 0.9,
  driftStrength: 0.3,
};

const createBubble = (width, height) => {
  const radius = Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius;

  return {
    x: Math.random() * width,
    y: height + radius + Math.random() * height * 0.3,
    radius,
    speed: Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed,
    drift: (Math.random() - 0.5) * CONFIG.driftStrength,
    driftPhase: Math.random() * Math.PI * 2,
    hue: Math.floor(Math.random() * 40) + 190,
  };
};

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #020b2a 0%, #01204a 50%, #011a32 100%)',
    color: '#f5f9ff',
    fontFamily: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: 'blur(0.3px)',
  },
  overlay: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    padding: '0 24px',
    pointerEvents: 'none',
    backdropFilter: 'blur(6px)',
  },
  title: {
    fontSize: 'clamp(2.5rem, 4vw, 4.5rem)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '16px',
    textShadow: '0 0 18px rgba(76, 222, 255, 0.4)',
  },
  subtitle: {
    fontSize: 'clamp(1.1rem, 2.4vw, 1.6rem)',
    maxWidth: '620px',
    lineHeight: 1.5,
    opacity: 0.85,
  },
  accent: {
    color: '#4cdeff',
  },
};

function BubbleAnimation() {
  const canvasRef = useRef(null);
  const animationFrame = useRef(null);
  const bubblesRef = useRef([]);
  const dprRef = useRef(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Create BroadcastChannel for cross-tab communication
    const channel = new BroadcastChannel('bubble_channel');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'pointer') {
        const { x, y } = event.data;
        handleRemotePointer(x, y, bubblesRef.current, height);
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.scale(dpr, dpr);

      bubblesRef.current = Array.from({ length: CONFIG.bubbleCount }, () => createBubble(width, height));
    };

    const drawBubble = (bubble) => {
      const gradient = ctx.createRadialGradient(
        bubble.x,
        bubble.y,
        bubble.radius * 0.1,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      gradient.addColorStop(0, `hsla(${bubble.hue}, 90%, 65%, 0.95)`);
      gradient.addColorStop(0.4, `hsla(${bubble.hue}, 90%, 55%, 0.55)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateBubble = (bubble) => {
      bubble.y -= bubble.speed;
      bubble.x += Math.sin(bubble.driftPhase) * bubble.drift;
      bubble.driftPhase += bubble.speed * 0.015;

      if (bubble.y + bubble.radius < -40) {
        Object.assign(bubble, createBubble(width, height));
        bubble.y = height + bubble.radius + Math.random() * height * 0.3;
      }

      const boundaryPadding = bubble.radius * 1.5;
      if (bubble.x < -boundaryPadding) bubble.x = width + boundaryPadding;
      if (bubble.x > width + boundaryPadding) bubble.x = -boundaryPadding;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bubblesRef.current.length; i += 1) {
        const bubble = bubblesRef.current[i];
        updateBubble(bubble);
        drawBubble(bubble);
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    const handleRemotePointer = (x, y, bubbles, height) => {
      bubbles.forEach((bubble) => {
        const dx = bubble.x - x;
        const dy = bubble.y - y;
        const distanceSq = dx * dx + dy * dy;
        const influenceRadius = Math.max(height * 0.25, 240);

        if (distanceSq < influenceRadius * influenceRadius) {
          bubble.x += dx * 0.005;
          bubble.y += dy * 0.004;
        }
      });
    };

    const handlePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;

      // Send pointer position to other tabs
      channel.postMessage({
        type: 'pointer',
        x: pointerX,
        y: pointerY
      });

      // Local pointer handling
      bubblesRef.current.forEach((bubble) => {
        const dx = bubble.x - pointerX;
        const dy = bubble.y - pointerY;
        const distanceSq = dx * dx + dy * dy;
        const influenceRadius = Math.max(height * 0.25, 240);

        if (distanceSq < influenceRadius * influenceRadius) {
          bubble.x += dx * 0.008;
          bubble.y += dy * 0.006;
        }
      });
    };

    resizeCanvas();
    animationFrame.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('pointermove', handlePointer);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      channel.close();

      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointermove', handlePointer);
    };
  }, []);

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      <div style={styles.overlay}>
        <h1 style={styles.title}>
          <span style={styles.accent}>Vintra</span> Design Experiment
        </h1>
        <p style={styles.subtitle}>
          Experience interconnected bubbles across browser tabs. Open this page in multiple windows to see the connection.
        </p>
      </div>
    </div>
  );
}

export default BubbleAnimation;
