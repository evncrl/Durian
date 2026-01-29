import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import styles from "../styles/Home.styles";
import { API_URL } from "../config/appconf";


import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  Dimensions
} from "react-native";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

export default function Home() {
  const [name, setName] = useState("John Doe");
  const [photoUri, setPhotoUri] = useState("https://via.placeholder.com/120");

  const [recentScans] = useState([
    { id: 1, date: "Jan 25, 2026", quality: "Premium", score: 95, status: "Export Ready" },
    { id: 2, date: "Jan 24, 2026", quality: "Good", score: 82, status: "Approved" },
    { id: 3, date: "Jan 23, 2026", quality: "Premium", score: 91, status: "Export Ready" },
    { id: 4, date: "Jan 22, 2026", quality: "Fair", score: 74, status: "Review" },
  ]);

  const stats = [
    { label: "Total Scans", value: "127", change: "+12%", icon: "📊" },
    { label: "Average Quality", value: "89%", change: "+5%", icon: "⭐" },
    { label: "Export Ready", value: "82%", change: "+8%", icon: "✓" },
    { label: "This Month", value: "47", change: "+18%", icon: "📅" },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Load stored values first (even without authentication)
        const token = await AsyncStorage.getItem("jwt_token");
        const userId = await AsyncStorage.getItem("user_id");
        const storedName = await AsyncStorage.getItem("name");
        const storedPhoto = await AsyncStorage.getItem("photoProfile");

        // Always set the stored name and photo if they exist
        if (storedName) setName(storedName);
        if (storedPhoto) setPhotoUri(storedPhoto);

        // Only fetch from backend if we have authentication
        if (token && userId) {
          try {
            const res = await axios.get(`${API_URL}/profile/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data?.name) setName(res.data.name);
            if (res.data?.photoProfile) setPhotoUri(res.data.photoProfile);
          } catch (err) {
            console.error("Failed to fetch profile from backend:", err);
            // Keep using stored values if backend fails
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    loadProfile();
  }, []);

  const getQualityStyle = (quality: string) => {
    switch(quality) {
      case "Premium": return styles.qualityPremium;
      case "Good": return styles.qualityGood;
      case "Fair": return styles.qualityFair;
      default: return styles.qualityDefault;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}><Text style={styles.logoText}>D</Text></View>
            <Text style={styles.brandText}>Durianostics</Text>
          </View>
          <View style={styles.navLinks}>
            <TouchableOpacity><Text style={styles.navLink}>Help</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.navLink}>Settings</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileContent}>
          <Image source={{ uri: photoUri }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome back, {name}</Text>
            <Text style={styles.dashboardText}>Dashboard Overview</Text>
          </View>
          <TouchableOpacity style={styles.newScanButton}>
            <Text style={styles.newScanButtonText}>New Scan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats & Recent Scans */}
      <View style={styles.mainContent}>
        {/* Stats Grid */}
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          {stats.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, isMobile && styles.statCardMobile]}>
              <View style={styles.statHeader}>
                <View style={styles.statIcon}><Text style={styles.statIconText}>{stat.icon}</Text></View>
                <View style={styles.changeBadge}><Text style={styles.changeBadgeText}>{stat.change}</Text></View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.contentGrid, isMobile && styles.contentGridMobile]}>
          {/* Recent Scans */}
          <View style={[styles.recentScans, isMobile && styles.recentScansMobile]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              <TouchableOpacity><Text style={styles.viewAllButton}>View All</Text></TouchableOpacity>
            </View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Quality</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Score</Text>
              <Text style={[styles.tableHeaderText, styles.col4]}>Status</Text>
            </View>
            {recentScans.map((scan, index) => (
              <View key={scan.id} style={[styles.tableRow, index !== recentScans.length-1 && styles.tableRowBorder]}>
                <Text style={[styles.tableCell, styles.col1, styles.tableCellBold]}>{scan.date}</Text>
                <View style={styles.col2}>
                  <View style={[styles.qualityBadge, getQualityStyle(scan.quality)]}>
                    <Text style={[styles.qualityText, getQualityStyle(scan.quality)]}>{scan.quality}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, styles.col3, styles.scoreText]}>{scan.score}%</Text>
                <Text style={[styles.tableCell, styles.col4, styles.statusText]}>{scan.status}</Text>
              </View>
            ))}
          </View>

          {/* Sidebar */}
          <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
            <View style={styles.quickActions}>
              <Text style={styles.sidebarTitle}>Quick Actions</Text>

              <TouchableOpacity style={styles.primaryAction}>
                <Text style={styles.actionIcon}>📸</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Start New Scan</Text>
                  <Text style={styles.actionSubtitle}>Analyze quality now</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryAction}>
                <Text style={styles.actionIcon}>📊</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitleSecondary}>View Analytics</Text>
                  <Text style={styles.actionSubtitleSecondary}>Detailed insights</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => router.push("/(tabs)/Profile")}
              >
                <Text style={styles.actionIcon}>⚙️</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitleSecondary}>Profile Settings</Text>
                  <Text style={styles.actionSubtitleSecondary}>Manage account</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.systemStatus}>
              <Text style={styles.systemStatusTitle}>System Status</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>AI Model</Text>
                <Text style={styles.statusValue}>Active</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Last Update</Text>
                <Text style={styles.statusValue}>2h ago</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Accuracy</Text>
                <Text style={styles.statusValue}>99.2%</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
  </ScrollView>
  );
}
