import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

/* =====================
   Design Tokens
===================== */
const COLORS = {
  primary: '#27AE60',
  primaryDark: '#2e7d32',
  white: '#FFFFFF',
  border: '#E0E0E0',
  black: '#000000',
  text: '#333333',
} as const;

const SPACING = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 40,
} as const;

/* =====================
   Component
===================== */
export default function Scanner() {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Loading permissions…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>No camera access</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setPhotoUri(photo.uri);
  };

  const handleBack = () => {
    router.replace('/LandingMobile');
  };

  return (
    <View style={styles.container}>
      {/* Camera MUST be absolute */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      {/* Overlay (buttons must be here) */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <Text style={styles.captureText}>📸 Take Picture</Text>
        </TouchableOpacity>

        {photoUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          </View>
        )}
      </View>
    </View>
  );
}

/* =====================
   Styles
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },

  permissionText: {
    color: COLORS.white,
    fontSize: 18,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },

  backButton: {
    position: 'absolute',
    top: SPACING.xxxl,
    left: SPACING.xl,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    elevation: 4,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },

  captureButton: {
    position: 'absolute',
    bottom: SPACING.xxxl,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 30,
    elevation: 6,
    minWidth: 160,
  },

  captureText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  previewContainer: {
    position: 'absolute',
    bottom: 110,
    left: SPACING.xl,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },
});
