import React, { useState } from 'react';
import GlassOrbAvatar from '../components/GlassOrbAvatar';

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
  const [glyph, setGlyph] = useState("A");

  return (
    
    <div style={styles.container}>
      <input
        value={glyph}
        onChange={(e) => setGlyph(e.target.value.toUpperCase().slice(0, 1))}
        maxLength={1}
      />
      <div style={styles.avatarContainer}>
        {/*<GlassOrbAvatar size={400} />*/}
      </div>
      <div style={styles.smallAvatarContainer}>
        <GlassOrbAvatar size={100} glyph={glyph}/>
      </div>
    </div>
  );
}

export default TestLanding;
