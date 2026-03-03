import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Modal, StyleSheet, Platform } from 'react-native';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAdminStyles } from '@/styles/admin_styles/index.styles';
import { Fonts, Palette } from '@/constants/theme';
import { API_URL } from '@/config/appconf';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/utils/platform';

export default function ScansManage() {
    const styles = useAdminStyles();
    const { isWeb, isSmallScreen } = useResponsive();
    const [scans, setScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    const fetchScans = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/scans/all`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            const json = await res.json();
            if (json.success) setScans(json.scans);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchScans(); }, []);

    const TableHeader = () => (
        <View style={localStyles.tableHeader}>
            <Text style={[localStyles.headText, { flex: 2 }]}>USER</Text>
            <Text style={[localStyles.headText, { flex: 1.5 }]}>VARIETY</Text>
            <Text style={[localStyles.headText, { flex: 1.5 }]}>STATUS</Text>
            <Text style={[localStyles.headText, { flex: 1 }]}>CONF.</Text>
            <Text style={[localStyles.headText, { flex: 1, textAlign: 'right' }]}>ACTION</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Palette.linenWhite }}>
            <AdminSidebar />
            
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 30 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Scan Records</Text>
                    <Text style={{ fontFamily: Fonts.medium, color: Palette.slate }}>Detailed logs of all durian classifications.</Text>
                </View>

                <View style={styles.card}>
                    <TableHeader />
                    {loading ? <ActivityIndicator color={Palette.warmCopper} style={{ margin: 20 }} /> : 
                    scans.map((item) => (
                        <View key={item.id} style={localStyles.tableRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={localStyles.userName}>{item.username}</Text>
                                <Text style={localStyles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <Text style={[localStyles.cellText, { flex: 1.5 }]}>{item.variety}</Text>
                            <View style={{ flex: 1.5 }}>
                                <View style={[localStyles.badge, { backgroundColor: item.status === 'Export Ready' ? '#dcfce7' : '#fee2e2' }]}>
                                    <Text style={[localStyles.badgeText, { color: item.status === 'Export Ready' ? '#166534' : '#991b1b' }]}>{item.status}</Text>
                                </View>
                            </View>
                            <Text style={[localStyles.cellText, { flex: 1 }]}>{item.confidence}%</Text>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={() => setSelectedImg(item.image_url)}>
                                <Ionicons name="image-outline" size={22} color={Palette.warmCopper} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Image Viewer Modal */}
            <Modal visible={!!selectedImg} transparent animationType="fade">
                <View style={localStyles.modalOverlay}>
                    <TouchableOpacity style={localStyles.closeArea} onPress={() => setSelectedImg(null)} />
                    <View style={localStyles.imageContainer}>
                        <Image source={{ uri: selectedImg || '' }} style={localStyles.fullImg} resizeMode="contain" />
                        <TouchableOpacity style={localStyles.closeBtn} onPress={() => setSelectedImg(null)}>
                            <Ionicons name="close-circle" size={40} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const localStyles = StyleSheet.create({
    tableHeader: { flexDirection: 'row', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 10 },
    headText: { fontSize: 12, fontFamily: Fonts.bold, color: Palette.slate },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', paddingHorizontal: 10 },
    userName: { fontSize: 14, fontFamily: Fonts.bold, color: Palette.deepObsidian },
    dateText: { fontSize: 11, color: Palette.slate, marginTop: 2 },
    cellText: { fontSize: 13, fontFamily: Fonts.medium, color: Palette.charcoalEspresso },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
    badgeText: { fontSize: 11, fontFamily: Fonts.bold },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    closeArea: { position: 'absolute', width: '100%', height: '100%' },
    imageContainer: { width: '80%', height: '80%', justifyContent: 'center', alignItems: 'center' },
    fullImg: { width: '100%', height: '100%', borderRadius: 12 },
    closeBtn: { position: 'absolute', top: -50, right: 0 }
});