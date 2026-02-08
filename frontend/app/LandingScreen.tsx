import React, { useRef, useEffect, useState } from "react";
import { Linking } from "react-native";
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
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { router } from "expo-router";
// import { API_URL } from "./config/appconf"; 
import { useLandingStyles } from "./styles/LandingScreen.styles";
import { useResponsive } from './utils/platform';
// import * as ImagePicker from 'expo-image-picker';
import Footer from './components/Footer';
import { useUser } from './contexts/UserContext';
import DurianHeatmap from './components/DurianHeatmap';

function Landing(props: any = {}) {
  // All hooks must be declared at the top, before any conditional or early return
  const { user } = useUser();
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isWeb, isSmallScreen, isMediumScreen, isLargeScreen, width } = useResponsive();
  const styles = useLandingStyles();
  const scrollRef = useRef<ScrollView | null>(null);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [anchors, setAnchors] = useState<{ home: number; about: number }>({ home: 0, about: 0 });
  const openAuthModal = props.openAuthModal;
  // Carousel index state (was missing after cleanup)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Remove all local modal/auth state and handlers


  const carouselData = [
    {
      id: "1",
      title: "Know Your Durian Instantly",
      subtitle: "AI-powered quality analysis for damage, disease & export standards",
      image: require("../assets/images/durian-bg.jpg"), // unchanged, correct path
    },
    {
      id: "2",
      title: "Fast & Accurate Analysis",
      subtitle: "Get instant AI-powered quality assessment in seconds",
      image: require("../assets/images/durian-bg1.jpg"), // unchanged, correct path
    },
    {
      id: "3",
      title: "Early Detection Matters",
      subtitle: "Identify damage and disease before it's too late",
      image: require("../assets/images/durian-bg2.jpg"), // unchanged, correct path
    },
  ];

  // ...existing code...

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

  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent?.contentOffset?.y ?? 0;
    setShowScrollTop(yOffset > 200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Durianostics Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Durianostics</Text>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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
              {!user && (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => openAuthModal("login")}
                >
                  <Text style={[styles.buttonText, styles.primaryButtonText]}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {/* Featured + Heatmap Side by Side */}
        <View
          style={{
            flexDirection: width < 600 ? 'column' : 'row',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginVertical: 24,
          }}
        >
          <View
            style={
              width < 600
                ? { width: '100%' }
                : { flex: 1, minWidth: 320, maxWidth: 600 }
            }
          >
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Featured Articles</Text>
              <Text style={styles.aboutSubtitle}>Read the latest insights and news about durian farming, export, and AI technology.</Text>
              <View style={styles.squareScrollContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={{ height: 320 }}
                  contentContainerStyle={{ alignItems: 'stretch', justifyContent: 'flex-start' }}
                >
                  <TouchableOpacity
                    style={[styles.articleCard, { marginBottom: 16 }]}
                    onPress={() => Linking.openURL("https://ijtech.eng.ui.ac.id/article/view/6640")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.articleTitle}>Detection and Sizing of Durian using Zero-Shot Deep Learning Models</Text>
                    <Text style={styles.articleDesc}>Dela Cruz and Concepcion (2023) designed a computerized method of automated detection and size estimation of durian fruits, which is a demanding process in determining the yield and quality of durian fruits in the Philippines through precision agriculture. </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.articleCard, { marginBottom: 16 }]}
                    onPress={() => Linking.openURL("https://www.researchgate.net/publication/370517327_Identification_of_Durian_Leaf_Disease_Using_Convolutional_Neural_Network")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.articleTitle}>AI-Based Durian Disease Detection</Text>
                    <Text style={styles.articleDesc}>Identification of durian disease has been a significant problem with the Philippine agriculture because this nation has been applying manually-monitored and laboratory validated procedures. </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.articleCard}
                    onPress={() => Linking.openURL("https://www.researchgate.net/publication/370517328_Computer_Vision-Based_Non-invasive_Sweetness_Assessment_of_Mangifera_Indica_L_Fruit_Using_K-means_Clustering_and_CNN")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.articleTitle}>Non-Destructive Fruit Quality Assessment via Image Analysis</Text>
                    <Text style={styles.articleDesc}>Secretaria et al. (2025) also evaluated the post-harvest traits of the Puyat type of durian to be able to set definite quality standards of Filipino growers who are attempting to enter international markets. </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </View>
          <View
            style={
              width < 600
                ? { width: '100%', marginTop: 24 }
                : { flex: 1, minWidth: 320, maxWidth: 600 }
            }
          >
            <DurianHeatmap
              mapMode={'heatmap'}
              onMapModeChange={() => {}}
              onRegionSelect={() => {}}
              plotlyLoaded={plotlyLoaded}
              onPlotlyLoad={() => setPlotlyLoaded(true)}
            />
          </View>
        </View>
        {/* FOOTER */}
        <Footer />
      </ScrollView>
      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollTopButton}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Text style={styles.scrollTopButtonText}>↑</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default Landing;