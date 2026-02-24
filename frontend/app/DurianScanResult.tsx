import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isLargeScreen = width >= 900;

export default function DurianScanResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const imageUri = params.imageUri as string;
  const resultStr = params.result as string;

  let result: any = null;
  try {
    result = resultStr ? JSON.parse(resultStr) : null;
  } catch (e) {
    console.error('Failed to parse result:', e);
  }

  // --------------------------------------------------
  // Data from merged response (UNCHANGED)
  // --------------------------------------------------
  const color = result?.color;
  const size = result?.size;
  const detection = result?.detection || {};
  const analysis = result?.analysis || {};
  const objects = detection.objects || [];

  const disease = result?.disease || 'healthy';
  const diseaseDetections = result?.detections || [];
  

  const getQualityColor = (score: number) => {
    if (score >= 80) return '#27AE60';
    if (score >= 60) return '#F39C12';
    return '#E74C3C';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.main}>
        {/* LEFT: IMAGE */}
        <View style={styles.leftPane}>
          {imageUri && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {detection.count || 0} detected
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* RIGHT: RESULTS */}
        <ScrollView
          style={styles.rightPane}
          contentContainerStyle={styles.rightContent}
          showsVerticalScrollIndicator={false}
        >
          {analysis.found ? (
            <>
              {/* Quality Score */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Quality Score</Text>
                <View style={styles.scoreContainer}>
                  <View
                    style={[
                      styles.scoreCircle,
                      { borderColor: getQualityColor(analysis.quality_score || 0) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreText,
                        { color: getQualityColor(analysis.quality_score || 0) },
                      ]}
                    >
                      {Math.round(analysis.quality_score || 0)}
                    </Text>
                    <Text style={styles.scoreLabel}>/100</Text>
                  </View>
                  <Text
                    style={[
                      styles.qualityLabel,
                      { color: getQualityColor(analysis.quality_score || 0) },
                    ]}
                  >
                    {getQualityLabel(analysis.quality_score || 0)}
                  </Text>
                </View>
              </View>

              {/* Detection Details */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Detection Details</Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="search-outline" size={18} color="#666" />
                    <Text style={styles.detailLabel}>Objects Found</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {analysis.total_count || 0}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.detailLabel}>Primary Class</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {analysis.primary_class || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name="analytics-outline" size={18} color="#666" />
                    <Text style={styles.detailLabel}>Confidence</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {analysis.primary_confidence
                      ? `${(analysis.primary_confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons
                      name="stats-chart-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.detailLabel}>Avg Confidence</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {analysis.average_confidence
                      ? `${(analysis.average_confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Detected Objects */}
              {objects.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Detected Objects</Text>
                  {objects.map((obj: any, index: number) => (
                    <View key={index} style={styles.objectRow}>
                      <View style={styles.objectInfo}>
                        <Text style={styles.objectClass}>
                          {obj.class_name}
                        </Text>
                        <View style={styles.confidenceBar}>
                          <View
                            style={[
                              styles.confidenceFill,
                              {
                                width: `${obj.confidence * 100}%`,
                                backgroundColor: getQualityColor(
                                  obj.confidence * 100
                                ),
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <Text style={styles.objectConfidence}>
                        {(obj.confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Color Classification */}
              {color && color.success && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Color Classification</Text>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons
                        name="color-palette-outline"
                        size={18}
                        color="#666"
                      />
                      <Text style={styles.detailLabel}>Color</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {color.color_class || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Ionicons
                        name="trending-up-outline"
                        size={18}
                        color="#666"
                      />
                      <Text style={styles.detailLabel}>Confidence</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {color.confidence
                        ? `${(color.confidence * 100).toFixed(1)}%`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
              {/* Size Classification */}

              {size && size.success && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Size Classification</Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons
                      name="resize-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.detailLabel}>Size</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {size.size_class || 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons
                      name="trending-up-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.detailLabel}>Confidence</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {size.confidence
                      ? `${(size.confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            )}

              {/* Disease Detection */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Disease Detection</Text>

                {disease && disease !== 'healthy' ? (
                  <>
                    <View style={styles.detailRow}>
                      <View style={styles.detailLeft}>
                        <Ionicons
                          name="warning-outline"
                          size={18}
                          color="#E74C3C"
                        />
                        <Text style={styles.detailLabel}>Disease</Text>
                      </View>
                      <Text style={styles.detailValue}>{disease}</Text>
                    </View>

                    {diseaseDetections.length > 0 && (
                      <View style={styles.recommendationBox}>
                        {diseaseDetections.map((d: any, index: number) => (
                          <Text key={index} style={styles.recommendationText}>
                            • {d.class_name} ({(d.confidence * 100).toFixed(1)}%)
                          </Text>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.recommendationBox}>
                    <Ionicons
                      name="leaf-outline"
                      size={22}
                      color="#27AE60"
                    />
                    <Text style={styles.recommendationText}>
                      No disease detected. Durian looks healthy.
                    </Text>
                  </View>
                )}
              </View>

              {/* Recommendation */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recommendation</Text>
                <View style={styles.recommendationBox}>
                  <Ionicons
                    name="bulb-outline"
                    size={22}
                    color="#27AE60"
                  />
                  <Text style={styles.recommendationText}>
                    {analysis.recommendation ||
                      'No recommendation available'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <View style={styles.noDetection}>
                <Ionicons
                  name="alert-circle-outline"
                  size={64}
                  color="#E74C3C"
                />
                <Text style={styles.noDetectionTitle}>
                  No Durian Detected
                </Text>
                <Text style={styles.noDetectionText}>
                  {analysis.recommendation ||
                    'Try taking a clearer photo with better lighting'}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={18} color="#27AE60" />
              <Text style={styles.homeText}>Go Home</Text>
            </TouchableOpacity>
          </View>

          {/* Model Info */}
          <Text style={styles.modelInfo}>
            Model: {result?.model || 'YOLO'} •{' '}
            {result?.timestamp
              ? new Date(result.timestamp).toLocaleString()
              : ''}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  main: {
    flex: 1,
    flexDirection: isLargeScreen ? 'row' : 'column',
  },
  leftPane: {
    flex: isLargeScreen ? 1 : undefined,
    padding: 32,
    alignItems: 'center',
  },
  rightPane: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  rightContent: {
    padding: 32,
    paddingBottom: 48,
  },
  imageWrapper: {
    width: '100%',
    maxWidth: 520,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F2F2F2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#00000080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  objectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  objectInfo: {
    flex: 1,
    marginRight: 12,
  },
  objectClass: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#111',
  },
  confidenceBar: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  objectConfidence: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    width: 60,
    textAlign: 'right',
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginLeft: 12,
  },
  noDetection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDetectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#111',
  },
  noDetectionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  scanAgainButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  homeText: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  modelInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});