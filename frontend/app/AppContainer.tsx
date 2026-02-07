import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from './contexts/NavigationContext';
import UniversalHeader from './components/UniversalHeader';
import Home from './(tabs)/Home';
import Scanner from './(tabs)/Scanner';
import Shop from './(tabs)/Shop';
import Chatbot from './(tabs)/Chatbot';
import Profile from './(tabs)/Profile';
import Analytics from './(tabs)/Analytics';

export default function AppContainer() {
  const { currentScreen, navigateToScreen } = useNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <Home />;
      case 'Scanner':
        return <Scanner />;
      case 'Shop':
        return <Shop />;
      case 'Chatbot':
        return <Chatbot />;
     case 'Analytics':
        return <Analytics />;
      case 'Profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Universal Header */}
      <UniversalHeader />

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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
