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
  Platform as RNPlatform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/appconf';

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
      behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Durianostics AI</Text>
          <Text style={styles.headerSubtitle}>Powered by Groq AI</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#666" />
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
            <Text style={styles.messageContent}>{message.content}</Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageRole}>AI Assistant</Text>
              <Text style={styles.messageTime}>...</Text>
            </View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#27AE60" />
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

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about durians..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#27AE60',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  messageTime: {
    fontSize: 11,
    color: '#95a5a6',
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#27AE60',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
});
