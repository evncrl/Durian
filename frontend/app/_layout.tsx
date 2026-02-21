import { Stack } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import {
  Montserrat_600SemiBold,
  Montserrat_700Bold
} from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AuthUIProvider } from '@/contexts/AuthUIContext';
import {
  Ionicons,
  MaterialIcons,
  Feather,
  FontAwesome5
} from '@expo/vector-icons';
import LandingAuthModal from '@/components/LandingAuthModal';
import { CartProvider } from '@/contexts/CartContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { UserProvider } = require('@/contexts/UserContext');

  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...Feather.font,
    ...FontAwesome5.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
   <AuthUIProvider>
  <UserProvider>
    <CartProvider>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{
          __html: `
          * { font-family: 'Inter_400Regular', sans-serif; }
          h1, h2, h3, h4, h5, h6, b, strong { font-family: 'Montserrat_700Bold', sans-serif; }
        `}} />
      )}
      {loaded || error ? (
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
          </Stack>
          <LandingAuthModal />
        </>
      ) : null}
    </CartProvider>
  </UserProvider>
</AuthUIProvider>
  );
}
