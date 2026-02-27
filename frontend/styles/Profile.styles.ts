import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Fonts, Palette } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.deepObsidian, 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 600, // Make it not full container (constrained width)
    alignSelf: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: Palette.linenWhite,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Palette.linenWhite, 
    letterSpacing: -0.5,
  },

  // Profile Card
  profileCard: {
  backgroundColor: '#1A291A',
  borderWidth: 1,
  borderColor: Palette.deepObsidian,

  borderRadius: 16, 
  padding: 24,
  width: '100%',
  maxWidth: 500, 
  alignSelf: 'center',
  marginTop: 20,
  
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  
  elevation: 8,
  },

  // Avatar Section
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -60, 
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Palette.linenWhite,
    shadowColor: Palette.warmCopper,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  avatarPlaceholder: {
    fontSize: 48,
    fontFamily: Fonts.bold,
    color: Palette.warmCopper,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Palette.warmCopper,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.warmCopper,
  },

  // Info Container
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: Palette.linenWhite,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 16,
    color: Palette.linenWhite,
    opacity: 0.8,
    marginBottom: 28,
    textAlign: 'center',
    fontFamily: Fonts.medium,
  },

  // Form Elements
  formContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Palette.linenWhite,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1.5,
    borderColor: Palette.stoneGray,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: Palette.linenWhite,
    color: Palette.deepObsidian,
    fontFamily: Fonts.regular,
  },
  inputFocused: {
    borderColor: Palette.warmCopper,
    backgroundColor: Palette.white,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },

  // Button Styles
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: Palette.warmCopper,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 4,
    shadowColor: Palette.warmCopper,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    shadowColor: '#1b5e20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.3,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.deepObsidian, // Match dark theme
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.linenWhite, 
    fontFamily: Fonts.medium,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#1A291A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1A291A',
    borderWidth: 1,
    borderColor: Palette.deepObsidian,
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#1a365d',
    flex: 1,
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalButtonPrimary: {
    backgroundColor: '#1b5e20',
  },
  modalButtonSecondary: {
    backgroundColor: '#475569',
  },
  modalCancelButton: {
    marginTop: 20,
    padding: 12,
  },

  // Stats Section (Professional Touch)
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Palette.deepObsidian,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
  alignItems: 'center',
  flex: 1,
},
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Palette.linenWhite,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Palette.linenWhite,
    opacity: 0.7,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 24,
  },

  // Badge (For verification status)
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: Palette.linenWhite,
    fontFamily: Fonts.semiBold,
    marginLeft: 4,
  },

  // Section Header
  sectionHeader: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Palette.linenWhite,
    marginBottom: 16,
    marginTop: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    color: '#cbd5e1',
  },
  emptyStateText: {
    fontSize: 16,
    color: Palette.linenWhite,
    opacity: 0.6,
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },

statsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle card effect
  borderRadius: 16,
  paddingVertical: 15,
  marginVertical: 20,
  width: '100%',
},

statNumber: {
  fontFamily: Fonts.bold,
  fontSize: 18,
  color: Palette.warmCopper,
},

statDivider: {
  width: 1,
  height: 30,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
},

});

