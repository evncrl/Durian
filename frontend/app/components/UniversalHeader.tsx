import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../contexts/NavigationContext';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

interface UniversalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showNotifications?: boolean;
  backgroundColor?: string;
  onBackPress?: () => void;
}

const navItems = [
  { id: '1', title: 'Home', icon: 'home' as const, screen: 'Home' },
  { id: '2', title: 'Scanner', icon: 'camera' as const, screen: 'Scanner' },
  { id: '3', title: 'Analytics', icon: 'stats-chart' as const, screen: 'Analytics' },
  { id: '4', title: 'Shop', icon: 'storefront' as const, screen: 'Shop' },
  { id: '5', title: 'Chatbot', icon: 'chatbox' as const, screen: 'Chatbot' },
];

export default function UniversalHeader({ 
  title, 
  showBackButton = false, 
  showNotifications = true,
  backgroundColor = '#fff',
  onBackPress 
}: UniversalHeaderProps) {
  const { currentScreen, navigateToScreen } = useNavigation();
  const { user } = useUser();

  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) {
      return 'US';
    }
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return 'US';
    
    return parts
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCloudinaryUrl = (photoUri: string) => {
    if (!photoUri) return '';
    
    if (photoUri.includes('cloudinary.com')) {
      return photoUri.replace('/upload/', '/upload/w_100,h_100,c_fill,g_face,q_auto,f_auto/');
    }
    
    return photoUri;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Left Section - Back Button or Logo */}
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={24} color="#27AE60" />
            <Text style={styles.logoText}>Durianostics</Text>
          </View>
        )}
      </View>

      {/* Center Section - Title or Navigation */}
      <View style={styles.centerSection}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
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
                onPress={() => navigateToScreen(item.screen)}
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
        )}
      </View>

      {/* Right Section - Profile only */}
<View style={styles.rightSection}>
  {showNotifications && !title && (
    <TouchableOpacity 
      style={styles.profileButton}
      onPress={() => navigateToScreen('Profile')}
    >
      {user?.photoProfile ? (
        <Image 
          source={{ uri: getCloudinaryUrl(user.photoProfile) }}
          style={styles.profileAvatar}
        />
      ) : (
        <View style={styles.profileAvatarPlaceholder}>
          <Text style={styles.profileAvatarText}>
            {user?.name ? getInitials(user.name) : 'US'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )}
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 60,
  },
  leftSection: {
    width: 120,
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  navScroll: {
    maxWidth: '100%',
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
  rightSection: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
