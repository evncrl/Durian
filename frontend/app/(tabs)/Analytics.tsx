import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnalyticsStyles } from '@/styles/Analytics.styles';
import { API_URL } from '@/config/appconf';
import { useUser } from '@/contexts/UserContext';
import { Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface ScanItem {
  id: string;
  variety: string;
  quality: number;
  status: string;
  time: string;
  image_url?: string;
  thumbnail_url?: string;
  created_at?: string;
  durian_count: number;
  confidence: number;
  color?: string;
  size?: string;
  shape?: string;
  disease?: string;
  recommendation?: string;
}

interface AnalyticsData {
  stats: {
    total_scans: number;
    export_ready_percent: number;
    rejected_percent: number;
    avg_quality: number;
    top_variety: string;
    weekly_growth: number;
  };
  weekly_data: Array<{
    day: string;
    date: string;
    scans: number;
    quality: number;
  }>;
  quality_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  recent_scans: ScanItem[];
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const styles = useAnalyticsStyles();
  const { user } = useUser();

  // --------------------------------------------------
  // ✅ SYNCED DYNAMIC LOGIC
  // --------------------------------------------------
  const getDynamicMetrics = (scan: ScanItem) => {
    const cClass = (scan.color || '').toLowerCase();
    const sSize = (scan.size || '').toLowerCase();
    const sShape = (scan.shape || '').toLowerCase();
    const diseaseName = (scan.disease || 'healthy').toLowerCase();
    const conf = scan.confidence > 1 ? scan.confidence / 100 : (scan.confidence || 0.5);

    // 1. Disease Priority (Range 0-50)
    if (diseaseName === 'rot' || diseaseName === 'mold') {
      const calculatedScore = Math.max(5, 50 * (1 - conf));
      return { 
        score: calculatedScore, 
        label: 'Rejected', 
        color: '#E74C3C',
        recommendation: 'Warning: Fruit is contaminated. Do not mix with healthy stocks. Dispose of rot/mold items properly.'
      };
    }

    // 2. Export Quality (Range 90-100)
    if (cClass === 'greenish' && sShape === 'round' && sSize === 'large') {
      const calculatedScore = 90 + (10 * conf);
      return { 
        score: calculatedScore, 
        label: 'Export Quality', 
        color: '#27AE60',
        recommendation: 'Recommendation: This durian is suitable for Export Quality.'
      };
    }

    // 3. Local Market (Range 70-89)
    if (cClass === 'brownish' && sShape === 'round' && sSize === 'medium') {
      const calculatedScore = 70 + (19 * conf);
      return { 
        score: calculatedScore, 
        label: 'Local Market', 
        color: '#F39C12',
        recommendation: 'Recommendation: This durian is suitable for Local Market.'
      };
    }

    const dynamicScore = 51 + (18 * conf);

    return { 
      score: dynamicScore, 
      label: 'Average Quality', 
      color: '#3498DB',
      recommendation: 'Suitable for distribution based on grade.'
    };
  };

  const getConfColor = (conf: number) => {
    const perc = conf <= 1 ? conf * 100 : conf;
    if (perc >= 80) return '#27AE60'; 
    if (perc >= 60) return '#F39C12'; 
    return '#E74C3C';
  };

  const openScanDetails = (scan: ScanItem) => {
    setSelectedScan(scan);
    setModalVisible(true);
  };

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setError('Please log in to view your analytics');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/scanner/analytics/${user.id}?time_range=${timeRange}`, {
        headers: { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      });
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, timeRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = analyticsData?.stats || { total_scans: 0, export_ready_percent: 0, rejected_percent: 0, avg_quality: 0, top_variety: 'N/A', weekly_growth: 0 };
  const weeklyData = analyticsData?.weekly_data || [];
  const recentScans = analyticsData?.recent_scans || [];
  const qualityDistribution = analyticsData?.quality_distribution || [];
  const maxScans = Math.max(...weeklyData.map(d => d.scans), 1);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#27AE60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Durian Quality Insights</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#27AE60" />}
      >
        {/* Error Message */}
        {error && <Text style={{ color: '#E74C3C', textAlign: 'center', padding: 20 }}>{error}</Text>}

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics Grid - RESTORED */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardLarge]}>
            <View style={styles.metricHeader}>
              <Ionicons name="analytics" size={24} color="#27AE60" />
              <View style={styles.metricBadge}>
                <Text style={styles.metricBadgeText}>{stats.weekly_growth >= 0 ? '+' : ''}{stats.weekly_growth}%</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{stats.total_scans}</Text>
            <Text style={styles.metricLabel}>Total Scans</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#27AE60" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.export_ready_percent}%</Text>
            <Text style={styles.metricLabel}>Export Quality</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.export_ready_percent}%` }]} />
            </View>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="warning" size={24} color="#E74C3C" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.rejected_percent}%</Text>
            <Text style={styles.metricLabel}>Rejected</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, styles.progressFillWarning, { width: `${stats.rejected_percent}%` }]} />
            </View>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="star" size={24} color="#F1C40F" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.avg_quality}/100</Text>
            <Text style={styles.metricLabel}>Avg Quality Score</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="ribbon" size={24} color="#E67E22" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.top_variety}</Text>
            <Text style={styles.metricLabel}>Top Variety</Text>
          </View>
        </View>

        {/* Weekly Activity - RESTORED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyData.map((data, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.chartBarContainer}>
                    <View style={[styles.chartBarFill, { height: `${(data.scans / maxScans) * 100}%` }]}>
                      <Text style={styles.chartBarValue}>{data.scans}</Text>
                    </View>
                  </View>
                  <Text style={styles.chartBarLabel}>{data.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Quality Distribution - RESTORED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Distribution</Text>
          <View style={styles.distributionCard}>
            {qualityDistribution.map((item, index) => (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <Text style={styles.distributionRange}>{item.range}</Text>
                  <Text style={styles.distributionCount}>{item.count} scans</Text>
                </View>
                <View style={styles.distributionBarContainer}>
                  <View style={[styles.distributionBar, { width: `${item.percentage}%` }]} />
                </View>
                <Text style={styles.distributionPercentage}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Scans with Synced Logic */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Scans History</Text>
          <View style={styles.recentScansCard}>
            {recentScans.length === 0 ? (
               <Text style={{ color: '#888', textAlign: 'center', padding: 20 }}>No scans recorded.</Text>
            ) : (
              recentScans.map((scan) => {
                const dynamic = getDynamicMetrics(scan); // ✅ Logic Match
                const barWidth = scan.confidence > 1 ? scan.confidence : scan.confidence * 100;
                return (
                  <TouchableOpacity key={scan.id} style={styles.scanItem} activeOpacity={0.7} onPress={() => openScanDetails(scan)}>
                    <Image source={{ uri: scan.thumbnail_url }} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#333' }} />
                    <View style={[styles.scanInfo, { flex: 1, marginLeft: 12 }]}>
                      <Text style={styles.scanVariety}>{scan.variety}</Text>
                      <Text style={styles.scanTime}>{formatDate(scan.created_at)}</Text>
                      <View style={styles.confidenceBar}>
                        <View style={[styles.confidenceFill, { 
                          width: `${scan.confidence * 100}%`, 
                          backgroundColor: getConfColor(scan.confidence) // ✅ Updated color
                        }]} />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.scanQuality, { color: dynamic.color, fontSize: 18, fontFamily: Fonts.bold }]}>
                        {Math.round(Math.min(100, dynamic.score))}/100
                      </Text>
                      <View style={[styles.scanStatusBadge, { backgroundColor: dynamic.color + '33' }]}>
                        <Text style={[styles.scanStatusText, { color: dynamic.color }]}>
                          {dynamic.label}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Detail Modal with Dynamic Recommendations */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Scan Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={30} color="#E74C3C" /></TouchableOpacity>
            </View>
            {selectedScan && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedScan.image_url || selectedScan.thumbnail_url }} style={modalStyles.detailImage} resizeMode="cover" />
                {(() => {
                  const dynamic = getDynamicMetrics(selectedScan);
                  return (
                    <>
                      <View style={modalStyles.infoRow}>
                        <Text style={modalStyles.infoLabel}>Dynamic Score:</Text>
                        <Text style={[modalStyles.infoValue, { color: dynamic.color }]}>{Math.round(dynamic.score)}/100%</Text>
                      </View>
                      <View style={modalStyles.infoRow}>
                        <Text style={modalStyles.infoLabel}>Final Grade:</Text>
                        <Text style={[modalStyles.infoValue, { color: dynamic.color }]}>{dynamic.label}</Text>
                      </View>
                      <View style={modalStyles.infoRow}>
                        <Text style={modalStyles.infoLabel}>Disease:</Text>
                        <Text style={[modalStyles.infoValue, {color: selectedScan.disease?.toLowerCase() !== 'healthy' ? '#E74C3C' : '#27AE60'}]}>{selectedScan.disease || 'Healthy'}</Text>
                      </View>
                      <View style={modalStyles.infoRow}><Text style={modalStyles.infoLabel}>Color:</Text><Text style={modalStyles.infoValue}>{selectedScan.color || 'N/A'}</Text></View>
                      <View style={modalStyles.infoRow}><Text style={modalStyles.infoLabel}>Size:</Text><Text style={modalStyles.infoValue}>{selectedScan.size || 'N/A'}</Text></View>
                      <View style={modalStyles.infoRow}><Text style={modalStyles.infoLabel}>Shape:</Text><Text style={modalStyles.infoValue}>{selectedScan.shape || 'N/A'}</Text></View>
                      
                      {/* ✅ Updated Recommendation Logic */}
                      <View style={modalStyles.recommendationBox}>
                        <Text style={modalStyles.recommendationTitle}>
                           <Ionicons name="bulb-outline" size={16} color="#F1C40F" /> Recommendation
                        </Text>
                        <Text style={modalStyles.recommendationText}>
                          {dynamic.recommendation}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyles = RNStyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalView: { width: '100%', maxWidth: 500, maxHeight: '85%', backgroundColor: '#1A1A1A', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontFamily: Fonts.bold, color: '#fff' },
  detailImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  infoLabel: { color: '#aaa', fontSize: 16, fontFamily: Fonts.regular },
  infoValue: { color: '#fff', fontSize: 16, fontFamily: Fonts.semiBold },
  recommendationBox: { backgroundColor: '#222', borderRadius: 12, padding: 15, marginVertical: 15, borderLeftWidth: 4, borderLeftColor: '#F1C40F' },
  recommendationTitle: { color: '#F1C40F', fontFamily: Fonts.bold, fontSize: 14, marginBottom: 5, textTransform: 'uppercase' },
  recommendationText: { color: '#ddd', fontSize: 14, lineHeight: 20, fontFamily: Fonts.regular },
});