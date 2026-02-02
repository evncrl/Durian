import React from 'react';
import { NavigationProvider } from '../contexts/NavigationContext';
import { UserProvider } from '../contexts/UserContext';
import AppContainer from '../AppContainer';

export default function TabsLayout() {
  return (
    <NavigationProvider>
      <UserProvider>
        <AppContainer />
      </UserProvider>
    </NavigationProvider>
  );
}
