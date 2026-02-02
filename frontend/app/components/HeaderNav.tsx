import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface HeaderNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

interface NavItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
}

const navItems: NavItem[] = [
  { id: '1', title: 'Home', icon: 'home', screen: 'Home' },
  { id: '2', title: 'Scanner', icon: 'camera', screen: 'Scanner' },
  { id: '3', title: 'Analytics', icon: 'stats-chart', screen: 'Analytics' },
  { id: '4', title: 'Forum', icon: 'chatbubbles', screen: 'Forum' },
  { id: '5', title: 'Profile', icon: 'person', screen: 'Profile' },
];

export default function HeaderNav({ currentScreen, onNavigate }: HeaderNavProps) {
  const [showMore, setShowMore] = useState(false);

  // Show first 4 items on mobile, all on larger screens
  const visibleItems = width < 768 ? navItems.slice(0, 4) : navItems;
  const moreItems = width < 768 ? navItems.slice(4) : [];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Ionicons name="leaf" size={24} color="#27AE60" />
        <Text style={styles.logoText}>Durianostics</Text>
      </View>

      {/* Navigation Items */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.navScroll}
        contentContainerStyle={styles.navContent}
      >
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              currentScreen === item.screen && styles.navItemActive,
            ]}
            onPress={() => onNavigate(item.screen)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={currentScreen === item.screen ? '#27AE60' : '#666'}
            />
            <Text
              style={[
                styles.navItemText,
                currentScreen === item.screen && styles.navItemTextActive,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications */}
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  navScroll: {
    flex: 1,
  },
  navContent: {
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 60,
  },
  navItemActive: {
    backgroundColor: '#f0f9ff',
  },
  navItemText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  navItemTextActive: {
    color: '#27AE60',
    fontWeight: '600',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginLeft: 8,
  },
});
