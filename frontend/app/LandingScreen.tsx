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
  const scrollRef = useRef<ScrollView | null>(null);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [anchors, setAnchors] = useState({ home: 0, about: 0, services: 0, contact: 0 });

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

    try {
      setLoading(true);

      if (authMode === "signup") {
        if (!name || !email || !password || !confirmPassword) {
          Alert.alert("Error", "Please fill in all fields");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert("Error", "Passwords do not match");
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

          signupRes = await axios.post(`${API_URL}/signup-with-pfp`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          signupRes = await axios.post(`${API_URL}/signup`, {
            name, email, password, confirm_password: confirmPassword,
          });
        }

        if (signupRes.status === 200 && signupRes.data.success) {
          // AUTO-LOGIN LOGIC AFTER SIGNUP
          const loginRes = await axios.post(`${API_URL}/login`, { email, password });
          if (loginRes.data.success) {
            const userData = loginRes.data.user;
            const userRole = userData.role || "user";

            await storeData("jwt_token", loginRes.data.token);
            await storeData("user_role", userRole);
            await storeData("user_id", userData.id);
            await storeData("name", userData.name);
            await storeData("photoProfile", userData.photoProfile);

            Alert.alert("Success", "Account created!");
            closeAuthModal();
            
            // Redirect based on role
            if (userRole === "admin") {
              router.replace("/admin");
            } else {
              router.replace("/(tabs)/Home");
            }
          }
        } else {
          Alert.alert("Error", signupRes.data?.error || "Signup failed");
        }
        setLoading(false);
        return;
      }

      // LOGIN LOGIC
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        setLoading(false);
        return;
      }

      const loginRes = await axios.post(`${API_URL}/login`, { email, password });

      if (loginRes.data.success && loginRes.data.token) {
        // 1. Kunin ang user object mula sa response
        const userData = loginRes.data.user;
        const userRole = userData.role || "user"; // Ito ang role na galing sa DB

        // 2. I-save ang lahat sa AsyncStorage
        await storeData("jwt_token", loginRes.data.token);
        await storeData("user_role", userRole);
        await storeData("user_id", userData.id);
        await storeData("userEmail", email);
        await storeData("name", userData.name);
        await storeData("photoProfile", userData.photoProfile);

        console.log("Login Success! Role:", userRole);
        closeAuthModal();

        // 3. PAG-REDIRECT (ADMIN vs USER)
        if (userRole === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/(tabs)/Home");
        }
      } else {
        Alert.alert("Error", loginRes.data.error || "Invalid credentials");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      Alert.alert("Error", err.response?.data?.error || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1;
        try {
          if (flatListRef.current?.scrollToIndex) {
            flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
          } else if (flatListRef.current?.scrollToOffset) {
            flatListRef.current.scrollToOffset({ offset: nextIndex * width, animated: true });
          }
        } catch (e) {
          // Fallback if measurement isn't available yet
          try {
            flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
          } catch (err) {
            console.warn('Carousel scroll error:', err);
          }
        }
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
  }, [width]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
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
              <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: anchors.home, animated: true })}>
                <Text style={styles.navText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: anchors.about, animated: true })}>
                <Text style={styles.navText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: anchors.services, animated: true })}>
                <Text style={styles.navText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => scrollRef.current?.scrollTo({ y: anchors.contact, animated: true })}>
                <Text style={styles.navText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* HERO CAROUSEL SECTION */}
        <View style={styles.heroSection} onLayout={(e) => { const y = e.nativeEvent?.layout?.y ?? 0; setAnchors(prev => ({ ...prev, home: y })); }}>
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
              // Improve reliability for scrollToIndex and nested scrolling
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
              initialNumToRender={1}
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


        {/* FEATURES SECTION */}
        <View style={styles.infoSection} onLayout={(e) => { const y = e.nativeEvent?.layout?.y ?? 0; setAnchors(prev => ({ ...prev, about: y })); }}>
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
        <View style={styles.factsSection}onLayout={(e) => { const y = e.nativeEvent?.layout?.y ?? 0; setAnchors(prev => ({ ...prev, services: y })); }}>
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

        {/* CONTACT SECTION */}
        <View style={styles.contactSection} onLayout={(e) => { const y = e.nativeEvent?.layout?.y ?? 0; setAnchors(prev => ({ ...prev, contact: y })); }}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactText}>Email: support@durianostics.example • Phone: +1 555-1234</Text>
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