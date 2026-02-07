// app/(tabs)/Profile.tsx
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
import { API_URL } from '../config/appconf';
import * as ImagePicker from 'expo-image-picker';
import { 
  Ionicons, 
  MaterialIcons, 
  Feather, 
  FontAwesome5 
} from '@expo/vector-icons';
import { styles } from '../styles/Profile.styles';

export default function Profile() {
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
  const isSmallScreen = width < 375;

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

      // Get stored data first
      const storedName = await AsyncStorage.getItem('name');
      const storedPhoto = await AsyncStorage.getItem('photoProfile');
      const storedPublicId = await AsyncStorage.getItem('photoPublicId');
      
      if (storedName) setName(storedName);
      if (storedPhoto) setPhotoUri(storedPhoto);
      if (storedPublicId) setPhotoPublicId(storedPublicId);

      // Try to fetch from API
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
      
      if (!token || !userId) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      
      if (!isWeb) {
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // @ts-ignore
        formData.append('photo', {
          uri: imageUri,
          name: filename,
          type,
        });
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
            'Authorization': `Bearer ${token}`,
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
          try {
            const uploadResult = await uploadPhotoToCloudinary(result.assets[0].uri);
            
            setPhotoUri(uploadResult.photoProfile);
            setPhotoPublicId(uploadResult.photoPublicId);
            
            await AsyncStorage.setItem('photoProfile', uploadResult.photoProfile);
            await AsyncStorage.setItem('photoPublicId', uploadResult.photoPublicId);
            
            Alert.alert('Success', 'Profile photo updated!');
          } catch (error) {
            Alert.alert('Error', 'Failed to upload photo');
          }
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
        try {
          const uploadResult = await uploadPhotoToCloudinary(result.assets[0].uri);
          
          setPhotoUri(uploadResult.photoProfile);
          setPhotoPublicId(uploadResult.photoPublicId);
          
          await AsyncStorage.setItem('photoProfile', uploadResult.photoProfile);
          await AsyncStorage.setItem('photoPublicId', uploadResult.photoPublicId);
          
          Alert.alert('Success', 'Profile photo updated!');
        } catch (error) {
          Alert.alert('Error', 'Failed to upload photo');
        }
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

      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
      };

      if (password) {
        updateData.password = password;
      }

      if (photoPublicId) {
        updateData.photoPublicId = photoPublicId;
      }

      await axios.put(
        `${API_URL}/profile/${storedId}`,
        updateData,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      await AsyncStorage.setItem('name', name.trim());

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      // Close any open modals first
      setPhotoModalVisible(false);
      
      // Clear storage directly
      await AsyncStorage.multiRemove([
        'jwt_token',
        'user_id',
        'name',
        'photoProfile',
        'photoPublicId'
      ]);
      console.log('Storage cleared, navigating to home');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = () => {
    if (!name || name.trim().length === 0) {
      return 'US';
    }
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return 'US';
    
    return parts
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCloudinaryUrl = () => {
    if (!photoUri) return '';
    
    if (photoUri.includes('cloudinary.com')) {
      return photoUri.replace('/upload/', '/upload/w_400,h_400,c_fill,g_face,q_auto,f_auto/');
    }
    
    return photoUri;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
        <ActivityIndicator size="large" color="#1b5e20" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            {!isWeb && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={22} color="#1b5e20" />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>My Profile</Text>
            {!isWeb && <View style={{ width: 40 }} />}
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                {photoUri ? (
                  <Image 
                    source={{ uri: getCloudinaryUrl() }}
                    style={styles.avatar}
                    onError={() => {
                      // Fallback to initials if image fails to load
                      console.log('Image failed to load, using initials');
                    }}
                  />
                ) : (
                  <Text style={styles.avatarPlaceholder}>{getInitials()}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setPhotoModalVisible(true)}
                disabled={uploadingPhoto}
              >
                <View style={styles.cameraButtonInner}>
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#94a3b8"
                      style={[
                        styles.input,
                        focusedInput === 'name' && styles.inputFocused
                      ]}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="words"
                      editable={!saving}
                    />
                    {focusedInput === 'name' && (
                      <View style={styles.inputIcon}>
                        <Feather name="user" size={20} color="#1b5e20" />
                      </View>
                    )}
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="your.email@example.com"
                      placeholderTextColor="#94a3b8"
                      style={[
                        styles.input,
                        focusedInput === 'email' && styles.inputFocused
                      ]}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!saving}
                    />
                    {focusedInput === 'email' && (
                      <View style={styles.inputIcon}>
                        <MaterialIcons name="email" size={20} color="#1b5e20" />
                      </View>
                    )}
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password (Optional)</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter new password"
                      placeholderTextColor="#94a3b8"
                      style={[
                        styles.input,
                        focusedInput === 'password' && styles.inputFocused
                      ]}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry
                      editable={!saving}
                    />
                    {focusedInput === 'password' && (
                      <View style={styles.inputIcon}>
                        <Feather name="lock" size={20} color="#1b5e20" />
                      </View>
                    )}
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor="#94a3b8"
                      style={[
                        styles.input,
                        focusedInput === 'confirmPassword' && styles.inputFocused
                      ]}
                      onFocus={() => setFocusedInput('confirmPassword')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry
                      editable={!saving}
                    />
                    {focusedInput === 'confirmPassword' && (
                      <View style={styles.inputIcon}>
                        <Feather name="shield" size={20} color="#1b5e20" />
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    onPress={handleSave} 
                    style={[styles.button, styles.saveButton]}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    style={[styles.button, styles.cancelButton]}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{name || 'User Name'}</Text>
                <Text style={styles.email}>{email || 'user@example.com'}</Text>
                
              
                
          

                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={() => {
              console.log('Logout button pressed');
              handleLogout();
            }} 
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Photo Upload Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setPhotoModalVisible(false)}
                disabled={uploadingPhoto}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <View style={{ width: 40 }} />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={pickImageFromGallery}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Choose from Gallery</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={takePhotoWithCamera}
                disabled={uploadingPhoto || isWeb}
              >
                {isWeb ? (
                  <>
                    <Ionicons name="camera-outline" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Camera Not Available</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={22} color="#fff" />
                    <Text style={styles.buttonText}>Take Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setPhotoModalVisible(false)}
              disabled={uploadingPhoto}
            >
              <Text style={{ color: '#64748b', fontSize: 16, fontWeight: '500' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}