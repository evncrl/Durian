import React, { useRef, useState, useEffect } from 'react';

import { View, Text, TouchableOpacity, Image, Platform, Animated } from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { router } from 'expo-router';

import { useScannerStyles } from '../styles/Scanner.styles';



export default function Scanner() {

  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const scanLineAnim = useRef(new Animated.Value(0)).current;



  const styles = useScannerStyles();



  // Animated scanning line effect

  useEffect(() => {

    if (!photoUri) {

      const animation = Animated.loop(

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

      );

      animation.start();

      return () => animation.stop();

    }

  }, [photoUri]);



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

    if (photo) {

      setPhotoUri(photo.uri);

    }

  };



  const handleBack = () => {

    router.replace('/LandingScreen');

  };



  return (

    <View style={styles.container}>

      {/* Camera MUST be absolute */}

      <CameraView

        ref={cameraRef}

        style={styles.camera}

        facing="back"

      />



      {/* Overlay (buttons must be here) */}

      <View style={styles.overlay}>

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>

          <Text style={styles.backText}>← Back</Text>

        </TouchableOpacity>



        {/* AR Scan Overlay - only show when no photo taken */}

        {!photoUri && (

          <View style={styles.scanOverlay}>

            {/* Scan Frame */}

            <View style={styles.scanFrame}>

              {/* Corner Markers */}

              <View style={[styles.corner, styles.cornerTopLeft]} />

              <View style={[styles.corner, styles.cornerTopRight]} />

              <View style={[styles.corner, styles.cornerBottomLeft]} />

              <View style={[styles.corner, styles.cornerBottomRight]} />

              

              {/* Animated Scan Line */}

              <Animated.View

                style={[

                  styles.scanLine,

                  {

                    transform: [

                      {

                        translateY: scanLineAnim.interpolate({

                          inputRange: [0, 1],

                          outputRange: [0, 300], // Adjust based on frame height

                        }),

                      },

                    ],

                  },

                ]}

              />

              

              {/* Grid Lines */}

              <View style={styles.gridContainer}>

                <View style={styles.gridLineHorizontal} />

                <View style={[styles.gridLineHorizontal, { top: '50%' }]} />

                <View style={[styles.gridLineHorizontal, { bottom: 0 }]} />

                <View style={styles.gridLineVertical} />

                <View style={[styles.gridLineVertical, { left: '50%' }]} />

                <View style={[styles.gridLineVertical, { right: 0 }]} />

              </View>

            </View>

            

            {/* Instructions */}

            <View style={styles.instructionsContainer}>

              <Text style={styles.instructionsText}>

                🎯 Position durian in frame

              </Text>

              <Text style={styles.instructionsSubtext}>

                Ensure good lighting for best results

              </Text>

            </View>

          </View>

        )}



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