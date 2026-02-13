import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styles from '@/styles/DurianScanResults.styles';

const { width } = Dimensions.get('window');

export default function DurianScanResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the result from params
  const imageUri = params.imageUri as string;
  const resultStr = params.result as string;

  let result: any = null;
  try {
    result = resultStr ? JSON.parse(resultStr) : null;
  } catch (e) {
    console.error('Failed to parse result:', e);
  }

  const detection = result?.detection || {};
  const analysis = result?.analysis || {};
  const objects = detection.objects || [];

  // Get quality color
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image Preview */}
      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {/* Detection count badge */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{detection.count || 0} detected</Text>
          </View>
        </View>
      )}

      {/* Analysis Summary */}
      {analysis.found ? (
        <>
          {/* Quality Score Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quality Score</Text>
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreCircle, { borderColor: getQualityColor(analysis.quality_score || 0) }]}>
                <Text style={[styles.scoreText, { color: getQualityColor(analysis.quality_score || 0) }]}>
                  {Math.round(analysis.quality_score || 0)}
                </Text>
                <Text style={styles.scoreLabel}>/100</Text>
              </View>
              <Text style={[styles.qualityLabel, { color: getQualityColor(analysis.quality_score || 0) }]}>
                {getQualityLabel(analysis.quality_score || 0)}
              </Text>
            </View>
          </View>

          {/* Detection Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Detection Details</Text>

            <View style={styles.detailRow}>
              <Ionicons name="search-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Objects Found:</Text>
              <Text style={styles.detailValue}>{analysis.total_count || 0}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Primary Class:</Text>
              <Text style={styles.detailValue}>{analysis.primary_class || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="analytics-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Confidence:</Text>
              <Text style={styles.detailValue}>
                {analysis.primary_confidence ? `${(analysis.primary_confidence * 100).toFixed(1)}%` : 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="stats-chart-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Avg Confidence:</Text>
              <Text style={styles.detailValue}>
                {analysis.average_confidence ? `${(analysis.average_confidence * 100).toFixed(1)}%` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Detected Objects List */}
          {objects.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detected Objects</Text>
              {objects.map((obj: any, index: number) => (
                <View key={index} style={styles.objectRow}>
                  <View style={styles.objectInfo}>
                    <Text style={styles.objectClass}>{obj.class_name}</Text>
                    <View style={styles.confidenceBar}>
                      <View
                        style={[
                          styles.confidenceFill,
                          {
                            width: `${obj.confidence * 100}%`,
                            backgroundColor: getQualityColor(obj.confidence * 100)
                          }
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

          {/* Recommendation */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recommendation</Text>
            <View style={styles.recommendationBox}>
              <Ionicons name="bulb-outline" size={24} color="#27AE60" />
              <Text style={styles.recommendationText}>
                {analysis.recommendation || 'No recommendation available'}
              </Text>
            </View>
          </View>
        </>
      ) : (
        /* No Detection */
        <View style={styles.card}>
          <View style={styles.noDetection}>
            <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
            <Text style={styles.noDetectionTitle}>No Durian Detected</Text>
            <Text style={styles.noDetectionText}>
              {analysis.recommendation || 'Try taking a clearer photo with better lighting'}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => router.back()}
        >
          <Ionicons name="camera-outline" size={20} color="#fff" />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/LandingScreen')}
        >
          <Ionicons name="home-outline" size={20} color="#27AE60" />
          <Text style={styles.homeText}>Go Home</Text>
        </TouchableOpacity>
      </View>

      {/* Model Info */}
      <Text style={styles.modelInfo}>
        Model: {result?.model || 'YOLO'} • {result?.timestamp ? new Date(result.timestamp).toLocaleString() : ''}
      </Text>
    </ScrollView>
  );
}


