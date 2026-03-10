import React, { useMemo, useState } from 'react';
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
  },

  stage: {
    position: 'relative',
    width: '900px',
    height: '520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarContainer: {
    position: 'absolute',
    right: '120px',
    width: '140px',
    height: '140px',
    zIndex: 5,
  },

  chatWindow: {
    position: 'absolute',
    right: '300px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '360px',
    height: '460px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.15)',
    border: '1px solid rgba(255,255,255,0.55)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 4,
  },

  chatHeader: {
    height: '76px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 18px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.5))',
  },

  headerOrbWrap: {
    position: 'relative',
    width: '42px',
    height: '42px',
    flexShrink: 0,
  },

  headerTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  headerTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#122033',
  },

  headerSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },

  messages: {
    flex: 1,
    padding: '18px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background:
      'linear-gradient(180deg, rgba(248,250,252,0.6) 0%, rgba(255,255,255,0.35) 100%)',
  },

  messageRowBot: {
    display: 'flex',
    justifyContent: 'flex-start',
  },

  messageRowUser: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  bubbleBot: {
    maxWidth: '78%',
    padding: '12px 14px',
    borderRadius: '16px 16px 16px 6px',
    background: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    lineHeight: 1.45,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
  },

  bubbleUser: {
    maxWidth: '78%',
    padding: '12px 14px',
    borderRadius: '16px 16px 6px 16px',
    background: 'linear-gradient(135deg, #dffcff 0%, #d7f7ea 100%)',
    color: '#0f172a',
    fontSize: '14px',
    lineHeight: 1.45,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
  },

  inputArea: {
    padding: '14px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: 'rgba(255,255,255,0.72)',
  },

  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 10px 10px 14px',
    borderRadius: '18px',
    background: '#ffffff',
    boxShadow: 'inset 0 0 0 1px rgba(15, 23, 42, 0.08)',
  },

  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#0f172a',
    fontFamily: 'inherit',
  },

  sendButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '10px 14px',
    background: '#111827',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },

  glyphInput: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    width: '56px',
    height: '44px',
    textAlign: 'center',
    fontSize: '18px',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.1)',
    background: 'rgba(255,255,255,0.85)',
    outline: 'none',
  },
};

function TestLanding() {
  const [glyph, setGlyph] = useState('A');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [glyphFont, setGlyphFont] = useState('Times New Roman');

  const sampleMessages = useMemo(
    () => [
      { from: 'bot', text: 'Hei! Dette er et eksempel på chatvinduet ditt.' },
      { from: 'bot', text: 'Når du skriver i feltet under, kan GlassOrb endre farge.' },
      { from: 'user', text: 'Det ser bra ut. Jeg vil teste orb + chat.' },
    ],
    []
  );

  const orbState = chatInput.trim().length > 0 ? 'typing' : chatOpen ? 'listening' : 'idle';

  return (
    <div style={styles.container}>
      <input
        style={styles.glyphInput}
        value={glyph}
        onChange={(e) => setGlyph(e.target.value.toUpperCase().slice(0, 1))}
        maxLength={1}
      />
      <select value={glyphFont} onChange={(e) => setGlyphFont(e.target.value)}>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Arial">Arial</option>
        <option value="Verdana">Verdana</option>
        <option value="Courier New">Courier New</option>
      </select>

      <div style={styles.stage}>
        {chatOpen && (
          <div style={styles.chatWindow}>
            <div style={styles.chatHeader}>
              <div style={styles.headerOrbWrap}>
                <GlassOrbAvatar
                  size={42}
                  glyph={glyph}
                  variant="chatHeader"
                  interactive={false}
                  forceState={chatInput.trim() ? 'typing' : 'idle'}
                  style={{
                    position: 'relative',
                    width: '42px',
                    height: '42px',
                  }}
                />
              </div>

              <div style={styles.headerTitleWrap}>
                <div style={styles.headerTitle}>GlassOrb Assistant</div>
                <div style={styles.headerSubtitle}>
                  Eksempel-chat med enkel header-orb
                </div>
              </div>
            </div>

            <div style={styles.messages}>
              {sampleMessages.map((msg, index) => (
                <div
                  key={index}
                  style={msg.from === 'bot' ? styles.messageRowBot : styles.messageRowUser}
                >
                  <div style={msg.from === 'bot' ? styles.bubbleBot : styles.bubbleUser}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {chatInput.trim().length > 0 && (
                <div style={styles.messageRowUser}>
                  <div style={styles.bubbleUser}>{chatInput}</div>
                </div>
              )}
            </div>

            <div style={styles.inputArea}>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Skriv en melding..."
                />
                <button
                  style={styles.sendButton}
                  onClick={() => {
                    console.log('Send melding:', chatInput);
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.avatarContainer}>
          <GlassOrbAvatar
            size={140}
            glyph={chatOpen ? 'X' : glyph}
            glyphFont={chatOpen ? 'Arial' : glyphFont}
            onClick={() => setChatOpen((prev) => !prev)}
            forceState={orbState}
            forceGlyphReveal={chatOpen}
            hideRingParticles={chatOpen}
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TestLanding;