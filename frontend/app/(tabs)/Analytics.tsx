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

  const styles = useAnalyticsStyles();
  const { user } = useUser();

  // Fetch analytics data from backend
  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setError('Please log in to view your analytics');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/scanner/analytics/${user.id}?time_range=${timeRange}`,
        {
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Default values when no data
  const stats = analyticsData?.stats || {
    total_scans: 0,
    export_ready_percent: 0,
    rejected_percent: 0,
    avg_quality: 0,
    top_variety: 'N/A',
    weekly_growth: 0,
  };

  const weeklyData = analyticsData?.weekly_data || [];
  const recentScans = analyticsData?.recent_scans || [];
  const qualityDistribution = analyticsData?.quality_distribution || [];

  const maxScans = Math.max(...weeklyData.map(d => d.scans), 1);

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#27AE60"
            colors={['#27AE60']}
          />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#E74C3C', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity
              style={{ marginTop: 12, padding: 10, backgroundColor: '#27AE60', borderRadius: 8 }}
              onPress={fetchAnalytics}
            >
              <Text style={{ color: '#fff' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Scans */}
          <View style={[styles.metricCard, styles.metricCardLarge]}>
            <View style={styles.metricHeader}>
              <Ionicons name="analytics" size={24} color="#27AE60" />
              <View style={styles.metricBadge}>
                <Text style={styles.metricBadgeText}>
                  {stats.weekly_growth >= 0 ? '+' : ''}{stats.weekly_growth}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{stats.total_scans.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Scans</Text>
            <Text style={styles.metricSubtext}>This {timeRange}</Text>
          </View>

          {/* Export Quality */}
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-circle" size={24} color="#27AE60" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.export_ready_percent}%</Text>
            <Text style={styles.metricLabel}>Export Quality</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.export_ready_percent}%` }]} />
            </View>
          </View>

          {/* Rejected */}
          <View style={styles.metricCard}>
            <Ionicons name="warning" size={24} color="#E74C3C" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.rejected_percent}%</Text>
            <Text style={styles.metricLabel}>Rejected</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, styles.progressFillWarning, { width: `${stats.rejected_percent}%` }]} />
            </View>
          </View>

          {/* Avg Quality Score */}
          <View style={styles.metricCard}>
            <Ionicons name="star" size={24} color="#F1C40F" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.avg_quality}/100</Text>
            <Text style={styles.metricLabel}>Avg Quality Score</Text>
            <Text style={styles.metricSubtext}>Based on AI analysis</Text>
          </View>

          {/* Top Variety */}
          <View style={styles.metricCard}>
            <Ionicons name="ribbon" size={24} color="#E67E22" style={{ marginBottom: 8 }} />
            <Text style={styles.metricValue}>{stats.top_variety}</Text>
            <Text style={styles.metricLabel}>Top Variety</Text>
            <Text style={styles.metricSubtext}>Most scanned</Text>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {weeklyData.map((data, index) => {
                const barHeight = (data.scans / maxScans) * 100;
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View style={[styles.chartBarFill, { height: `${barHeight}%` }]}>
                        <Text style={styles.chartBarValue}>{data.scans}</Text>
                      </View>
                    </View>
                    <Text style={styles.chartBarLabel}>{data.day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#27AE60' }]} />
                <Text style={styles.legendText}>Scans per day</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quality Distribution */}
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

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/Scanner')}>
              <Text style={styles.sectionLink}>Scan New →</Text>
            </TouchableOpacity>
          </View>

          {recentScans.length === 0 ? (
            <View style={[styles.recentScansCard, { alignItems: 'center', paddingVertical: 40 }]}>
              <Text style={{ color: '#666', fontSize: 16, marginBottom: 8, fontFamily: Fonts.regular }}>No scans yet</Text>
              <Text style={{ color: '#888', fontSize: 14, fontFamily: Fonts.regular }}>Start scanning durians to see your history</Text>
              <TouchableOpacity
                style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#27AE60', borderRadius: 8 }}
                onPress={() => router.push('/(tabs)/Scanner')}
              >
                <Text style={{ color: '#fff', fontFamily: Fonts.semiBold }}>Start Scanning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recentScansCard}>
              {recentScans.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  style={[styles.scanItem, { alignItems: 'flex-start' }]}
                  activeOpacity={0.7}
                >
                  {/* Scan Image */}
                  {scan.thumbnail_url ? (
                    <Image
                      source={{ uri: scan.thumbnail_url }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: '#333',
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.scanIcon, { width: 60, height: 60, borderRadius: 8 }]}>
                      <Ionicons name="leaf" size={24} color="#27AE60" />
                    </View>
                  )}

                  {/* Scan Details */}
                  <View style={[styles.scanInfo, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.scanVariety}>{scan.variety}</Text>
                    <Text style={styles.scanTime}>{scan.time}</Text>
                    {scan.created_at && (
                      <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                        {formatDate(scan.created_at)}
                      </Text>
                    )}
                    <View style={{ flexDirection: 'row', marginTop: 4, gap: 8 }}>
                      <Text style={{ color: '#888', fontSize: 12, fontFamily: Fonts.regular }}>
                        {scan.durian_count} detected
                      </Text>
                      <Text style={{ color: '#888', fontSize: 12, fontFamily: Fonts.regular }}>
                        {(scan.confidence * 100).toFixed(0)}% conf.
                      </Text>
                    </View>
                  </View>

                  {/* Quality & Status */}
                  <View style={[styles.scanMetrics, { alignItems: 'flex-end' }]}>
                    <Text style={[
                      styles.scanQuality,
                      {
                        color: scan.quality >= 70 ? '#27AE60' :
                          scan.quality >= 50 ? '#F39C12' : '#E74C3C',
                        fontSize: 18,
                        fontFamily: Fonts.bold
                      }
                    ]}>
                      {Math.round(scan.quality)}%
                    </Text>
                    <View style={[
                      styles.scanStatusBadge,
                      scan.status === 'Rejected' && styles.scanStatusBadgeRejected,
                      scan.status === 'Local Sale' && { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
                    ]}>
                      <Text style={[
                        styles.scanStatusText,
                        scan.status === 'Rejected' && styles.scanStatusTextRejected,
                        scan.status === 'Local Sale' && { color: '#F39C12' },
                      ]}>
                        {scan.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.exportButtonText}>Refresh Data</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
