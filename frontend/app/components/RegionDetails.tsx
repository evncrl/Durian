import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/Home.styles';
import { DURIAN_DATA } from './DurianHeatmap';

interface RegionDetailProps {
  selectedRegion: any;
  onClose: () => void;
}

export function RegionDetail({ selectedRegion, onClose }: RegionDetailProps) {
  if (!selectedRegion) return null;

  return (
    <View style={styles.regionDetail}>
      <View style={styles.regionDetailHeader}>
        <Text style={styles.regionDetailTitle}>📍 {selectedRegion.province}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
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
  );
}

interface TopProducersProps {
  onRegionSelect: (region: any) => void;
}

export function TopProducers({ onRegionSelect }: TopProducersProps) {
  const getProductionColor = (production: number) => {
    if (production > 20000) return '#FF6B6B';
    if (production > 8000) return '#FFA726';
    if (production > 3000) return '#FFD166';
    return '#4ECDC4';
  };

  return (
    <View style={styles.topProducers}>
      <Text style={styles.sectionTitle}>🏆 Top Durian Producers</Text>
      <View style={styles.producersList}>
        {DURIAN_DATA.slice(0, 5).map((region, index) => (
          <TouchableOpacity 
            key={region.id} 
            style={styles.producerItem}
            onPress={() => onRegionSelect(region)}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.producerInfo}>
              <Text style={styles.producerName}>{region.province}</Text>
              <Text style={styles.producerProduction}>{region.production.toLocaleString()} MT</Text>
            </View>
            <View 
              style={[
                styles.productionIndicator, 
                { 
                  backgroundColor: getProductionColor(region.production),
                  width: `${(region.production / 45000) * 100}%`
                }
              ]} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
