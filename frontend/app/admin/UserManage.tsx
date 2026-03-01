import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    TextInput,
    StyleSheet as RNStyleSheet,
} from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { useResponsive } from '@/utils/platform';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '@/config/appconf';
import { useAdminStyles } from '@/styles/admin_styles/index.styles';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

// ✅ Pre-defined Reasons for Deactivation Email
const DEACTIVATION_REASONS = [
    "Violation of Terms of Service",
    "Spamming or Suspicious Activity",
    "Inappropriate Content/Harassment",
    "Account Requested for Deletion",
    "Security Breach/Compromised Account",
    "Policy Violation - Multi-accounting",
    "Administrative Maintenance"
];

// Interface for User Data
interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

export default function UserManage() {
    const styles = useAdminStyles();
    const { isWeb, isSmallScreen } = useResponsive();
    const { user: currentUser, loading: authLoading } = useUser();

    // State Management
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeactivated, setShowDeactivated] = useState(false);
    const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
    
    // Default to the first reason in the list
    const [deactivateReason, setDeactivateReason] = useState(DEACTIVATION_REASONS[0]);
    
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
    const [deactivating, setDeactivating] = useState(false);

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
            })
            .catch((err) => {
                console.error('Fetch Users Error:', err);
                Alert.alert('Error', 'Failed to fetch users list.');
            })
            .finally(() => setLoading(false));
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

    // Deactivate Logic
    const openDeactivateModal = (user: User) => {
        setUserToDeactivate(user);
        setDeactivateReason(DEACTIVATION_REASONS[0]); 
        setDeactivateModalVisible(true);
    };

    const closeDeactivateModal = () => {
        setDeactivateModalVisible(false);
        setUserToDeactivate(null);
        setDeactivateReason(DEACTIVATION_REASONS[0]);
    };

    const confirmDeactivateUser = () => {
        if (!userToDeactivate) return;
        
        setDeactivating(true);
        // ✅ Ipapadala ang 'reason' sa backend para maisama sa email
        fetch(`${API_URL}/admin/users/${userToDeactivate._id}/deactivate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({ reason: deactivateReason }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // Magpapakita ng alert kung naging success ang email sending base sa backend response
                    const statusMsg = data.emailSent 
                        ? 'User deactivated and notification email sent successfully.' 
                        : 'User deactivated, but there was an issue sending the notification email.';
                    Alert.alert('Account Status Updated', statusMsg);
                    closeDeactivateModal();
                    fetchUsers();
                } else {
                    Alert.alert('Error', data.error || 'Failed to deactivate user.');
                }
            })
            .catch((err) => {
                console.error('Deactivate User Error:', err);
                Alert.alert('Error', 'Failed to connect to the server.');
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
                    const statusMsg = data.emailSent 
                        ? 'User reactivated and notified via email.' 
                        : 'User reactivated, but notification email failed.';
                    Alert.alert('Account Status Updated', statusMsg);
                    fetchUsers();
                } else {
                    Alert.alert('Error', data.error || 'Failed to reactivate user.');
                }
            })
            .catch((err) => {
                console.error('Reactivate User Error:', err);
                Alert.alert('Error', 'Failed to connect to the server.');
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading && users.length === 0) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Palette.warmCopper} />
                <Text style={{ marginTop: 12, fontFamily: Fonts.medium, color: Palette.slate }}>Loading users...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, flexDirection: (isSmallScreen || !isWeb) ? 'column' : 'row', backgroundColor: Palette.linenWhite }}>
            <AdminSidebar isVisible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

            {sidebarVisible && (isSmallScreen || !isWeb) && (
                <TouchableOpacity
                    style={overlayStyles.overlay}
                    activeOpacity={1}
                    onPress={() => setSidebarVisible(false)}
                />
            )}

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
                            <Text style={mobileHeaderStyles.title}>User Management</Text>
                            <View style={{ width: 32 }} />
                        </View>
                    )}

                    {/* Standard Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Manage Users</Text>
                    </View>

                    <View style={[styles.card, { marginBottom: 40 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardTitle}>User Directory</Text>
                            <TouchableOpacity
                                style={[styles.retryBtn, { alignSelf: 'flex-start' }]}
                                onPress={() => setShowDeactivated((prev) => !prev)}
                            >
                                <Text style={styles.retryBtnText}>
                                    {showDeactivated ? 'Hide Deactivated' : 'Show Deactivated'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {(showDeactivated ? users : users.filter((u) => u.isActive !== false)).length === 0 ? (
                            <Text style={styles.emptyText}>No users found.</Text>
                        ) : (
                            (showDeactivated ? users : users.filter((u) => u.isActive !== false)).map((user) => (
                                <View key={user._id} style={styles.userRow}>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{user.name}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                        <View style={{flexDirection: 'row', marginTop: 4}}>
                                            <View style={{
                                                backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 4
                                            }}>
                                                <Text style={{fontSize: 10, color: user.isActive ? '#166534' : '#991b1b', fontFamily: Fonts.bold}}>
                                                    {user.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.userActions}>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={user.role}
                                                onValueChange={(itemValue) => {
                                                    if (itemValue === 'deactivate') {
                                                        openDeactivateModal(user);
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

                {/* ✅ Deactivation Modal with Automatic Email Reason Picker */}
                <Modal
                    visible={deactivateModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeDeactivateModal}
                >
                    <View style={modalStyles.overlay}>
                        <View style={modalStyles.modalContainer}>
                            <Text style={modalStyles.modalTitle}>Deactivate Account</Text>
                            {userToDeactivate && (
                                <Text style={modalStyles.userInfo}>
                                    Target: {userToDeactivate.name} ({userToDeactivate.email})
                                </Text>
                            )}
                            
                            <Text style={modalStyles.label}>Select deactivation reason:</Text>
                            
                            <View style={localPickerStyles.pickerContainer}>
                                <Picker
                                    selectedValue={deactivateReason}
                                    onValueChange={(itemValue) => setDeactivateReason(itemValue)}
                                    style={localPickerStyles.picker}
                                >
                                    {DEACTIVATION_REASONS.map((reason, index) => (
                                        <Picker.Item key={index} label={reason} value={reason} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={{backgroundColor: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 20}}>
                                <Text style={{fontSize: 11, color: '#92400e', fontFamily: Fonts.medium}}>
                                    📧 An automated notice will be sent via Mailtrap to the user's registered email address.
                                </Text>
                            </View>

                            <View style={modalStyles.buttonRow}>
                                <TouchableOpacity style={modalStyles.cancelBtn} onPress={closeDeactivateModal}>
                                    <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[modalStyles.confirmBtn, deactivating && modalStyles.disabledBtn]}
                                    onPress={confirmDeactivateUser}
                                    disabled={deactivating}
                                >
                                    <Text style={modalStyles.confirmBtnText}>
                                        {deactivating ? 'Notifying...' : 'Confirm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

// Local Styles
const localPickerStyles = RNStyleSheet.create({
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    }
});

const modalStyles = RNStyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: Palette.white,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        elevation: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Fonts.bold,
        color: Palette.charcoalEspresso,
        marginBottom: 8,
        textAlign: 'center',
    },
    userInfo: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: Fonts.medium,
    },
    label: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
        marginBottom: 10,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#e0e0e0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: Fonts.semiBold,
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#d32f2f',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: Palette.white,
        fontFamily: Fonts.bold,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
    },
});

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
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: Palette.deepObsidian,
    }
});