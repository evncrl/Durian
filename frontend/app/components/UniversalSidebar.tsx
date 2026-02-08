import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import { useResponsive } from '../utils/platform';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../contexts/NavigationContext';
import { useUser } from '../contexts/UserContext';

const navItems = [
  { id: '0', title: 'Landing', icon: 'home' as const, screen: 'Landing' },
  { id: '2', title: 'Scanner', icon: 'camera' as const, screen: 'Scanner' },
  { id: '3', title: 'Analytics', icon: 'stats-chart' as const, screen: 'Analytics' },
  { id: '4', title: 'Shop', icon: 'storefront' as const, screen: 'Shop' },
  { id: '5', title: 'Chatbot', icon: 'chatbox' as const, screen: 'Chatbot' },
  { id: '6', title: 'Forum', icon: 'people' as const, screen: 'Forum' },
  { id: '7', title: 'About', icon: 'information-circle' as const, screen: 'About' },
];

interface UniversalSidebarProps {
  openAuthModal?: (mode: 'login' | 'signup') => void;
}

export default function UniversalSidebar({ openAuthModal }: UniversalSidebarProps) {
  const nav = useNavigation();
  const userCtx = useUser();
  const { isSmallScreen, isMediumScreen, isLargeScreen, width } = useResponsive();
  const [expanded, setExpanded] = React.useState(false);
  // Always minimized by default, do not auto-expand on screen size change
  const currentScreen = nav.currentScreen;
  const navigateToScreen = nav.navigateToScreen;
  const user = userCtx.user;
  const filteredNavItems = React.useMemo(() => {
    if (!user) {
      return navItems.filter(item => item.title !== 'Analytics' && item.title !== 'Shop' && item.title !== 'Home' && item.title !== 'Forum' );
    }
    return navItems;
  }, [user]);

  const getInitials = (name: string) => {
    if (!name || name.trim().length === 0) return 'US';
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return 'US';
    return parts.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCloudinaryUrl = (photoUri: string) => {
    if (!photoUri) return '';
    if (photoUri.includes('cloudinary.com')) {
      return photoUri.replace('/upload/', '/upload/w_100,h_100,c_fill,g_face,q_auto,f_auto/');
    }
    return photoUri;
  };

  // Sidebar width responsive
  const sidebarWidth = expanded ? (isSmallScreen ? 64 : 220) : 48;

    // Handler for toggling sidebar
    const handleSidebarPress = (e: any) => {
      // Only toggle if not clicking on nav/profile
      setExpanded(exp => !exp);
    };

    // Prevent nav/profile clicks from toggling sidebar
    const stopPropagation = (e: any) => {
      e.stopPropagation && e.stopPropagation();
    };

    return (
      <TouchableWithoutFeedback onPress={handleSidebarPress}>
        <View style={[styles.sidebar, { width: sidebarWidth }]}> 
        {/* Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={(e) => { stopPropagation(e); setExpanded(exp => !exp); }}>
          <Ionicons name={expanded ? 'chevron-back' : 'chevron-forward'} size={22} color="#27AE60" />
        </TouchableOpacity>
        {/* Logo */}
        {expanded && (
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={28} color="#27AE60" />
            <Text style={styles.logoText}>Durianostics</Text>
          </View>
        )}
        {/* Navigation */}
        <ScrollView style={styles.navScroll} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
          {filteredNavItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, currentScreen === item.screen && styles.navItemActive, !expanded && styles.navItemCollapsed]}
              onPress={(e) => { e.stopPropagation(); navigateToScreen(item.screen); }}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={currentScreen === item.screen ? '#27AE60' : '#666'}
              />
              {expanded && (
                <Text style={[styles.navItemText, currentScreen === item.screen && styles.navItemTextActive]}>
                  {item.title}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Profile/Login */}
        <View style={styles.profileSection}>
          {user ? (
            <TouchableOpacity style={[styles.profileButton, !expanded && styles.profileButtonCollapsed]} onPress={(e) => { e.stopPropagation(); navigateToScreen('Profile'); }}>
              {user?.photoProfile ? (
                <Image source={{ uri: getCloudinaryUrl(user.photoProfile) }} style={styles.profileAvatar} />
              ) : (
                <View style={styles.profileAvatarPlaceholder}>
                  <Text style={styles.profileAvatarText}>{user?.name ? getInitials(user.name) : 'US'}</Text>
                </View>
              )}
              {expanded && <Text style={styles.profileName}>{user?.name || 'User'}</Text>}
            </TouchableOpacity>
          ) : (
            expanded ? (
              <TouchableOpacity style={styles.loginButton} onPress={(e) => { e.stopPropagation(); openAuthModal && openAuthModal('login'); }}>
                <Text style={styles.loginButtonText}>Login / Sign Up</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.minimizedLoginButton} onPress={(e) => { e.stopPropagation(); openAuthModal && openAuthModal('login'); }}>
                <Ionicons name="log-in-outline" size={22} color="#27AE60" />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 4,
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    zIndex: 20,
  },
  toggleButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 10,
  },
  navScroll: {
    flex: 1,
    width: '100%',
  },
  navContent: {
    alignItems: 'flex-start',
    paddingBottom: 24,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    minHeight: 44,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: '#f0f9ff',
  },
  navItemText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#27AE60',
    fontWeight: '700',
  },
  profileSection: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  profileButtonCollapsed: {
    justifyContent: 'center',
    paddingLeft: 0,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    width: '100%',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  profileAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
