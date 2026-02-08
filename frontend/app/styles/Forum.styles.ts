import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modern Color Palette - Vibrant Community Theme
const colors = {
  // Primary - Fresh Green
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#22c55e',
  primaryGlow: '#4ade80',
  
  // Accent Colors
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentLight: '#60a5fa',
  
  // Category Colors
  qualityRed: '#dc2626',
  qualityRedBg: '#fee2e2',
  practiceBlue: '#2563eb',
  practiceBlueBg: '#dbeafe',
  exportGreen: '#16a34a',
  exportGreenBg: '#dcfce7',
  discussionGray: '#4b5563',
  discussionGrayBg: '#f3f4f6',
  
  // Neutrals
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  glassWhite: 'rgba(255, 255, 255, 0.95)',
  
  // Gradient Colors
  gradientStart: '#16a34a',
  gradientMid: '#22c55e',
  gradientEnd: '#4ade80',
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
    backgroundColor: colors.white,
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
    fontWeight: '800',
    color: colors.gray900,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: scale(14),
    color: colors.gray500,
    marginTop: 4,
    fontWeight: '500',
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
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ========== SEARCH SECTION ==========
  searchSection: {
    paddingHorizontal: scale(20),
    paddingVertical: 16,
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
    fontWeight: '600',
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
    backgroundColor: colors.white,
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
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: scale(12),
    color: colors.gray500,
    fontWeight: '600',
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
    paddingHorizontal: scale(20),
    paddingTop: 12,
    paddingBottom: 20,
  },

  // ========== POST CARD ==========
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 2,
  },

  postTimestamp: {
    fontSize: scale(12),
    color: colors.gray500,
    fontWeight: '500',
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  categoryBadgeText: {
    fontSize: scale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ========== POST CONTENT ==========
  postTitle: {
    fontSize: scale(18),
    fontWeight: '800',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      },
    }),
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
    fontWeight: '800',
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
    fontWeight: '700',
  },

  // ========== FORM INPUTS ==========
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: scale(15),
    color: colors.gray900,
    marginHorizontal: 24,
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: colors.gray900,
  },

  commentTime: {
    fontSize: scale(11),
    color: colors.gray500,
    fontWeight: '500',
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
    fontWeight: '600',
  },

  noComments: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  noCommentsText: {
    fontSize: scale(18),
    fontWeight: '700',
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
    backgroundColor: colors.white,
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
    fontWeight: '700',
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
    borderColor: colors.white,
  },

  trendingText: {
    fontSize: 10,
    fontWeight: '800',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: colors.gray900,
  },

  pollPercentage: {
    fontSize: scale(13),
    fontWeight: '700',
    color: colors.primary,
  },
});

export default styles;
export { colors };