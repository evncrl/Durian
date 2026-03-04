import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, StyleSheet, ActivityIndicator, 
    RefreshControl, TouchableOpacity, Modal, TextInput, Alert 
} from 'react-native';
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

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

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

    const submitReview = async () => {
        if (!comment.trim()) return Alert.alert("Wait", "Please write a short comment about your durian.");
        try {
            const res = await axios.post(`${API_URL}/shop/reviews`, {
                user_id: user?.id,
                user_name: user?.name,
                product_name: selectedProduct.name,
                rating: rating,
                comment: comment
            });
            if (res.data.success) {
                Alert.alert("Salamat!", "Naitabi na namin ang iyong review.");
                setModalVisible(false);
                setComment("");
                setRating(5);
            }
        } catch (err) {
            Alert.alert("Error", "Hindi ma-send ang review sa ngayon.");
        }
    };

    const renderOrder = ({ item }: any) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>ID: {item.transaction_id.slice(0, 8)}...</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Delivered' ? '#dcfce7' : '#fef3c7' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'Delivered' ? '#166534' : '#854d0e' }]}>{item.status}</Text>
                </View>
            </View>
            
            {item.items.map((prod: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                    <Text style={styles.productItem}>• {prod.name} x{prod.quantity}</Text>
                    
                    {item.status === 'Delivered' && (
                        <TouchableOpacity 
                            onPress={() => { setSelectedProduct(prod); setModalVisible(true); }}
                            style={styles.smallRateBtn}
                        >
                            <Text style={styles.smallRateText}>Rate</Text>
                        </TouchableOpacity>
                    )}
                </View>
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

            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate {selectedProduct?.name}</Text>
                        
                        <Text style={styles.modalLabel}>Rating (1-5 Stars):</Text>
                        <View style={styles.starRow}>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <TouchableOpacity key={num} onPress={() => setRating(num)}>
                                    <Ionicons 
                                        name={rating >= num ? "star" : "star-outline"} 
                                        size={32} 
                                        color={Palette.warmCopper} 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput 
                            style={styles.input} 
                            multiline 
                            placeholder="How was your durian experience? Share your thoughts!" 
                            placeholderTextColor="#999"
                            value={comment}
                            onChangeText={setComment} 
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={submitReview} style={styles.submitBtn}>
                                <Text style={styles.submitBtnText}>Submit Review</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.deepObsidian, padding: 20 },
    title: { fontSize: 24, fontFamily: Fonts.bold, color: Palette.warmCopper, marginBottom: 20 },
    orderCard: { backgroundColor: Palette.charcoalEspresso, borderRadius: 16, padding: 16, marginBottom: 15 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderId: { color: Palette.slate, fontSize: 12, fontFamily: Fonts.medium },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontFamily: Fonts.bold },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    productItem: { color: Palette.linenWhite, fontSize: 14, fontFamily: Fonts.medium },
    smallRateBtn: { backgroundColor: Palette.warmCopper, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
    smallRateText: { color: '#fff', fontSize: 11, fontFamily: Fonts.bold },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 },
    dateText: { color: Palette.slate, fontSize: 12 },
    totalPrice: { color: Palette.warmCopper, fontFamily: Fonts.bold, fontSize: 16 },
    emptyText: { color: Palette.slate, textAlign: 'center', marginTop: 50 },
    
    // MODAL STYLES
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 24 },
    modalTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Palette.charcoalEspresso, marginBottom: 20 },
    modalLabel: { fontSize: 14, color: '#666', marginBottom: 10, fontFamily: Fonts.medium },
    starRow: { flexDirection: 'row', gap: 8, marginBottom: 20, justifyContent: 'center' },
    input: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 14, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    submitBtn: { flex: 2, backgroundColor: Palette.warmCopper, padding: 15, borderRadius: 12, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontFamily: Fonts.bold, fontSize: 14 },
    cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, alignItems: 'center' },
    cancelBtnText: { color: Palette.slate, fontFamily: Fonts.bold, fontSize: 14 }
});