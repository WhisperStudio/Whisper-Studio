import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  background: none;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const GlassOrb = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  box-shadow: 
    0 0 10px rgba(100, 150, 255, 0.5),
    0 0 20px rgba(100, 150, 255, 0.3),
    0 0 40px rgba(100, 150, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  background: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const GlassOrbAvatar = ({ messageId, sender, isTyping, style, className, size = 40 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: size, height: size });
  
  // Color states
  const [colorState, setColorState] = useState('idle'); // 'idle' | 'typing' | 'listening'
  
  // Enhanced color palettes for better visibility and vibrancy
  const colorPalettes = {
    idle: [
      { r: 80, g: 150, b: 255 },   // Deep blue
      { r: 90, g: 170, b: 255 },   // Brighter blue
      { r: 100, g: 190, b: 255 },  // Light blue
      { r: 130, g: 170, b: 255 },  // Soft blue
      { r: 160, g: 150, b: 255 },  // Purple-blue
      { r: 200, g: 130, b: 255 },  // Purple
      { r: 230, g: 120, b: 255 }   // Pink
    ],
    typing: [
      { r: 50, g: 200, b: 50 },    // Bright green
      { r: 70, g: 220, b: 70 },    // Brighter green
      { r: 100, g: 240, b: 100 }   // Light green
    ],
    listening: [
      { r: 255, g: 100, b: 100 },  // Bright red
      { r: 255, g: 150, b: 100 },  // Orange-red
      { r: 255, g: 200, b: 100 }   // Orange-yellow
    ]
  };

  useEffect(() => {
    if (isTyping) {
      setColorState('typing');
    } else {
      setColorState('idle');
    }
  }, [isTyping]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const updateDimensions = () => {
      const size = Math.min(container.offsetWidth, container.offsetHeight);
      canvas.width = size;
      canvas.height = size;
      setDimensions({ width: size, height: size });
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    
    // Animation variables
    let particles = [];
    let explosions = [];
    let mouseX = null;
    let mouseY = null;
    let colorIndex = 0;
    let colorProgress = 0;
    
    // Get current color based on state and progress
    const getCurrentColor = (alpha = 0.3, variant = 'normal') => {
      const colors = colorPalettes[colorState] || colorPalettes.idle;
      const current = colors[colorIndex % colors.length];
      const next = colors[(colorIndex + 1) % colors.length];
      
      let r, g, b;
      
      if (variant === 'pulled') {
        // Darker version of current color for pulled particles
        r = Math.max(0, Math.floor(current.r * 0.7));
        g = Math.max(0, Math.floor(current.g * 0.7));
        b = Math.max(0, Math.floor(current.b * 0.7));
      } else if (variant === 'pushed') {
        // Red tint for pushed particles
        r = 255;
        g = Math.max(0, Math.floor(current.g * 0.5));
        b = Math.max(0, Math.floor(current.b * 0.5));
      } else {
        // Normal gradient between colors
        r = Math.floor(current.r + (next.r - current.r) * colorProgress);
        g = Math.floor(current.g + (next.g - current.g) * colorProgress);
        b = Math.floor(current.b + (next.b - current.b) * colorProgress);
      }
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Initialize particles
    const initParticles = () => {
      const size = Math.min(canvas.width, canvas.height);
      const count = Math.floor(300 * (size / 100)); // Scale particle count with size
      
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };
    
    // Particle class
    class Particle {
      constructor() {
        const size = Math.min(canvas.width, canvas.height);
        this.orbRadius = size / 2;
        this.minRadius = this.orbRadius * 0.1;
        this.maxRadius = this.orbRadius * 0.9;
        
        this.baseRadius = this.minRadius + Math.random() * (this.maxRadius - this.minRadius);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() * 0.01 + 0.005) * (Math.random() < 0.5 ? 1 : -1);
        this.size = (Math.random() * 2 + 1.5) * (size / 100);
        this.radiusOffset = 0;
        this.angleOffset = 0;
        this.effect = 'none'; // 'none' | 'pulled' | 'pushed'
      }
      
      update() {
        const size = Math.min(canvas.width, canvas.height);
        const centerX = size / 2;
        const centerY = size / 2;
        const orbRadius = size / 2;
        
        this.angle += this.speed;
        
        // Calculate base position
        let currentRadius = this.baseRadius + this.radiusOffset;
        let currentAngle = this.angle + this.angleOffset;
        
        const particleX = centerX + Math.cos(currentAngle) * currentRadius;
        const particleY = centerY + Math.sin(currentAngle) * currentRadius;
        
        let targetRadiusOffset = 0;
        let targetAngleOffset = 0;
        let effect = 'none';
        
        // Mouse interaction
        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - centerX;
          const dy = mouseY - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          
          // Inside orb - push effect (mouse repels particles)
          if (distFromCenter < orbRadius - 2) {
            const distToMouse = Math.sqrt(
              (particleX - mouseX) ** 2 + 
              (particleY - mouseY) ** 2
            );
            
            if (distToMouse < orbRadius * 0.25) { // Mouse repulsion radius
              const pushAngle = Math.atan2(particleY - mouseY, particleX - mouseX);
              const falloff = 1 - distToMouse / (orbRadius * 0.25);
              const pushStrength = falloff * falloff * (orbRadius * 0.1);
              
              const pushDx = Math.cos(pushAngle) * pushStrength;
              const pushDy = Math.sin(pushAngle) * pushStrength;
              
              const newX = particleX + pushDx;
              const newY = particleY + pushDy;
              
              const newDx = newX - centerX;
              const newDy = newY - centerY;
              const newRadius = Math.sqrt(newDx * newDx + newDy * newDy);
              const newAngle = Math.atan2(newDy, newDx);
              
              targetRadiusOffset = Math.max(this.minRadius, Math.min(this.maxRadius, newRadius)) - this.baseRadius;
              targetAngleOffset = newAngle - this.angle;
              effect = 'pushed';
            }
          }
          // Outside orb - pull effect (mouse attracts particles)
          else if (distFromCenter >= orbRadius) {
            const mouseAngle = Math.atan2(dy, dx);
            const particleAngle = Math.atan2(particleY - centerY, particleX - centerX);
            
            let angleDiff = Math.abs(mouseAngle - particleAngle);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            const pullAngleRange = 1.0;
            const maxPullAmount = orbRadius * 0.5;
            const pullRingThickness = orbRadius * 0.8;
            const radialFromBorder = distFromCenter - orbRadius;
            
            if (angleDiff < pullAngleRange && radialFromBorder >= 0 && radialFromBorder <= pullRingThickness) {
              const t = radialFromBorder / pullRingThickness;
              let pullStrength = 1 - t;
              pullStrength = Math.pow(pullStrength, 1.5);
              
              const angleFactor = 1 - (angleDiff / pullAngleRange);
              pullStrength *= angleFactor;
              
              targetRadiusOffset = maxPullAmount * pullStrength;
              effect = 'pulled';
            }
          }
        }
        
        // Handle explosions (from clicks)
        explosions.forEach(explosion => {
          const distToExplosion = Math.sqrt(
            (particleX - explosion.x) ** 2 + 
            (particleY - explosion.y) ** 2
          );
          
          if (distToExplosion < explosion.radius) {
            const explosionAngle = Math.atan2(particleY - explosion.y, particleX - explosion.x);
            const falloff = 1 - distToExplosion / explosion.radius;
            const explosionPush = falloff * falloff * explosion.strength * 0.6;
            
            const pushDx = Math.cos(explosionAngle) * explosionPush;
            const pushDy = Math.sin(explosionAngle) * explosionPush;
            
            const newX = particleX + pushDx;
            const newY = particleY + pushDy;
            
            const newDx = newX - centerX;
            const newDy = newY - centerY;
            const newRadius = Math.sqrt(newDx * newDx + newDy * newDy);
            const newAngle = Math.atan2(newDy, newDx);
            
            targetRadiusOffset = Math.max(this.minRadius, Math.min(this.maxRadius, newRadius)) - this.baseRadius;
            targetAngleOffset = newAngle - this.angle;
            effect = 'pushed';
          }
        });
        
        // Smooth transitions
        this.radiusOffset += (targetRadiusOffset - this.radiusOffset) * 0.15;
        this.angleOffset += (targetAngleOffset - this.angleOffset) * 0.15;
        
        // Apply some damping
        this.radiusOffset *= 0.96;
        this.angleOffset *= 0.96;
        
        this.effect = effect;
      }
      
      draw() {
        const size = Math.min(canvas.width, canvas.height);
        const centerX = size / 2;
        const centerY = size / 2;
        
        const currentRadius = this.baseRadius + this.radiusOffset;
        const currentAngle = this.angle + this.angleOffset;
        
        const x = centerX + Math.cos(currentAngle) * currentRadius;
        const y = centerY + Math.sin(currentAngle) * currentRadius;
        
        // Determine color based on effect
        let colorVariant = 'normal';
        if (this.effect === 'pulled') colorVariant = 'pulled';
        if (this.effect === 'pushed') colorVariant = 'pushed';
        
        const color = getCurrentColor(0.3, colorVariant);
        const glowColor = getCurrentColor(0.15, colorVariant);
        
        // Draw particle
        ctx.shadowBlur = 12 * (size / 100);
        ctx.shadowColor = glowColor;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        ctx.shadowBlur = 20 * (size / 100);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(x, y, this.size + 2 * (size / 100), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    // Initialize particles
    initParticles();
    
    // Mouse move handler
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    // Click handler for explosions
    const handleClick = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const dx = clickX - centerX;
      const dy = clickY - centerY;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      
      if (distFromCenter < (canvas.width / 2) - 10) {
        explosions.push({
          x: clickX,
          y: clickY,
          radius: (canvas.width / 2) * 0.25,
          strength: (canvas.width / 2) * 0.08,
          decay: 0.85
        });
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!canvasRef.current) return;
      
      const size = Math.min(canvas.width, canvas.height);
      
      // Update color gradient
      colorProgress += 0.003;
      if (colorProgress >= 1) {
        colorProgress = 0;
        colorIndex = (colorIndex + 1) % (colorPalettes[colorState]?.length || 3);
      }
      
      // Clear canvas with full transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and filter out weak explosions
      explosions = explosions.filter(explosion => {
        explosion.strength *= explosion.decay;
        return explosion.strength > 0.3;
      });
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Add event listeners
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [isTyping, colorState]);

  return (
    <Container 
      ref={containerRef} 
      className={className}
      style={{
        width: style?.width || `${size}px`,
        height: style?.height || `${size}px`,
        ...style
      }}
    >
      <GlassOrb />
      <Canvas ref={canvasRef} />
    </Container>
  );
};

export default GlassOrbAvatar;
