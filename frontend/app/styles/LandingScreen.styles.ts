
import { StyleSheet, Platform, useWindowDimensions } from "react-native";

export const useLandingStyles = () => {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  return StyleSheet.create({
    // Main Container
    safeArea: {
      flex: 1,
      backgroundColor: "#fff",
    },
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    scrollContainer: {
      flexGrow: 1,
    },

    //pfp section
     profilePictureSection: {
      marginBottom: isSmallScreen ? 16 : 20,
      alignItems: 'center',
      width: '100%',
    },
    sectionLabel: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: isSmallScreen ? 10 : 12,
      textAlign: 'center',
      width: '100%',
    },
    profileImageContainer: {
      position: 'relative',
      width: isSmallScreen ? 100 : 120,
      height: isSmallScreen ? 100 : 120,
      borderRadius: 60,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isSmallScreen ? 12 : 16,
      borderWidth: 2,
      borderColor: '#d1d5db',
      overflow: 'hidden',
      alignSelf: 'center',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
      resizeMode: 'cover',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
      backgroundColor: '#e5e7eb',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#9ca3af',
      borderStyle: 'dashed',
    },
    placeholderText: {
      color: '#6b7280',
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: '500',
    },
    removeImageButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: isSmallScreen ? 24 : 30,
      height: isSmallScreen ? 24 : 30,
      borderRadius: 15,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    removeImageText: {
      color: '#fff',
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      lineHeight: isSmallScreen ? 20 : 22,
    },
    imageButtonsContainer: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      justifyContent: 'center',
      gap: isSmallScreen ? 8 : 12,
      width: '100%',
    },
    imageButton: {
      paddingVertical: isSmallScreen ? 10 : 12,
      paddingHorizontal: isSmallScreen ? 14 : 16,
      borderRadius: 8,
      alignItems: 'center',
      minWidth: isSmallScreen ? 120 : 140,
      flex: isSmallScreen ? 1 : undefined,
    },
    galleryButton: {
      backgroundColor: '#3b82f6',
    },
    cameraButton: {
      backgroundColor: '#10b981',
    },
    imageButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: isSmallScreen ? 13 : 14,
    },

    // Add image upload toggle button
    addPhotoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: isSmallScreen ? 8 : 10,
      paddingHorizontal: isSmallScreen ? 12 : 16,
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#d1d5db',
      marginBottom: isSmallScreen ? 12 : 16,
      width: '100%',
    },
    addPhotoButtonText: {
      color: '#374151',
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: '500',
    },
    addPhotoIcon: {
      fontSize: isSmallScreen ? 16 : 18,
    },

    // Optional: Add image preview modal
    imagePreviewModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    imagePreview: {
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: 8,
      resizeMode: 'contain',
    },
    closePreviewButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closePreviewText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },

    // Optional: Add image upload progress
    uploadProgressContainer: {
      width: '100%',
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      height: 8,
      marginTop: 8,
      overflow: 'hidden',
    },
    uploadProgressBar: {
      height: '100%',
      backgroundColor: '#1b5e20',
      borderRadius: 8,
    },
    uploadProgressText: {
      fontSize: 12,
      color: '#6b7280',
      textAlign: 'center',
      marginTop: 4,
    },

    // Header Section
    header: {
      backgroundColor: "#0d5233",
      paddingHorizontal: isSmallScreen ? 16 : isWeb ? 40 : 20,
      paddingVertical: isSmallScreen ? 12 : 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 3,
      borderBottomColor: "#1b7a4d",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    logo: {
      width: isSmallScreen ? 40 : 50,
      height: isSmallScreen ? 40 : 50,
      backgroundColor: "#fff",
      borderRadius: 8,
    },
    headerTitle: {
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : 20,
      fontWeight: "bold",
      color: "#fff",
      maxWidth: isSmallScreen ? 180 : isMediumScreen ? 250 : 400,
    },
    headerRight: {
      flexDirection: "row",
      gap: isSmallScreen ? 8 : 12,
    },

    // Navigation
    nav: {
      backgroundColor: "#333",
      paddingHorizontal: isSmallScreen ? 12 : isWeb ? 40 : 20,
      paddingVertical: isSmallScreen ? 10 : 12,
      alignItems: "center",
    },
    navScroll: {
      flexDirection: "row",
      gap: isSmallScreen ? 12 : 20,
    },
    navItem: {
      paddingVertical: 8,
      paddingHorizontal: isSmallScreen ? 8 : 12,
    },
    navText: {
      color: "#fff",
      fontSize: isSmallScreen ? 13 : 15,
      fontWeight: "500",
    },

    // Hero Section (Banner)
    heroSection: {
      backgroundColor: "#f5f5f5",
      width: width,
    },
    heroContent: {
      width: "100%",
      alignSelf: "center",
    },
    heroBanner: {
      width: width,
      height: isWeb ? height * 0.8 : 400,
      resizeMode: "cover",
      marginBottom: 0,
    },
    heroTextOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.3)",
      padding: 20,
    },
    heroTitle: {
      fontSize: isSmallScreen ? 28 : 48,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      textShadowColor: "rgba(0, 0, 0, 0.75)",
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    heroSubtitle: {
      fontSize: isSmallScreen ? 16 : 20,
      color: "#fff",
      textAlign: "center",
      maxWidth: 600,
      marginTop: 10,
    },

    // Carousel Indicators
    indicatorsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 16,
      gap: 8,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    indicator: {
      height: 8,
      borderRadius: 4,
    },

    // Info Cards Section
    infoCardsSection: {
      backgroundColor: "#fff",
      paddingHorizontal: isSmallScreen ? 16 : isWeb ? 40 : 20,
      paddingVertical: isSmallScreen ? 24 : 32,
    },
    infoCardsGrid: {
      flexDirection: isWeb && isLargeScreen ? "row" : "column",
      gap: isSmallScreen ? 16 : 20,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    infoCard: {
      backgroundColor: "#0d5233",
      borderRadius: 12,
      padding: isSmallScreen ? 20 : 24,
      flex: isWeb && isLargeScreen ? 1 : undefined,
      minWidth: isWeb && isLargeScreen ? 250 : undefined,
      maxWidth: isWeb && isLargeScreen ? 350 : undefined,
      alignItems: "center",
    },
    infoCardTitle: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 12,
      textAlign: "center",
    },
    infoCardText: {
      fontSize: isSmallScreen ? 14 : 15,
      color: "#e0e0e0",
      textAlign: "center",
      lineHeight: 20,
    },

    // Buttons
    heroButtons: {
      flexDirection: isWeb ? "row" : "column",
      gap: isSmallScreen ? 12 : 16,
      marginTop: isSmallScreen ? 20 : 32,
      justifyContent: "center",
    },
    button: {
      paddingVertical: isSmallScreen ? 14 : 16,
      paddingHorizontal: isSmallScreen ? 24 : 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      minHeight: isSmallScreen ? 48 : 52,
      minWidth: isSmallScreen ? 140 : 160,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    primaryButton: {
      backgroundColor: "#1b5e20",
    },
    secondaryButton: {
      backgroundColor: "#fff",
      borderWidth: 2,
      borderColor: "#1b5e20",
    },
    buttonText: {
      fontSize: isSmallScreen ? 16 : 17,
      fontWeight: "700",
    },
    primaryButtonText: {
      color: "#fff",
    },
    secondaryButtonText: {
      color: "#1b5e20",
    },

    // Features Section
    infoSection: {
      backgroundColor: "#f5f5f5",
      paddingHorizontal: isSmallScreen ? 16 : isWeb ? 40 : 20,
      paddingVertical: isSmallScreen ? 32 : isWeb ? 48 : 40,
    },
    sectionTitle: {
      fontSize: isSmallScreen ? 24 : isMediumScreen ? 28 : isWeb ? 36 : 30,
      fontWeight: "bold",
      color: "#0d5233",
      textAlign: "center",
      marginBottom: isSmallScreen ? 24 : 32,
    },
    featureBlock: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: isSmallScreen ? 16 : 20,
      marginBottom: isSmallScreen ? 16 : 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    featureImage: {
      width: "100%",
      height: isSmallScreen ? 140 : isMediumScreen ? 160 : 180,
      borderRadius: 8,
      marginBottom: isSmallScreen ? 12 : 16,
      resizeMode: "cover",
    },
    featureText: {
      fontSize: isSmallScreen ? 15 : 16,
      color: "#333",
      textAlign: "center",
      lineHeight: isSmallScreen ? 22 : 24,
      fontWeight: "500",
    },

    // Facts Section
    factsSection: {
      backgroundColor: "#0d5233",
      paddingHorizontal: isSmallScreen ? 16 : isWeb ? 40 : 20,
      paddingVertical: isSmallScreen ? 32 : 40,
    },
    factsTitle: {
      fontSize: isSmallScreen ? 24 : 30,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      marginBottom: 30,
    },
    factCard: {
      backgroundColor: "rgba(255,255,255,0.1)",
      padding: 20,
      borderRadius: 10,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: "#e67e22",
    },
    factHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    factIcon: {
      fontSize: 24,
      marginRight: 10,
    },
    factLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
    },
    factDesc: {
      fontSize: 14,
      color: "#e0e0e0",
      lineHeight: 22,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isSmallScreen ? 16 : 20,
    },
     // Update modalContent to handle scroll
    modalContent: {
      backgroundColor: "#fff",
      borderRadius: 16,
      width: "100%",
      maxWidth: 400,
      maxHeight: isSmallScreen ? '85%' : '80%',
      padding: isSmallScreen ? 20 : 24,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },

    // Make modal scrollable container
    modalScrollContent: {
      paddingBottom: 20,
    },
    
    modalTitle: {
      fontSize: isSmallScreen ? 24 : 26,
      fontWeight: "bold",
      color: "#0d5233",
      textAlign: "center",
      marginBottom: isSmallScreen ? 20 : 24,
    },
    input: {
      borderWidth: 1.5,
      borderColor: "#d1d5db",
      borderRadius: 10,
      paddingVertical: isSmallScreen ? 12 : 14,
      paddingHorizontal: isSmallScreen ? 14 : 16,
      fontSize: isSmallScreen ? 15 : 16,
      color: "#1f2937",
      marginBottom: isSmallScreen ? 14 : 16,
      backgroundColor: "#f9fafb",
    },

    // Loading
    disabledButton: {
      opacity: 0.6,
    },
    loadingContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    
  });
};
