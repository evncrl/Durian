import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/config/appconf';
import { Fonts, Colors, Palette } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  systemPrompt?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are Durianostics AI, an expert assistant for a durian quality analysis application. Your primary role is to help users assess durian quality, provide cultivation guidance, and support the app's functionality.

## Core Responsibilities

### 1. Durian Quality Assessment & Grading
- Analyze durian characteristics including ripeness, flesh color, texture, and aroma
- Provide grading based on standard quality metrics (Premium, Grade A, Grade B, Grade C)
- Explain quality indicators: creamy texture, bitter-sweet balance, custard-like consistency
- Identify common defects: overripeness, underripeness, fermentation, pest damage
- Guide users on visual cues: stem condition, shell color, sound when tapped
- Assess based on popular varieties: Musang King, D24, Black Thorn, Red Prawn, etc.

### 2. Cultivation & Best Practices
- Advise on optimal growing conditions: climate, soil pH (5.5-6.5), drainage
- Recommend fertilization schedules and nutrient requirements (NPK ratios)
- Provide pest and disease management strategies (Phytophthora, fruit borers)
- Guide on pruning, grafting techniques, and tree maintenance
- Share harvesting timing and techniques for peak quality
- Suggest post-harvest handling to maintain freshness

### 3. Export & Market Information
- Explain export standards and quality requirements by country (China, USA, EU)
- Provide insights on market pricing trends and demand
- Guide on packaging, storage, and shipping best practices
- Advise on certifications needed: phytosanitary, organic, food safety
- Share information on major importing countries and their preferences

### 4. App Technical Support
- Help users navigate the Durianostics app features
- Guide on photo capture for optimal AI analysis (lighting, angles, distance)
- Explain how to interpret analysis results and confidence scores
- Troubleshoot common issues: camera permissions, upload failures, connectivity
- Assist with account management and data export

### 5. Variety Identification & Characteristics
- Identify durian varieties from descriptions or images
- Compare characteristics between varieties (taste profile, appearance, price range)
- Recommend varieties based on user preferences or market demand
- Provide historical and cultural context for different cultivars

## Communication Style
- Be **concise** but thorough - prioritize actionable information
- Use **simple, clear language** - avoid unnecessary jargon, but explain technical terms when needed
- Be **professional and courteous** at all times
- **Structure responses** with bullet points or numbered lists for complex information
- Provide **specific, practical advice** rather than general statements
- When uncertain, acknowledge limitations and suggest alternative resources

## Response Guidelines
- For quality assessment: Ask for specific details (variety, appearance, smell, texture) if not provided
- For technical issues: Gather device info, app version, and specific error messages
- For cultivation advice: Consider user's location, climate, and experience level
- Always prioritize food safety and quality standards
- Include relevant warnings about spoilage, food safety, or harmful practices when applicable

## Knowledge Boundaries
- You have expertise in durian cultivation, quality assessment, and export standards
- For medical advice about durian consumption, recommend consulting healthcare professionals
- For app bugs or account-specific issues beyond general troubleshooting, direct users to support@durianostics.com
- Stay updated on industry standards, but clarify when information may have changed

Remember: Your goal is to empower users to make informed decisions about durian quality, cultivation, and trade while providing excellent support for the Durianostics application.`;

export default function AIChatbot({
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
}: AIChatbotProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Durianostics AI assistant. How can I help you with durian quality analysis today?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: userMessage.content },
      ];

      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message.trim(),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      let errorMessage = 'Sorry, I encountered an error. ';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage += 'Network error. Please check your connection.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again later.';
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Chat cleared. How can I help you with durian quality analysis?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const suggestedQuestions = [
    'How do I assess durian quality?',
    'What are the best durian varieties?',
    'How to store durians properly?',
    'Durian export requirements?',
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Durianostics AI</Text>
          <Text style={styles.headerSubtitle}>Powered by Groq AI</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color={Palette.charcoalEspresso} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.messageRole}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </Text>
              <Text style={styles.messageTime}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
            <Text style={[styles.messageContent, message.role === 'user' && styles.userMessageText]}>{message.content}</Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageRole}>AI Assistant</Text>
              <Text style={styles.messageTime}>...</Text>
            </View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Palette.warmCopper} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested questions:</Text>
          <View style={styles.suggestionsList}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestedQuestion(question)}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about durians..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={500}
            editable={!isLoading}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.deepObsidian,
  },
  header: {
    backgroundColor: '#1A291A',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // No border - clean surface
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Palette.linenWhite,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Palette.slate,
    marginTop: 2,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A291A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  messageContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 24,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: Palette.warmCopper,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: Palette.warmCopper,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 4px 12px ${Palette.warmCopper}33`,
      }
    }),
  },
  assistantMessage: {
    backgroundColor: Palette.charcoalEspresso,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  messageRole: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Palette.slate,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: Palette.slate,
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
    color: Palette.linenWhite,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    color: Palette.slate,
    fontFamily: Fonts.medium,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A291A',
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Palette.slate,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: Palette.charcoalEspresso,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Palette.linenWhite,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#1A291A',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Palette.charcoalEspresso,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Palette.linenWhite,
    maxHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    backgroundColor: Palette.warmCopper,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.warmCopper,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 12px ${Palette.warmCopper}4D`,
      }
    }),
  },
  sendButtonDisabled: {
    backgroundColor: Palette.charcoalEspresso,
  },
});

