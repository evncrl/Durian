import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // Kailangan itong import
import { API_URL } from '../config/appconf';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchStatus();
    fetchUsers();
  }, []);

  const fetchStatus = () => {
    setLoading(true);
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

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/user/users`, {
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
        setUsers(data.users);
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch Users Error:", err);
        setError("Failed to fetch users.");
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

  const updateUserRole = (userId: string, newRole: string) => {
    fetch(`${API_URL}/user/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ role: newRole })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Alert.alert("Success", `User is now an ${newRole}.`);
          fetchUsers();
        } else {
          Alert.alert("Error", data.error || "Failed to update role.");
        }
      })
      .catch((err) => {
        console.error("Update Role Error:", err);
        Alert.alert("Error", "Failed to update role.");
      });
  };

  const deactivateUser = (userId: string) => {
    fetch(`${API_URL}/user/users/${userId}/deactivate`, {
      method: 'PUT',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Alert.alert("Success", "User deactivated.");
          fetchUsers();
        } else {
          Alert.alert("Error", data.error || "Failed to deactivate user.");
        }
      })
      .catch((err) => {
        console.error("Deactivate User Error:", err);
        Alert.alert("Error", "Failed to deactivate user.");
      });
  };

  const deleteUser = (userId: string) => {
    // Nagdagdag ng Confirmation Alert para hindi aksidente
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this user? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            fetch(`${API_URL}/user/users/${userId}`, {
              method: 'DELETE',
              headers: { 'ngrok-skip-browser-warning': 'true' }
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  Alert.alert("Success", "User deleted.");
                  fetchUsers();
                }
              })
              .catch((err) => console.error("Delete Error:", err));
          }
        }
      ]
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1b5e20" />
        <Text style={{marginTop: 10}}>Connecting to server...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.cardTitle}>User Management</Text>
        {users.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          users.map((user) => (
            <View key={user._id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>

              <View style={styles.userActions}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={user.role}
                    onValueChange={(itemValue) => {
                      if (itemValue === "deactivate") {
                        deactivateUser(user._id);
                      } else {
                        updateUserRole(user._id, itemValue);
                      }
                    }}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    <Picker.Item label="User" value="user" />
                    <Picker.Item label="Admin" value="admin" />
                    <Picker.Item label="Deactivate" value="deactivate" color="red" />
                  </Picker>
                </View>

                <TouchableOpacity 
                  onPress={() => deleteUser(user._id)} 
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20' },
  logoutBtn: { backgroundColor: '#e53935', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#333' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  statusText: { fontSize: 16, color: '#666' },
  welcomeText: { marginTop: 10, marginBottom: 20, fontSize: 16, color: '#888', fontStyle: 'italic', textAlign: 'center' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryBtn: { marginTop: 15, backgroundColor: '#1b5e20', padding: 10, borderRadius: 5, alignItems: 'center' },
  retryBtnText: { color: '#fff', fontWeight: '500' },
  
  // User Management Styles
  userRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 13, color: '#777' },
  userActions: { flexDirection: 'row', alignItems: 'center' },
  pickerWrapper: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 10,
    width: 140,
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    color: '#333',
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  deleteBtnText: { color: '#e53935', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', padding: 20 },
});

export default AdminDashboard;