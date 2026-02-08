import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from './contexts/NavigationContext';
import UniversalSidebar from './components/UniversalSidebar';
import LandingAuthModal from './components/LandingAuthModal';
import AuthModal from './components/AuthModal';
import LandingScreen from './LandingScreen';
import About from './(tabs)/About';
import Scanner from './(tabs)/Scanner';
import Shop from './(tabs)/Shop';
import Chatbot from './(tabs)/Chatbot';
import Profile from './(tabs)/Profile';
import Analytics from './(tabs)/Analytics';
import Forum from './(tabs)/Forum';

export default function AppContainer() {
    const [authModalVisible, setAuthModalVisible] = React.useState(false);
    const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
    const openAuthModal = (mode: 'login' | 'signup') => {
      setAuthMode(mode);
      setAuthModalVisible(true);
    };
    const closeAuthModal = () => {
      setAuthModalVisible(false);
    };
  const { currentScreen, navigateToScreen } = useNavigation();
  const userCtx = require('./contexts/UserContext').useUser();
  const user = userCtx.user;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Landing':
        return <LandingScreen
          authModalVisible={authModalVisible}
          authMode={authMode}
          openAuthModal={openAuthModal}
        />;
      case 'Scanner':
        return <Scanner />;
      case 'Shop':
        if (!user) return <LandingScreen
          authModalVisible={authModalVisible}
          authMode={authMode}
          openAuthModal={openAuthModal}
          closeAuthModal={closeAuthModal}
        />;
        return <Shop />;
      case 'Chatbot':
        return <Chatbot />;
      case 'Analytics':
        if (!user) return <LandingScreen
          authModalVisible={authModalVisible}
          authMode={authMode}
          openAuthModal={openAuthModal}
          closeAuthModal={closeAuthModal}
        />;
        return <Analytics />;
      case 'Profile':
        return <Profile />;
      case 'Forum':
        return <Forum />;
      case 'About':
         return <About />;
      default:
        return <LandingScreen
          authModalVisible={authModalVisible}
          authMode={authMode}
          openAuthModal={openAuthModal}
        />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Universal Sidebar */}
      <UniversalSidebar openAuthModal={openAuthModal} />

      {/* Global Landing Auth Modal */}
      <LandingAuthModal visible={authModalVisible} mode={authMode} onClose={closeAuthModal} />

      {/* Screen Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
