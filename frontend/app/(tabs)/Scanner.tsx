import React, { useState, useRef, useEffect } from 'react';

import {

  View,

  Text,

  TouchableOpacity,

  StyleSheet,

  Platform,

  Alert,

  Image,

  Modal,

  ActivityIndicator,

  Dimensions,

  Animated,

  ScrollView,

} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { LinearGradient } from 'expo-linear-gradient';

import { styles } from '../styles/Scanner.styles';



const isWeb = Platform.OS === 'web';

const { width, height } = Dimensions.get('window');



interface ScanResult {

  uri: string;

  type: string;

  name?: string;

  size?: number;

  base64?: string;

  width?: number;

  height?: number;

}



export default function Scanner() {

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView | null>(null);

  

  // Animation values

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;



  const maxFileSize = 10 * 1024 * 1024;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];



  useEffect(() => {

    if (!isWeb && !permission) {

      requestPermission();

    }

    

    // Entrance animation

    Animated.parallel([

      Animated.timing(fadeAnim, {

        toValue: 1,

        duration: 600,

        useNativeDriver: true,

      }),

      Animated.spring(scaleAnim, {

        toValue: 1,

        friction: 8,

        tension: 40,

        useNativeDriver: true,

      }),

    ]).start();

  }, [permission, requestPermission]);



  const animateButton = () => {

    Animated.sequence([

      Animated.timing(buttonScale, {

        toValue: 0.95,

        duration: 100,

        useNativeDriver: true,

      }),

      Animated.timing(buttonScale, {

        toValue: 1,

        duration: 100,

        useNativeDriver: true,

      }),

    ]).start();

  };



  const handleWebFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];

    if (!file) return;

    validateAndProcessFile(file);

    event.target.value = '';

  };



  const validateAndProcessFile = async (file: File | any) => {

    try {

      if (!allowedTypes.includes(file.type)) {

        throw new Error(`File type not supported. Please use: ${allowedTypes.join(', ')}`);

      }



      if (file.size > maxFileSize) {

        throw new Error(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);

      }



      setIsLoading(true);



      let uri: string;

      let base64Data: string | undefined;



      if (isWeb && file instanceof File) {

        uri = URL.createObjectURL(file);

        base64Data = await fileToBase64(file);

      } else {

        uri = file.uri || file.path;

        if (file.base64) {

          base64Data = file.base64;

        }

      }



      const result: ScanResult = {

        uri,

        type: file.type,

        name: file.name || `scan_${Date.now()}`,

        size: file.size,

        base64: base64Data,

      };



      setPreviewUri(uri);

      setIsModalVisible(false);

      Alert.alert('Success', 'Document scanned successfully');

    } catch (error: any) {

      console.error('Error processing file:', error);

      Alert.alert('Error', error.message || 'Failed to process file');

    } finally {

      setIsLoading(false);

    }

  };



  const fileToBase64 = (file: File): Promise<string> => {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);

      reader.onerror = error => reject(error);

    });

  };



  const handleTakePhoto = async () => {

    animateButton();

    

    if (isWeb) {

      const input = document.createElement('input');

      input.type = 'file';

      input.accept = 'image/*';

      input.capture = 'environment';

      

      input.onchange = async (event: Event) => {

        const target = event.target as HTMLInputElement;

        const file = target.files?.[0];

        if (file) {

          validateAndProcessFile(file);

        }

      };

      

      input.click();

      return;

    }



    if (!permission?.granted) {

      Alert.alert('Permission Required', 'Camera access is required to capture documents');

      await requestPermission();

      return;

    }



    try {

      const result = await ImagePicker.launchCameraAsync({

        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        allowsEditing: true,

        aspect: [4, 3],

        quality: 0.8,

      });



      if (!result.canceled && result.assets[0]) {

        validateAndProcessFile(result.assets[0]);

      }

    } catch (error) {

      console.error('Error launching camera:', error);

      Alert.alert('Error', 'Failed to launch camera');

    }

  };



  const handleOpenImageLibrary = async () => {

    animateButton();

    

    try {

      const result = await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        allowsEditing: true,

        aspect: [4, 3],

        quality: 0.8,

      });



      if (!result.canceled && result.assets[0]) {

        validateAndProcessFile(result.assets[0]);

      }

    } catch (error) {

      console.error('Error opening image library:', error);

      Alert.alert('Error', 'Failed to open image library');

    }

  };



  const captureWithExpoCamera = async () => {

    if (!cameraRef.current) return;



    try {

      setIsLoading(true);

      const photo = await cameraRef.current.takePictureAsync({

        quality: 0.8,

        base64: true,

      });



      if (photo) {

        const result: ScanResult = {

          uri: photo.uri,

          type: 'image/jpeg',

          name: `scan_${Date.now()}.jpg`,

          size: photo.width * photo.height * 4,

          base64: photo.base64,

          width: photo.width,

          height: photo.height,

        };



        setPreviewUri(photo.uri);

        setIsModalVisible(false);

        Alert.alert('Success', 'Document captured successfully');

      }

    } catch (error) {

      console.error('Error capturing image:', error);

      Alert.alert('Error', 'Failed to capture image');

    } finally {

      setIsLoading(false);

    }

  };



  const renderCameraView = () => {

    if (!isWeb && permission?.granted) {

      return (

        <View style={styles.cameraContainer}>

          <CameraView

            ref={cameraRef}

            style={styles.cameraPreview}

            facing="back"

            mode="picture"

          />

          <View style={styles.cameraOverlay}>

            <View style={styles.scanFrame} />

          </View>

          <View style={styles.cameraControls}>

            <TouchableOpacity

              style={styles.captureButton}

              onPress={captureWithExpoCamera}

              disabled={isLoading}

            >

              <View style={styles.captureButtonOuter}>

                <View style={styles.captureButtonInner} />

              </View>

            </TouchableOpacity>

          </View>

        </View>

      );

    }



    return (

      <View style={styles.cameraPlaceholder}>

        <Text style={styles.placeholderText}>Camera Unavailable</Text>

      </View>

    );

  };



  return (

    <View style={styles.container}>

      <Animated.View 

        style={[

          styles.content,

          {

            opacity: fadeAnim,

            transform: [{ scale: scaleAnim }],

          }

        ]}

      >

        {/* Header Section */}

        <View style={styles.header}>

          <Text style={styles.title}>Document Scanner</Text>

          <Text style={styles.subtitle}>

            Digitize your documents with professional quality

          </Text>

        </View>



        {/* Main Action Button */}

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>

          <TouchableOpacity

            style={styles.scanButton}

            onPress={() => {

              animateButton();

              setIsModalVisible(true);

            }}

            disabled={isLoading}

            activeOpacity={0.8}

          >

            <LinearGradient

              colors={['#2563eb', '#1d4ed8']}

              start={{ x: 0, y: 0 }}

              end={{ x: 1, y: 1 }}

              style={styles.gradientButton}

            >

              {isLoading ? (

                <ActivityIndicator color="#fff" size="small" />

              ) : (

                <>

                  <View style={styles.scanIcon}>

                    <View style={styles.scanIconLine} />

                    <View style={[styles.scanIconLine, styles.scanIconLineBottom]} />

                  </View>

                  <Text style={styles.scanButtonText}>Start New Scan</Text>

                </>

              )}

            </LinearGradient>

          </TouchableOpacity>

        </Animated.View>



        {/* Preview Section */}

        {previewUri && (

          <Animated.View 

            style={styles.previewContainer}

            entering="fadeIn"

          >

            <View style={styles.previewHeader}>

              <Text style={styles.previewTitle}>Recent Scan</Text>

              <TouchableOpacity

                style={styles.removeButton}

                onPress={() => setPreviewUri(null)}

              >

                <Text style={styles.removeButtonText}>✕</Text>

              </TouchableOpacity>

            </View>

            <View style={styles.imageWrapper}>

              <Image 

                source={{ uri: previewUri }} 

                style={styles.previewImage}

                resizeMode="cover"

              />

              <View style={styles.imageOverlay}>

                <Text style={styles.imageLabel}>Preview</Text>

              </View>

            </View>

          </Animated.View>

        )}



        {/* Features Section */}

        <View style={styles.featuresContainer}>

          <View style={styles.featureCard}>

            <View style={styles.featureIcon}>

              <Text style={styles.featureIconText}>📄</Text>

            </View>

            <Text style={styles.featureTitle}>High Quality</Text>

            <Text style={styles.featureDescription}>Professional grade scanning</Text>

          </View>

          

          <View style={styles.featureCard}>

            <View style={styles.featureIcon}>

              <Text style={styles.featureIconText}>⚡</Text>

            </View>

            <Text style={styles.featureTitle}>Fast Process</Text>

            <Text style={styles.featureDescription}>Instant digitization</Text>

          </View>

          

          <View style={styles.featureCard}>

            <View style={styles.featureIcon}>

              <Text style={styles.featureIconText}>🔒</Text>

            </View>

            <Text style={styles.featureTitle}>Secure</Text>

            <Text style={styles.featureDescription}>Protected storage</Text>

          </View>

        </View>

      </Animated.View>



      {/* Modal */}

      <Modal

        visible={isModalVisible}

        animationType="slide"

        transparent={true}

        onRequestClose={() => setIsModalVisible(false)}

      >

        <View style={styles.modalContainer}>

          <TouchableOpacity 

            style={styles.modalBackdrop}

            activeOpacity={1}

            onPress={() => setIsModalVisible(false)}

          />

          

          <View style={styles.modalContent}>

            <View style={styles.modalHandle} />

            

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>Scan Document</Text>

              <TouchableOpacity 

                onPress={() => setIsModalVisible(false)}

                style={styles.closeButton}

              >

                <Text style={styles.closeButtonText}>✕</Text>

              </TouchableOpacity>

            </View>



            <ScrollView 

              style={styles.optionsContainer}

              showsVerticalScrollIndicator={false}

            >

              {isWeb ? (

                <View style={styles.webInputWrapper}>

                  <input

                    type="file"

                    id="web-file-input"

                    accept={allowedTypes.join(',')}

                    onChange={handleWebFileUpload}

                    style={{ display: 'none' }}

                  />

                  <label htmlFor="web-file-input" style={{ width: '100%' }}>

                    <View style={styles.optionButton}>

                      <View style={styles.optionIconContainer}>

                        <Text style={styles.optionIcon}>📷</Text>

                      </View>

                      <View style={styles.optionTextContainer}>

                        <Text style={styles.optionButtonText}>Capture Document</Text>

                        <Text style={styles.optionButtonSubtext}>

                          Use your camera to scan

                        </Text>

                      </View>

                      <Text style={styles.optionArrow}>›</Text>

                    </View>

                  </label>

                </View>

              ) : (

                <>

                  <TouchableOpacity

                    style={styles.optionButton}

                    onPress={handleTakePhoto}

                    disabled={isLoading}

                    activeOpacity={0.7}

                  >

                    <View style={styles.optionIconContainer}>

                      <Text style={styles.optionIcon}>📷</Text>

                    </View>

                    <View style={styles.optionTextContainer}>

                      <Text style={styles.optionButtonText}>Take Photo</Text>

                      <Text style={styles.optionButtonSubtext}>

                        Capture using camera

                      </Text>

                    </View>

                    <Text style={styles.optionArrow}>›</Text>

                  </TouchableOpacity>



                  <TouchableOpacity

                    style={styles.optionButton}

                    onPress={handleOpenImageLibrary}

                    disabled={isLoading}

                    activeOpacity={0.7}

                  >

                    <View style={styles.optionIconContainer}>

                      <Text style={styles.optionIcon}>🖼️</Text>

                    </View>

                    <View style={styles.optionTextContainer}>

                      <Text style={styles.optionButtonText}>Choose from Gallery</Text>

                      <Text style={styles.optionButtonSubtext}>

                        Select existing image

                      </Text>

                    </View>

                    <Text style={styles.optionArrow}>›</Text>

                  </TouchableOpacity>

                </>

              )}



              {!isWeb && permission?.granted && (

                <View style={styles.cameraSection}>

                  <Text style={styles.sectionTitle}>Live Camera Preview</Text>

                  {renderCameraView()}

                </View>

              )}

            </ScrollView>



            {isLoading && (

              <View style={styles.loadingOverlay}>

                <View style={styles.loadingCard}>

                  <ActivityIndicator size="large" color="#2563eb" />

                  <Text style={styles.loadingText}>Processing Document...</Text>

                </View>

              </View>

            )}

          </View>

        </View>

      </Modal>

    </View>

  );

}