import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DURIAN_DATA } from './DurianHeatmap';
import styles from './RegionDetails.styles';

interface RegionDetailProps {
  selectedRegion: any;
  onClose: () => void;
}

export function RegionDetail({ selectedRegion, onClose }: RegionDetailProps) {
  if (!selectedRegion) return null;

  
  return (
    <View style={styles.regionDetailContainer}>
      <View style={styles.regionHeader}>
        <Text style={styles.regionTitle}>📍 {selectedRegion.province}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.regionContent}>
        <View style={styles.regionStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Annual Production</Text>
          <Text style={styles.statValue}>{selectedRegion.production.toLocaleString()} MT</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Market Share</Text>
          <Text style={styles.statValue}>
            {((selectedRegion.production / 100000) * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Growth Rate</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>+8.2%</Text>
        </View>
        </View>
      </View>
    </View>
  );
}

interface TopProducersProps {
  onRegionSelect: (region: any) => void;
}

export function TopProducers({ onRegionSelect }: TopProducersProps) {
  const topProducers = [...DURIAN_DATA]
    .sort((a, b) => b.production - a.production)
    .slice(0, 5);

  return (
    <View style={styles.producersContainer}>
      {topProducers.map((region, index) => (
        <TouchableOpacity
          key={region.id}
          style={styles.producerItem}
          onPress={() => onRegionSelect(region)}
        >
          <View style={styles.producerRank}>
            <Text style={styles.producerRankText}>{index + 1}</Text>
          </View>
          <View style={styles.producerInfo}>
            <Text style={styles.producerName}>{region.province}</Text>
            <Text style={styles.producerValue}>{region.production.toLocaleString()} MT</Text>
          </View>
          <View style={styles.producerChevron}>
            <Text>›</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
