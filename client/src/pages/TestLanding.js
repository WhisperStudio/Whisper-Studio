import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GlassOrbAvatar from '../components/GlassOrbAvatar';

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
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
    color: '#2c3e50',
    fontFamily: '"Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '80px',
  },
  avatarContainer: {
    position: 'relative',
    width: '400px',
    height: '400px',
    zIndex: 3,
  },
  smallAvatarContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    zIndex: 3,
  },
};

function TestLanding() {
  return (
    <div style={styles.container}>
      <div style={styles.avatarContainer}>
        {/*<GlassOrbAvatar size={400} />*/}
      </div>
      <div style={styles.smallAvatarContainer}>
        <GlassOrbAvatar size={80} />
      </div>
    </div>
  );
}

export default TestLanding;
