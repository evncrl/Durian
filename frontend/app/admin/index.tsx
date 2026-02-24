import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useResponsive } from '@/utils/platform';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '@/config/appconf';
import { useAdminStyles } from '@/styles/admin_styles/index.styles';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const modalStyles = RNStyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Palette.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Palette.charcoalEspresso,
    marginBottom: 8,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    fontFamily: Fonts.medium,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#333',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: Palette.white,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
});

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function Admin() {
  const styles = useAdminStyles();
  const { user, loading: userLoading, refreshUser, logout } = useUser();

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      // Not admin, redirect to home
      router.replace('/');
    }
  }, [user, userLoading]);

  if (userLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.linenWhite }}>
        <ActivityIndicator size="large" color={Palette.warmCopper} />
        <Text style={{ marginTop: 12, fontFamily: Fonts.medium, color: Palette.slate }}>Checking admin access...</Text>
      </View>
    );
  }
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { isWeb, isSmallScreen } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  // Fetch backend status
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
        console.error('Dashboard Error:', err);
        setError('Failed to fetch backend status.');
      })
      .finally(() => setLoading(false));
  };

  // Fetch users from backend
  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/users`, {
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
        const normalizedUsers = data.users.map((user: any) => ({
          ...user,
          _id: user._id || user.id,
        }));
        setUsers(normalizedUsers);
        setError(null);
      })
      .catch((err) => {
        console.error('Fetch Users Error:', err);
        setError('Failed to fetch users.');
      })
      .finally(() => setLoading(false));
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Logged Out', 'Redirecting to home screen...');
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Update user role
  const updateUserRole = (userId: string, newRole: string) => {
    fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ role: newRole }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Alert.alert('Success', `User is now an ${newRole}.`);
          fetchUsers();
        } else {
          Alert.alert('Error', data.error || 'Failed to update role.');
        }
      })
      .catch((err) => {
        console.error('Update Role Error:', err);
        Alert.alert('Error', 'Failed to update role.');
      });
  };

  // Open deactivate modal
  const openDeactivateModal = (user: User) => {
    setUserToDeactivate(user);
    setDeactivateReason('');
    setDeactivateModalVisible(true);
  };

  // Close deactivate modal
  const closeDeactivateModal = () => {
    setDeactivateModalVisible(false);
    setUserToDeactivate(null);
    setDeactivateReason('');
  };

  // Deactivate user (open modal)
  const deactivateUser = (userId: string) => {
    openDeactivateModal(users.find((u) => u._id === userId) as User);
  };

  // Confirm deactivation
  const confirmDeactivateUser = () => {
    if (!userToDeactivate) return;
    if (!deactivateReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for deactivation.');
      return;
    }
    setDeactivating(true);
    fetch(`${API_URL}/admin/users/${userToDeactivate._id}/deactivate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ reason: deactivateReason.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Alert.alert('Success', 'User deactivated and notified via email.');
          closeDeactivateModal();
          fetchUsers();
        } else {
          Alert.alert('Error', data.error || 'Failed to deactivate user.');
        }
      })
      .catch((err) => {
        console.error('Deactivate User Error:', err);
        Alert.alert('Error', 'Failed to deactivate user.');
      })
      .finally(() => setDeactivating(false));
  };

  // Reactivate user
  const reactivateUser = (userId: string) => {
    fetch(`${API_URL}/admin/users/${userId}/activate`, {
      method: 'PUT',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Alert.alert('Success', 'User reactivated.');
          fetchUsers();
        } else {
          Alert.alert('Error', data.error || 'Failed to reactivate user.');
        }
      })
      .catch((err) => {
        console.error('Reactivate User Error:', err);
        Alert.alert('Error', 'Failed to reactivate user.');
      });
  };

  useEffect(() => {
    fetchStatus();
    fetchUsers();
  }, []);

  if (loading && users.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Palette.warmCopper} />
        <Text style={{ marginTop: 12, fontFamily: Fonts.medium, color: Palette.slate }}>Connecting to server...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: (isSmallScreen || !isWeb) ? 'column' : 'row', backgroundColor: Palette.linenWhite }}>
      {/* Sidebar - handles its own responsive visibility internally */}
      <AdminSidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Mobile Sidebar Overlay */}
      {sidebarVisible && (isSmallScreen || !isWeb) && (
        <TouchableOpacity
          style={overlayStyles.overlay}
          activeOpacity={1}
          onPress={() => setSidebarVisible(false)}
        />
      )}

      {/* Main content */}
      <View style={{ flex: 1 }}>
        <ScrollView
          style={[styles.container]}
          contentContainerStyle={(isSmallScreen || !isWeb) ? undefined : { paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Mobile Header */}
          {(isSmallScreen || !isWeb) && (
            <View style={mobileHeaderStyles.header}>
              <TouchableOpacity onPress={() => setSidebarVisible(true)}>
                <Ionicons name="menu" size={32} color={Palette.deepObsidian} />
              </TouchableOpacity>
              <Text style={mobileHeaderStyles.title}>Admin Panel</Text>
              <View style={{ width: 32 }} />
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>System Status</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: error ? '#ef4444' : '#22c55e' }]} />
              <Text style={styles.statusText}>
                {error ? 'Backend Offline' : statusData?.message || 'Operational'}
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
            <TouchableOpacity
              style={[styles.retryBtn, { alignSelf: 'flex-start', marginTop: 10 }]}
              onPress={() => setShowDeactivated((prev) => !prev)}
            >
              <Text style={styles.retryBtnText}>
                {showDeactivated ? 'Hide Deactivated' : 'Show Deactivated'}
              </Text>
            </TouchableOpacity>

            {(showDeactivated ? users : users.filter((u) => u.isActive !== false)).length === 0 ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : (
              (showDeactivated ? users : users.filter((u) => u.isActive !== false)).map((user) => (
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
                          if (itemValue === 'deactivate') {
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
                    {user.isActive === false ? (
                      <TouchableOpacity
                        onPress={() => reactivateUser(user._id)}
                        style={styles.retryBtn}
                      >
                        <Text style={styles.retryBtnText}>Reactivate</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => openDeactivateModal(user)}
                        style={styles.deleteBtn}
                      >
                        <Text style={styles.deleteBtnText}>Deactivate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Deactivation Reason Modal */}
        <Modal
          visible={deactivateModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeDeactivateModal}
        >
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modalContainer}>
              <View>
                <Text style={modalStyles.modalTitle}>Deactivate User</Text>
                {userToDeactivate && (
                  <Text style={modalStyles.userInfo}>
                    {userToDeactivate.name} ({userToDeactivate.email})
                  </Text>
                )}
                <Text style={modalStyles.label}>Reason for deactivation:</Text>
                <TextInput
                  style={modalStyles.textInput}
                  placeholder="Enter the reason for deactivation..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  value={deactivateReason}
                  onChangeText={setDeactivateReason}
                  textAlignVertical="top"
                />
                <Text style={modalStyles.note}>
                  The user will receive an email notification with this reason.
                </Text>
                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity
                    style={modalStyles.cancelBtn}
                    onPress={closeDeactivateModal}
                    disabled={deactivating}
                  >
                    <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.confirmBtn, deactivating && modalStyles.disabledBtn]}
                    onPress={confirmDeactivateUser}
                    disabled={deactivating}
                  >
                    <Text style={modalStyles.confirmBtnText}>
                      {deactivating ? 'Deactivating...' : 'Confirm Deactivate'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}


const overlayStyles = RNStyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  }
});

const mobileHeaderStyles = RNStyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.stoneGray,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Palette.deepObsidian,
  }
});
