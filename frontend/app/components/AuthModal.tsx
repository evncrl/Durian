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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
    setLoading(true);
    // TODO: Implement login/signup logic here (copy from LandingScreen if needed)
    setTimeout(() => { setLoading(false); onClose(); }, 1000); // Placeholder
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <ScrollView
            style={{ width: '90%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </Text>
            {authMode === 'signup' && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '600', marginBottom: 4 }}>Profile Picture (Optional)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  {imageUri ? (
                    <>
                      <Image source={{ uri: imageUri }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                      <TouchableOpacity onPress={clearImage} style={{ marginLeft: 8 }}>
                        <Text style={{ color: '#d32f2f', fontWeight: '700', fontSize: 18 }}>×</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#888' }}>No Image</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={pickImage} style={{ marginRight: 8, backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8 }}>
                    <Text>📁 Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={takePhoto} style={{ backgroundColor: '#f0f0f0', padding: 8, borderRadius: 8 }}>
                    <Text>📷 Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {authMode === 'signup' && (
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                editable={!loading}
                autoCapitalize="words"
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }}
              />
            )}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }}
            />
            {authMode === 'signup' && (
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 12 }}
              />
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#27AE60', borderRadius: 8, padding: 12, marginTop: 8 }}
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16, textAlign: 'center' }}>
                {loading ? 'Loading...' : authMode === 'login' ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8, paddingVertical: 8 }}
              onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              disabled={loading}
            >
              <Text style={{ color: '#27AE60', textAlign: 'center', fontSize: 15 }}>
                {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8, paddingVertical: 8 }}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 15 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
