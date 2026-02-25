import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/appconf';
import * as ImagePicker from 'expo-image-picker';
import {
  Ionicons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import { styles } from '@/styles/Profile.styles';
import { Fonts, Palette } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import Analytics from './Analytics';

export default function Profile() {
  const { user, loading: userLoading, refreshUser, logout } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUri, setPhotoUri] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoPublicId, setPhotoPublicId] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = isWeb && width > 1024;

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

      if (galleryStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to upload profile pictures.');
      }
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access to take profile pictures.');
      }
    }
  };

  // Load user profile
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwt_token');
      const storedId = await AsyncStorage.getItem('user_id');

      if (!storedToken || !storedId) {
        router.replace('/');
        return;
      }

      const storedName = await AsyncStorage.getItem('name');
      const storedPhoto = await AsyncStorage.getItem('photoProfile');
      const storedPublicId = await AsyncStorage.getItem('photoPublicId');

      if (storedName) setName(storedName);
      if (storedPhoto) setPhotoUri(storedPhoto);
      if (storedPublicId) setPhotoPublicId(storedPublicId);

      try {
        const res = await axios.get(`${API_URL}/profile/${storedId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.data.name) {
          setName(res.data.name);
          await AsyncStorage.setItem('name', res.data.name);
        }
        if (res.data.email) setEmail(res.data.email);
        if (res.data.photoProfile) {
          setPhotoUri(res.data.photoProfile);
          await AsyncStorage.setItem('photoProfile', res.data.photoProfile);
        }
        if (res.data.photoPublicId) {
          setPhotoPublicId(res.data.photoPublicId);
          await AsyncStorage.setItem('photoPublicId', res.data.photoPublicId);
        }
      } catch (apiError) {
        console.log('Using cached profile data');
      }
    } catch (error) {
      console.error('Profile load error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotoToCloudinary = async (imageUri: string) => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const userId = await AsyncStorage.getItem('user_id');

      if (!token || !userId) throw new Error('Not authenticated');

      const formData = new FormData();

      if (!isWeb) {
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        // @ts-ignore
        formData.append('photo', { uri: imageUri, name: filename, type });
      } else {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('photo', blob, 'profile.jpg');
      }

      formData.append('userId', userId);

      const response = await axios.put(
        `${API_URL}/profile/update-pfp`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setUploadingPhoto(true);
      if (isWeb) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event: any) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const result = e.target?.result as string;
              try {
                const uploadResult = await uploadPhotoToCloudinary(result);
                setPhotoUri(uploadResult.photoProfile);
                setPhotoPublicId(uploadResult.photoPublicId);
                await AsyncStorage.setItem('photoProfile', uploadResult.photoProfile);
                await AsyncStorage.setItem('photoPublicId', uploadResult.photoPublicId);
                Alert.alert('Success', 'Profile photo updated!');
              } catch (error) {
                Alert.alert('Error', 'Failed to upload photo');
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
          const uploadResult = await uploadPhotoToCloudinary(result.assets[0].uri);
          setPhotoUri(uploadResult.photoProfile);
          setPhotoPublicId(uploadResult.photoPublicId);
          await AsyncStorage.setItem('photoProfile', uploadResult.photoProfile);
          await AsyncStorage.setItem('photoPublicId', uploadResult.photoPublicId);
          Alert.alert('Success', 'Profile photo updated!');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploadingPhoto(false);
      setPhotoModalVisible(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      setUploadingPhoto(true);
      if (isWeb) {
        Alert.alert('Info', 'Camera access is limited on web. Please use "Choose from Gallery" instead.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uploadResult = await uploadPhotoToCloudinary(result.assets[0].uri);
        setPhotoUri(uploadResult.photoProfile);
        setPhotoPublicId(uploadResult.photoPublicId);
        await AsyncStorage.setItem('photoProfile', uploadResult.photoProfile);
        await AsyncStorage.setItem('photoPublicId', uploadResult.photoPublicId);
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setUploadingPhoto(false);
      setPhotoModalVisible(false);
    }
  };

  const handleSave = async () => {
    if (!password && !confirmPassword) {
      await updateProfile();
    } else if (password && confirmPassword) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
      await updateProfile();
    } else {
      Alert.alert('Error', 'Please fill both password fields');
      return;
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const storedToken = await AsyncStorage.getItem('jwt_token');
      const storedId = await AsyncStorage.getItem('user_id');
      if (!storedToken || !storedId) {
        router.replace('/');
        return;
      }

      const updateData: any = { name: name.trim(), email: email.trim() };
      if (password) updateData.password = password;
      if (photoPublicId) updateData.photoPublicId = photoPublicId;

      await axios.put(`${API_URL}/profile/${storedId}`, updateData, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      await AsyncStorage.setItem('name', name.trim());
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setPhotoModalVisible(false);
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = () => {
    if (!name || name.trim().length === 0) return 'US';
    const parts = name.split(' ').filter(p => p.length > 0);
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCloudinaryUrl = () => {
    if (!photoUri) return '';
    return photoUri.includes('cloudinary.com')
      ? photoUri.replace('/upload/', '/upload/w_400,h_400,c_fill,g_face,q_auto,f_auto/')
      : photoUri;
  };

  if (loading || userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Palette.linenWhite} />
        <ActivityIndicator size="large" color={Palette.warmCopper} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // ===== MAIN CONTENT COMPONENT =====
  const ProfileContent = () => (
    <View style={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        {!isWeb && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Palette.charcoalEspresso} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>My Profile</Text>
        {!isWeb && <View style={{ width: 40 }} />}
      </View>

      {/* Profile Card (full mobile content) */}
      <View style={styles.profileCard}>
        {/* Avatar & Editing Section */}
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
            {/* Name */}
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

            {/* Email */}
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

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                  editable={!saving}
                />
                {focusedInput === 'password' && <View style={styles.inputIcon}><Feather name="lock" size={20} color="#1b5e20" /></View>}
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, focusedInput === 'confirmPassword' && styles.inputFocused]}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                  editable={!saving}
                />
                {focusedInput === 'confirmPassword' && <View style={styles.inputIcon}><Feather name="shield" size={20} color="#1b5e20" /></View>}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Save Changes</Text>
                </>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsEditing(false); setPassword(''); setConfirmPassword(''); }} style={[styles.button, styles.cancelButton]} disabled={saving}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{name || 'User Name'}</Text>
            <Text style={styles.email}>{email || 'user@example.com'}</Text>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Scans</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statNumber}>89%</Text><Text style={styles.statLabel}>Avg Quality</Text></View>
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

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color={Palette.white} />
        <Text style={styles.buttonText}>Logout Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      {isLargeScreen ? (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Palette.deepObsidian }}>
          {/* LEFT - PROFILE */}
          <ScrollView
            style={{ flex: 0.4, backgroundColor: Palette.deepObsidian }}
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <ProfileContent />
          </ScrollView>

          {/* RIGHT - ANALYTICS */}
          <View style={{ flex: 0.6, backgroundColor: Palette.deepObsidian }}>
            <Analytics />
          </View>
        </View>
      ) : (
        <ScrollView style={[styles.container, { backgroundColor: Palette.charcoalEspresso }]} showsVerticalScrollIndicator={false}>
          <ProfileContent />
        </ScrollView>
      )}

      {/* Photo Upload Modal */}
      <Modal visible={photoModalVisible} transparent animationType="slide" onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setPhotoModalVisible(false)} disabled={uploadingPhoto}>
                <Ionicons name="close" size={26} color={Palette.slate} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { fontFamily: Fonts.bold }]}>Change Profile Photo</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: Palette.charcoalEspresso }]} onPress={pickImageFromGallery} disabled={uploadingPhoto}>
                {uploadingPhoto ? <ActivityIndicator color="#fff" /> : <>
                  <Ionicons name="image-outline" size={22} color={Palette.white} />
                  <Text style={styles.buttonText}>Choose from Gallery</Text>
                </>}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, { backgroundColor: Palette.charcoalEspresso }]} onPress={takePhotoWithCamera} disabled={uploadingPhoto || isWeb}>
                {isWeb ? <>
                  <Ionicons name="camera-outline" size={22} color={Palette.white} />
                  <Text style={styles.buttonText}>Camera Not Available</Text>
                </> : <>
                  <Ionicons name="camera-outline" size={22} color={Palette.white} />
                  <Text style={styles.buttonText}>Take Photo</Text>
                </>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setPhotoModalVisible(false)} disabled={uploadingPhoto}>
              <Text style={{ color: Palette.slate, fontSize: 16, fontFamily: Fonts.bold }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
