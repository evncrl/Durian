import React, { useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/appconf';
import { useUser } from '@/contexts/UserContext';
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
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useResponsive } from '@/utils/platform';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Palette, Colors } from '@/constants/theme';
import { useLandingStyles } from '@/styles/LandingScreen.styles';
import { useAuthUI } from '@/contexts/AuthUIContext';

interface LandingAuthModalProps {
  // Now using context
}

type ImagePickerAsset = {
  uri: string;
  [key: string]: any;
};

export default function LandingAuthModal({ }: LandingAuthModalProps) {
  const { refreshUser } = useUser();
  const { authModalVisible, authMode: initialMode, closeAuthModal } = useAuthUI();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode || 'login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { isSmallScreen } = useResponsive();
  const styles = useLandingStyles();

  // Sync authMode with context
  React.useEffect(() => {
    setAuthMode(initialMode || 'login');
    // Reset all fields when modal is opened or mode changes
    if (authModalVisible) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedImage(null);
      setImageUri(null);
      setLoading(false);
    }
  }, [initialMode, authModalVisible]);

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
    setErrorMsg("");
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
            await storeData('email', userData.email); // Ensure 'email' key is set
            Alert.alert('Success', 'Account created!');
            await refreshUser();
            // Redirect to admin dashboard if admin after signup
            if (userRole === 'admin') {
              router.replace('/admin');
            } else {
              router.replace('/');
            }
            closeAuthModal();
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
        setErrorMsg('Please fill in all fields');
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
        await storeData('email', userData.email); // Use 'email' key for consistency
        await storeData('name', userData.name);
        await storeData('photoProfile', userData.photoProfile);
        await refreshUser();
        // Redirect to admin dashboard if admin
        if (userRole === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
        closeAuthModal();
        Alert.alert('Success', 'Logged in!');
      } else {
        setErrorMsg(loginRes.data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err?.response?.data?.error || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={authModalVisible}
      animationType="fade"
      transparent
      onRequestClose={closeAuthModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <ScrollView
              style={modalStyles.scrollView}
              contentContainerStyle={modalStyles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={modalStyles.modalHeader}>
                <Text style={modalStyles.modalTitle}>
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </Text>
                <TouchableOpacity onPress={closeAuthModal} style={modalStyles.closeButton}>
                  <Ionicons name="close" size={24} color={Palette.slate} />
                </TouchableOpacity>
              </View>

              {authMode === 'signup' && (
                <View style={modalStyles.pfpSection}>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={modalStyles.pfpWrapper}
                    activeOpacity={0.8}
                  >
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={modalStyles.pfpImage} />
                    ) : (
                      <View style={modalStyles.pfpPlaceholder}>
                        <Ionicons name="camera" size={32} color={Palette.slate} />
                      </View>
                    )}
                    <View style={modalStyles.pfpEditBadge}>
                      <Ionicons name="pencil" size={14} color={Palette.white} />
                    </View>
                  </TouchableOpacity>
                  {imageUri && (
                    <TouchableOpacity onPress={clearImage} style={modalStyles.removePfpButton}>
                      <Text style={modalStyles.removePfpText}>Remove photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={modalStyles.form}>
                {authMode === 'signup' && (
                  <View style={modalStyles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={Palette.slate} style={modalStyles.inputIcon} />
                    <TextInput
                      style={modalStyles.input}
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      editable={!loading}
                      autoCapitalize="words"
                      placeholderTextColor={Palette.slate}
                    />
                  </View>
                )}

                <View style={modalStyles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Palette.slate} style={modalStyles.inputIcon} />
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!loading}
                    autoCapitalize="none"
                    placeholderTextColor={Palette.slate}
                  />
                </View>

                <View style={modalStyles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Palette.slate} style={modalStyles.inputIcon} />
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                    placeholderTextColor={Palette.slate}
                  />
                </View>

                {authMode === 'signup' && (
                  <View style={modalStyles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={Palette.slate} style={modalStyles.inputIcon} />
                    <TextInput
                      style={modalStyles.input}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      editable={!loading}
                      placeholderTextColor={Palette.slate}
                    />
                  </View>
                )}

                {errorMsg ? (
                  <Text style={modalStyles.errorText}>{errorMsg}</Text>
                ) : null}

                <TouchableOpacity
                  style={[modalStyles.submitButton, loading && modalStyles.disabledButton]}
                  onPress={onSubmit}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={modalStyles.submitButtonText}>
                      {authMode === 'login' ? 'Login' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={modalStyles.footerLinkContainer}>
                  <Text style={modalStyles.footerText}>
                    {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      clearImage();
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                    }}
                    disabled={loading}
                  >
                    <Text style={modalStyles.footerLinkBold}>
                      {authMode === 'login' ? 'Sign Up' : 'Login'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 26, 16, 0.4)', // Deep Obsidian overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 440,
    backgroundColor: Palette.white,
    borderRadius: 32,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
      }
    }),
  },
  scrollView: {
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  scrollContent: {
    padding: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Palette.charcoalEspresso,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.linenWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pfpSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pfpWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Palette.linenWhite,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Palette.stoneGray,
  },
  pfpImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  pfpPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Palette.linenWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Palette.stoneGray,
    borderStyle: 'dashed',
  },
  pfpEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Palette.warmCopper,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  removePfpButton: {
    marginTop: 12,
  },
  removePfpText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#ef4444',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.linenWhite,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Palette.stoneGray,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Palette.charcoalEspresso,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: Palette.warmCopper,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: Palette.warmCopper,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 8px 16px ${Palette.warmCopper}40`,
      }
    }),
  },
  disabledButton: {
    backgroundColor: Palette.warmCopper,
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Palette.slate,
  },
  footerLinkBold: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Palette.warmCopper,
  },
});

