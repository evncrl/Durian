import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Idagdag ito para sa Admin folder */}
      <Stack.Screen name="admin" options={{ headerShown: false }} /> 
    </Stack>
  );
}