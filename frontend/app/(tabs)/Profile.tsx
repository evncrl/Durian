import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, Alert,
  ScrollView, Platform, useWindowDimensions, ActivityIndicator,
  Modal, StatusBar, StyleSheet as RNStyleSheet
} from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/appconf';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { styles } from '@/styles/Profile.styles';
import { Fonts, Palette } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import Analytics from './Analytics';

const ProfileContent = ({
  isWeb, photoUri, getCloudinaryUrl, getInitials, setPhotoModalVisible,
  uploadingPhoto, isEditing, name, setName, focusedInput, setFocusedInput,
  saving, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
  handleSave, setIsEditing, handleLogout, styles
}: any) => (
  <View style={styles.scrollContent}>
    <View style={styles.header}>
      {!isWeb && (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Palette.deepObsidian} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>My Profile</Text>
      {!isWeb && <View style={{ width: 40 }} />}
    </View>

    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          {photoUri ? (
            <Image source={{ uri: getCloudinaryUrl() }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarPlaceholder}>{getInitials()}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.cameraButton} onPress={() => setPhotoModalVisible(true)} disabled={uploadingPhoto}>
          <View style={styles.cameraButtonInner}>
            {uploadingPhoto ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={20} color="#fff" />}
          </View>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
                style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="words"
                editable={!saving}
              />
              {focusedInput === 'name' && <View style={styles.inputIcon}><Feather name="user" size={20} color="#1b5e20" /></View>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor="#94a3b8"
                style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
              {focusedInput === 'email' && <View style={styles.inputIcon}><MaterialIcons name="email" size={20} color="#1b5e20" /></View>}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.button, styles.cancelButton]} disabled={saving}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name || 'User Name'}</Text>
          <Text style={styles.email}>{email || 'user@example.com'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Scans</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statNumber}>89%</Text><Text style={styles.statLabel}>Quality</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statNumber}>5</Text><Text style={styles.statLabel}>Posts</Text></View>
          </View>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={Palette.white} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>

    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <Ionicons name="log-out-outline" size={20} color={Palette.white} />
      <Text style={styles.buttonText}>Logout Account</Text>
    </TouchableOpacity>
  </View>
);

export default function Profile() {
  const { user, loading: userLoading, refreshUser, logout } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = isWeb && width > 1024;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhotoUri(user.photoProfile || '');
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    // Logic for updating profile here...
    setIsEditing(false);
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getInitials = () => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US';
  const getCloudinaryUrl = () => photoUri || '';

  if (loading || userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020d08' }}>
        <ActivityIndicator size="large" color={Palette.warmCopper} />
      </View>
    );
  }

  const commonProps = {
    isWeb, photoUri, getCloudinaryUrl, getInitials, setPhotoModalVisible,
    uploadingPhoto, isEditing, name, setName, focusedInput, setFocusedInput,
    saving, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    handleSave, setIsEditing, handleLogout, styles
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.deepObsidian }}>
      <StatusBar barStyle="light-content" />
      
      {isLargeScreen ? (
        /* --- WEB / DESKTOP VIEW --- */
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <ScrollView style={{ flex: 0.4 }} contentContainerStyle={{ padding: 24 }}>
            <ProfileContent {...commonProps} />
          </ScrollView>
          <View style={{ flex: 0.6 }}>
            <Analytics />
          </View>
        </View>
      ) : (
        /* --- ✅ MOBILE VIEW (FIXED) --- */
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{ paddingBottom: 40 }} // Allowance sa baba para hindi dikit
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Profile Details & Logout */}
          <ProfileContent {...commonProps} />
          
          {/* 2. ✅ IDINAGDAG DITO ANG ANALYTICS PARA LUMITAW SA MOBILE */}
          <View style={{ marginTop: 10 }}>
             <Analytics />
          </View>
        </ScrollView>
      )}

      {/* Basic Modal implementation */}
      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Photo</Text>
            <TouchableOpacity onPress={() => setPhotoModalVisible(false)} style={styles.modalCancelButton}>
              <Text style={{color: '#fff'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}