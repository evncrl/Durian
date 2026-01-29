import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { API_URL } from "./config/appconf"; 
import { useLandingStyles } from "./styles/LandingScreen.styles";
import * as ImagePicker from 'expo-image-picker';

export default function Landing() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isSmallScreen = width < 375;

  const styles = useLandingStyles();
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const carouselData = [
    {
      id: "1",
      title: "Know Your Durian Instantly",
      subtitle: "AI-powered quality analysis for damage, disease & export standards",
      image: require("../assets/images/durian-bg.jpg"),
    },
    {
      id: "2",
      title: "Fast & Accurate Analysis",
      subtitle: "Get instant AI-powered quality assessment in seconds",
      image: require("../assets/images/durian-bg1.jpg"),
    },
    {
      id: "3",
      title: "Early Detection Matters",
      subtitle: "Identify damage and disease before it's too late",
      image: require("../assets/images/durian-bg2.jpg"),
    },
  ];

  // Image picker functions
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
      console.error('Error picking image:', error);
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
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageUri(null);
  };

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalVisible(true);
  };

  const closeAuthModal = () => {
    setAuthModalVisible(false);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSelectedImage(null);
    setImageUri(null);
    setLoading(false);
  };

  const storeData = async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("JWT decode error:", error);
      return null;
    }
  };

  const onSubmit = async () => {
    console.log("onSubmit called - authMode:", authMode);
    console.log("Form data:", { name, email, password, confirmPassword });

    try {
      setLoading(true);

      if (authMode === "signup") {
        console.log("Validating signup...");

        if (!name || !email || !password || !confirmPassword) {
          console.log("Missing fields validation failed");
          Alert.alert("Error", "Please fill in all fields");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          console.log("Password mismatch validation failed");
          Alert.alert("Error", "Passwords do not match");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          console.log("Password length validation failed");
          Alert.alert("Error", "Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        console.log("Making signup request to:", `${API_URL}/signup`);

        let signupRes;
        
        if (selectedImage) {
          // Use signup-with-pfp endpoint (with image)
          console.log("Using signup-with-pfp endpoint with image");
          console.log("Platform:", Platform.OS);
          
          const filename = selectedImage.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          console.log("File info:", { filename, type, uri: selectedImage.uri });

          // Use fetch API for better file upload support across platforms
          const formData = new FormData();
          formData.append('name', name);
          formData.append('email', email);
          formData.append('password', password);
          formData.append('confirm_password', confirmPassword);

          // Handle file upload based on platform
          if (Platform.OS === 'web') {
            // For web, convert to blob
            console.log("Converting image to blob for web");
            const response = await fetch(selectedImage.uri);
            const blob = await response.blob();
            console.log("Blob created:", { size: blob.size, type: blob.type });
            formData.append('photo', blob, `profile_${Date.now()}.${match ? match[1] : 'jpg'}`);
          } else {
            // For React Native/Expo - need to handle file differently
            console.log("Using native file upload");
            try {
              // Read the file as base64 and convert to blob
              const response = await fetch(selectedImage.uri);
              const blob = await response.blob();
              console.log("Blob created from native URI:", { size: blob.size, type: blob.type });
              formData.append('photo', blob, `profile_${Date.now()}.${match ? match[1] : 'jpg'}`);
            } catch (e) {
              console.log("Error converting to blob, falling back to direct URI:", e);
              formData.append('photo', {
                uri: selectedImage.uri,
                type: type,
                name: `profile_${Date.now()}.${match ? match[1] : 'jpg'}`
              } as any);
            }
          }

          console.log("FormData prepared, posting to:", `${API_URL}/signup-with-pfp`);
          signupRes = await axios.post(`${API_URL}/signup-with-pfp`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
          });
        } else {
          // Use regular signup endpoint (no image)
          console.log("Using regular signup endpoint");
          
          signupRes = await axios.post(`${API_URL}/signup`, {
            name: name,
            email: email,
            password: password,
            confirm_password: confirmPassword,
          });
        }

        console.log("Signup response received:", signupRes);
        console.log("Signup response data:", signupRes.data);

        // Check if signup was successful
        if (signupRes.status === 200 && signupRes.data.success) {
          console.log("Signup successful!");
          
          // Auto-login after successful signup
          try {
            const loginRes = await axios.post(`${API_URL}/login`, {
              email,
              password,
            });

            if (loginRes.data.success && loginRes.data.token) {
              await storeData("jwt_token", loginRes.data.token);

              const payload = decodeJWT(loginRes.data.token);
              const userId = payload?.sub;
              if (userId) {
                await storeData("user_id", userId);
              }

              await storeData("userEmail", email);
              await storeData("name", name);
              await storeData("photoProfile", 
                signupRes.data.user?.photoProfile || 
                signupRes.data.photoProfile || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1b5e20&color=fff`
              );

              Alert.alert("Success", "Account created and logged in!");
              closeAuthModal();
              router.replace("/(tabs)/Home");
            }
          } catch (loginError) {
            Alert.alert("Success", "Account created! Please log in.");
            setAuthMode("login");
          }
        } else {
          const errorMessage = signupRes.data?.error || signupRes.data?.message || "Signup failed";
          console.log("Signup failed:", errorMessage);
          Alert.alert("Signup Error", errorMessage);
        }
        setLoading(false);
        return;
      }

      // Login
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        setLoading(false);
        return;
      }

      const loginRes = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (!loginRes.data.success || !loginRes.data.token) {
        Alert.alert("Login Error", loginRes.data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Save JWT token
      await storeData("jwt_token", loginRes.data.token);

      // Decode JWT for user_id
      const payload = decodeJWT(loginRes.data.token);
      const userId = payload?.sub;
      if (userId) {
        await storeData("user_id", userId);
      }

      // Store user info
      await storeData("userEmail", email);
      await storeData("name", loginRes.data.user?.name || email.split("@")[0]);
      await storeData("photoProfile", loginRes.data.user?.photoProfile || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0])}&background=1b5e20&color=fff`);

      closeAuthModal();
      router.replace("/(tabs)/Home");
    } catch (err: any) {
      console.error("Auth error:", err);
      console.error("Error details:", err.response?.data);
      
      let errorMessage = "Something went wrong";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Make sure backend is running.";
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Check your connection.";
      }
      
      Alert.alert("Error", errorMessage);
      setLoading(false);
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000) as any;
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Durianostics</Text>
          </View>
    
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { minWidth: isSmallScreen ? 80 : 100, paddingVertical: isSmallScreen ? 8 : 10 }]}
              onPress={() => openAuthModal("login")}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText, { fontSize: isSmallScreen ? 14 : 15 }]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { minWidth: isSmallScreen ? 80 : 100, paddingVertical: isSmallScreen ? 8 : 10 }]}
              onPress={() => openAuthModal("signup")}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText, { fontSize: isSmallScreen ? 14 : 15 }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NAVIGATION */}
        <View style={styles.nav}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.navScroll}>
              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* HERO CAROUSEL SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <FlatList
              ref={flatListRef}
              data={carouselData}
              renderItem={({ item }) => (
                <View style={{ width, backgroundColor: "#fff" }}>
                  <View style={{ position: "relative" }}>
                    <Image source={item.image} style={styles.heroBanner} />
                    <View style={styles.heroTextOverlay}>
                      <Text style={styles.heroTitle}>{item.title}</Text>
                      <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={stopAutoScroll}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentIndex(newIndex);
                startAutoScroll();
              }}
              scrollEventThrottle={16}
            />

            {/* Carousel Indicators */}
            <View style={styles.indicatorsContainer}>
              {carouselData.map((_, index) => {
                const isActive = index === currentIndex;
                return (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: isActive ? "#1b5e20" : "#fff",
                        opacity: isActive ? 1 : 0.6,
                        width: isActive ? 20 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Buttons */}
            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
                onPress={() => openAuthModal("login")}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Get Started
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, loading && styles.disabledButton]}
                onPress={() => openAuthModal("signup")}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Learn More
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* INFO CARDS SECTION */}
        <View style={styles.infoCardsSection}>
          <View style={styles.infoCardsGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Fast Analysis</Text>
              <Text style={styles.infoCardText}>
                Get instant AI-powered quality assessment in seconds
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Early Detection</Text>
              <Text style={styles.infoCardText}>
                Identify damage and disease before it spreads
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Export Ready</Text>
              <Text style={styles.infoCardText}>
                Meet international quality standards with confidence
              </Text>
            </View>
          </View>
        </View>

        {/* FEATURES SECTION */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Why Choose Durianostics?</Text>

          <View style={styles.featureBlock}>
            <Image
              source={require("../assets/images/feature1.jpg")}
              style={styles.featureImage}
            />
            <Text style={styles.featureText}>
              Fast and accurate AI analysis for growers, sellers, and exporters.
            </Text>
          </View>

          <View style={styles.featureBlock}>
            <Image
              source={require("../assets/images/feature2.jpg")}
              style={styles.featureImage}
            />
            <Text style={styles.featureText}>
              Detect early signs of damage and disease before it's too late.
            </Text>
          </View>

          <View style={styles.featureBlock}>
            <Image
              source={require("../assets/images/feature3.jpg")}
              style={styles.featureImage}
            />
            <Text style={styles.featureText}>
              Export‑ready quality standards at your fingertips.
            </Text>
          </View>
        </View>

        {/* FACTS SECTION */}
        <View style={styles.factsSection}>
          <Text style={styles.factsTitle}>Did You Know?</Text>
          
          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Text style={styles.factIcon}>👑</Text>
              <Text style={styles.factLabel}>King of Fruits</Text>
            </View>
            <Text style={styles.factDesc}>
              Durian is hailed as the "King of Fruits" in Southeast Asia due to its formidable thorn-covered husk and distinctive size.
            </Text>
          </View>

          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Text style={styles.factIcon}>🚫</Text>
              <Text style={styles.factLabel}>Banned in Public</Text>
            </View>
            <Text style={styles.factDesc}>
              Due to its overpowering smell, durian is banned in many airports, hotels, and public trains across Asia, including Singapore and Japan.
            </Text>
          </View>

          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Text style={styles.factIcon}>💪</Text>
              <Text style={styles.factLabel}>Nutrient Powerhouse</Text>
            </View>
            <Text style={styles.factDesc}>
              Despite the smell, it is rich in iron, Vitamin C, and potassium, improving muscle strength and skin health.
            </Text>
          </View>

          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Text style={styles.factIcon}>🇵🇭</Text>
              <Text style={styles.factLabel}>The "Puyat" Variety</Text>
            </View>
            <Text style={styles.factDesc}>
              The Philippines is famous for the "Puyat" durian, known for its sweet, creamy taste and milder odor compared to other varieties.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* AUTH MODAL */}
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAuthModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <ScrollView 
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>
                {authMode === "login" ? "Login" : "Sign Up"}
              </Text>

              {/* Profile Picture Upload Section (only for signup) */}
              {authMode === "signup" && (
                <View style={styles.profilePictureSection}>
                  <Text style={styles.sectionLabel}>Profile Picture (Optional)</Text>
                  
                  <View style={styles.profileImageContainer}>
                    {imageUri ? (
                      <>
                        <Image 
                          source={{ uri: imageUri || '' }} 
                          style={styles.profileImage}
                        />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={clearImage}
                        >
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
                    <TouchableOpacity 
                      style={[styles.imageButton, styles.galleryButton]}
                      onPress={pickImage}
                      disabled={loading}
                    >
                      <Text style={styles.imageButtonText}>📁 Gallery</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.imageButton, styles.cameraButton]}
                      onPress={takePhoto}
                      disabled={loading}
                    >
                      <Text style={styles.imageButtonText}>📷 Camera</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {authMode === "signup" && (
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

              {authMode === "signup" && (
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
                    {authMode === "login" ? "Login" : "Sign Up"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 16, paddingVertical: 8 }}
                onPress={() => {
                  clearImage();
                  setAuthMode(authMode === "login" ? "signup" : "login");
                }}
                disabled={loading}
              >
                <Text style={{ color: "#1b5e20", textAlign: "center", fontSize: isSmallScreen ? 14 : 15 }}>
                  {authMode === "login"
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Login"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 8, paddingVertical: 8 }}
                onPress={closeAuthModal}
                disabled={loading}
              >
                <Text style={{ color: "#6b7280", textAlign: "center", fontSize: isSmallScreen ? 14 : 15 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}