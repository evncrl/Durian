import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext'; //
import { View, ActivityIndicator } from 'react-native';
import { Palette } from '@/constants/theme';

export default function AdminGatekeeperLayout() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        console.log('[AdminGatekeeper] Unauthorized access, redirecting to home...');
        router.replace('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Palette.deepObsidian }}>
        <ActivityIndicator size="large" color={Palette.warmCopper} />
      </View>
    );
  }

  return <Slot />;
}