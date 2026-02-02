import React from 'react';
import { View, StyleSheet } from 'react-native';
import AIChatbot from '../components/AIChatbot';

export default function Chatbot() {
  return (
    <View style={styles.container}>
      <AIChatbot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});