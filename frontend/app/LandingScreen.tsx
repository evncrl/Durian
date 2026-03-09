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
// import { API_URL } from "@/config/appconf"; 
import { useLandingStyles } from "@/styles/LandingScreen.styles";
import { useResponsive } from '@/utils/platform';
// import * as ImagePicker from 'expo-image-picker';
import Footer from '@/components/Footer';
import { useUser } from '@/contexts/UserContext';
import DurianHeatmap from '@/components/DurianHeatmap';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthUI } from '@/contexts/AuthUIContext';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, useAnimatedScrollHandler } from 'react-native-reanimated';

// Animated Component for Hover Effect
const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedImage } from '@/components/ui/AnimatedImage';
import { VideoSection } from '@/components/VideoSection';
import { interpolate, useDerivedValue, withRepeat, withSequence, withDelay, withTiming } from "react-native-reanimated";

const AnimatedIndicator = ({ index, currentIndex }: { index: number, currentIndex: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = index === currentIndex;
    const widthValue = withSpring(isActive ? 24 : 8, { damping: 15 });
    const opacityValue = withSpring(isActive ? 1 : 0.4);
    const backgroundValue = isActive ? Palette.deepObsidian : Palette.stoneGray;

    return {
      width: widthValue,
      opacity: opacityValue,
      backgroundColor: backgroundValue,
    };
  });

  return <Animated.View style={[{ height: 8, borderRadius: 4, marginHorizontal: 4 }, animatedStyle]} />;
};

const InteractiveCard = ({ children, style, onPress }: any) => {
  const scale = useSharedValue(1);
  const shadow = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: withSpring(shadow.value * 0.1),
    elevation: withSpring(shadow.value * 8),
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97);
        shadow.value = withSpring(1.5);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
        shadow.value = withSpring(1);
      }}
      activeOpacity={0.9}
    >
      {children}
    </AnimatedPressable>
  );
};

const HeroItem = ({ item, scrollY, width, floatStyle }: any) => {
  const styles = useLandingStyles();
  const parallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 500],
      [0, 150]
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, backgroundColor: Palette.deepObsidian, overflow: 'hidden' }}>
      <View style={{ position: "relative" }}>
        <Animated.View style={parallaxStyle}>
          <AnimatedImage
            source={item.image}
            style={styles.heroBanner}
            entering={FadeInDown.duration(800).delay(200)}
          />
        </Animated.View>
        <LinearGradient
          colors={['transparent', 'rgba(12, 26, 16, 0.3)', 'rgba(12, 26, 16, 0.9)']}
          style={styles.heroTextOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Animated.View style={floatStyle}>
            <Animated.Text
              entering={FadeInDown.duration(800).delay(400)}
              style={[styles.heroTitle, { color: Palette.white }]}
            >
              {item.title}
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.duration(800).delay(600)}
              style={[styles.heroSubtitle, { color: Palette.linenWhite }]}
            >
              {item.subtitle}
            </Animated.Text>
          </Animated.View>
        </LinearGradient>
      </View>
    </View>
  );
};

const DynamicSection = ({ section, scrollY, width, plotlyLoaded, setPlotlyLoaded, user, openAuthModal }: any) => {
  const styles = useLandingStyles();

  return (
    <View style={section.style || (styles as any)[section.styleName]}>
      {section.title && (
        <ScrollReveal scrollY={scrollY}>
          <Animated.Text
            entering={FadeInDown.duration(800).delay(200)}
            style={[styles.sectionTitle, section.titleStyle]}
          >
            {section.title}
          </Animated.Text>
        </ScrollReveal>
      )}
      {section.subtitle && (
        <ScrollReveal scrollY={scrollY}>
          <Animated.Text
            entering={FadeInDown.duration(800).delay(300)}
            style={[styles.aboutSubtitle, section.subtitleStyle]}
          >
            {section.subtitle}
          </Animated.Text>
        </ScrollReveal>
      )}

      {section.type === 'hero' && (
        <View style={styles.heroContent}>
          <FlatList
            ref={section.flatListRef}
            data={section.data}
            renderItem={({ item }) => (
              <HeroItem
                item={item}
                scrollY={scrollY}
                width={width}
                floatStyle={section.floatStyle}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              section.onIndexChange(newIndex);
            }}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          />
          <View style={styles.indicatorsContainer}>
            {section.data.map((_: any, index: number) => (
              <AnimatedIndicator key={index} index={index} currentIndex={section.currentIndex} />
            ))}
          </View>
          <Animated.View
            entering={FadeInDown.duration(800).delay(800)}
            style={styles.heroButtons}
          >
            {!user && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => openAuthModal('login')}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Get Started
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      )}

      {section.type === 'grid' && (
        <View style={styles.missionCardsContainer}>
          {section.data.map((item: any, index: number) => (
            <ScrollReveal key={index} scrollY={scrollY} style={styles.card} index={index}>
              <InteractiveCard style={{ flex: 1 }} onPress={() => { }}>
                <View style={styles.missionIconContainer}>
                  <Ionicons name={item.icon} size={32} color={Palette.warmCopper} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </View>
      )}

      {section.type === 'scroll' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.articlesScrollContainer}>
          {section.data.map((article: any, index: number) => (
            <ScrollReveal key={article.id} scrollY={scrollY} index={index}>
              <InteractiveCard
                style={styles.articleCard}
                onPress={() => article.url && Linking.openURL(article.url)}
              >
                <AnimatedImage
                  source={article.image}
                  style={styles.articleImage}
                  entering={FadeInDown.duration(600).delay(200 + index * 100)}
                />
                <View style={styles.articleContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name={article.icon} size={16} color={Palette.warmCopper} style={{ marginRight: 6 }} />
                    <Text style={styles.articleTitle} numberOfLines={1}>{article.title}</Text>
                  </View>
                  <Text style={styles.articleDesc} numberOfLines={3}>{article.desc}</Text>
                </View>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </ScrollView>
      )}

      {section.type === 'custom' && section.id === 'heatmap' && (
        <ScrollReveal
          scrollY={scrollY}
          style={{
            flexDirection: width < 600 ? 'column' : 'row',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginVertical: 24,
          }}
        >
          <View style={width < 600 ? { width: '100%', marginTop: 24 } : { flex: 1, minWidth: 320, maxWidth: 600 }}>
            <DurianHeatmap
              mapMode={'heatmap'}
              onMapModeChange={() => { }}
              onRegionSelect={() => { }}
              plotlyLoaded={plotlyLoaded}
              onPlotlyLoad={() => setPlotlyLoaded(true)}
            />
          </View>
        </ScrollReveal>
      )}

      {section.type === 'video' && (
        <VideoSection
          videoId={section.videoId}
          scrollY={scrollY}
          width={width}
          index={1} // Hardcoded index for now as it's the second section
        />
      )}
    </View>
  );
};

function Landing({ }: any) {
  // All hooks must be declared at the top, before any conditional or early return
  const { user } = useUser();
  const { openAuthModal } = useAuthUI();
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Animation Values
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event: any) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const { isWeb, isSmallScreen, isMediumScreen, isLargeScreen, width } = useResponsive();
  const styles = useLandingStyles();
  const scrollRef = useRef<ScrollView | null>(null);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [anchors, setAnchors] = useState<{ home: number; about: number }>({ home: 0, about: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const floatValue = useSharedValue(0);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -10]) }],
  }));
  // Remove all local modal/auth state and handlers


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

  const SECTIONS = [
    {
      id: 'home',
      type: 'hero',
      styleName: 'heroSection',
      data: carouselData,
      flatListRef: flatListRef,
      currentIndex: currentIndex,
      onIndexChange: (idx: number) => setCurrentIndex(idx),
      onLayout: (e: any) => { const y = e.nativeEvent?.layout?.y ?? 0; setAnchors(prev => ({ ...prev, home: y })); },
      floatStyle: floatStyle
    },
    {
      id: 'video-demo',
      type: 'video',
      videoId: 'EXK6yQCQ93Q',
      styleName: 'videoSection', // Ensure this style exists or use inline
      title: "Watch Our Story",
      subtitle: "Discover the journey behind our durian quality assurance.",
      titleStyle: { color: '#F0F0F0', textAlign: 'center', marginTop: 40 },
      subtitleStyle: { color: '#F0F0F0', textAlign: 'center', marginBottom: 20 },
    },
    {
      id: 'mission',
      type: 'grid',
      title: "Our Mission",
      subtitle: "Empowering durian farmers with cutting-edge AI for quality assurance and sustainable practices.",
      styleName: 'missionSection',
      titleStyle: { color: Palette.warmCopper },
      subtitleStyle: { color: Palette.linenWhite },
      data: [
        { title: "Precision Analysis", desc: "Our AI models are trained on thousands of samples for pinpoint accuracy.", icon: "flask-outline" },
        { title: "Farmer Empowerment", desc: "Supporting local growers with data-driven insights and fair market standards.", icon: "people-outline" },
        { title: "Global Standards", desc: "Setting the benchmark for durian export quality with automated consistency.", icon: "globe-outline" },
      ]
    },
    {
      id: 'articles',
      type: 'scroll',
      title: "Latest Articles",
      subtitle: "Stay informed with the newest trends and research in durian cultivation and AI.",
      styleName: 'featuredArticlesSection',
      titleStyle: { color: Palette.deepObsidian },
      subtitleStyle: { color: Palette.charcoalEspresso, opacity: 0.8, fontStyle: 'italic' },
      data: [
        {
          id: "1",
          title: "Detection and Sizing of Durian using Zero-Shot Models",
          image: require("../assets/images/feature1.jpg"),
          desc: "Detailed study on computerized automated detection and size estimation of durian fruits.",
          icon: "scan-outline",
          url: "https://ijtech.eng.ui.ac.id/article/view/6640"
        },
        {
          id: "2",
          title: "AI-Based Durian Disease Detection",
          image: require("../assets/images/feature2.jpg"),
          desc: "Identification of durian leaf disease using Convolutional Neural Networks.",
          icon: "flask-outline",
          url: "https://www.researchgate.net/publication/370517327_Identification_of_Durian_Leaf_Disease_Using_Convolutional_Neural_Network"
        },
        {
          id: "3",
          title: "Non-Destructive Fruit Quality Assessment",
          image: require("../assets/images/feature3.jpg"),
          desc: "Evaluating post-harvest traits to set quality standards for international markets.",
          icon: "shield-checkmark-outline",
          url: "https://www.researchgate.net/publication/370517328_Computer_Vision-Based_Non-invasive_Sweetness_Assessment_of_Mangifera_Indica_L_Fruit_Using_K-means_Clustering_and_CNN"
        },
      ]
    },
    {
      id: 'heatmap',
      type: 'custom',
      styleName: 'heatmapContainer',
    }
  ];

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

  // handleScroll simplified as logic moved to scrollHandler if needed, 
  // but we can keep it for simple state updates like showScrollTop
  useEffect(() => {
    const checkScroll = setInterval(() => {
      setShowScrollTop(scrollY.value > 200);
    }, 100);
    return () => clearInterval(checkScroll);
  }, []);

  return (
    <View style={styles.safeArea}>

      <Animated.ScrollView
        ref={scrollRef as any}
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* DYNAMIC SECTIONS ENGINE */}
        {SECTIONS.map((section) => (
          <DynamicSection
            key={section.id}
            section={section}
            scrollY={scrollY}
            width={width}
            plotlyLoaded={plotlyLoaded}
            setPlotlyLoaded={setPlotlyLoaded}
            user={user}
            openAuthModal={openAuthModal}
          />
        ))}

        {/* FOOTER */}
        <Animated.View entering={FadeInUp.duration(1000).delay(800)}>
          <Footer />
        </Animated.View>
      </Animated.ScrollView>
      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollTopButton}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Text style={styles.scrollTopButtonText}>↑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Landing;

