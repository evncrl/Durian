
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { useResponsive } from '../utils/platform';

// Vibrant Color Palette
const colors = {
  // Primary Green Shades
  primary: '#2d7a3e',
  primaryDark: '#1b5e20',
  primaryLight: '#4caf50',
  primaryGlow: '#66bb6a',
  
  // Accent Colors
  accent: '#ff9800',
  accentLight: '#ffb74d',
  accentDark: '#f57c00',
  
  // Secondary Colors
  secondary: '#00bcd4',
  secondaryLight: '#4dd0e1',
  secondaryDark: '#0097a7',
  
  // Purple Shades
  purple: '#9c27b0',
  purpleLight: '#ba68c8',
  purpleDark: '#7b1fa2',
  
  // Pink Shades
  pink: '#e91e63',
  pinkLight: '#f06292',
  
  // Background Colors
  bgLight: '#f0f9f4',
  bgWhite: '#ffffff',
  bgGray: '#f5f7fa',
  
  // Gradient Colors
  gradientStart: '#1b5e20',
  gradientMid: '#2d7a3e',
  gradientEnd: '#4caf50',
  
  // Text Colors
  textDark: '#1a1a1a',
  textMedium: '#374151',
  textLight: '#6b7280',
  textWhite: '#ffffff',
  
  // Border Colors
  borderLight: '#e0f2f1',
  borderMedium: '#b2dfdb',
  borderDark: '#4db6ac',
};


export const useLandingStyles = () => {
  const { isWeb, isSmallScreen, isMediumScreen, isLargeScreen, width } = useResponsive();
  const screenWidth = width;
  const screenHeight = Dimensions.get('window').height;
  const isWebPlatform = Platform.OS === 'web';
  const isSmall = screenWidth < 375;
  const isMedium = screenWidth >= 375 && screenWidth < 768;
  const isLarge = screenWidth >= 768;

  // Responsive sizing (now inside the hook)
  const scale = (size: number) => {
    if (isWeb && isLargeScreen) return size;
    if (isSmallScreen) return size * 0.9;
    return size;
  };

  const verticalScale = (size: number) => {
    if (isWeb && isLargeScreen) return size;
    if (isSmallScreen) return size * 0.85;
    return size;
  };

  const moderateScale = (size: number, factor = 0.5) => {
    return size + (scale(size) - size) * factor;
  };

  return StyleSheet.create({
    squareScrollContainer: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      borderRadius: 20,
      backgroundColor: '#f5f5f5',
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 0,
      overflow: 'visible',
      elevation: 0,
      shadowColor: 'transparent',
      justifyContent: 'flex-start',
    },
    safeArea: {
      flex: 1,
      backgroundColor: '#fff',
    },
    
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: verticalScale(20),
    },

    // ========== HEADER ==========
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isSmall ? 12 : isWebPlatform && isLarge ? 40 : 20,
      paddingVertical: isSmall ? 14 : 18,
      backgroundColor: colors.bgWhite,
      borderBottomWidth: 3,
      borderBottomColor: colors.primaryLight,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      zIndex: 10,
    },
    
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isSmall ? 8 : 12,
      flex: isWebPlatform && isLarge ? 0 : 1,
    },
    
    logo: {
      width: isSmall ? 36 : 44,
      height: isSmall ? 36 : 44,
      borderRadius: isSmall ? 18 : 22,
      borderWidth: 2,
      borderColor: colors.primaryLight,
    },
    
    headerTitle: {
      fontSize: isSmall ? 17 : isWebPlatform && isLarge ? 24 : 20,
      fontWeight: '800',
      color: colors.primary,
      textShadowColor: 'rgba(45, 122, 62, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    
    headerRight: {
      flexDirection: 'row',
      gap: isSmall ? 8 : 12,
      alignItems: 'center',
    },

    // ========== NAVIGATION ==========
    nav: {
      backgroundColor: colors.bgLight,
      borderBottomWidth: 2,
      borderBottomColor: colors.borderMedium,
      paddingVertical: isSmall ? 10 : 14,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    
    navScroll: {
      flexDirection: 'row',
      paddingHorizontal: isSmall ? 12 : isWebPlatform && isLarge ? 40 : 20,
      gap: isSmall ? 16 : isWebPlatform && isLarge ? 32 : 24,
    },
    
    navItem: {
      paddingVertical: 10,
      paddingHorizontal: isSmall ? 8 : 12,
      borderRadius: 20,
      backgroundColor: colors.bgWhite,
      elevation: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    
    navText: {
      fontSize: isSmall ? 14 : 15,
      fontWeight: '700',
      color: colors.primary,
    },

    // ========== HERO SECTION ==========
    heroSection: {
      backgroundColor: colors.bgWhite,
      width: '100%',
    },
    
    heroContent: {
      width: '100%',
    },
    
    heroBanner: {
      width: screenWidth,
      height: isSmall ? screenHeight * 0.38 : isWebPlatform && isLarge ? 520 : screenHeight * 0.42,
      resizeMode: 'cover',
    },
    
    heroTextOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(27, 94, 32, 0.85)',
      padding: isSmall ? 18 : isWebPlatform && isLarge ? 44 : 28,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    
    heroTitle: {
      fontSize: isSmall ? 22 : isWebPlatform && isLarge ? 40 : 30,
      fontWeight: '900',
      color: colors.textWhite,
      marginBottom: 10,
      textAlign: 'left',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 0.5,
    },
    
    heroSubtitle: {
      fontSize: isSmall ? 14 : isWebPlatform && isLarge ? 19 : 16,
      color: colors.accentLight,
      lineHeight: isSmall ? 20 : isWebPlatform && isLarge ? 28 : 24,
      textAlign: 'left',
      fontWeight: '600',
    },
    
    indicatorsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: isSmall ? 16 : 20,
      gap: 10,
      backgroundColor: colors.bgLight,
    },
    
    indicator: {
      height: 10,
      borderRadius: 5,
      elevation: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    
    heroButtons: {
      flexDirection: isSmall ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isSmall ? 14 : 18,
      paddingHorizontal: isSmall ? 16 : isWebPlatform && isLarge ? 40 : 24,
      paddingBottom: verticalScale(28),
      paddingTop: verticalScale(12),
      backgroundColor: colors.bgLight,
    },

    // ========== BUTTONS ==========
    button: {
      paddingVertical: isSmall ? 14 : isWebPlatform && isLarge ? 16 : 14,
      paddingHorizontal: isSmall ? 24 : isWebPlatform && isLarge ? 36 : 28,
      borderRadius: 30,
      minWidth: isSmall ? '100%' : isWebPlatform && isLarge ? 160 : 140,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      transform: [{ scale: 1 }],
    },
    
    primaryButton: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    
    secondaryButton: {
      backgroundColor: colors.bgWhite,
      borderWidth: 3,
      borderColor: colors.primaryLight,
    },
    
    disabledButton: {
      opacity: 0.5,
    },
    
    buttonText: {
      fontSize: isSmall ? 15 : 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    
    primaryButtonText: {
      color: colors.textWhite,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    
    secondaryButtonText: {
      color: colors.primary,
      fontWeight: '800',
    },

    // ========== INFO SECTION (About Us) ==========
    infoSection: {
      paddingHorizontal: isSmall ? 16 : isWebPlatform && isLarge ? 80 : 24,
      paddingVertical: verticalScale(40),
      backgroundColor: colors.bgWhite,
    },
    
    sectionTitle: {
      fontSize: isSmall ? 24 : isWebPlatform && isLarge ? 36 : 28,
      fontWeight: '900',
      color: colors.primary,
      marginBottom: verticalScale(12),
      textAlign: 'center',
      textShadowColor: 'rgba(45, 122, 62, 0.2)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 0.5,
    },

    aboutSubtitle: {
      fontSize: isSmall ? 15 : isWebPlatform && isLarge ? 18 : 16,
      color: colors.textMedium,
      textAlign: 'center',
      marginBottom: verticalScale(32),
      fontWeight: '600',
      fontStyle: 'italic',
    },

    teamContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: isSmall ? 16 : 20,
    },

    teamMember: {
      width: isWebPlatform && isLarge ? '18%' : isSmall ? '100%' : '47%',
      minWidth: isSmall ? 280 : 300,
      maxWidth: isWebPlatform && isLarge ? 220 : '100%',
      backgroundColor: colors.bgWhite,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      borderWidth: 3,
      borderColor: colors.borderMedium,
      marginBottom: isSmall ? 16 : 0,
    },

    teamImageWrapper: {
      width: '100%',
      height: isSmall ? 240 : isWebPlatform && isLarge ? 280 : 260,
      overflow: 'hidden',
      backgroundColor: colors.bgLight,
      borderBottomWidth: 3,
      borderBottomColor: colors.primaryLight,
    },

    teamImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    teamName: {
      fontSize: isSmall ? 17 : 18,
      fontWeight: '800',
      color: colors.primary,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 12,
      letterSpacing: 0.3,
    },

    teamRole: {
      fontSize: isSmall ? 13 : 14,
      fontWeight: '700',
      color: colors.accent,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 12,
      paddingHorizontal: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    teamDesc: {
      fontSize: isSmall ? 13 : 14,
      color: colors.textMedium,
      textAlign: 'center',
      lineHeight: isSmall ? 19 : 20,
      paddingHorizontal: 14,
      paddingBottom: 18,
      fontWeight: '500',
    },

    scrollTopButton: {
      position: 'absolute',
      right: isSmall ? 16 : 24,
      bottom: isSmall ? 24 : 32,
      width: isSmall ? 44 : 52,
      height: isSmall ? 44 : 52,
      borderRadius: isSmall ? 22 : 26,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: colors.primaryDark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      borderWidth: 2,
      borderColor: colors.primaryLight,
    },

    scrollTopButtonText: {
      color: colors.textWhite,
      fontSize: isSmall ? 18 : 22,
      fontWeight: '800',
      marginTop: -2,
    },

    authMenuWrapper: {
      position: 'relative',
      zIndex: 100,
    },

    authMenuButton: {
      paddingVertical: isSmall ? 8 : 10,
      paddingHorizontal: isSmall ? 10 : 14,
      minWidth: isSmall ? 44 : 50,
      borderRadius: 20,
    },

    authDropdown: {
      position: 'absolute',
      top: isSmall ? 44 : 50,
      right: 0,
      backgroundColor: colors.bgWhite,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primaryLight,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      overflow: 'hidden',
      minWidth: 120,
    },

    authDropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.bgWhite,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },

    authDropdownText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'left',
    },
    
    // Legacy styles (kept for backward compatibility if needed)
    featureBlock: {
      marginBottom: verticalScale(28),
      backgroundColor: colors.bgWhite,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      borderWidth: 3,
      borderColor: colors.borderMedium,
      transform: [{ scale: 1 }],
    },
    
    featureImage: {
      width: '100%',
      height: isSmall ? 180 : isWebPlatform && isLarge ? 320 : 220,
      resizeMode: 'cover',
    },
    
    featureText: {
      fontSize: isSmall ? 15 : 17,
      color: colors.textMedium,
      lineHeight: isSmall ? 22 : 26,
      padding: isSmall ? 18 : 24,
      textAlign: 'center',
      fontWeight: '600',
      backgroundColor: colors.bgLight,
    },

    

    // ========== CONTACT SECTION ==========
    contactSection: {
      paddingHorizontal: isSmall ? 16 : isWebPlatform && isLarge ? 80 : 24,
      paddingVertical: verticalScale(40),
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    
    contactTitle: {
      fontSize: isSmall ? 24 : isWebPlatform && isLarge ? 36 : 28,
      fontWeight: '900',
      color: colors.textWhite,
      marginBottom: 18,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 0.5,
    },
    
    contactText: {
      fontSize: isSmall ? 14 : 16,
      color: colors.accentLight,
      textAlign: 'center',
      lineHeight: isSmall ? 20 : 24,
      fontWeight: '600',
    },

    // ========== MODAL ==========
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(27, 94, 32, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isSmall ? 16 : 20,
    },
    
    modalContent: {
      backgroundColor: colors.bgWhite,
      borderRadius: 24,
      padding: isSmall ? 24 : isWebPlatform && isLarge ? 36 : 28,
      width: '100%',
      maxWidth: isWebPlatform && isLarge ? 520 : 420,
      maxHeight: isSmall ? '90%' : '85%',
      elevation: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      borderWidth: 3,
      borderColor: colors.primaryLight,
    },
    
    modalTitle: {
      fontSize: isSmall ? 26 : isWebPlatform && isLarge ? 32 : 28,
      fontWeight: '900',
      color: colors.primary,
      marginBottom: verticalScale(24),
      textAlign: 'center',
      textShadowColor: 'rgba(45, 122, 62, 0.15)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      letterSpacing: 0.5,
    },
    
    input: {
      borderWidth: 2,
      borderColor: colors.borderMedium,
      borderRadius: 16,
      padding: isSmall ? 14 : 16,
      fontSize: isSmall ? 15 : 16,
      marginBottom: 18,
      backgroundColor: colors.bgLight,
      color: colors.textDark,
      fontWeight: '500',
      elevation: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    // ========== PROFILE PICTURE SECTION ==========
    profilePictureSection: {
      marginBottom: 24,
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.bgLight,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.borderMedium,
    },
    
    sectionLabel: {
      fontSize: isSmall ? 15 : 16,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 16,
      alignSelf: 'flex-start',
      width: '100%',
      letterSpacing: 0.3,
    },
    
    profileImageContainer: {
      position: 'relative',
      marginBottom: 20,
    },
    
    profileImage: {
      width: isSmall ? 110 : 130,
      height: isSmall ? 110 : 130,
      borderRadius: isSmall ? 55 : 65,
      borderWidth: 4,
      borderColor: colors.primaryLight,
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    
    placeholderImage: {
      width: isSmall ? 110 : 130,
      height: isSmall ? 110 : 130,
      borderRadius: isSmall ? 55 : 65,
      backgroundColor: colors.bgGray,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.borderMedium,
      borderStyle: 'dashed',
    },
    
    placeholderText: {
      fontSize: isSmall ? 13 : 14,
      color: colors.textLight,
      fontWeight: '600',
    },
    
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.pink,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: colors.pink,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      borderWidth: 2,
      borderColor: colors.bgWhite,
    },
    
    removeImageText: {
      color: colors.textWhite,
      fontSize: 22,
      fontWeight: '900',
      lineHeight: 22,
    },
    
    imageButtonsContainer: {
      flexDirection: 'row',
      gap: 14,
      width: '100%',
      justifyContent: 'center',
    },
    
    imageButton: {
      flex: 1,
      paddingVertical: isSmall ? 12 : 14,
      paddingHorizontal: isSmall ? 14 : 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      maxWidth: 150,
      borderWidth: 2,
    },
    
    galleryButton: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondaryLight,
    },
    
    cameraButton: {
      backgroundColor: colors.purple,
      borderColor: colors.purpleLight,
    },
    
    imageButtonText: {
      color: colors.textWhite,
      fontSize: isSmall ? 14 : 15,
      fontWeight: '700',
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },

    // Featured Articles styles
    articlesContainer: {
      marginTop: isSmall ? 16 : 32,
      paddingHorizontal: isSmall ? 12 : 24,
      gap: isSmall ? 16 : 24,
    },
    articleCard: {
      backgroundColor: colors.bgWhite,
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 18,
      marginBottom: 14,
      borderLeftWidth: 5,
      borderLeftColor: colors.primary,
      shadowColor: 'transparent',
      elevation: 0,
    },
    articleTitle: {
      fontSize: isSmall ? 16 : 18,
      fontWeight: '700',
      color: colors.primaryDark,
      marginBottom: 4,
    },
    articleDesc: {
      fontSize: isSmall ? 13 : 15,
      color: colors.textMedium,
    },
  });
};