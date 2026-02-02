import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isLargeScreen = width >= 768;

export const useLandingStyles = () => {
  return StyleSheet.create({
    // Container Styles
    safeArea: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 40,
    },

    // Header Styles
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 16 : 24,
      paddingVertical: isSmallScreen ? 12 : 16,
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmallScreen ? 8 : 12,
    },
    logo: {
      width: isSmallScreen ? 32 : 40,
      height: isSmallScreen ? 32 : 40,
      borderRadius: isSmallScreen ? 16 : 20,
    },
    headerTitle: {
      fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 24,
      fontWeight: '700',
      color: '#1b5e20',
      letterSpacing: 0.3,
    },
    headerRight: {
      flexDirection: 'row',
      gap: isSmallScreen ? 8 : 12,
      alignItems: 'center',
    },

    // Navigation Styles
    nav: {
      backgroundColor: '#f8faf9',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingVertical: 12,
    },
    navScroll: {
      flexDirection: 'row',
      paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 16 : 24,
      gap: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
    },
    navItem: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    navText: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '500',
      color: '#374151',
      letterSpacing: 0.2,
    },

    // Hero Section Styles
    heroSection: {
      backgroundColor: '#ffffff',
      overflow: 'hidden',
    },
    heroContent: {
      position: 'relative',
    },
    heroBanner: {
      width: '100%',
      height: isSmallScreen ? 320 : isMediumScreen ? 420 : 520,
      resizeMode: 'cover',
    },
    heroTextOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      paddingHorizontal: isSmallScreen ? 20 : isMediumScreen ? 28 : 40,
      paddingVertical: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
    },
    heroTitle: {
      fontSize: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: 8,
      lineHeight: isSmallScreen ? 30 : isMediumScreen ? 40 : 48,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    heroSubtitle: {
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
      fontWeight: '400',
      color: '#f3f4f6',
      lineHeight: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
      opacity: 0.95,
    },

    // Carousel Indicators
    indicatorsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 20,
      backgroundColor: '#ffffff',
    },
    indicator: {
      height: 8,
      borderRadius: 4,
      ...(Platform.OS === 'web' ? ({ transition: 'all 0.3s ease' } as any) : {}),
    },

    // Hero Buttons
    heroButtons: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isSmallScreen ? 12 : 16,
      paddingHorizontal: isSmallScreen ? 20 : isMediumScreen ? 28 : 40,
      paddingVertical: isSmallScreen ? 20 : 28,
      backgroundColor: '#ffffff',
    },

    // Button Styles
    button: {
      paddingVertical: isSmallScreen ? 12 : 14,
      paddingHorizontal: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isSmallScreen ? '100%' : 140,
      ...Platform.select({
        ios: {
          shadowColor: '#1b5e20',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    primaryButton: {
      backgroundColor: '#1b5e20',
      borderWidth: 2,
      borderColor: '#1b5e20',
    },
    secondaryButton: {
      backgroundColor: '#ffffff',
      borderWidth: 2,
      borderColor: '#1b5e20',
    },
    disabledButton: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: isSmallScreen ? 15 : 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    primaryButtonText: {
      color: '#ffffff',
    },
    secondaryButtonText: {
      color: '#1b5e20',
    },

    // Info Cards Section
    infoCardsSection: {
      backgroundColor: '#f8faf9',
      paddingVertical: isSmallScreen ? 32 : isMediumScreen ? 40 : 56,
      paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
    },
    infoCardsGrid: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: isSmallScreen ? 16 : 20,
      justifyContent: 'center',
    },
    infoCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
      flex: isSmallScreen ? 1 : 0,
      minWidth: isSmallScreen ? '100%' : isMediumScreen ? 280 : 320,
      maxWidth: isSmallScreen ? '100%' : 380,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      ...Platform.select({
        ios: {
          shadowColor: '#1b5e20',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    infoCardTitle: {
      fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 22,
      fontWeight: '700',
      color: '#1b5e20',
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    infoCardText: {
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: '400',
      color: '#4b5563',
      lineHeight: isSmallScreen ? 20 : 22,
    },

    // ABOUT US Section
   infoSection: {
  paddingVertical: isSmallScreen ? 40 : 56,
  paddingHorizontal: isSmallScreen ? 20 : 32,
  backgroundColor: '#ffffff',
},
sectionTitle: {
  fontSize: isSmallScreen ? 28 : 36,
  fontWeight: '800',
  color: '#0f172a',
  textAlign: 'center',
  marginBottom: isSmallScreen ? 32 : 48,
  lineHeight: isSmallScreen ? 36 : 44,
},

// Feature Block
featureBlock: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: isSmallScreen ? 24 : 32,
  padding: isSmallScreen ? 20 : 24,
  backgroundColor: '#ffffff',
  borderRadius: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#10b981', // Emerald green accent
  ...Platform.select({
    ios: {
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }),
},
featureImage: {
  width: isSmallScreen ? 80 : 100,
  height: isSmallScreen ? 80 : 100,
  borderRadius: 12,
  marginRight: isSmallScreen ? 16 : 20,
  resizeMode: 'cover',
},
featureText: {
  flex: 1,
  fontSize: isSmallScreen ? 16 : 18,
  fontWeight: '600',
  color: '#334155',
  lineHeight: isSmallScreen ? 24 : 28,
},

    // Facts Section
    factsSection: {
      backgroundColor: '#f0f9f4',
      paddingVertical: isSmallScreen ? 40 : isMediumScreen ? 56 : 72,
      paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 24 : 32,
    },
    factsTitle: {
      fontSize: isSmallScreen ? 26 : isMediumScreen ? 32 : 38,
      fontWeight: '800',
      color: '#1b5e20',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 24 : isMediumScreen ? 32 : 40,
      letterSpacing: 0.5,
    },
    factCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
      marginBottom: isSmallScreen ? 16 : 20,
      borderLeftWidth: 4,
      borderLeftColor: '#1b5e20',
      ...Platform.select({
        ios: {
          shadowColor: '#1b5e20',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    factHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    factIcon: {
      fontSize: isSmallScreen ? 28 : 32,
      lineHeight: isSmallScreen ? 28 : 32,
    },
    factLabel: {
      fontSize: isSmallScreen ? 17 : isMediumScreen ? 18 : 20,
      fontWeight: '700',
      color: '#1b5e20',
      flex: 1,
      letterSpacing: 0.3,
    },
    factDesc: {
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: '400',
      color: '#4b5563',
      lineHeight: isSmallScreen ? 20 : 22,
      paddingLeft: isSmallScreen ? 40 : 44,
    },

    // Contact Section
    contactSection: {
      backgroundColor: '#ffffff',
      paddingVertical: isSmallScreen ? 28 : 36,
      paddingHorizontal: isSmallScreen ? 16 : 24,
      alignItems: 'center',
    },
    contactTitle: {
      fontSize: isSmallScreen ? 20 : 22,
      fontWeight: '700',
      color: '#1b5e20',
      marginBottom: 8,
      textAlign: 'center',
    },
    contactText: {
      fontSize: isSmallScreen ? 14 : 15,
      color: '#374151',
      textAlign: 'center',
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: 24,
      padding: isSmallScreen ? 24 : isMediumScreen ? 28 : 32,
      width: '100%',
      maxWidth: 480,
      maxHeight: '90%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    modalTitle: {
      fontSize: isSmallScreen ? 24 : isMediumScreen ? 28 : 32,
      fontWeight: '800',
      color: '#1b5e20',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 20 : 24,
      letterSpacing: 0.5,
    },

    // Profile Picture Section (Signup)
    profilePictureSection: {
      marginBottom: 24,
      alignItems: 'center',
    },
    sectionLabel: {
      fontSize: isSmallScreen ? 15 : 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 16,
      alignSelf: 'flex-start',
      width: '100%',
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: '#1b5e20',
      backgroundColor: '#f3f4f6',
    },
    placeholderImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#e5e7eb',
      borderWidth: 2,
      borderColor: '#d1d5db',
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#9ca3af',
    },
    removeImageButton: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#ef4444',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#ffffff',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    removeImageText: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 20,
    },

    // Image Buttons
    imageButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      justifyContent: 'center',
    },
    imageButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      maxWidth: 150,
    },
    galleryButton: {
      backgroundColor: '#ffffff',
      borderColor: '#1b5e20',
    },
    cameraButton: {
      backgroundColor: '#1b5e20',
      borderColor: '#1b5e20',
    },
    imageButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1b5e20',
    },

    // Input Styles
    input: {
      backgroundColor: '#f9fafb',
      borderWidth: 2,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: isSmallScreen ? 12 : 14,
      fontSize: isSmallScreen ? 15 : 16,
      color: '#1f2937',
      marginBottom: 16,
      fontWeight: '500',
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
    },
  });
};