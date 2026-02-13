import { StyleSheet, Platform } from "react-native";
import { Fonts } from "@/constants/theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#333',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#333',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  scoreText: {
    fontSize: 36,
    fontFamily: Fonts.bold,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#999',
  },
  qualityLabel: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#333',
  },
  objectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  objectInfo: {
    flex: 1,
  },
  objectClass: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  objectConfidence: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#666',
    marginLeft: 12,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    lineHeight: 22,
  },
  noDetection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noDetectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  noDetectionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scanAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27AE60',
    gap: 8,
  },
  homeText: {
    color: '#27AE60',
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  modelInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
});

