import axios from 'axios';

// AI Service Configuration
const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY, // Fixed to match .env file
    model: 'gpt-4',
    maxTokens: 500,
    temperature: 0.7,
  },
  fallbackResponses: {
    greeting: [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! What can I do for you?",
      "Welcome! I'm here to assist you.",
    ],
    error: [
      "I apologize, but I'm having trouble understanding. Could you rephrase that?",
      "Sorry, I couldn't process that request. Please try again.",
      "There seems to be an issue. Let me try to help you differently.",
    ],
    thinking: [
      "Let me think about that...",
      "Processing your request...",
      "Analyzing your question...",
    ],
  },
  contextWindow: 10, // Number of previous messages to include for context
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
  try {
    // Add message to context
    contextManager.addMessage(userId, { role: 'user', content: message });

    // Get conversation context
    const context = contextManager.getContext(userId);

    // If no API key, use intelligent fallback
    if (!AI_CONFIG.openai.apiKey) {
      const response = generateIntelligentFallback(message, context);
      contextManager.addMessage(userId, { role: 'assistant', content: response });
      return response;
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: options.model || AI_CONFIG.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for VintraStudio. You help users with questions about the company and the VOTE game.

About VOTE:
- VOTE is a story-driven open-world game inspired by Nordic nature and culture
- Features beautiful landscapes, engaging gameplay, and rich narrative
- Expected to cost around $20 when released
- Currently in active development with regular updates

About VintraStudio:
- Innovative game development company focused on creating immersive experiences
- Passionate team working on bringing unique gaming experiences to life
- Flagship project is VOTE, showcasing dedication to quality and creativity

Be friendly, professional, and concise. Always provide specific information when available, and offer to help with related topics.`
          },
          ...context
        ],
        max_tokens: options.maxTokens || AI_CONFIG.openai.maxTokens,
        temperature: options.temperature || AI_CONFIG.openai.temperature,
        stream: options.stream || false,
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    contextManager.addMessage(userId, { role: 'assistant', content: aiResponse });
    
    return aiResponse;
  } catch (error) {
    console.error('AI Service Error:', error);

    // Use intelligent fallback on error
    const fallbackResponse = generateIntelligentFallback(message, contextManager.getContext(userId));
    contextManager.addMessage(userId, { role: 'assistant', content: fallbackResponse });

    return fallbackResponse;
  }
};

// Intelligent fallback system with pattern matching
const generateIntelligentFallback = (message, context) => {
  const msg = message.toLowerCase();
  
  // Greeting patterns
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/.test(msg)) {
    return getRandomResponse(AI_CONFIG.fallbackResponses.greeting);
  }
  
  // Questions about VOTE game
  if (msg.includes('vote') || msg.includes('game')) {
    const gameResponses = [
      "VOTE is our exciting story-driven open-world game inspired by Nordic nature and culture. It features stunning landscapes, engaging gameplay, and a rich narrative.",
      "The VOTE game is currently in development. We're creating beautiful maps, characters, and an immersive story. Check our Art Gallery to see some previews!",
      "VOTE combines exploration, storytelling, and Nordic mythology in a unique gaming experience. Would you like to know more about specific features?",
    ];
    return getRandomResponse(gameResponses);
  }
  
  // Questions about VintraStudio
  if (msg.includes('vintra') || msg.includes('studio') || msg.includes('company')) {
    const studioResponses = [
      "VintraStudio is an innovative game development company focused on creating immersive experiences. Our main project is VOTE, a Nordic-inspired open-world game.",
      "We're a passionate team at VintraStudio working on bringing unique gaming experiences to life. Our flagship project VOTE showcases our dedication to quality and creativity.",
      "VintraStudio specializes in game development with a focus on storytelling and beautiful environments. How can I help you learn more about us?",
    ];
    return getRandomResponse(studioResponses);
  }
  
  // Help requests
  if (msg.includes('help') || msg.includes('support') || msg.includes('assist')) {
    return "I'm here to help! You can ask me about:\n• VintraStudio and our team\n• The VOTE game and its features\n• Our development progress\n• General inquiries\n\nWhat would you like to know?";
  }
  
  // Features and gameplay
  if (msg.includes('feature') || msg.includes('gameplay') || msg.includes('play')) {
    const featureResponses = [
      "VOTE features open-world exploration, character customization, quest systems, and a rich story inspired by Nordic mythology.",
      "The gameplay includes exploration of vast Nordic landscapes, character progression, crafting systems, and engaging combat mechanics.",
      "Players can expect immersive storytelling, beautiful environments, dynamic weather, and meaningful choices that affect the game world.",
    ];
    return getRandomResponse(featureResponses);
  }
  
  // Art and graphics
  if (msg.includes('art') || msg.includes('graphic') || msg.includes('visual')) {
    return "Our Art Gallery showcases the stunning visuals of VOTE, including landscapes, creatures, and characters inspired by Nordic culture. The game features high-quality graphics with attention to detail in every environment.";
  }
  
  // Release date
  if (msg.includes('when') || msg.includes('release') || msg.includes('launch')) {
    return "VOTE is currently in active development. We're working hard to create the best possible experience. Follow our updates for the latest development news and release information!";
  }
  
  // Platform questions
  if (msg.includes('platform') || msg.includes('pc') || msg.includes('console') || msg.includes('mobile')) {
    return "We're initially focusing on PC development for VOTE to ensure the best possible experience. Platform availability will be announced as development progresses.";
  }
  
  // Price questions
  if (msg.includes('price') || msg.includes('cost') || msg.includes('buy') || msg.includes('purchase')) {
    return "VOTE is expected to cost around $20 when it's released. This provides excellent value for the immersive gaming experience we're creating. Would you like to know more about the game's features or our development timeline?";
  }
  
  // Community and social
  if (msg.includes('community') || msg.includes('discord') || msg.includes('social')) {
    return "Join our growing community to stay updated on VOTE's development! We regularly share progress updates, concept art, and engage with our players.";
  }
  
  // Technical questions
  if (msg.includes('requirement') || msg.includes('spec') || msg.includes('system')) {
    return "System requirements for VOTE will be optimized to ensure a smooth experience across a range of hardware. Detailed specifications will be shared as we approach release.";
  }
  
  // Analyze context for follow-up questions
  if (context.length > 0) {
    const lastUserMessage = context.filter(m => m.role === 'user').pop();
    if (lastUserMessage && msg.includes('more') || msg.includes('else') || msg.includes('other')) {
      return "I'd be happy to provide more information! Could you be more specific about what aspect you'd like to know more about?";
    }
  }
  
  // Default response with specific suggestions
  return "I'd be happy to help you with information about VintraStudio and our VOTE game! You can ask me about:\n• VOTE gameplay and features\n• Game pricing and release information\n• VintraStudio and our development process\n• Art gallery and concept art\n• How to get updates on development\n\nWhat specific aspect interests you most?";
};

// Get random response from array
const getRandomResponse = (responses) => {
  return responses[Math.floor(Math.random() * responses.length)];
};

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
