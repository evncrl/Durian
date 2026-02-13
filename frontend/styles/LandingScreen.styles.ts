
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { useResponsive } from '@/utils/platform';
import { Fonts, Palette } from '@/constants/theme';

// Modern Earthy 2.0 Refined Palette
const colors = {
  primary: Palette.warmCopper,
  primaryDark: Palette.deepObsidian,
  primaryLight: Palette.mutedSage,
  primaryGlow: Palette.linenWhite,

  // Accent Colors
  accent: Palette.charcoalEspresso,
  accentLight: Palette.stoneGray,
  accentDark: Palette.deepObsidian,

  // Secondary Colors
  secondary: Palette.mutedSage,
  secondaryLight: Palette.linenWhite,

  // Modern Neutral Palette
  bgLight: '#F0EFEA', // Slightly deeper Linen
  bgWhite: '#F0EFEA',
  bgGray: Palette.stoneGray,

  // Refined Text Colors
  textDark: Palette.charcoalEspresso,
  textMedium: Palette.deepObsidian,
  textLight: Palette.slate,
  textWhite: Palette.white,

  // Border Colors
  borderLight: Palette.linenWhite,
  borderMedium: Palette.stoneGray,
  borderDark: Palette.mutedSage,
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
      backgroundColor: colors.primaryDark, // Start with dark obsidian for a premium feel
    },

    container: {
      flex: 1,
      backgroundColor: Palette.deepObsidian,
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
      backgroundColor: colors.primaryDark,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
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
      borderColor: colors.primary,
    },

    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: isSmall ? 17 : isWebPlatform && isLarge ? 24 : 20,
      color: colors.primary,
      letterSpacing: -0.5,
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
      boxShadow: '0 2px 4px rgba(22, 101, 52, 0.15)',
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
      boxShadow: '0 1px 2px rgba(22, 101, 52, 0.1)',
    },

    navText: {
      fontSize: isSmall ? 14 : 15,
      fontFamily: Fonts.bold,
      color: colors.primary,
    },

    // ========== HERO SECTION ==========
    heroSection: {
      backgroundColor: Palette.deepObsidian,
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
      padding: isSmall ? 24 : isWebPlatform && isLarge ? 60 : 32,
      paddingBottom: isSmall ? 40 : 60,
    },

    heroTitle: {
      fontFamily: Fonts.bold,
      fontSize: isSmall ? 28 : isWebPlatform && isLarge ? 56 : 40,
      color: Palette.white,
      marginBottom: 12,
      textAlign: 'left',
      letterSpacing: -1,
      lineHeight: isSmall ? 32 : isWebPlatform && isLarge ? 64 : 48,
    },

    heroSubtitle: {
      fontFamily: Fonts.regular,
      fontSize: isSmall ? 15 : isWebPlatform && isLarge ? 20 : 18,
      color: Palette.linenWhite,
      lineHeight: isSmall ? 22 : isWebPlatform && isLarge ? 30 : 26,
      textAlign: 'left',
    },

    indicatorsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: isSmall ? 16 : 20,
      gap: 10,
      backgroundColor: Palette.deepObsidian,
    },

    indicator: {
      height: 10,
      borderRadius: 5,
      elevation: 2,
      boxShadow: '0 1px 2px rgba(22, 101, 52, 0.3)',
    },

    heroButtons: {
      flexDirection: isSmall ? 'column' : 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isSmall ? 14 : 18,
      paddingHorizontal: isSmall ? 16 : isWebPlatform && isLarge ? 40 : 24,
      paddingBottom: verticalScale(28),
      paddingTop: verticalScale(12),
      backgroundColor: Palette.deepObsidian,
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
      boxShadow: '0 4px 8px rgba(22, 101, 52, 0.3)',
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
      fontFamily: Fonts.semiBold,
      fontSize: isSmall ? 15 : 16,
      letterSpacing: 0.2,
    },

    primaryButtonText: {
      color: colors.textWhite,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },

    secondaryButtonText: {
      color: colors.primary,
      fontFamily: Fonts.bold,
    },

    // ========== INFO SECTION (About Us) ==========
    infoSection: {
      paddingHorizontal: isSmall ? 16 : isWebPlatform && isLarge ? 80 : 24,
      paddingVertical: verticalScale(40),
      backgroundColor: colors.bgWhite,
    },

    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: isSmall ? 24 : isWebPlatform && isLarge ? 42 : 32,
      color: Palette.warmCopper,
      marginBottom: verticalScale(12),
      textAlign: 'center',
      letterSpacing: -0.5,
    },

    aboutSubtitle: {
      fontSize: isSmall ? 15 : isWebPlatform && isLarge ? 18 : 16,
      color: colors.primaryGlow,
      textAlign: 'center',
      marginBottom: verticalScale(40),
      fontFamily: Fonts.medium,
      lineHeight: 24,
      paddingHorizontal: 20,
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
      boxShadow: '0 4px 10px rgba(22, 101, 52, 0.2)',
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
      fontFamily: Fonts.bold,
      fontSize: isSmall ? 17 : 18,
      color: colors.primary,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 12,
      letterSpacing: -0.2,
    },

    teamRole: {
      fontFamily: Fonts.semiBold,
      fontSize: isSmall ? 13 : 14,
      color: colors.accent,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 12,
      paddingHorizontal: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    teamDesc: {
      fontFamily: Fonts.regular,
      fontSize: isSmall ? 13 : 14,
      color: colors.textMedium,
      textAlign: 'center',
      lineHeight: isSmall ? 19 : 20,
      paddingHorizontal: 14,
      paddingBottom: 18,
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
      boxShadow: '0 4px 6px rgba(6, 78, 59, 0.25)',
      borderWidth: 2,
      borderColor: colors.primaryLight,
    },

    scrollTopButtonText: {
      color: colors.textWhite,
      fontSize: isSmall ? 18 : 22,
      fontFamily: Fonts.bold,
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
      boxShadow: '0 4px 6px rgba(22, 101, 52, 0.2)',
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
      fontFamily: Fonts.bold,
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
      fontFamily: Fonts.semiBold,
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
      fontFamily: Fonts.bold,
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
      fontFamily: Fonts.semiBold,
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
      boxShadow: '0 8px 16px rgba(22, 101, 52, 0.4)',
      borderWidth: 3,
      borderColor: colors.primaryLight,
    },

    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: isSmall ? 26 : isWebPlatform && isLarge ? 32 : 28,
      color: colors.primary,
      marginBottom: verticalScale(24),
      textAlign: 'center',
      letterSpacing: -0.5,
    },

    input: {
      fontFamily: Fonts.regular,
      borderWidth: 2,
      borderColor: colors.borderMedium,
      borderRadius: 16,
      padding: isSmall ? 14 : 16,
      fontSize: isSmall ? 15 : 16,
      marginBottom: 18,
      backgroundColor: colors.bgLight,
      color: colors.textDark,
      elevation: 2,
      boxShadow: '0 2px 4px rgba(22, 101, 52, 0.1)',
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
      fontFamily: Fonts.semiBold,
      fontSize: isSmall ? 15 : 16,
      color: colors.primary,
      marginBottom: 16,
      alignSelf: 'flex-start',
      width: '100%',
      letterSpacing: -0.2,
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
      boxShadow: '0 4px 8px rgba(22, 101, 52, 0.3)',
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
      fontFamily: Fonts.medium,
      fontSize: isSmall ? 13 : 14,
      color: colors.textLight,
    },

    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.primaryDark,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: colors.primaryDark,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      borderWidth: 2,
      borderColor: colors.bgWhite,
    },

    removeImageText: {
      color: colors.textWhite,
      fontSize: 22,
      fontFamily: Fonts.bold,
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
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
      maxWidth: 150,
      borderWidth: 2,
    },

    galleryButton: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondaryLight,
    },

    cameraButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryLight,
    },

    imageButtonText: {
      fontFamily: Fonts.semiBold,
      color: colors.textWhite,
      fontSize: isSmall ? 14 : 15,
    },

    // Featured Articles styles
    articlesContainer: {
      marginTop: isSmall ? 16 : 32,
      paddingHorizontal: isSmall ? 12 : 24,
      gap: isSmall ? 16 : 24,
    },
    articleTitle: {
      fontFamily: Fonts.bold,
      fontSize: isSmall ? 16 : 18,
      color: colors.primaryDark,
      marginBottom: 4,
      letterSpacing: -0.2,
    },
    articleDesc: {
      fontFamily: Fonts.regular,
      fontSize: isSmall ? 13 : 15,
      color: colors.textMedium,
      lineHeight: 20,
    },

    // ========== NEW MODERN SECTIONS ==========
    videoSection: {
      paddingHorizontal: 0, // Full width for video
      paddingVertical: 0,
      backgroundColor: Palette.deepObsidian,
      alignItems: 'center',
      marginBottom: 40,
    },
    missionSection: {
      paddingHorizontal: isWebPlatform && isLarge ? 80 : 24,
      paddingVertical: 80,
      backgroundColor: colors.primaryDark, // Vibrant Obsidian Background
    },
    missionCardsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 24,
      marginTop: 32,
    },
    missionIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: 'rgba(22, 101, 52, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    card: {
      width: isWebPlatform && isLarge ? '30%' : '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glassmorphic effect on dark bg
      borderRadius: 24,
      padding: 32,
      // Removed border for a clean borderless look
      elevation: 5,
    },
    cardTitle: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.primary,
      marginBottom: 12,
    },
    cardDesc: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.primaryGlow,
      lineHeight: 24,
      opacity: 0.9,
    },
    featuredArticlesSection: {
      paddingVertical: 80,
      backgroundColor: Palette.mutedSage, // Earthy sage background
    },
    articlesScrollContainer: {
      paddingHorizontal: isWebPlatform && isLarge ? 80 : 24,
      paddingBottom: 20,
    },
    articleCard: {
      width: 320,
      marginRight: 24,
      backgroundColor: Palette.linenWhite,
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      // Removed border for a clean borderless look
    },
    articleImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    articleContent: {
      padding: 24,
    },
  });
};
