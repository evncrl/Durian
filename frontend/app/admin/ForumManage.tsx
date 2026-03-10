import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';
import { API_URL } from '@/config/appconf';
import { Ionicons } from '@expo/vector-icons';

export default function ForumManage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // ✅ Dito kukuha ng posts, siguraduhin na may route ka na ganito sa backend
            const res = await fetch(`${API_URL}/admin/forum/posts`, {
                headers: { 'ngrok-skip-browser-warning': 'true', 'Accept': 'application/json' }
            });
            const json = await res.json();
            if (json.success) {
                setPosts(json.posts);
            }
        } catch (err) {
            console.error("Forum Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = (postId: string) => {
        const deleteAction = async () => {
            try {
                const res = await fetch(`${API_URL}/admin/forum/post/${postId}`, {
                    method: 'DELETE',
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                const json = await res.json();
                if (json.success) {
                    if (Platform.OS === 'web') alert("Post Deleted!");
                    fetchPosts(); // Refresh listahan
                }
            } catch (err) {
                alert("Failed to delete post.");
            }
        };

        if (Platform.OS === 'web') {
            if (confirm("Sigurado ka bang buburahin mo itong post?")) deleteAction();
        } else {
            Alert.alert("Delete Post", "Hindi na ito mababawi. Ituloy?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deleteAction }
            ]);
        }
    };

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Palette.linenWhite }}>
            <AdminSidebar />
            
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 40 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Forum Management</Text>
                        <Text style={styles.subtitle}>Moderate community discussions and remove inappropriate content.</Text>
                    </View>
                    <TouchableOpacity style={styles.refreshBtn} onPress={fetchPosts}>
                        <Ionicons name="refresh" size={20} color={Palette.white} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingArea}>
                        <ActivityIndicator size="large" color={Palette.warmCopper} />
                        <Text style={{ fontFamily: Fonts.medium, marginTop: 10 }}>Loading forum posts...</Text>
                    </View>
                ) : (
                    <View style={styles.tableCard}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headText, { flex: 2 }]}>AUTHOR</Text>
                            <Text style={[styles.headText, { flex: 4 }]}>CONTENT SNIPPET</Text>
                            <Text style={[styles.headText, { flex: 1, textAlign: 'right' }]}>ACTION</Text>
                        </View>

                        {/* Table Rows */}
                        {posts.length > 0 ? (
                            posts.map((item) => (
                                <View key={item._id || item.id} style={styles.tableRow}>
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.authorName}>{item.username || item.author || 'Unknown'}</Text>
                                        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={[styles.cellText, { flex: 4 }]} numberOfLines={2}>
                                        {item.content || item.text}
                                    </Text>
                                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                        <TouchableOpacity 
                                            style={styles.deleteBtn}
                                            onPress={() => handleDelete(item._id || item.id)}
                                        >
                                            <Ionicons name="trash" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ fontFamily: Fonts.medium, color: Palette.slate }}>No forum posts found.</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
    title: { fontSize: 28, fontFamily: Fonts.bold, color: Palette.charcoalEspresso },
    subtitle: { fontSize: 14, color: Palette.slate, fontFamily: Fonts.medium, marginTop: 4 },
    refreshBtn: { backgroundColor: Palette.warmCopper, padding: 12, borderRadius: 10 },
    loadingArea: { marginTop: 100, alignItems: 'center' },
    tableCard: { backgroundColor: '#fff', borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: Palette.deepObsidian, padding: 20 },
    headText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 1 },
    tableRow: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
    authorName: { fontSize: 14, fontFamily: Fonts.bold, color: Palette.charcoalEspresso },
    dateText: { fontSize: 11, color: Palette.slate, fontFamily: Fonts.medium },
    cellText: { fontSize: 14, color: Palette.deepObsidian, fontFamily: Fonts.medium, paddingRight: 10 },
    deleteBtn: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 8 },
});