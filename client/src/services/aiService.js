import axios from 'axios';

// AI Service Configuration (kept minimal; backend handles prompts)
const AI_CONFIG = {
  contextWindow: 10,
};

// Message context manager
class ContextManager {
  constructor() {
    this.conversations = new Map();
  }

  addMessage(userId, message) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    const conversation = this.conversations.get(userId);
    conversation.push(message);
    
    // Keep only last N messages for context
    if (conversation.length > AI_CONFIG.contextWindow * 2) {
      conversation.splice(0, 2);
    }
  }

  getContext(userId) {
    return this.conversations.get(userId) || [];
  }

  clearContext(userId) {
    this.conversations.delete(userId);
  }
}

const contextManager = new ContextManager();

// OpenAI API Integration
export const generateAIResponse = async (message, userId, options = {}) => {
  // Route to Python bot backend instead of local prompts/OpenAI
  try {
    const sessionId = userId || (() => {
      if (typeof window === 'undefined') return 'server-test';
      let id = localStorage.getItem('voteSessionId');
      if (!id) {
        id = (crypto.randomUUID?.() || String(Date.now()));
        localStorage.setItem('voteSessionId', id);
      }
      return id;
    })();

      const res = await axios.post(
    '/api/chat',                        // <–– hit vercel function
    { session_id: sessionId, text: message },
    { headers: { 'Content-Type': 'application/json' } }
  );

    const data = res.data || {};
    const reply = data.reply || '';
    // maintain minimal local context if needed
    contextManager.addMessage(sessionId, { role: 'user', content: message });
    contextManager.addMessage(sessionId, { role: 'assistant', content: reply });
    return reply;
  } catch (error) {
    console.error('AI Service Error (Python backend):', error);
    throw error;
  }
};

// Removed local intelligent fallback: all prompts should come from Python backend.

// Removed getRandomResponse (no longer needed)

// Sentiment analysis
export const analyzeSentiment = (message) => {
  const positive = /😊|😄|🎉|good|great|awesome|excellent|love|amazing|fantastic|wonderful|best|perfect/i;
  const negative = /😢|😞|😡|bad|terrible|awful|hate|worst|horrible|disappointing|frustrated|angry/i;
  const neutral = /okay|fine|alright|maybe|perhaps|possibly/i;
  
  if (positive.test(message)) return 'positive';
  if (negative.test(message)) return 'negative';
  if (neutral.test(message)) return 'neutral';
  return 'neutral';
};

// Message suggestions based on context
export const getMessageSuggestions = (context) => {
  const suggestions = [];
  
  if (!context || context.length === 0) {
    return [
      "Tell me about VOTE",
      "What is VintraStudio?",
      "Show me game features",
      "When will VOTE be released?",
    ];
  }
  
  const lastMessage = context[context.length - 1]?.content?.toLowerCase() || '';
  
  if (lastMessage.includes('vote') || lastMessage.includes('game')) {
    suggestions.push(
      "What are the main features?",
      "Tell me about the story",
      "What platforms will it be on?",
      "Can I see some artwork?"
    );
  } else if (lastMessage.includes('vintra') || lastMessage.includes('studio')) {
    suggestions.push(
      "What games are you making?",
      "Tell me about the team",
      "How can I follow updates?",
      "What's your vision?"
    );
  } else {
    suggestions.push(
      "Tell me more",
      "What else can you help with?",
      "Show me the art gallery",
      "How can I contact support?"
    );
  }
  
  return suggestions.slice(0, 4);
};

// Language detection
export const detectLanguage = (message) => {
  const norwegianWords = /\b(hei|hva|hvordan|takk|bra|jeg|du|er|har|kan|vil|skal|med|for|og|eller|men|som|på|i|av|til|fra)\b/i;
  const englishWords = /\b(hello|what|how|thanks|good|i|you|is|are|have|can|will|with|for|and|or|but|as|on|in|of|to|from)\b/i;
  
  const norwegianMatches = (message.match(norwegianWords) || []).length;
  const englishMatches = (message.match(englishWords) || []).length;
  
  if (norwegianMatches > englishMatches) return 'no';
  return 'en';
};

// Typing indicator simulation
export const getTypingDuration = (message) => {
  // Simulate typing speed based on message length
  const baseTime = 500;
  const timePerChar = 20;
  const maxTime = 3000;
  
  return Math.min(baseTime + (message.length * timePerChar), maxTime);
};

// Export context manager for external use
export const clearUserContext = (userId) => {
  contextManager.clearContext(userId);
};

// Voice commands processor
export const processVoiceCommand = (transcript) => {
  const command = transcript.toLowerCase();
  
  // Navigation commands
  if (command.includes('close') || command.includes('exit')) {
    return { action: 'close' };
  }
  if (command.includes('clear') || command.includes('reset')) {
    return { action: 'clear' };
  }
  if (command.includes('settings')) {
    return { action: 'settings' };
  }
  
  // Otherwise, treat as regular message
  return { action: 'message', text: transcript };
};

// File upload handler
export const processFileUpload = async (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }
  
  // Here you would normally upload to a storage service
  // For now, return a mock URL
  return {
    url: URL.createObjectURL(file),
    type: file.type,
    name: file.name,
    size: file.size,
  };
};

// Emoji suggestions based on sentiment.
export const getEmojiSuggestions = (sentiment) => {
  const emojiMap = {
    positive: ['😊', '👍', '🎉', '✨', '💪', '🌟'],
    negative: ['😔', '👎', '😢', '💔', '😞', '😟'],
    neutral: ['🤔', '👌', '✋', '💭', '📝', '💬'],
  };
  
  return emojiMap[sentiment] || emojiMap.neutral;
};

export default {
  generateAIResponse,
  analyzeSentiment,
  getMessageSuggestions,
  detectLanguage,
  getTypingDuration,
  clearUserContext,
  processVoiceCommand,
  processFileUpload,
  getEmojiSuggestions,
};
