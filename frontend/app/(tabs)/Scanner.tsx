import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useScannerStyles } from '../styles/Scanner.styles';
import { API_URL } from '../config/appconf';
import { useUser } from '../contexts/UserContext';

const { width: screenWidth } = Dimensions.get('window');

export default function Scanner() {
  const styles = useScannerStyles();
  const router = useRouter();
  const { user } = useUser();
  
  // Camera state
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  
  // UI state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Animation for scan line
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  // Animate scan line
  useEffect(() => {
    const animateScanLine = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    animateScanLine();
  }, []);

  // Handle permission states
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={64} color="#27AE60" />
        <Text style={styles.permissionText}>
          Camera access is required to scan durians
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Take photo with camera
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        analyzeImage(photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Analyze image with backend API
  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Create form data
      const formData = new FormData();
      
      // Handle different platforms
      if (Platform.OS === 'web') {
        // For web, fetch the blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'durian_scan.jpg');
      } else {
        // For mobile
        const filename = imageUri.split('/').pop() || 'durian_scan.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      // Add user_id to save scan to history
      if (user?.id) {
        formData.append('user_id', user.id);
        formData.append('save_to_history', 'true');
      }

      // Send to backend with user ID header
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (user?.id) {
        headers['X-User-Id'] = user.id;
      }

      const response = await fetch(`${API_URL}/scanner/detect`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result);
        
        // Use Cloudinary URL if scan was saved, otherwise use local URI
        const displayImageUri = result.cloudinary?.image_url || imageUri;
        
        // Navigate to results screen with data
        router.push({
          pathname: '/DurianScanResult',
          params: {
            imageUri: displayImageUri,
            localImageUri: imageUri, // Keep local URI as fallback
            result: JSON.stringify(result),
            scanSaved: result.scan_saved ? 'true' : 'false',
            scanId: result.scan_id || '',
          },
        });
      } else {
        Alert.alert('Analysis Failed', result.message || 'Could not analyze the image');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to the analysis server. Please check your connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Calculate scan line position
  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280], // Height of scan frame
  });

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
            <Text style={styles.backText}> Back</Text>
          </TouchableOpacity>

          {/* Flip Camera Button */}
          <TouchableOpacity
            style={[styles.backButton, { left: 'auto', right: 20 }]}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#333" />
          </TouchableOpacity>

          {/* Scan Frame with AR effect */}
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Animated scan line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslate }],
                  },
                ]}
              />

              {/* Grid lines */}
              <View style={styles.gridContainer}>
                <View style={[styles.gridLineHorizontal, { top: '33%' }]} />
                <View style={[styles.gridLineHorizontal, { top: '66%' }]} />
                <View style={[styles.gridLineVertical, { left: '33%' }]} />
                <View style={[styles.gridLineVertical, { left: '66%' }]} />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                🥭 Position durian in frame
              </Text>
              <Text style={styles.instructionsSubtext}>
                Ensure good lighting for best results
              </Text>
            </View>
          </View>

          {/* Preview of last captured image */}
          {capturedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
              {isAnalyzing && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <ActivityIndicator size="small" color="#27AE60" />
                </View>
              )}
            </View>
          )}

          {/* Bottom Controls */}
          <View style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 40 : 30,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
          }}>
            {/* Gallery Button */}
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: 14,
                borderRadius: 30,
              }}
              onPress={pickImage}
              disabled={isAnalyzing}
            >
              <Ionicons name="images-outline" size={28} color="#333" />
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              style={[
                styles.captureButton,
                isAnalyzing && { opacity: 0.6 },
                { position: 'relative', bottom: 0, marginHorizontal: 0 },
              ]}
              onPress={takePicture}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.captureText}>📷 Scan</Text>
              )}
            </TouchableOpacity>

            {/* Reset Button (if image captured) */}
            {capturedImage && (
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: 14,
                  borderRadius: 30,
                }}
                onPress={resetScanner}
                disabled={isAnalyzing}
              >
                <Ionicons name="refresh-outline" size={28} color="#333" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <ActivityIndicator size="large" color="#27AE60" />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 18, fontWeight: '600' }}>
            🔍 Analyzing durian...
          </Text>
          <Text style={{ color: '#ccc', marginTop: 8, fontSize: 14 }}>
            Please wait while AI processes the image
          </Text>
        </View>
      )}
    </View>
  );
}
