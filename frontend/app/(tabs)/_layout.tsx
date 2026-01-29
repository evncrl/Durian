import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#27AE60',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          const routeName = route.name;
          if (routeName === 'Home') iconName = 'home';
          else if (routeName === 'Scanner') iconName = 'camera';
          else if (routeName === 'Analytics') iconName = 'stats-chart';
          else if (routeName === 'Profile') iconName = 'person';
          else if (routeName === 'Flower') iconName = 'flower';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen 
        name="Home" 
        options={{ title: 'Home', tabBarLabel: 'Home' }} 
      />
      <Tabs.Screen 
        name="Scanner" 
        options={{ title: 'Scanner', tabBarLabel: 'Scanner' }} 
      />
      <Tabs.Screen 
        name="Analytics" 
        options={{ title: 'Analytics', tabBarLabel: 'Analytics' }} 
      />
      <Tabs.Screen 
        name="Flower" 
        options={{ title: 'Flower', tabBarLabel: 'Flower' }} 
      />
      <Tabs.Screen 
        name="Profile" 
        options={{ title: 'Profile', tabBarLabel: 'Profile' }} 
      />
    </Tabs>
  );
}
