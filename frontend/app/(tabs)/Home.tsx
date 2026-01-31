import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import styles from "../styles/Home.styles";
import { API_URL } from "../config/appconf";

import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  Dimensions,
  ActivityIndicator
} from "react-native";

const { width, height } = Dimensions.get("window");
const isMobile = width < 768;

// Durian production data for Philippines
const DURIAN_DATA = [
  { id: 1, province: "Davao City", lat: 7.1907, lon: 125.4553, production: 45000 },
  { id: 2, province: "Davao del Sur", lat: 6.4158, lon: 125.6114, production: 18000 },
  { id: 3, province: "Cotabato", lat: 7.2047, lon: 124.2317, production: 9500 },
  { id: 4, province: "South Cotabato", lat: 6.2707, lon: 124.6857, production: 8800 },
  { id: 5, province: "Davao de Oro", lat: 7.5152, lon: 125.9495, production: 8500 },
  { id: 6, province: "Bukidnon", lat: 7.9631, lon: 125.1367, production: 6200 },
  { id: 7, province: "Sultan Kudarat", lat: 6.5658, lon: 124.6827, production: 5700 },
  { id: 8, province: "Maguindanao", lat: 6.9528, lon: 124.4258, production: 5100 },
  { id: 9, province: "Zamboanga Sibugay", lat: 7.5000, lon: 122.3333, production: 4200 },
  { id: 10, province: "Misamis Oriental", lat: 8.5042, lon: 124.6333, production: 3500 },

   { id: 11, province: "Davao del Norte", lat: 7.3300, lon: 125.7100, production: 7800 },
  { id: 12, province: "Davao Oriental", lat: 7.1600, lon: 126.2500, production: 4800 },
  { id: 13, province: "Davao Occidental", lat: 6.3500, lon: 125.4000, production: 3000 },
  { id: 14, province: "Agusan del Sur", lat: 8.9400, lon: 125.5200, production: 2500 },
  { id: 15, province: "Lanao del Sur", lat: 7.6800, lon: 124.3000, production: 2200 },
  { id: 16, province: "Lanao del Norte", lat: 8.0500, lon: 124.2500, production: 1800 },
  { id: 17, province: "Sulu", lat: 6.0500, lon: 121.0000, production: 1200 },

  // 🟡 Small-scale / emerging areas outside Mindanao
  { id: 18, province: "Cagayan Valley", lat: 17.6400, lon: 121.7300, production: 500 },
  { id: 19, province: "Western Visayas", lat: 11.7000, lon: 122.5700, production: 400 },
  { id: 20, province: "Central Visayas", lat: 10.3100, lon: 123.8900, production: 350 },
  { id: 21, province: "Eastern Visayas", lat: 11.2000, lon: 125.0000, production: 300 },
  { id: 22, province: "CALABARZON", lat: 14.2000, lon: 121.1500, production: 200 },
  { id: 23, province: "MIMAROPA", lat: 12.5000, lon: 121.0000, production: 150 },
  { id: 24, province: "Central Luzon", lat: 15.0000, lon: 120.9000, production: 100 }

];

export default function Home() {
  const [name, setName] = useState("John Doe");
  const [photoUri, setPhotoUri] = useState("https://via.placeholder.com/120");
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [mapMode, setMapMode] = useState<'heatmap' | 'scatter'>('heatmap');

  // Load Plotly.js for web
  useEffect(() => {
    if (Platform.OS === 'web' && !plotlyLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.24.1.min.js';
      script.onload = () => {
        setPlotlyLoaded(true);
        renderMap();
      };
      document.head.appendChild(script);
      
      return () => {
        // Clean up
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && plotlyLoaded) {
      renderMap();
    }
  }, [plotlyLoaded, mapMode]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        const userId = await AsyncStorage.getItem("user_id");
        const storedName = await AsyncStorage.getItem("name");
        const storedPhoto = await AsyncStorage.getItem("photoProfile");

        if (storedName) setName(storedName);
        if (storedPhoto) setPhotoUri(storedPhoto);

        if (token && userId) {
          try {
            const res = await axios.get(`${API_URL}/profile/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data?.name) setName(res.data.name);
            if (res.data?.photoProfile) setPhotoUri(res.data.photoProfile);
          } catch (err) {
            console.error("Failed to fetch profile:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    loadProfile();
  }, []);

 const renderMap = () => {
  if (!plotRef.current || !(window as any).Plotly) return;

  const { Plotly } = (window as any);
  
  // Store current div reference
  const plotDiv = plotRef.current;
  
  // Clear previous plot if exists
  Plotly.purge(plotDiv);

  // Prepare data based on map mode
  let trace;
  
 if (mapMode === 'heatmap') {
  // Heatmap mode (normalized and contrast-adjusted)
  const maxProduction = Math.max(...DURIAN_DATA.map(d => d.production));
  trace = {
    type: 'densitymapbox',
    lat: DURIAN_DATA.map(d => d.lat),
    lon: DURIAN_DATA.map(d => d.lon),
    // Normalize to 0..1 so colorscale maps consistently
    z: DURIAN_DATA.map(d => d.production / maxProduction),
    zmin: 0,
    zmax: 1,
    radius: 60,
    colorscale: [
      [0, 'rgba(0, 255, 0, 0.06)'],
      [0.2, 'rgba(255, 255, 0, 0.65)'],
      [0.5, 'rgba(255, 165, 0, 0.85)'],
      [0.8, 'rgba(255, 100, 0, 0.95)'],
      [1, 'rgba(255, 0, 0, 1)']
    ],
    hoverinfo: 'text',
    text: DURIAN_DATA.map(d =>
      `<b>${d.province}</b><br>Production: ${d.production.toLocaleString()} MT<br>(${((d.production / maxProduction) * 100).toFixed(1)}% of top producer)`
    ),
    showscale: true,
    colorbar: {
      title: 'Production (relative)',
      titleside: 'right'
    }
  };
  } else {
    // Scatter mode
    trace = {
      type: 'scattermapbox',
      lat: DURIAN_DATA.map(d => d.lat),
      lon: DURIAN_DATA.map(d => d.lon),
      mode: 'markers',
      marker: {
        size: DURIAN_DATA.map(d => Math.max(10, d.production / 1500)),
        color: DURIAN_DATA.map(d => d.production),
        colorscale: 'YlOrRd',
        showscale: true,
        colorbar: {
          title: 'Production (MT)',
          titleside: 'right'
        },
        opacity: 0.8
      },
      text: DURIAN_DATA.map(d => d.province),
      hoverinfo: 'text',
      customdata: DURIAN_DATA,
      hovertemplate: 
        '<b>%{text}</b><br>' +
        'Production: %{customdata.production:,} MT<br>' +
        '<extra></extra>'
    };
  }

  const layout = {
    title: {
      text: 'Philippines Durian Production',
      font: { size: 20, family: 'Arial, sans-serif' }
    },
    autosize: true,
    mapbox: {
      style: 'open-street-map',
      // Center roughly on the Philippines and lower zoom to include all islands
      center: { lat: 12.0, lon: 122.0 },
      zoom: 4,
      minzoom: 3,
      bearing: 0,
      pitch: 0,
      // Expanded bounds to allow full country view while keeping panning reasonable
      bounds: {
        west: 110.0,   // Left boundary (includes extreme western islands)
        east: 131.0,   // Right boundary (east-most islands)
        south: -2.0,   // Bottom boundary (includes southernmost islands)
        north: 22.5    // Top boundary (includes northern islands)
      }
    },
    height: 500,
    margin: { t: 50, b: 20, l: 20, r: 20 },
    hovermode: 'closest',
    showlegend: false,
    // Prevent users from panning too far from the Philippines
    dragmode: 'pan'
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    mapboxAccessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA',
    // Set view constraints
    scrollZoom: true,
    doubleClick: 'reset+autosize'
  };

  Plotly.newPlot(plotDiv, [trace], layout, config).then(() => {
    // Cast to any to bypass TypeScript checking
    (plotDiv as any).on('plotly_click', function(data: any) {
      if (data.points && data.points[0]) {
        const pointIndex = data.points[0].pointIndex;
        if (pointIndex >= 0 && pointIndex < DURIAN_DATA.length) {
          setSelectedRegion(DURIAN_DATA[pointIndex]);
        }
      }
    });
  }).catch((err: any) => {
    console.error('Plotly error:', err);
  });
};

  const getProductionColor = (production: number) => {
    if (production > 20000) return '#FF6B6B';
    if (production > 8000) return '#FFA726';
    if (production > 3000) return '#FFD166';
    return '#4ECDC4';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logoImage} 
              accessibilityLabel="Durianostics logo" 
            />
            <Text style={styles.brandText}>Durianostics</Text>
          </View>
          <View style={styles.navLinks}>
            <TouchableOpacity>
              <Text style={styles.navLink}>🌏 Map</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.navLink}>⚙️ Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileContent}>
          <Image source={{ uri: photoUri }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome back, {name}</Text>
            <Text style={styles.dashboardText}>Here's what we have for you today</Text>
          </View>
          <TouchableOpacity 
            style={styles.newScanButton}
            onPress={() => setMapMode(mapMode === 'heatmap' ? 'scatter' : 'heatmap')}
          >
            <Text style={styles.newScanButtonText}>
              {mapMode === 'heatmap' ? ' Switch to Scatter' : ' Switch to Heatmap'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mainContent}>
        {/* Map Controls */}
        <View style={styles.mapControls}>
          <View style={styles.mapTitleSection}>
            <Text style={styles.mapTitle}>Philippines Durian Production</Text>
            <Text style={styles.mapSubtitle}>
              {mapMode === 'heatmap' 
                ? 'Heat map visualization of production intensity' 
                : 'Bubble size represents production volume'}
            </Text>
          </View>
          
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, mapMode === 'heatmap' && styles.controlButtonActive]}
              onPress={() => setMapMode('heatmap')}
            >
              <Text style={styles.controlButtonText}>🔥 Heat Map</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, mapMode === 'scatter' && styles.controlButtonActive]}
              onPress={() => setMapMode('scatter')}
            >
              <Text style={styles.controlButtonText}>⚪ Scatter Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            plotlyLoaded ? (
              <div 
                ref={plotRef} 
                style={{ 
                  width: '100%', 
                  height: '500px',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }} 
              />
            ) : (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="large" color="#15803d" />
                <Text style={styles.mapLoadingText}>Loading Durian Production Map...</Text>
              </View>
            )
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                Interactive heat map is only available on web.
              </Text>
              <Text style={styles.mapPlaceholderText}>
                Open this app in a browser for the full experience.
              </Text>
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>Production Intensity</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.legendText}>Low (&lt;3K MT)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFD166' }]} />
              <Text style={styles.legendText}>Medium (3-8K)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFA726' }]} />
              <Text style={styles.legendText}>High (8-20K)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Highest (&gt;20K)</Text>
            </View>
          </View>
        </View>

        {/* Selected Region Details */}
        {selectedRegion && (
          <View style={styles.regionDetail}>
            <View style={styles.regionDetailHeader}>
              <Text style={styles.regionDetailTitle}>📍 {selectedRegion.province}</Text>
              <TouchableOpacity onPress={() => setSelectedRegion(null)}>
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
        )}

        {/* Top Producers Summary */}
        <View style={styles.topProducers}>
          <Text style={styles.sectionTitle}>🏆 Top Durian Producers</Text>
          <View style={styles.producersList}>
            {DURIAN_DATA.slice(0, 5).map((region, index) => (
              <View key={region.id} style={styles.producerItem}>
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
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}