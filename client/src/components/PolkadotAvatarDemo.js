import React, { useState, useEffect } from 'react';
import PolkadotAvatar from './PolkadotAvatar';

// Demo component showing different states
const PolkadotAvatarDemo = () => {
  const [currentState, setCurrentState] = useState('idle');

  useEffect(() => {
    // Demo state changes
    const states = ['idle', 'typing', 'thinking'];
    let index = 0;

    const interval = setInterval(() => {
      setCurrentState(states[index % states.length]);
      index++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>
        Polkadot Avatar Demo
      </h1>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {/* Main avatar */}
        <PolkadotAvatar
          state={currentState}
          size="150px"
          dotCount={12}
        />

        {/* State indicator */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3>Current State: {currentState.toUpperCase()}</h3>
          <p>Changes every 3 seconds</p>
        </div>
      </div>

      {/* Usage examples */}
      <div style={{
        display: 'flex',
        gap: '30px',
        marginTop: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <PolkadotAvatar
          state="idle"
          size="80px"
          baseHue={210}
        />

        <PolkadotAvatar
          state="typing"
          size="80px"
          baseHue={285}
        />

        <PolkadotAvatar
          state="thinking"
          size="80px"
          baseHue={160}
        />
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        marginTop: '30px',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h4>Usage:</h4>
        <pre style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
{`<PolkadotAvatar
  state="idle"        // idle, typing, thinking
  size="120px"        // avatar size
  dotCount={12}       // number of dots
  baseHue={210}       // base color (HSL hue)
  spinSpeed="6s"      // rotation speed
  pulseSpeed="1.8s"   // pulse animation speed
/>`}
        </pre>
      </div>
    </div>
  );
};

export default PolkadotAvatarDemo;
