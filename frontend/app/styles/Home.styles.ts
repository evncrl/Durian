
import { StyleSheet } from "react-native";

export default StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Navbar
  navbar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  navbarContent: {
    maxWidth: 1280,
    marginHorizontal: "auto",
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: "#15803d",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  brandText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  navLinks: {
    flexDirection: "row",
    gap: 16,
  },
  navLink: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Profile Header
  profileHeader: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  profileContent: {
    maxWidth: 1280,
    marginHorizontal: "auto",
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  profileInfo: {
    flex: 1,
    minWidth: 200,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  dashboardText: {
    fontSize: 14,
    color: "#6b7280",
  },
  newScanButton: {
    backgroundColor: "#15803d",
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  newScanButtonText: {
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
    paddingTop: 32,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 32,
  },
  statsGridMobile: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
  },
  statCardMobile: {
    minWidth: "100%",
    padding: 20,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    justifyContent: "center",
    alignItems: "center",
  },
  statIconText: {
    fontSize: 24,
  },
  changeBadge: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#15803d",
  },
  statValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Content Grid
  contentGrid: {
    flexDirection: "row",
    gap: 32,
  },
  contentGridMobile: {
    flexDirection: "column",
    gap: 24,
  },

  // Recent Scans
  recentScans: {
    flex: 2,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  recentScansMobile: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#15803d",
  },

  // Table
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableCell: {
    fontSize: 14,
    color: "#111827",
  },
  tableCellBold: {
    fontWeight: "500",
  },
  col1: { flex: 1 },
  col2: { flex: 1 },
  col3: { flex: 0.8, textAlign: "center" },
  col4: { flex: 1, textAlign: "right" },
  
  qualityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  qualityPremium: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    color: "#166534",
  },
  qualityGood: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
    color: "#1e40af",
  },
  qualityFair: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    color: "#92400e",
  },
  qualityDefault: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    color: "#374151",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    padding: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  // Sidebar
  sidebar: {
    flex: 1,
    gap: 24,
  },
  sidebarMobile: {
    flex: 1,
  },

  // Quick Actions
  quickActions: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  primaryAction: {
    backgroundColor: "#15803d",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  secondaryAction: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  actionSubtitle: {
    fontSize: 11,
    color: "#dcfce7",
  },
  actionTitleSecondary: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  actionSubtitleSecondary: {
    fontSize: 11,
    color: "#6b7280",
  },

  // System Status
  systemStatus: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 24,
  },
  systemStatusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#15803d",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
});