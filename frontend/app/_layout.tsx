import { Stack } from 'expo-router';

export default function RootLayout() {
  const { UserProvider } = require('./contexts/UserContext');
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} /> 
      </Stack>
    </UserProvider>
  );
}