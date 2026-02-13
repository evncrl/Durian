import { StyleSheet, Platform } from 'react-native';
import { useResponsive } from '@/utils/platform';
import { Fonts, Palette } from '../../constants/theme';

export const useAdminStyles = () => {
  const { isWeb, isSmallScreen, isMediumScreen, isLargeScreen } = useResponsive();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: Palette.linenWhite,
    },

    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Palette.linenWhite,
    },

    // Header Section
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
      marginTop: isWeb ? 20 : 40,
      ...Platform.select({
        web: {
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
        },
      }),
    },

    title: {
      fontSize: isWeb ? 32 : 26,
      fontFamily: Fonts.bold,
      color: Palette.charcoalEspresso,
      ...Platform.select({
        web: {
          fontFamily: Fonts.bold,
        },
      }),
    },

    logoutBtn: {
      backgroundColor: Palette.linenWhite,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Palette.stoneGray,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      }),
    },

    logoutBtnText: {
      color: Palette.charcoalEspresso,
      fontFamily: Fonts.bold,
      fontSize: 14,
    },

    // Card Styles
    card: {
      backgroundColor: Palette.white,
      padding: 24,
      borderRadius: 20,
      ...Platform.select({
        web: {
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        },
        default: {
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }
      }),
      marginBottom: 24,
    },

    cardTitle: {
      fontSize: 20,
      fontFamily: Fonts.bold,
      marginBottom: 20,
      color: Palette.charcoalEspresso,
      ...Platform.select({
        web: {
          fontSize: 20,
        },
      }),
    },

    // Status Section
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },

    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 10,
    },

    statusText: {
      fontSize: 16,
      color: '#666',
    },

    retryBtn: {
      marginTop: 15,
      backgroundColor: Palette.warmCopper,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      elevation: 2,
      shadowColor: Palette.warmCopper,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        },
      }),
    },

    retryBtnText: {
      color: '#fff',
      fontFamily: Fonts.medium,
      fontSize: 14,
    },

    // Welcome Text
    welcomeText: {
      marginTop: 10,
      marginBottom: 20,
      fontSize: 16,
      color: '#888',
      fontStyle: 'italic',
      textAlign: 'center',
      ...Platform.select({
        web: {
          maxWidth: 1200,
          width: '100%',
          alignSelf: 'center',
        },
      }),
    },

    // User Management Section
    userRow: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
      paddingVertical: 15,
      paddingHorizontal: Platform.OS === 'web' ? 10 : 0,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      gap: Platform.OS === 'web' ? 0 : 10,
      ...Platform.select({
        web: {
          transition: 'background-color 0.2s ease',
        },
      }),
    },

    userInfo: {
      flex: 1,
      marginBottom: Platform.OS === 'web' ? 0 : 10,
    },

    userName: {
      fontSize: 16,
      fontFamily: Fonts.bold,
      color: '#333',
      marginBottom: 4,
    },

    userEmail: {
      fontSize: 13,
      color: '#777',
    },

    userActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      ...Platform.select({
        web: {
          minWidth: 280,
          justifyContent: 'flex-end',
        },
        default: {
          width: '100%',
          justifyContent: 'space-between',
        },
      }),
    },

    pickerWrapper: {
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginRight: 10,
      width: Platform.OS === 'web' ? 140 : 150,
      height: 40,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      overflow: 'hidden',
      ...Platform.select({
        web: {
          cursor: 'pointer',
        },
      }),
    },

    picker: {
      width: '100%',
      height: '100%',
      color: '#333',
      ...Platform.select({
        android: {
          marginTop: -6,
        },
        ios: {
          height: 40,
        },
        web: {
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        },
      }),
    },

    deleteBtn: {
      backgroundColor: '#ffebee',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e53935',
      elevation: 1,
      shadowColor: '#e53935',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minWidth: 80,
          alignItems: 'center',
        },
      }),
    },

    deleteBtnText: {
      color: '#e53935',
      fontFamily: Fonts.bold,
      fontSize: 13,
      textAlign: 'center',
    },

    emptyText: {
      textAlign: 'center',
      color: '#999',
      padding: 20,
      fontSize: 15,
      fontStyle: 'italic',
    },

    // Loading State
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: '#666',
    },
  });
};
