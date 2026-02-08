import React, { useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/appconf';
import { useUser } from '../contexts/UserContext';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useResponsive } from '../utils/platform';
import { useLandingStyles } from '../styles/LandingScreen.styles';

interface LandingAuthModalProps {
  visible: boolean;
  mode?: 'login' | 'signup';
  onClose: () => void;
}

type ImagePickerAsset = {
  uri: string;
  [key: string]: any;
};

export default function LandingAuthModal({ visible, mode, onClose }: LandingAuthModalProps) {
  const { refreshUser } = useUser();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(mode || 'login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { isSmallScreen } = useResponsive();
  const styles = useLandingStyles();

  // Sync authMode with mode prop
  React.useEffect(() => {
    setAuthMode(mode || 'login');
    // Reset all fields when modal is opened or mode changes
    if (visible) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedImage(null);
      setImageUri(null);
      setLoading(false);
    }
  }, [mode, visible]);

  const clearImage = () => {
    setSelectedImage(null);
    setImageUri(null);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload a profile picture!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0] as ImagePickerAsset);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to take a photo!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0] as ImagePickerAsset);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const storeData = async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (authMode === 'signup') {
        if (!name || !email || !password || !confirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          setLoading(false);
          return;
        }
        let signupRes;
        if (selectedImage) {
          const formData = new FormData();
          formData.append('name', name);
          formData.append('email', email);
          formData.append('password', password);
          formData.append('confirm_password', confirmPassword);
          const filename = selectedImage.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          if (Platform.OS === 'web') {
            const response = await fetch(selectedImage.uri);
            const blob = await response.blob();
            formData.append('photo', blob, `profile_${Date.now()}.${match ? match[1] : 'jpg'}`);
          } else {
            formData.append('photo', {
              uri: selectedImage.uri,
              type: type,
              name: `profile_${Date.now()}.${match ? match[1] : 'jpg'}`
            } as any);
          }
          signupRes = await axios.post(`${API_URL}/auth/signup-with-pfp`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          signupRes = await axios.post(`${API_URL}/auth/signup`, {
            name, email, password, confirm_password: confirmPassword,
          });
        }
        if (signupRes.status === 200 && signupRes.data.success) {
          // AUTO-LOGIN LOGIC AFTER SIGNUP
          const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
          if (loginRes.data.success) {
            const userData = loginRes.data.user;
            const userRole = userData.role || 'user';
            await storeData('jwt_token', loginRes.data.token);
            await storeData('user_role', userRole);
            await storeData('user_id', userData.id);
            await storeData('name', userData.name);
            await storeData('photoProfile', userData.photoProfile);
            Alert.alert('Success', 'Account created!');
            await refreshUser();
            onClose();
            // Redirect to admin dashboard if admin after signup
            if (userRole === 'admin') {
              router.replace('/admin');
            } else {
              router.replace('/');
            }
          } else {
            Alert.alert('Error', loginRes.data.error || 'Login after signup failed');
          }
        } else {
          Alert.alert('Error', signupRes.data?.error || 'Signup failed');
        }
        setLoading(false);
        return;
      }
      // LOGIN LOGIC
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        setLoading(false);
        return;
      }
      const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (loginRes.data.success && loginRes.data.token) {
        const userData = loginRes.data.user;
        const userRole = userData.role || 'user';
        await storeData('jwt_token', loginRes.data.token);
        await storeData('user_role', userRole);
        await storeData('user_id', userData.id);
        await storeData('userEmail', email);
        await storeData('name', userData.name);
        await storeData('photoProfile', userData.photoProfile);
        await refreshUser();
        onClose();
        Alert.alert('Success', 'Logged in!');
        // Redirect to admin dashboard if admin
        if (userRole === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      } else {
        Alert.alert('Error', loginRes.data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      Alert.alert('Error', err?.response?.data?.error || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalTitle}>
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </Text>
            {authMode === 'signup' && (
              <View style={styles.profilePictureSection}>
                <Text style={styles.sectionLabel}>Profile Picture (Optional)</Text>
                <View style={styles.profileImageContainer}>
                  {imageUri ? (
                    <>
                      <Image source={{ uri: imageUri }} style={styles.profileImage} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={clearImage}>
                        <Text style={styles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                </View>
                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity style={[styles.imageButton, styles.galleryButton]} onPress={pickImage} disabled={loading}>
                    <Text style={styles.imageButtonText}>📁 Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.imageButton, styles.cameraButton]} onPress={takePhoto} disabled={loading}>
                    <Text style={styles.imageButtonText}>📷 Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {authMode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                editable={!loading}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            {authMode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            )}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { marginTop: 8 }, loading && styles.disabledButton]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 16, paddingVertical: 8 }}
              onPress={() => {
                clearImage();
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              disabled={loading}
            >
              <Text style={{ color: '#1b5e20', textAlign: 'center', fontSize: isSmallScreen ? 14 : 15 }}>
                {authMode === 'login'
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8, paddingVertical: 8 }}
              onPress={() => {
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                clearImage();
                setAuthMode(mode || 'login');
                onClose();
              }}
              disabled={loading}
            >
              <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: isSmallScreen ? 14 : 15 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
