import React, { useState } from 'react';
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
import { Fonts, Colors, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/contexts/UserContext';

interface AuthModalProps {
  visible: boolean;
  mode: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ visible, mode, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const { refreshUser } = useUser();

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
      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
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
      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const onSubmit = async () => {
    // 1. Basic Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (authMode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 2. Define the URL based on the mode
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
      const url = `http://192.168.100.242:8000${endpoint}`;

      // 3. THIS DEFINES 'response' - The actual API call
      const response = await axios.post(url, {
        email,
        password,
        name: authMode === 'signup' ? name : undefined,
      });

      // 4. Handle the success
      if (response.data.success) {
        const { user, token } = response.data;

        // PERMANENT FIX: Store the email and other user data
        await AsyncStorage.multiSet([
          ['jwt_token', token],
          ['user_id', user.id.toString()],
          ['name', user.name],
          ['email', user.email], // This is the piece that was missing!
          ['user_role', user.role || 'user'],
        ]);

        // Update the context state
        await refreshUser();
        
        Alert.alert('Success', `Welcome, ${user.name}!`);
        onClose();
      }
    } catch (error: any) {
      console.error("Auth Error:", error.response?.data);
      Alert.alert(
        'Authentication Failed', 
        error.response?.data?.message || 'Check your credentials and try again.'
      );
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
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Palette.slate} />
                </TouchableOpacity>
              </View>

              {authMode === 'signup' && (
                <View style={styles.pfpSection}>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={styles.pfpWrapper}
                    activeOpacity={0.8}
                  >
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.pfpImage} />
                    ) : (
                      <View style={styles.pfpPlaceholder}>
                        <Ionicons name="camera" size={32} color={Palette.slate} />
                      </View>
                    )}
                    <View style={styles.pfpEditBadge}>
                      <Ionicons name="pencil" size={14} color={Palette.white} />
                    </View>
                  </TouchableOpacity>
                  {imageUri && (
                    <TouchableOpacity onPress={clearImage} style={styles.removePfpButton}>
                      <Text style={styles.removePfpText}>Remove photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.form}>
                {authMode === 'signup' && (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color={Palette.slate} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                      editable={!loading}
                      autoCapitalize="words"
                      style={styles.input}
                      placeholderTextColor={Palette.slate}
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Palette.slate} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!loading}
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor={Palette.slate}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={Palette.slate} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                    style={styles.input}
                    placeholderTextColor={Palette.slate}
                  />
                </View>

                {authMode === 'signup' && (
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={Palette.slate} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      editable={!loading}
                      style={styles.input}
                      placeholderTextColor={Palette.slate}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={onSubmit}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {authMode === 'login' ? 'Login' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footerLinkContainer}>
                  <Text style={styles.footerText}>
                    {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    disabled={loading}
                  >
                    <Text style={styles.footerLinkBold}>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 26, 16, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 440,
    backgroundColor: '#1A291A',
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
    color: Palette.linenWhite,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.charcoalEspresso,
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
    backgroundColor: Palette.charcoalEspresso,
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
    backgroundColor: Palette.charcoalEspresso,
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
    borderColor: '#1A291A',
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
    backgroundColor: Palette.charcoalEspresso,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Palette.linenWhite,
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
