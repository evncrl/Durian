import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_URL } from '../config/appconf';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    setLoading(true);
    // Nagdagdag ng 'ngrok-skip-browser-warning' header para hindi ma-block ng ngrok warning page
    fetch(`${API_URL}/status`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStatusData(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Dashboard Error:", err);
        setError("Failed to fetch backend status.");
      })
      .finally(() => setLoading(false));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['jwt_token', 'user_role', 'user_id', 'name']);
      Alert.alert("Logged Out", "Redirecting to home screen...");
      router.replace("/");
    } catch (e) {
      Alert.alert("Error", "Failed to logout");
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1b5e20" />
        <Text style={{marginTop: 10}}>Connecting to server...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>System Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: error ? 'red' : '#4caf50' }]} />
          <Text style={styles.statusText}>
            {error ? "Backend Offline" : statusData?.message || "Online"}
          </Text>
        </View>
        {error && (
          <TouchableOpacity style={styles.retryBtn} onPress={fetchStatus}>
            <Text style={styles.retryBtnText}>Retry Connection</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.welcomeText}>Welcome, Administrator!</Text>
      {/* Dito mo na pwedeng idagdag ang Analytics o User List sa susunod */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20' },
  logoutBtn: { backgroundColor: '#e53935', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#333' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  statusText: { fontSize: 16, color: '#666' },
  welcomeText: { marginTop: 30, fontSize: 16, color: '#888', fontStyle: 'italic', textAlign: 'center' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryBtn: { marginTop: 15, backgroundColor: '#1b5e20', padding: 10, borderRadius: 5, alignItems: 'center' },
  retryBtnText: { color: '#fff', fontWeight: '500' },
});

export default AdminDashboard;