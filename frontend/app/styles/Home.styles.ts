
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

export default StyleSheet.create({
  
   container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Welcome Section
  welcomeSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
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
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    resizeMode: 'cover',
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

  
  // Map styles
  mapContainer: {
    height: 520,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 32,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    height: 520,
    justifyContent: "center",
    alignItems: "center",
  },
  mapLoadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  mapPlaceholder: {
    height: 520,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
  },
  mapLink: {
    color: "#1e40af",
    fontWeight: "600",
  },
  mapControls: {
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    marginBottom: 16,
  },
  mapTitleSection: {
    marginBottom: isMobile ? 12 : 0,
  },
  mapTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: "700",
    color: "#1a472a",
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: isMobile ? 14 : 16,
    color: "#6b7280",
    opacity: 0.8,
  },
  controlButtons: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  controlButtonActive: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  controlButtonActiveText: {
    color: "#ffffff",
  },
  
  mapLegend: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a472a",
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#334155",
  },
  
  regionDetail: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  regionDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  regionDetailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a472a",
  },
  closeButton: {
    fontSize: 20,
    color: "#94a3b8",
    padding: 4,
  },
  regionStats: {
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    gap: isMobile ? 12 : 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  
  topProducers: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a472a",
    marginBottom: 16,
  },
  producersList: {
    gap: 12,
  },
  producerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  producerInfo: {
    flex: 1,
  },
  producerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  producerProduction: {
    fontSize: 14,
    color: "#64748b",
  },
  productionIndicator: {
    height: 4,
    borderRadius: 2,
    marginLeft: 12,
    maxWidth: 100,
  },
});
