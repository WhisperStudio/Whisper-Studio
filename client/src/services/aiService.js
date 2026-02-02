// src/services/aiService.js
import { ChatState, handleMessage } from './Node_AI';

// AI Service Configuration (kept minimal; frontend handles prompts)
const AI_CONFIG = {
  contextWindow: 10,
};

// Message context manager (for forslag osv.)
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
const stateBySession = new Map(); // sessionId -> ChatState

// Hoved-funksjon brukt av EnhancedChatBot
export const generateAIResponse = async (text, userId) => {
  try {
    // Samme session-id-logikk som før
    const sessionId =
      userId ||
      (() => {
        if (typeof window === 'undefined') return 'server-test';
        let id = localStorage.getItem('voteSessionId');
        if (!id) {
          id = crypto.randomUUID?.() || String(Date.now());
          localStorage.setItem('voteSessionId', id);
        }
        return id;
      })();

    // Hent eller opprett ChatState for denne brukeren
    let state = stateBySession.get(sessionId);
    if (!state) {
      state = new ChatState();
      stateBySession.set(sessionId, state);
    }

    // Kjør meldingen gjennom Node_AI-botten
    const result = await handleMessage(text, state);
    // result = { reply, lang, intent, awaiting_ticket_confirm, active_view, last_topic, state }

    // Oppdater lagret state
    stateBySession.set(sessionId, result.state);

    const reply = result.reply || '';

    // Behold din lokale contextManager for forslag osv.
    contextManager.addMessage(sessionId, { role: 'user', content: text });
    contextManager.addMessage(sessionId, { role: 'assistant', content: reply });

    // VIKTIG: returner HELE result-objektet, ikke bare reply
    return result;
  } catch (error) {
    console.error('AI Service Error (Node_AI in frontend):', error);
    throw error;
  }
};

// Sentiment analysis
export const analyzeSentiment = (message) => {
  const positive =
    /😊|😄|🎉|good|great|awesome|excellent|love|amazing|fantastic|wonderful|best|perfect/i;
  const negative =
    /😢|😞|😡|bad|terrible|awful|hate|worst|horrible|disappointing|frustrated|angry/i;
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
      'Tell me about VOTE',
      'What is VintraStudio?',
      'Show me game features',
      'When will VOTE be released?',
    ];
  }

  const lastMessage =
    context[context.length - 1]?.content?.toLowerCase() || '';

  if (lastMessage.includes('vote') || lastMessage.includes('game')) {
    suggestions.push(
      'What are the main features?',
      'Tell me about the story',
      'What platforms will it be on?',
      'Can I see some artwork?',
    );
  } else if (lastMessage.includes('vintra') || lastMessage.includes('studio')) {
    suggestions.push(
      'What games are you making?',
      'Tell me about the team',
      'How can I follow updates?',
      "What's your vision?",
    );
  } else {
    suggestions.push(
      'Tell me more',
      'What else can you help with?',
      'Show me the art gallery',
      'How can I contact support?',
    );
  }

  return suggestions.slice(0, 4);
};

// Language detection
export const detectLanguage = (message) => {
  const norwegianWords =
    /\b(hei|hva|hvordan|takk|bra|jeg|du|er|har|kan|vil|skal|med|for|og|eller|men|som|på|i|av|til|fra)\b/i;
  const englishWords =
    /\b(hello|what|how|thanks|good|i|you|is|are|have|can|will|with|for|and|or|but|as|on|in|of|to|from)\b/i;

  const norwegianMatches = (message.match(norwegianWords) || []).length;
  const englishMatches = (message.match(englishWords) || []).length;

  if (norwegianMatches > englishMatches) return 'no';
  return 'en';
};

// Typing indicator simulation
export const getTypingDuration = (message) => {
  const baseTime = 500;
  const timePerChar = 20;
  const maxTime = 3000;

  return Math.min(baseTime + message.length * timePerChar, maxTime);
};

export const clearUserContext = (userId) => {
  contextManager.clearContext(userId);
  stateBySession.delete(userId);
};

export const processVoiceCommand = (transcript) => {
  const command = transcript.toLowerCase();

  if (command.includes('close') || command.includes('exit')) {
    return { action: 'close' };
  }
  if (command.includes('clear') || command.includes('reset')) {
    return { action: 'clear' };
  }
  if (command.includes('settings')) {
    return { action: 'settings' };
  }

  return { action: 'message', text: transcript };
};

export const processFileUpload = async (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  return {
    url: URL.createObjectURL(file),
    type: file.type,
    name: file.name,
    size: file.size,
  };
};

export const getEmojiSuggestions = (sentiment) => {
  const emojiMap = {
    positive: ['😊', '👍', '🎉', '✨', '💪', '🌟'],
    negative: ['😔', '👎', '😢', '💔', '😞', '😟'],
    neutral: ['🤔', '👌', '✋', '💭', '📝', '💬'],
  };

  return emojiMap[sentiment] || emojiMap.neutral;
};

const aiService = {
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

export default aiService;
