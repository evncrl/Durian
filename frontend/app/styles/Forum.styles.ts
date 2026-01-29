import { StyleSheet } from "react-native";

export default StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Header
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    maxWidth: 1280,
    marginHorizontal: "auto",
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  newPostButton: {
    backgroundColor: "#15803d",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  newPostButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Main Content
  mainContent: {
    maxWidth: 1280,
    marginHorizontal: "auto",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Search
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },

  // Category Tabs
  categoryTabs: {
    marginBottom: 20,
  },
  categoryTabsContent: {
    gap: 12,
    paddingRight: 24,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  categoryTabActive: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  categoryTabTextActive: {
    color: "#ffffff",
  },

  // Stats Bar
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 20,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },

  // Posts Container
  postsContainer: {
    gap: 16,
  },

  // Post Card
  postCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
  },
  pinnedBadge: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },

  // Post Header
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  postHeaderInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  categoryRed: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
    color: "#991b1b",
  },
  categoryBlue: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    color: "#1e40af",
  },
  categoryGreen: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    color: "#166534",
  },
  categoryGray: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    color: "#374151",
  },

  // Post Content
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16,
  },

  // Post Footer
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  postStats: {
    flexDirection: "row",
    gap: 20,
  },
  statGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  replyButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#15803d",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#15803d",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
});