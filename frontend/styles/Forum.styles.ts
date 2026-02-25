import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Fonts, Palette } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
 
// Modern Earthy 2.0 - Dark Community Theme
const colors = {
  // Primary - Warm Copper
  primary: Palette.warmCopper,
  primaryDark: Palette.deepObsidian,
  primaryLight: Palette.mutedSage,
  primaryGlow: Palette.deepObsidian,

  // Accent Colors
  accent: Palette.warmCopper,
  accentDark: Palette.charcoalEspresso,
  accentLight: Palette.deepObsidian,

  // Category Colors
  qualityRed: '#dc2626',
  qualityRedBg: 'rgba(220, 38, 38, 0.15)',
  practiceBlue: '#2563eb',
  practiceBlueBg: 'rgba(37, 99, 235, 0.15)',
  exportGreen: Palette.deepObsidian,
  exportGreenBg: '#1A291A',
  discussionGray: Palette.linenWhite,
  discussionGrayBg: Palette.charcoalEspresso,

  // Neutrals (Dark Mode)
  white: Palette.linenWhite,
  gray50: Palette.deepObsidian,
  gray100: Palette.charcoalEspresso,
  gray200: '#1A291A',
  gray300: '#3f3f46',
  gray400: Palette.slate,
  gray500: Palette.mutedSage,
  gray600: '#a1a1aa',
  gray700: '#3f3f46',
  gray800: Palette.charcoalEspresso,
  gray900: Palette.linenWhite,

  // Status Colors
  success: Palette.mutedSage,
  warning: '#f59e0b',
  error: '#ef4444',
  info: Palette.warmCopper,

  // Overlays
  overlay: 'rgba(12, 26, 16, 0.5)',
  overlayLight: 'rgba(12, 26, 16, 0.3)',
  overlayDark: 'rgba(12, 26, 16, 0.7)',
  glassWhite: 'rgba(26, 41, 26, 0.95)',

  // Gradient Colors
  gradientStart: Palette.deepObsidian,
  gradientMid: Palette.mutedSage,
  gradientEnd: Palette.charcoalEspresso,

  // Dark Mode Surface Colors
  cardBg: '#1A291A',
  surfaceBg: '#152015',
};

// Responsive sizing
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;
const isLargeScreen = SCREEN_WIDTH >= 768;
const isWebPlatform = Platform.OS === 'web';

const scale = (size: number) => {
  if (isLargeScreen) return size * 1.1;
  if (isSmallScreen) return size * 0.9;
  return size;
};

const verticalScale = (size: number) => {
  if (isLargeScreen) return size * 1.05;
  if (isSmallScreen) return size * 0.85;
  return size;
};

const styles = StyleSheet.create({
  // ========== MAIN CONTAINER ==========
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  // ========== HEADER ==========
  header: {
    backgroundColor: colors.cardBg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },

  headerTitle: {
    fontSize: isSmallScreen ? 24 : isLargeScreen ? 32 : 28,
    fontFamily: Fonts.bold,
    color: colors.gray900,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: scale(14),
    color: colors.gray500,
    marginTop: 4,
    fontFamily: Fonts.medium,
  },

  newPostButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 12px ${colors.primary}40`,
      },
    }),
  },

  newPostButtonText: {
    color: colors.white,
    fontSize: scale(15),
    fontFamily: Fonts.bold,
    letterSpacing: 0.3,
  },

  // ========== SEARCH SECTION ==========
  searchSection: {
    paddingHorizontal: scale(20),
    paddingVertical: 16,
    backgroundColor: colors.surfaceBg,
  },

  searchInput: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: scale(15),
    color: colors.gray900,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  // ========== CATEGORY TABS ==========
  categoryTabs: {
    backgroundColor: colors.surfaceBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  categoryTabsContent: {
    paddingHorizontal: scale(20),
    paddingVertical: 12,
    gap: 8,
  },

  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginRight: 8,
  },

  categoryTabActive: {
    backgroundColor: colors.primary,
  },

  categoryTabText: {
    fontSize: scale(14),
    fontFamily: Fonts.semiBold,
    color: colors.gray600,
  },

  categoryTabTextActive: {
    color: colors.white,
  },

  // ========== STATS BAR ==========
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surfaceBg,
    paddingVertical: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: scale(20),
    fontFamily: Fonts.bold,
    color: colors.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: scale(12),
    color: colors.gray500,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray200,
  },

  // ========== POSTS CONTAINER ==========
  postsContainer: {
    alignItems: 'center',          // center the post cards horizontally
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 0,          // remove extra padding to let card width control spacing
  },

  // ========== POST CARD ==========
  postCard: {
    minHeight: 150,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    paddingHorizontal: 25,
    marginVertical: 8,             // smaller vertical spacing
    width: SCREEN_WIDTH > 650 ? 750 : '94%',   // fixed max width like Facebook/IG
    borderWidth: 1,
    borderColor: colors.gray200,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 5 },
      web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
    }),
  },

  pinnedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },

  pinnedText: {
    fontSize: scale(12),
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },

  // ========== POST HEADER ==========
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },

  authorName: {
    fontSize: scale(15),
    fontFamily: Fonts.bold,
    color: colors.gray900,
    marginBottom: 2,
  },

  postTimestamp: {
    fontSize: scale(12),
    color: colors.gray500,
    fontFamily: Fonts.medium,
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoryBadgeText: {
    fontSize: scale(11),
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ========== POST CONTENT ==========
  postTitle: {
    fontSize: scale(18),
    fontFamily: Fonts.bold,
    color: colors.gray900,
    marginBottom: 8,
    lineHeight: 24,
  },

  postContent: {
    fontSize: scale(15),
    color: colors.gray600,
    lineHeight: 22,
    marginBottom: 12,
  },

  // ========== POST FOOTER ==========
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },

  postStats: {
    flexDirection: 'row',
    gap: 16,
  },

  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statIcon: {
    fontSize: 18,
  },

  likedIcon: {
    transform: [{ scale: 1.1 }],
  },

  statText: {
    fontSize: scale(14),
    color: colors.gray600,
    fontFamily: Fonts.semiBold,
  },

  replyButton: {
    backgroundColor: colors.gray100,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  replyButtonText: {
    fontSize: scale(14),
    fontFamily: Fonts.bold,
    color: colors.primary,
  },

  // ========== LOADING & EMPTY STATES ==========
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: scale(15),
    color: colors.gray500,
    fontFamily: Fonts.semiBold,
  },

  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyStateText: {
    fontSize: scale(20),
    fontFamily: Fonts.bold,
    color: colors.gray700,
    marginBottom: 8,
  },

  emptyStateSubtext: {
    fontSize: scale(14),
    color: colors.gray500,
    textAlign: 'center',
    maxWidth: 250,
  },

  // ========== MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center', // center vertically
    alignItems: 'center',     // center horizontally
    paddingHorizontal: 16,    // optional padding for smaller screens
  },

  modalContent: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,


    width: SCREEN_WIDTH > 650 ? 750 : '94%',
    marginBottom: Platform.OS === 'ios' ? 40 : 20,

    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
    overflow: 'hidden',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.1)',
      },
    }),
  },

  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.gray300,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  modalTitle: {
    fontSize: scale(22),
    fontFamily: Fonts.bold,
    color: colors.gray900,
    letterSpacing: -0.5,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: colors.gray600,
    fontFamily: Fonts.bold,
  },

  // ========== FORM INPUTS ==========
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: scale(15),
    color: colors.gray900,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  // ========== CATEGORY SELECTION ==========
  categorySelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },

  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryOptionText: {
    fontSize: scale(13),
    fontFamily: Fonts.semiBold,
    color: colors.gray700,
  },

  // ========== MODAL FOOTER ==========
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  cancelButtonText: {
    fontSize: scale(16),
    fontFamily: Fonts.bold,
    color: colors.gray700,
  },

  postButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 12px ${colors.primary}40`,
      },
    }),
  },

  postButtonDisabled: {
    opacity: 0.5,
  },

  postButtonText: {
    fontSize: scale(16),
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },

  // ========== COMMENTS ==========
  commentsList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },

  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray200,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  commentContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  commentAuthor: {
    fontSize: scale(14),
    fontFamily: Fonts.bold,
    color: colors.gray900,
  },

  commentTime: {
    fontSize: scale(11),
    color: colors.gray500,
    fontFamily: Fonts.medium,
  },

  commentText: {
    fontSize: scale(14),
    color: colors.gray700,
    lineHeight: 20,
    marginBottom: 8,
  },

  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },

  commentLikeIcon: {
    fontSize: 14,
  },

  commentLikeCount: {
    fontSize: scale(12),
    color: colors.gray600,
    fontFamily: Fonts.semiBold,
  },

  noComments: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  noCommentsText: {
    fontSize: scale(18),
    fontFamily: Fonts.bold,
    color: colors.gray700,
    marginBottom: 6,
  },

  noCommentsSubtext: {
    fontSize: scale(14),
    color: colors.gray500,
  },

  // ========== COMMENT INPUT ==========
  commentInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.surfaceBg,
    gap: 12,
    alignItems: 'flex-end',
  },

  commentInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: scale(15),
    color: colors.gray900,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  submitCommentButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 12px ${colors.primary}40`,
      },
    }),
  },

  submitCommentButtonDisabled: {
    opacity: 0.5,
  },

  submitCommentButtonText: {
    fontSize: scale(15),
    fontFamily: Fonts.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },

  // ========== ADDITIONAL ELEMENTS ==========

  // Trending Badge
  trendingBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cardBg,
  },

  trendingText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Verified Badge
  verifiedBadge: {
    marginLeft: 4,
    fontSize: 14,
  },

  // Engagement Bar
  engagementBar: {
    height: 3,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },

  engagementFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Tag
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.accent + '20',
    marginRight: 6,
  },

  tagText: {
    fontSize: scale(11),
    fontFamily: Fonts.semiBold,
    color: colors.accent,
  },

  // Share Button
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },

  // Poll Option
  pollOption: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  pollOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },

  pollOptionText: {
    fontSize: scale(15),
    fontFamily: Fonts.semiBold,
    color: colors.gray900,
  },

  pollPercentage: {
    fontSize: scale(13),
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
});




export default styles;
export { colors };
