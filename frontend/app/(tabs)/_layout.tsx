import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import UniversalTopbar from '@/components/UniversalTopbar';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <UniversalTopbar />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

