import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  currentScreen: string;
  navigateToScreen: (screen: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialScreen?: string;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentScreen, setCurrentScreen] = useState(
    typeof initialScreen === 'string' && initialScreen.length > 0 ? initialScreen : 'Landing'
  );

  const navigateToScreen = (screen: string) => {
    setCurrentScreen(screen);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        navigateToScreen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
