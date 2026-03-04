import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { API_URL } from '@/config/appconf';
import { Fonts, Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function MyOrders() {
    const { user } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyOrders = async () => {
        if (!user?.email) return;
        try {
            const res = await axios.get(`${API_URL}/api/orders/user/${user.email}`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.data.success) setOrders(res.data.orders);
        } catch (err) {
            console.error("Fetch User Orders Error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchMyOrders(); }, [user]);

    const renderOrder = ({ item }: any) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>ID: {item.transaction_id.slice(0, 8)}...</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Delivered' ? '#dcfce7' : '#fef3c7' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Delivered' ? '#166534' : '#854d0e' }]}>{item.status}</Text>
                </View>
            </View>
            
            {item.items.map((prod: any, i: number) => (
                <Text key={i} style={styles.productItem}>• {prod.name} x{prod.quantity}</Text>
            ))}
            
            <View style={styles.orderFooter}>
                <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <Text style={styles.totalPrice}>₱{item.total.toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Order History</Text>
            {loading ? (
                <ActivityIndicator size="large" color={Palette.warmCopper} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrder}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchMyOrders();}} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>You haven't ordered anything yet.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.deepObsidian, padding: 20 },
    title: { fontSize: 24, fontFamily: Fonts.bold, color: Palette.warmCopper, marginBottom: 20 },
    orderCard: { backgroundColor: Palette.charcoalEspresso, borderRadius: 16, padding: 16, marginBottom: 15 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    orderId: { color: Palette.slate, fontSize: 12, fontFamily: Fonts.medium },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontFamily: Fonts.bold },
    productItem: { color: Palette.linenWhite, fontSize: 14, marginBottom: 4 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
    dateText: { color: Palette.slate, fontSize: 12 },
    totalPrice: { color: Palette.warmCopper, fontFamily: Fonts.bold, fontSize: 16 },
    emptyText: { color: Palette.slate, textAlign: 'center', marginTop: 50 }
});