import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import styles from './DurianHeatmap.styles';
import { useResponsive } from '@/utils/platform';

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
  { id: 16, province: "Lanao del Norte", lat: 8.0500, lon: 124.2500, production: 1800 }
];

interface HeatmapProps {
  mapMode: 'heatmap' | 'scatter';
  onMapModeChange: (mode: 'heatmap') => void;
  onRegionSelect: (region: any) => void;
  plotlyLoaded: boolean;
  onPlotlyLoad: () => void;
}

export default function DurianHeatmap(props: HeatmapProps) {
  const { mapMode, onMapModeChange, onRegionSelect, plotlyLoaded, onPlotlyLoad } = props;
  const plotRef = useRef<HTMLDivElement>(null);
  const { isWeb } = useResponsive();

  // Load Plotly.js for web
  useEffect(() => {
    if (isWeb && !plotlyLoaded) {
      console.log('[DurianHeatmap] Loading Plotly.js...');
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.24.1.min.js';
      script.onload = () => {
        console.log('[DurianHeatmap] Plotly.js loaded');
        onPlotlyLoad();
        renderMap();
      };
      script.onerror = () => {
        console.error('[DurianHeatmap] Failed to load Plotly.js');
      };
      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isWeb, plotlyLoaded]);

  useEffect(() => {
    if (isWeb && plotlyLoaded) {
      console.log('[DurianHeatmap] Rendering map...');
      renderMap();
    }
  }, [isWeb, plotlyLoaded, mapMode]);

  const renderMap = () => {
    if (!plotRef.current) {
      console.warn('[DurianHeatmap] plotRef.current is null');
      return;
    }
    if (!(window as any).Plotly) {
      console.warn('[DurianHeatmap] Plotly not available on window');
      return;
    }

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
          title: {
            text: 'Production (relative)',
            font: { color: '#fff' }
          },
          tickfont: { color: '#fff' },
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
            title: {
              text: 'Production (MT)',
              font: { color: '#fff' }
            },
            tickfont: { color: '#fff' },
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
        font: { size: 20, family: 'Montserrat, sans-serif', color: '#fff' }
      },
      autosize: true,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      mapbox: {
        style: 'open-street-map', // Most reliable style, no token issues
        center: { lat: 12.0, lon: 122.0 },
        zoom: 4,
        minzoom: 3,
        bearing: 0,
        pitch: 0,
        bounds: {
          west: 110.0,
          east: 131.0,
          south: -2.0,
          north: 22.5
        }
      },
      margin: { t: 50, b: 20, l: 20, r: 20 },
      hovermode: 'closest',
      showlegend: false,
      dragmode: 'pan'
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      
      // Set view constraints
      scrollZoom: true,
      doubleClick: 'reset+autosize'
    };

    Plotly.newPlot(plotDiv, [trace], layout, config).then(() => {
      // Cast to any to bypass TypeScript checking
      (plotDiv as any).on('plotly_click', function (data: any) {
        if (data.points && data.points[0]) {
          const pointIndex = data.points[0].pointIndex;
          if (pointIndex >= 0 && pointIndex < DURIAN_DATA.length) {
            onRegionSelect(DURIAN_DATA[pointIndex]);
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
    <View style={styles.mapCard}>
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
            onPress={() => onMapModeChange('heatmap')}
          >
            <Text style={styles.controlButtonText}>🔥 Heat Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapViewport}>
        {isWeb ? (
          plotlyLoaded ? (
            <div
              ref={plotRef}
              style={{
                width: '100%',
                height: '100%',
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
    </View>
  );
}

// Export the data for use in other components
export { DURIAN_DATA };

