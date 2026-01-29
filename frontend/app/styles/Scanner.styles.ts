import { StyleSheet } from 'react-native';

// Design tokens for consistency
const COLORS = {
  primary: '#27AE60',
  primaryDark: '#2e7d32',
  white: '#FFFFFF',
  border: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.5)',
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

const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 30,
} as const;

const styles = StyleSheet.create({
  // Layout
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Buttons
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },

  backButton: {
    position: 'absolute',
    top: SPACING.xxxl,
    left: SPACING.xl,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  captureButton: {
    position: 'absolute',
    bottom: SPACING.xxxl,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    minWidth: 140,
  },

  captureText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Preview
  previewContainer: {
    position: 'absolute',
    bottom: 110,
    left: SPACING.xl,
    width: 120,
    height: 160,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default styles;
export { COLORS, SPACING, BORDER_RADIUS };