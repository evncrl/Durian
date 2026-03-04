import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';
import { API_URL } from '@/config/appconf';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function OrderManage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/orders`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (res.data.success) setOrders(res.data.orders);
        } catch (err) {
            console.error("Order Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await axios.put(`${API_URL}/admin/orders/${id}/status`, { status: newStatus });
            if (res.data.success) {
                Alert.alert("Success", `Order is now ${newStatus}`);
                fetchOrders(); 
            }
        } catch (err) {
            Alert.alert("Error", "Failed to update status");
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const StatusBadge = ({ status }: { status: string }) => {
        const getColors = () => {
            switch (status) {
                case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
                case 'Shipped': return { bg: '#dbeafe', text: '#1e40af' };
                case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b' };
                default: return { bg: '#fef3c7', text: '#854d0e' }; 
            }
        };
        const colors = getColors();
        return (
            <View style={[localStyles.badge, { backgroundColor: colors.bg }]}>
                <Text style={[localStyles.badgeText, { color: colors.text }]}>{status}</Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Palette.linenWhite }}>
            <AdminSidebar />
            
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 30 }}>
                <View style={localStyles.header}>
                    <Text style={localStyles.title}>Order Management</Text>
                    <Text style={localStyles.subtitle}>Manage customer purchases and delivery status.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Palette.warmCopper} />
                ) : (
                    <View style={localStyles.tableCard}>
                        {/* ✅ FIXED HEADER WITH ITEMS COLUMN */}
                        <View style={localStyles.tableHeader}>
                            <Text style={[localStyles.headText, { flex: 2 }]}>CUSTOMER INFO</Text>
                            <Text style={[localStyles.headText, { flex: 2.5 }]}>ORDERED ITEMS</Text>
                            <Text style={[localStyles.headText, { flex: 1.5 }]}>TOTAL / PAY</Text>
                            <Text style={[localStyles.headText, { flex: 1 }]}>STATUS</Text>
                            <Text style={[localStyles.headText, { flex: 1, textAlign: 'right' }]}>ACTIONS</Text>
                        </View>

                        {orders.map((order) => (
                            <View key={order.id} style={localStyles.tableRow}>
                                {/* Customer Info */}
                                <View style={{ flex: 2 }}>
                                    <Text style={localStyles.emailText}>{order.email}</Text>
                                    <Text style={localStyles.addressText} numberOfLines={2}>{order.address}</Text>
                                    <Text style={localStyles.phoneText}>{order.phone}</Text>
                                </View>

                                {/* ✅ NEW COLUMN: ITEM LIST */}
                                <View style={{ flex: 2.5 }}>
                                    {order.items.map((item: any, i: number) => (
                                        <Text key={i} style={localStyles.itemText}>
                                            • {item.name} <Text style={{ fontFamily: Fonts.bold }}>x{item.quantity}</Text>
                                        </Text>
                                    ))}
                                </View>

                                {/* Payment Info */}
                                <View style={{ flex: 1.5 }}>
                                    <Text style={localStyles.priceText}>₱{order.total.toLocaleString()}</Text>
                                    <Text style={localStyles.detailText}>{order.paymentMethod}</Text>
                                </View>

                                {/* Status */}
                                <View style={{ flex: 1 }}>
                                    <StatusBadge status={order.status} />
                                </View>

                                {/* Actions */}
                                <View style={localStyles.actionCol}>
                                    {order.status === 'Pending' && (
                                        <TouchableOpacity onPress={() => updateStatus(order.id, 'Shipped')} style={localStyles.actionBtn}>
                                            <Ionicons name="bus-outline" size={18} color={Palette.warmCopper} />
                                        </TouchableOpacity>
                                    )}
                                    {order.status === 'Shipped' && (
                                        <TouchableOpacity onPress={() => updateStatus(order.id, 'Delivered')} style={localStyles.actionBtn}>
                                            <Ionicons name="checkmark-done" size={18} color="#22c55e" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const localStyles = StyleSheet.create({
    header: { marginBottom: 30 },
    title: { fontSize: 26, fontFamily: Fonts.bold, color: Palette.charcoalEspresso },
    subtitle: { fontSize: 13, color: Palette.slate, fontFamily: Fonts.medium, marginTop: 4 },
    tableCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 },
    headText: { fontSize: 11, fontFamily: Fonts.bold, color: Palette.slate, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
    emailText: { fontSize: 14, fontFamily: Fonts.bold, color: Palette.deepObsidian },
    detailText: { fontSize: 12, color: Palette.slate, marginTop: 2 },
    addressText: { fontSize: 11, color: '#666', marginTop: 4, lineHeight: 16 },
    phoneText: { fontSize: 11, color: Palette.warmCopper, fontFamily: Fonts.medium, marginTop: 2 },
    itemText: { fontSize: 13, color: Palette.deepObsidian, fontFamily: Fonts.medium, marginBottom: 2 },
    priceText: { fontSize: 15, fontFamily: Fonts.bold, color: Palette.warmCopper },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    badgeText: { fontSize: 10, fontFamily: Fonts.bold },
    actionCol: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    actionBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }
});