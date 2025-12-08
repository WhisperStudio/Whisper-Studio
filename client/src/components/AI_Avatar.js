import React, { useRef, useEffect } from 'react';

/* ===================== GLASS ORB AVATAR (MESSAGE) ===================== */
const MessageAvatarPolkadot = ({ messageId, sender, isTyping }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef('idle'); // 'idle' | 'userTyping' | 'botTyping'

  // Oppdater "modus" basert på hvem som skriver
  useEffect(() => {
    if (isTyping) {
      stateRef.current = sender === 'user' ? 'userTyping' : 'botTyping';
    } else {
      stateRef.current = 'idle';
    }
  }, [isTyping, sender]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = container.clientWidth || 32;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const orbRadius = size / 2;
    const minRadius = orbRadius * 0.1;
    const maxRadius = orbRadius * 0.9;

    // --- FARGEPALLETT MODES ---
    const palettes = {
      idle: [
        { r: 170, g: 130, b: 255 }, // lilla
        { r: 120, g: 160, b: 255 }, // blå
        { r: 230, g: 150, b: 255 }, // rosa
      ],
      userTyping: [
        { r: 80, g: 200, b: 150 },
        { r: 100, g: 230, b: 170 },
      ], // grønn / turkis
      botTyping: [
        { r: 235, g: 90, b: 110 },
        { r: 255, g: 150, b: 140 },
      ], // rød / korall
    };

    let colorStops = palettes.idle;
    let colorIndex = 0;
    let colorProgress = 0;

    function updatePaletteFromState() {
      const mode = stateRef.current;
      const target = palettes[mode] || palettes.idle;
      if (target !== colorStops) {
        // bytt palett og restart overgang
        colorStops = target;
        colorIndex = 0;
        colorProgress = 0;
      }
    }

    function getBaseColor() {
      const current = colorStops[colorIndex];
      const next = colorStops[(colorIndex + 1) % colorStops.length];
      const r = Math.floor(current.r + (next.r - current.r) * colorProgress);
      const g = Math.floor(current.g + (next.g - current.g) * colorProgress);
      const b = Math.floor(current.b + (next.b - current.b) * colorProgress);
      return { r, g, b };
    }

    function rgbaFromBase({ r, g, b }, alpha) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function getColor(alpha = 0.3, variant = 'normal') {
      const base = getBaseColor();

      if (variant === 'pulled') {
        // dypere versjon av gjeldende farge
        const r = Math.max(0, Math.floor(base.r * 0.8));
        const g = Math.max(0, Math.floor(base.g * 0.8));
        const b = Math.max(0, Math.floor(base.b * 0.8));
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      if (variant === 'pushed') {
        // tydelig rød
        return `rgba(255, 80, 80, ${alpha})`;
      }

      return rgbaFromBase(base, alpha);
    }

    // --- PARAMETERE FOR EFFEKTER ---
    const pullAngleRange = 0.9;
    const maxPullAmount = orbRadius * 0.45;

    const basePullThicknessPx = 150; // tykkelse på ringen rundt kulen
    const pullRingThickness = basePullThicknessPx * (size / 400);

    const mouseRepelRadius = orbRadius * 0.35;
    const maxPushStrength = orbRadius * 0.08;

    let explosions = [];
    let mouseX = null;
    let mouseY = null;

    class Particle {
      constructor() {
        this.baseRadius = minRadius + Math.random() * (maxRadius - minRadius);
        this.angle = Math.random() * Math.PI * 2;
        this.speed =
          (Math.random() * 0.01 + 0.005) *
          (Math.random() < 0.5 ? 1 : -1);
        this.size = (Math.random() * 2 + 1.5) * (size / 100);
        this.radiusOffset = 0;
        this.angleOffset = 0;
        this.effect = 'none'; // 'none' | 'pulled' | 'pushed'
      }

      update() {
        this.angle += this.speed;

        let currentRadius = this.baseRadius + this.radiusOffset;
        let currentAngle = this.angle + this.angleOffset;

        const particleX = centerX + Math.cos(currentAngle) * currentRadius;
        const particleY = centerY + Math.sin(currentAngle) * currentRadius;

        let targetRadiusOffset = 0;
        let targetAngleOffset = 0;
        let effect = 'none';

        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - centerX;
          const dy = mouseY - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);

          // INSIDE ORB – push/force field
          if (distFromCenter < orbRadius - 2) {
            const distToMouse = Math.sqrt(
              (particleX - mouseX) ** 2 +
                (particleY - mouseY) ** 2
            );

            if (distToMouse < mouseRepelRadius) {
              const pushAngle = Math.atan2(
                particleY - mouseY,
                particleX - mouseX
              );
              const falloff = 1 - distToMouse / mouseRepelRadius;
              const pushStrength = falloff * falloff;

              const pushDx =
                Math.cos(pushAngle) *
                maxPushStrength *
                pushStrength;
              const pushDy =
                Math.sin(pushAngle) *
                maxPushStrength *
                pushStrength;

              const newX = particleX + pushDx;
              const newY = particleY + pushDy;

              const newDx = newX - centerX;
              const newDy = newY - centerY;
              const newRadius = Math.sqrt(
                newDx * newDx + newDy * newDy
              );
              const newAngle = Math.atan2(newDy, newDx);

              targetRadiusOffset =
                Math.max(minRadius, Math.min(maxRadius, newRadius)) -
                this.baseRadius;
              targetAngleOffset = newAngle - this.angle;
              effect = 'pushed';
            }
          }
          // OUTSIDE ORB – pull ring
          else if (distFromCenter >= orbRadius) {
            const mouseAngle = Math.atan2(dy, dx);
            const particleAngle = Math.atan2(
              particleY - centerY,
              particleX - centerX
            );

            let angleDiff = Math.abs(mouseAngle - particleAngle);
            if (angleDiff > Math.PI)
              angleDiff = 2 * Math.PI - angleDiff;

            const radialFromBorder = distFromCenter - orbRadius;

            if (
              angleDiff < pullAngleRange &&
              radialFromBorder >= 0 &&
              radialFromBorder <= pullRingThickness
            ) {
              const t = radialFromBorder / pullRingThickness; // 0 ved kant, 1 ytterst
              let pullStrength = 1 - t;
              pullStrength = Math.pow(pullStrength, 1.5);

              const angleFactor =
                1 - angleDiff / pullAngleRange;
              pullStrength *= angleFactor;

              targetRadiusOffset = maxPullAmount * pullStrength;
              effect = 'pulled';
            }
          }
        }

        // Eksplosjoner (push ut fra klikk)
        explosions.forEach((explosion) => {
          const distToExplosion = Math.sqrt(
            (particleX - explosion.x) ** 2 +
              (particleY - explosion.y) ** 2
          );

          if (distToExplosion < explosion.radius) {
            const explosionAngle = Math.atan2(
              particleY - explosion.y,
              particleX - explosion.x
            );
            const falloff =
              1 - distToExplosion / explosion.radius;
            const explosionPush =
              falloff * falloff * explosion.strength * 0.6;

            const pushDx =
              Math.cos(explosionAngle) * explosionPush;
            const pushDy =
              Math.sin(explosionAngle) * explosionPush;

            const newX = particleX + pushDx;
            const newY = particleY + pushDy;

            const newDx = newX - centerX;
            const newDy = newY - centerY;
            const newRadius = Math.sqrt(
              newDx * newDx + newDy * newDy
            );
            const newAngle = Math.atan2(newDy, newDx);

            targetRadiusOffset =
              Math.max(minRadius, Math.min(maxRadius, newRadius)) -
              this.baseRadius;
            targetAngleOffset = newAngle - this.angle;
            effect = 'pushed';
          }
        });

        // Smooth overgang og decay
        this.radiusOffset +=
          (targetRadiusOffset - this.radiusOffset) * 0.15;
        this.angleOffset +=
          (targetAngleOffset - this.angleOffset) * 0.15;
        this.radiusOffset *= 0.96;
        this.angleOffset *= 0.96;

        this.effect = effect;
      }

      draw() {
        const currentRadius = this.baseRadius + this.radiusOffset;
        const currentAngle = this.angle + this.angleOffset;

        const x =
          centerX + Math.cos(currentAngle) * currentRadius;
        const y =
          centerY + Math.sin(currentAngle) * currentRadius;

        let variant = 'normal';
        if (this.effect === 'pulled') variant = 'pulled';
        if (this.effect === 'pushed') variant = 'pushed';

        const color = getColor(0.35, variant);
        const glowColor = getColor(
          this.effect === 'pushed' ? 0.35 : 0.2,
          variant
        );

        ctx.shadowBlur = 8 * (size / 100);
        ctx.shadowColor = glowColor;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 14 * (size / 100);
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          this.size + 2 * (size / 100),
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const particles = [];
    const particleCount = 250; // avatar-størrelse
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      updatePaletteFromState();

      // farge-syklus
      colorProgress += 0.01;
      if (colorProgress >= 1) {
        colorProgress = 0;
        colorIndex = (colorIndex + 1) % colorStops.length;
      }

      // decay eksplosjoner
      explosions = explosions.filter((explosion) => {
        explosion.strength *= explosion.decay;
        return explosion.strength > 0.3;
      });

      ctx.clearRect(0, 0, size, size);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animRef.current = requestAnimationFrame(animate);
    }

    // Mus-events på containeren (for pull/push)
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = null;
      mouseY = null;
    };
    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const dx = clickX - centerX;
      const dy = clickY - centerY;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      if (distFromCenter < orbRadius - 2) {
        explosions.push({
          x: clickX,
          y: clickY,
          radius: orbRadius * 0.45,
          strength: orbRadius * 0.1,
          decay: 0.86,
        });
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('click', onClick);

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};

export { MessageAvatarPolkadot };
