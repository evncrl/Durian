import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, StyleSheet, ActivityIndicator, 
    RefreshControl, TouchableOpacity, Alert, Platform 
} from 'react-native';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { API_URL } from '@/config/appconf';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function ReviewManage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/reviews`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.data.success) {
                setReviews(res.data.reviews);
            }
        } catch (err) {
            console.error("Fetch Reviews Error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ✅ FIXED DELETE LOGIC: Support for Web & Mobile
    const deleteReview = async (id: string) => {
        const performDelete = async () => {
            try {
                const res = await axios.delete(`${API_URL}/admin/reviews/${id}`);
                if (res.data.success) {
                    if (Platform.OS !== 'web') Alert.alert("Success", "Review removed.");
                    setReviews(prev => prev.filter(r => r.id !== id));
                }
            } catch (err) {
                console.error("Delete Error:", err);
                if (Platform.OS !== 'web') Alert.alert("Error", "Could not delete review.");
                else alert("Error: Could not delete review.");
            }
        };

        if (Platform.OS === 'web') {
            // ✅ Fix para sa Browser
            if (window.confirm("Are you sure you want to remove this feedback?")) {
                await performDelete();
            }
        } else {
            // Para sa Mobile (Android/iOS)
            Alert.alert(
                "Delete Review",
                "Are you sure you want to remove this feedback?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: performDelete }
                ]
            );
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const renderStars = (rating: number) => (
        <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((num) => (
                <Ionicons 
                    key={num} 
                    name={rating >= num ? "star" : "star-outline"} 
                    size={14} 
                    color={Palette.warmCopper} 
                />
            ))}
        </View>
    );

    const renderReviewItem = ({ item }: any) => (
        <View style={styles.reviewCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user_name}</Text>
                    <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    {renderStars(item.rating)}
                    {/* ✅ TRASH BUTTON */}
                    <TouchableOpacity 
                        onPress={() => deleteReview(item.id)} 
                        style={styles.deleteBtn}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.productBadge}>
                <Text style={styles.productName}>🍈 {item.product_name}</Text>
            </View>

            <View style={styles.commentBox}>
                <Text style={styles.commentText}>"{item.comment}"</Text>
            </View>
            
            <View style={styles.footer}>
                <Text style={styles.reviewId}>REF: {item.id.slice(-8).toUpperCase()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.screenContainer}>
            <AdminSidebar />
            <View style={styles.mainContent}>
                <View style={styles.headerSection}>
                    <View>
                        <Text style={styles.title}>Product Reviews</Text>
                        <Text style={styles.subtitle}>Detailed logs of customer feedback.</Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>{reviews.length} Total Reviews</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Palette.warmCopper} />
                    </View>
                ) : (
                    <FlatList
                        data={reviews}
                        keyExtractor={(item) => item.id}
                        renderItem={renderReviewItem}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchReviews();}} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No reviews found yet.</Text>}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#F8F9FA' },
    mainContent: { flex: 1, padding: 30 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
    title: { fontSize: 32, fontFamily: Fonts.bold, color: Palette.charcoalEspresso },
    subtitle: { fontSize: 14, color: Palette.slate, marginTop: 4 },
    statsContainer: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
    statsText: { color: Palette.slate, fontFamily: Fonts.medium, fontSize: 12 },
    listContainer: { paddingBottom: 40 },
    reviewCard: { 
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#EDF2F7',
        ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' }, android: { elevation: 2 } })
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    userInfo: { flex: 1 },
    userName: { color: Palette.charcoalEspresso, fontSize: 16, fontFamily: Fonts.bold },
    dateText: { color: Palette.slate, fontSize: 11, marginTop: 2 },
    starRow: { flexDirection: 'row', gap: 2 },
    deleteBtn: { marginTop: 12, padding: 8, backgroundColor: '#fff1f1', borderRadius: 8 },
    productBadge: { alignSelf: 'flex-start', backgroundColor: '#FFF9F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#FFE8D6', marginBottom: 12 },
    productName: { color: Palette.warmCopper, fontSize: 12, fontFamily: Fonts.bold, textTransform: 'uppercase' },
    commentBox: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 10 },
    commentText: { color: '#4A5568', fontSize: 15, lineHeight: 22, fontFamily: Fonts.medium, fontStyle: 'italic' },
    footer: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F7FAFC' },
    reviewId: { color: Palette.slate, fontSize: 10, letterSpacing: 1, opacity: 0.5 },
    emptyText: { color: Palette.slate, textAlign: 'center', marginTop: 100, fontSize: 16 }
});