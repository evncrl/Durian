import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Analytics() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Scans</Text>
        <Text style={styles.cardValue}>128</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export Quality</Text>
        <Text style={styles.cardValue}>82%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rejected</Text>
        <Text style={styles.cardValue}>18%</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/LandingMobile')}
      >
        <Text style={styles.buttonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  cardTitle: {
    fontSize: 14,
    color: '#aaa',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
