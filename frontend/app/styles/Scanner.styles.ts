import { StyleSheet, Platform } from 'react-native';
import { useResponsive } from '../utils/platform';



/* =====================

   Design Tokens

===================== */

const COLORS = {

  primary: '#27AE60',

  primaryDark: '#1b5e20',

  white: '#FFFFFF',

  border: '#E0E0E0',

  black: '#000000',

  text: '#333333',

  gray: '#6b7280',

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

   Platform-specific Shadows

===================== */

const createShadow = (elevation: number) => {

  if (Platform.OS === 'ios') {

    return {

      shadowColor: COLORS.black,

      shadowOffset: { width: 0, height: elevation / 2 },

      shadowOpacity: 0.15,

      shadowRadius: elevation,

    };

  } else if (Platform.OS === 'android') {

    return {

      elevation,

    };

  } else {

    // Web

    return {

      boxShadow: `0 ${elevation / 2}px ${elevation}px rgba(0, 0, 0, 0.15)`,

    };

  }

};



/* =====================

   Styles Hook

===================== */

export const useScannerStyles = () => {

  const { isWeb, isSmallScreen, isMediumScreen, isLargeScreen, width } = useResponsive();
  return StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor: COLORS.black,

      position: 'relative',

    },



    camera: {

      position: 'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      width: '100%',

      height: '100%',

    },



    overlay: {

      position: 'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      zIndex: 10,

    },



    /* =====================

       Permission States

    ===================== */

    center: {

      flex: 1,

      justifyContent: 'center',

      alignItems: 'center',

      backgroundColor: COLORS.black,

      padding: SPACING.xl,

    },



    permissionText: {

      color: COLORS.white,

      fontSize: isSmallScreen ? 16 : 18,

      marginBottom: SPACING.lg,

      textAlign: 'center',

      fontWeight: '500',

      letterSpacing: 0.3,

    },



    button: {

      paddingVertical: isSmallScreen ? 12 : SPACING.md,

      paddingHorizontal: isSmallScreen ? 20 : SPACING.xxl,

      backgroundColor: COLORS.primaryDark,

      borderRadius: 12,

      ...createShadow(4),

      ...(Platform.OS === 'web' && {

        cursor: 'pointer',

        transition: 'all 0.2s ease',

      }),

    },



    buttonText: {

      color: COLORS.white,

      fontSize: isSmallScreen ? 15 : 16,

      fontWeight: '700',

      letterSpacing: 0.5,

    },



    /* =====================

       Back Button

    ===================== */

    backButton: {

      position: 'absolute',

      top: Platform.OS === 'ios' ? 56 : SPACING.xxxl,

      left: SPACING.xl,

      backgroundColor: COLORS.white,

      paddingVertical: SPACING.sm,

      paddingHorizontal: SPACING.lg,

      borderRadius: 12,

      flexDirection: 'row',

      alignItems: 'center',

      ...createShadow(6),

      ...(Platform.OS === 'web' && {

        cursor: 'pointer',

        transition: 'all 0.2s ease',

      }),

    },



    backText: {

      fontSize: isSmallScreen ? 15 : 16,

      fontWeight: '700',

      color: COLORS.text,

      letterSpacing: 0.3,

    },



    /* =====================

       Capture Button

    ===================== */

    captureButton: {

      position: 'absolute',

      bottom: Platform.OS === 'ios' ? 56 : SPACING.xxxl,

      alignSelf: 'center',

      left: 0,

      right: 0,

      marginHorizontal: 'auto',

      backgroundColor: COLORS.primary,

      paddingVertical: isSmallScreen ? 14 : 16,

      paddingHorizontal: SPACING.xxl,

      borderRadius: 30,

      minWidth: isSmallScreen ? 140 : 180,

      maxWidth: 220,

      alignItems: 'center',

      justifyContent: 'center',

      borderWidth: 3,

      borderColor: COLORS.white,

      ...createShadow(8),

      ...(Platform.OS === 'web' && {

        cursor: 'pointer',

        transition: 'all 0.2s ease',

        marginLeft: 'auto',

        marginRight: 'auto',

      }),

    },



    captureText: {

      color: COLORS.white,

      fontSize: isSmallScreen ? 15 : 16,

      fontWeight: '700',

      textAlign: 'center',

      letterSpacing: 0.5,

    },



    /* =====================

       Preview Container

    ===================== */

    previewContainer: {

      position: 'absolute',

      bottom: Platform.OS === 'ios' ? 140 : 120,

      left: SPACING.xl,

      width: isSmallScreen ? 100 : 120,

      height: isSmallScreen ? 140 : 160,

      borderRadius: 16,

      overflow: 'hidden',

      borderWidth: 3,

      borderColor: COLORS.primary,

      backgroundColor: COLORS.white,

      ...createShadow(8),

    },



    previewImage: {

      width: '100%',

      height: '100%',

      resizeMode: 'cover',

    },



    /* =====================

       AR Scan Overlay

    ===================== */

    scanOverlay: {

      flex: 1,

      justifyContent: 'center',

      alignItems: 'center',

      paddingTop: Platform.OS === 'ios' ? 100 : 80,

      paddingBottom: 200,

    },



    scanFrame: {

      width: isSmallScreen ? 280 : 320,

      height: isSmallScreen ? 280 : 320,

      position: 'relative',

      justifyContent: 'center',

      alignItems: 'center',

    },



    /* Corner Markers */

    corner: {

      position: 'absolute',

      width: 40,

      height: 40,

      borderColor: COLORS.primary,

      borderWidth: 4,

    },



    cornerTopLeft: {

      top: 0,

      left: 0,

      borderRightWidth: 0,

      borderBottomWidth: 0,

      borderTopLeftRadius: 8,

    },



    cornerTopRight: {

      top: 0,

      right: 0,

      borderLeftWidth: 0,

      borderBottomWidth: 0,

      borderTopRightRadius: 8,

    },



    cornerBottomLeft: {

      bottom: 0,

      left: 0,

      borderRightWidth: 0,

      borderTopWidth: 0,

      borderBottomLeftRadius: 8,

    },



    cornerBottomRight: {

      bottom: 0,

      right: 0,

      borderLeftWidth: 0,

      borderTopWidth: 0,

      borderBottomRightRadius: 8,

    },



    /* Animated Scan Line */

    scanLine: {

      position: 'absolute',

      top: 0,

      left: 0,

      right: 0,

      height: 3,

      backgroundColor: COLORS.primary,

      ...createShadow(8),

      ...(Platform.OS === 'web' && {

        boxShadow: `0 0 20px ${COLORS.primary}`,

      }),

    },



    /* Grid Lines */

    gridContainer: {

      position: 'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

    },



    gridLineHorizontal: {

      position: 'absolute',

      left: 0,

      right: 0,

      height: 1,

      backgroundColor: 'rgba(39, 174, 96, 0.2)',

      top: 0,

    },



    gridLineVertical: {

      position: 'absolute',

      top: 0,

      bottom: 0,

      width: 1,

      backgroundColor: 'rgba(39, 174, 96, 0.2)',

      left: 0,

    },



    /* Instructions */

    instructionsContainer: {

      marginTop: SPACING.xxl,

      alignItems: 'center',

      backgroundColor: 'rgba(0, 0, 0, 0.6)',

      paddingVertical: SPACING.md,

      paddingHorizontal: SPACING.xl,

      borderRadius: 12,

      maxWidth: isSmallScreen ? 280 : 320,

    },



    instructionsText: {

      color: COLORS.white,

      fontSize: isSmallScreen ? 15 : 16,

      fontWeight: '700',

      textAlign: 'center',

      marginBottom: 4,

      letterSpacing: 0.3,

    },



    instructionsSubtext: {

      color: COLORS.white,

      fontSize: isSmallScreen ? 12 : 13,

      fontWeight: '400',

      textAlign: 'center',

      opacity: 0.8,

    },

  });

};