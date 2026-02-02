import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import styles from "../styles/Home.styles";
import { API_URL } from "../config/appconf";
import DurianHeatmap, { DURIAN_DATA } from "../components/DurianHeatmap";
import { RegionDetail, TopProducers } from "../components/RegionDetails";

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
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");
const isMobile = width < 768;

export default function Home() {
  const [name, setName] = useState("John Doe");
  const [photoUri, setPhotoUri] = useState("https://via.placeholder.com/120");
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [mapMode, setMapMode] = useState<'heatmap' | 'scatter'>('heatmap');

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Section - Simplified since navigation is in header */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to Durianostics</Text>
        <Text style={styles.welcomeSubtitle}>
          Your AI-powered durian quality analysis platform
        </Text>
      </View>

      {/* Map Section */}
      <View style={styles.mainContent}>
        <DurianHeatmap
          mapMode={mapMode}
          onMapModeChange={setMapMode}
          onRegionSelect={setSelectedRegion}
          plotlyLoaded={plotlyLoaded}
          onPlotlyLoad={() => setPlotlyLoaded(true)}
        />

        {/* Selected Region Details */}
        <RegionDetail
          selectedRegion={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />

        {/* Top Producers Summary */}
        <TopProducers onRegionSelect={setSelectedRegion} />
      </View>
    </ScrollView>
  );
}