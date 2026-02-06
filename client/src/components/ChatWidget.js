// Install the widget in your React/Next.js app
import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    // Add glassmorphism styles for the chat widget
    const style = document.createElement('style');
    style.textContent = `
      /* Glassmorphism styles for chat widget */
      [data-chatbot-id] {
        --glass-bg: rgba(255, 255, 255, 0.1);
        --glass-border: rgba(255, 255, 255, 0.2);
        --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        --glass-backdrop: blur(10px) saturate(180%);
      }
      
      /* Target the chat widget container */
      [data-chatbot-id] * {
        backdrop-filter: var(--glass-backdrop) !important;
        background: var(--glass-bg) !important;
        border: 1px solid var(--glass-border) !important;
        box-shadow: var(--glass-shadow) !important;
        border-radius: 16px !important;
      }
      
      /* Chat window specific styles */
      [data-chatbot-id] .chat-window,
      [data-chatbot-id] .chat-container,
      [data-chatbot-id] .chat-messages {
        background: rgba(15, 23, 42, 0.8) !important;
        backdrop-filter: blur(20px) saturate(200%) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Chat input area */
      [data-chatbot-id] .chat-input,
      [data-chatbot-id] input[type="text"],
      [data-chatbot-id] textarea {
        background: rgba(255, 255, 255, 0.05) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: white !important;
      }
      
      /* Chat messages */
      [data-chatbot-id] .message,
      [data-chatbot-id] .chat-message {
        background: rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(8px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Bot messages with different glass effect */
      [data-chatbot-id] .message.bot,
      [data-chatbot-id] .chat-message.bot {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)) !important;
        backdrop-filter: blur(15px) !important;
      }
      
      /* User messages */
      [data-chatbot-id] .message.user,
      [data-chatbot-id] .chat-message.user {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)) !important;
        backdrop-filter: blur(12px) !important;
      }
      
      /* Chat button */
      [data-chatbot-id] .chat-button,
      [data-chatbot-id] .chat-toggle {
        background: rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
        transition: all 0.3s ease !important;
      }
      
      [data-chatbot-id] .chat-button:hover,
      [data-chatbot-id] .chat-toggle:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
      }
    `;
    document.head.appendChild(style);
    
    const script = document.createElement('script');
    script.src = 'https://chat.vintrastudio.com/api/widget.js';
    script.setAttribute('data-chatbot-id', 'ff8c9f06-7ec9-4824-9003-484477677f5f');
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.head.removeChild(style);
      document.body.removeChild(script);
    };
  }, []);
  
  return null;
}