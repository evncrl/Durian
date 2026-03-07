import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import UniversalTopbar from '@/components/UniversalTopbar';
import { useUser } from '@/contexts/UserContext'; 
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated'; 

export default function TabsLayout() {
  const { hasNewForumPosts, setHasNewForumPosts } = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <UniversalTopbar />
      
      {/* ✅ FORUM NOTIFICATION TOAST */}
      {hasNewForumPosts && (
        <Animated.View 
          entering={FadeInUp} 
          exiting={FadeOutUp}
          style={styles.notificationToast}
        >
          <TouchableOpacity 
            style={styles.toastContent}
            onPress={() => {
              setHasNewForumPosts(false);
              router.push('/Forum'); 
            }}
          >
            <Text style={styles.toastText}>📢 New post in Community Forum!</Text>
            <TouchableOpacity onPress={() => setHasNewForumPosts(false)}>
               <Text style={styles.closeToast}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: '#fff' },
  content: { flex: 1 },
  notificationToast: {
    position: 'absolute',
    top: 80, 
    left: 20,
    right: 20,
    backgroundColor: '#16a34a', 
    borderRadius: 12,
    padding: 16,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toastText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  closeToast: { color: '#fff', fontSize: 18, marginLeft: 10 },
});