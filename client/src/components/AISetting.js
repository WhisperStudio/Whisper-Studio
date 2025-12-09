import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiAlertTriangle, FiSave, FiX } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 1000;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  svg {
    margin-right: 1rem;
    font-size: 2rem;
    color: #e57846ff;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.primary ? `
    background-color: #4f46e5;
    color: white;
    border: 1px solid #4338ca;
    
    &:hover {
      background-color: #4338ca;
    }
  ` : `
    background-color: transparent;
    color: #e5e7eb;
    border: 1px solid #4b5563;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const AISettings = () => {
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Operational');
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'AI is currently under maintenance. Please check back later or contact support if you need assistance.'
  );
  const [settings, setSettings] = useState({
    theme: 'dark',
    avatarSkin: 'default'
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load AI settings
        const savedSettings = localStorage.getItem('aiSettings');
        if (savedSettings) {
          const { isEnabled, message } = JSON.parse(savedSettings);
          setIsBotEnabled(isEnabled);
          setStatus(isEnabled ? 'Operational' : 'Maintenance');
          if (message) setMaintenanceMessage(message);
        }
        
        // Load theme and avatar settings
        const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        setSettings(prev => ({
          ...prev,
          theme: adminSettings.theme || 'dark',
          avatarSkin: adminSettings.avatarSkin || 'default'
        }));
      } catch (error) {
        console.error('Error loading AI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Save to localStorage
    const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    const updatedSettings = { ...currentSettings, ...updated };
    localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
    
    // Apply theme
    if (newSettings.theme) {
      document.documentElement.setAttribute('data-theme', newSettings.theme);
    }
  };

  const handleToggleBot = async () => {
    const newState = !isBotEnabled;
    setIsSaving(true);
    
    try {
      updateSettings({ isEnabled: newState });
      
      // In a real app, you would save this to your backend
      const settings = {
        isEnabled: newState,
        message: maintenanceMessage,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      localStorage.setItem('aiMaintenanceMode', !newState);
      
      setIsBotEnabled(newState);
      setStatus(newState ? 'Operational' : 'Maintenance');
    } catch (error) {
      console.error('Error updating bot settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMessage = async () => {
    try {
      const settings = {
        isEnabled: isBotEnabled,
        message: maintenanceMessage,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      
      // Show success message
      alert('Maintenance message updated successfully!');
    } catch (error) {
      console.error('Error updating maintenance message:', error);
      alert('Failed to update maintenance message. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      const settings = {
        isEnabled: isBotEnabled,
        message: maintenanceMessage,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      localStorage.setItem('aiMaintenanceMode', !isBotEnabled);
      
      setIsBotEnabled(isBotEnabled);
      setStatus(isBotEnabled ? 'Operational' : 'Maintenance');
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <BsRobot />
          <h1>AI Configuration</h1>
        </Header>
        <Card>
          <p>Loading settings...</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BsRobot />
        <h1>AI Configuration</h1>
      </Header>
      
      <Grid>
        <Card>
          <h2>AI Bot Status</h2>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: isBotEnabled ? '#10b981' : '#f59e0b',
            margin: '1rem 0'
          }}>
            {isBotEnabled ? (
              <>
                <FiCheckCircle style={{ marginRight: '0.5rem' }} />
                <span>Bot is currently <strong>enabled</strong></span>
              </>
            ) : (
              <>
                <FiAlertTriangle style={{ marginRight: '0.5rem' }} />
                <span>Bot is currently <strong>disabled</strong> (maintenance mode)</span>
              </>
            )}
          </p>
          
          <div style={{ margin: '1.5rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input 
                  type="checkbox" 
                  checked={isBotEnabled}
                  onChange={handleToggleBot}
                  disabled={isSaving}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '3.75rem',
                  height: '1.875rem',
                  backgroundColor: isBotEnabled ? '#10b981' : '#6b7280',
                  borderRadius: '0.9375rem',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0.1875rem',
                    left: isBotEnabled ? 'calc(100% - 1.5rem - 0.1875rem)' : '0.1875rem',
                    width: '1.5rem',
                    height: '1.5rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {isSaving ? (
                      <div style={{ 
                        width: '0.75rem', 
                        height: '0.75rem', 
                        border: '2px solid #ccc', 
                        borderTopColor: '#4f46e5', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                    ) : isBotEnabled ? (
                      <FiCheckCircle style={{ color: '#10b981' }} />
                    ) : (
                      <FiX style={{ color: '#6b7280' }} />
                    )}
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: 500 }}>
                {isBotEnabled ? 'Disable' : 'Enable'} AI Bot
              </span>
              {isSaving && (
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Saving...
                </span>
              )}
            </label>
          </div>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: 'rgba(0,0,0,0.2)', 
            borderRadius: '0.5rem' 
          }}>
            <h3>Current Status</h3>
            <p>Status: <strong>{status}</strong></p>
            <p>Version: <strong>1.0.0</strong></p>
            <p>Last Updated: <strong>{new Date().toLocaleString()}</strong></p>
          </div>
        </Card>
        
        <Card>
          <h2>Maintenance Message</h2>
          <p style={{ margin: '0.5rem 0 1rem' }}>
            Customize the message shown to users when the bot is disabled:
          </p>
          <textarea 
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            style={{
              width: '100%',
              minHeight: '7.5rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.375rem',
              color: 'white',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              resize: 'vertical',
              marginBottom: '1rem'
            }}
            placeholder="AI is currently under maintenance. Please check back later or contact support if you need assistance."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              primary 
              onClick={handleSaveMessage} 
              disabled={isSaving || !maintenanceMessage.trim()}
            >
              <FiSave /> Save Message
            </Button>
          </div>
        </Card>
      </Grid>
      
      <Card>
        <h2>Appearance</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Theme</label>
          <select 
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value })}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid #4b5563',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <option value="dark" style={{ color: '#fff', backgroundColor: '#3a3939ff' }}>Dark</option>
            <option value="light" style={{ color: '#fff', backgroundColor: '#3a3939ff' }}>Light</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Avatar Skin</label>
          <select 
            value={settings.avatarSkin}
            onChange={(e) => updateSettings({ avatarSkin: e.target.value })}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid #4b5563',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <option value="default" style={{ color: '#fff', backgroundColor: '#3a3939ff' }}>Default</option>
            <option value="juleskin" style={{ color: '#fff', backgroundColor: '#3a3939ff' }}>Christmas Theme</option>
          </select>
        </div>
      </Card>
      
      <Card>
        <h2>Advanced Settings</h2>
        <p>Configure advanced AI settings and behavior.</p>
        
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div>
            <h3>Response Settings</h3>
            <div style={{ marginTop: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Response Temperature
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                defaultValue="0.7" 
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.8rem', 
                color: '#9ca3af' 
              }}>
                <span>More Precise</span>
                <span>More Creative</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3>Content Filtering</h3>
            <div style={{ marginTop: '0.75rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem' 
              }}>
                <input type="checkbox" defaultChecked />
                Enable Safe Search
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <input type="checkbox" defaultChecked />
                Filter Inappropriate Content
              </label>
            </div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '0.75rem' 
        }}>
          <Button>
            Reset to Defaults
          </Button>
          <Button primary>
            Save All Settings
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default AISettings;
