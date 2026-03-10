import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Fonts, Palette } from '@/constants/theme';
import { API_URL } from '@/config/appconf';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function GenAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        let dateToParse = dateString;
        if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-')) {
            dateToParse = dateString.includes('T') ? `${dateString}Z` : `${dateString.replace(' ', 'T')}Z`;
        }
        const date = new Date(dateToParse);
        return isNaN(date.getTime()) ? dateString : date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/analytics/overview`, {
                headers: { 'ngrok-skip-browser-warning': 'true', 'Accept': 'application/json' }
            });
            const json = await res.json();
            if (json.success) setData(json.stats);
        } catch (err) {
            console.error("Analytics Fetch Error:", err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    // ✅ EXACT LOGIC FROM scans.tsx (Red, Yellow, Green)
    const getDynamicMetrics = (item: any) => {
        const cClass = (item.color || '').toLowerCase();
        const sSize = (item.size || '').toLowerCase();
        const sShape = (item.shape || '').toLowerCase();
        const disease = (item.disease || 'healthy').toLowerCase();
        const statusStr = (item.status || '').toLowerCase();

        // 1. REJECTED = RED (Priority for rot/mold)
        if (disease === 'rot' || disease === 'mold' || statusStr === 'rejected') {
            return {
                label: 'Rejected',
                color: '#991b1b', // Dark Red
                bg: '#fee2e2'    // Light Red
            };
        }

        // 2. EXPORT READY = GREEN
        if (
            (cClass === 'greenish' && sShape === 'round' && sSize === 'large') ||
            statusStr === 'export ready' ||
            statusStr === 'export quality'
        ) {
            return {
                label: 'Export Ready',
                color: '#166534', // Dark Green
                bg: '#dcfce7'    // Light Green
            };
        }

        // 3. LOCAL MARKET = YELLOW
        if (
            (cClass === 'brownish' && sShape === 'round' && sSize === 'medium') ||
            statusStr === 'local sale' ||
            statusStr === 'local market'
        ) {
            return {
                label: 'Local Market',
                color: '#854d0e', // Dark Yellow
                bg: '#fef3c7'    // Light Yellow
            };
        }

        // Default Average (Blue)
        return {
            label: item.status || 'Average',
            color: '#1e40af',
            bg: '#dbeafe'
        };
    };

    const handleDownloadReport = async () => {
        setExporting(true);
        const reportUrl = `${API_URL}/admin/analytics/report`;
        try {
            const response = await fetch(reportUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            const blob = await response.blob();
            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url; link.setAttribute('download', 'Durianostics_Report.pdf');
                document.body.appendChild(link); link.click(); link.parentNode?.removeChild(link);
            } else {
                const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
                const fileUri = directory + 'Durianostics_Report.pdf';
                await Sharing.shareAsync(fileUri);
            }
        } catch (error) { alert("Failed to export report."); } finally { setExporting(false); }
    };

    if (loading) {
        return (
            <View style={localStyles.centered}>
                <ActivityIndicator size="large" color={Palette.warmCopper} />
                <Text style={{ fontFamily: Fonts.medium, marginTop: 10, color: Palette.slate }}>Compiling System Data...</Text>
            </View>
        );
    }

    const StatCard = ({ title, value, icon, color }: any) => (
        <View style={localStyles.statCard}>
            <View style={[localStyles.iconCircle, { backgroundColor: color + '15' }]}>{icon}</View>
            <View style={{ flex: 1 }}>
                <Text style={localStyles.statTitle}>{title}</Text>
                <Text style={localStyles.statValue}>{value ?? '0'}</Text>
            </View>
        </View>
    );

    const RenderBar = ({ label, count, total, color }: any) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <View style={localStyles.barRow}>
                <Text style={localStyles.barLabel}>{label}</Text>
                <View style={localStyles.barTrack}>
                    <View style={[localStyles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
                </View>
                <Text style={localStyles.barCount}>{count}</Text>
            </View>
        );
    };

    const LeaderboardItem = ({ name, count, index, iconColor, rating, unit = 'Scans' }: any) => (
        <View style={localStyles.leaderboardRow}>
            <View style={localStyles.leaderboardRank}><Text style={localStyles.rankText}>#{index + 1}</Text></View>
            <View style={{ flex: 1 }}>
                <Text style={localStyles.leaderboardName} numberOfLines={1}>{name || "Unknown"}</Text>
                {rating !== undefined && (
                    <View style={localStyles.ratingRow}>
                        <Ionicons name="star" size={10} color={Palette.warmCopper} />
                        <Text style={localStyles.ratingText}>{rating} Rating</Text>
                    </View>
                )}
            </View>
            <View style={[localStyles.countBadge, { backgroundColor: iconColor + '15' }]}>
                <Text style={[localStyles.countText, { color: iconColor }]}>{count} {unit}</Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Palette.linenWhite }}>
            <StatusBar barStyle="dark-content" />
            <AdminSidebar />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 30 }}>
                <View style={localStyles.headerRow}>
                    <View>
                        <Text style={localStyles.title}>Analytics Dashboard</Text>
                        <Text style={localStyles.subtitle}>Real-time monitoring of AI performance, sales, and community activity.</Text>
                    </View>
                    <TouchableOpacity style={localStyles.downloadBtn} onPress={handleDownloadReport} disabled={exporting}>
                        {exporting ? <ActivityIndicator color={Palette.white} size="small" /> : <Ionicons name="download-outline" size={20} color={Palette.white} />}
                        <Text style={localStyles.downloadBtnText}>{exporting ? 'Generating...' : 'Export PDF'}</Text>
                    </TouchableOpacity>
                </View>

                {/* 📊 Summary Stats [RESTORED] */}
                <View style={localStyles.grid}>
                    <StatCard title="Total Users" value={data?.totalUsers} color="#2196f3" icon={<Ionicons name="people" size={22} color="#2196f3" />} />
                    <StatCard title="Total Scans" value={data?.totalScans} color="#4caf50" icon={<MaterialCommunityIcons name="barcode-scan" size={22} color="#4caf50" />} />
                    <StatCard title="Forum Posts" value={data?.totalPosts} color="#ff9800" icon={<Ionicons name="chatbubbles" size={22} color="#ff9800" />} />
                    <StatCard title="Scan Accuracy" value={`${data?.successRate ?? 0}%`} color={Palette.warmCopper} icon={<Ionicons name="checkmark-done-circle" size={22} color={Palette.warmCopper} />} />
                    <StatCard
                        title="Avg Confidence"
                        value={`${(() => {
                            let avg = data?.avgConfidence ?? 0;

                            if (avg > 1000) {
                                avg = avg / 100;
                            } else if (avg > 100) {
                                avg = avg / 10;
                            }

                            return Number(avg).toFixed(1);
                        })()}%`}
                        color="#9c27b0"
                        icon={<Ionicons name="analytics" size={22} color="#9c27b0" />}
                    />
                </View>

                <View style={localStyles.chartsWrapper}>
                    <View style={localStyles.chartCard}>
                        <Text style={localStyles.chartTitle}>Color Classification</Text>
                        <View style={{ marginTop: 20 }}>
                            <RenderBar label="Greenish" count={data?.distribution?.color?.Greenish || 0} total={data?.totalScans} color="#2e7d32" />
                            <RenderBar label="Brownish" count={data?.distribution?.color?.Brownish || 0} total={data?.totalScans} color="#8d6e63" />
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <Text style={localStyles.chartTitle}>Health & Diseases</Text>
                        <View style={{ marginTop: 20 }}>
                            <RenderBar label="Healthy" count={data?.distribution?.diseases?.Healthy || 0} total={data?.totalScans} color="#4caf50" />
                            <RenderBar label="Mold" count={data?.distribution?.diseases?.Mold || 0} total={data?.totalScans} color="#78909c" />
                            <RenderBar label="Rot" count={data?.distribution?.diseases?.Rot || 0} total={data?.totalScans} color="#d32f2f" />
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <Text style={localStyles.chartTitle}>Size Classification</Text>
                        <View style={{ marginTop: 20 }}>
                            <RenderBar label="Large" count={data?.distribution?.size?.Large || 0} total={data?.totalScans} color="#3f51b5" />
                            <RenderBar label="Medium" count={data?.distribution?.size?.Medium || 0} total={data?.totalScans} color="#5c6bc0" />
                            <RenderBar label="Small" count={data?.distribution?.size?.Small || 0} total={data?.totalScans} color="#9fa8da" />
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <Text style={localStyles.chartTitle}>Shape Classification</Text>
                        <View style={{ marginTop: 20 }}>
                            <RenderBar label="Elongated" count={data?.distribution?.shape?.Elongated || 0} total={data?.totalScans} color="#009688" />
                            <RenderBar label="Irregular" count={data?.distribution?.shape?.Irregular || 0} total={data?.totalScans} color="#4db6ac" />
                            <RenderBar label="Round" count={data?.distribution?.shape?.Round || 0} total={data?.totalScans} color="#b2dfdb" />
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <View style={localStyles.leaderboardHeader}><Ionicons name="medal" size={20} color="#4caf50" /><Text style={localStyles.leaderboardTitle}>Top Scanners</Text></View>
                        <View style={{ marginTop: 15 }}>
                            {data?.topScanners?.map((u: any, i: number) => <LeaderboardItem key={i} index={i} name={u.name} count={u.count} unit="Scans" iconColor="#4caf50" />)}
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <View style={localStyles.leaderboardHeader}><Ionicons name="megaphone" size={20} color="#ff9800" /><Text style={localStyles.leaderboardTitle}>Top Posters</Text></View>
                        <View style={{ marginTop: 15 }}>
                            {data?.topPosters?.map((u: any, i: number) => <LeaderboardItem key={i} index={i} name={u.name} count={u.count} unit="Posts" iconColor="#ff9800" />)}
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <View style={localStyles.leaderboardHeader}><Ionicons name="trophy" size={20} color="#FFD700" /><Text style={localStyles.leaderboardTitle}>Most Sold Product</Text></View>
                        <View style={{ marginTop: 15 }}>
                            {data?.topProducts?.map((p: any, i: number) => <LeaderboardItem key={i} index={i} name={p.name} count={p.sold} rating={p.rating} unit="Sold" iconColor={Palette.warmCopper} />)}
                        </View>
                    </View>

                    <View style={localStyles.chartCard}>
                        <View style={localStyles.leaderboardHeader}><Ionicons name="cart" size={20} color="#2196f3" /><Text style={localStyles.leaderboardTitle}>Top Buyers</Text></View>
                        <View style={{ marginTop: 15 }}>
                            {data?.topBuyers?.map((u: any, i: number) => <LeaderboardItem key={i} index={i} name={u.name} count={u.count} unit="Orders" iconColor="#2196f3" />)}
                        </View>
                    </View>

                    {/* 📋 Recent Activity Table [SYNCED LOGIC] */}
                    <View style={[localStyles.chartCard, { width: '100%' }]}>
                        <View style={localStyles.leaderboardHeader}><MaterialCommunityIcons name="history" size={22} color={Palette.warmCopper} /><Text style={localStyles.leaderboardTitle}>Recent System Activity</Text></View>
                        <View style={localStyles.recentTable}>
                            <View style={localStyles.tableHeader}>
                                <Text style={[localStyles.tableHeadText, { flex: 2 }]}>User</Text>
                                <Text style={[localStyles.tableHeadText, { flex: 1.5 }]}>Variety</Text>
                                <Text style={[localStyles.tableHeadText, { flex: 1.5 }]}>Status</Text>
                                <Text style={[localStyles.tableHeadText, { flex: 1 }]}>Detection Conf.</Text>
                                <Text style={[localStyles.tableHeadText, { flex: 2, textAlign: 'right' }]}>Date</Text>
                            </View>
                            {data?.recentScans?.map((scan: any, i: number) => {
                                const dynamic = getDynamicMetrics(scan); // ✅ Exact Logic Match
                                let displayConf = scan.confidence;

                                if (displayConf > 100) {
                                    displayConf = displayConf / 100;
                                }

                                displayConf = Number(displayConf).toFixed(1);
                                return (
                                    <View key={i} style={localStyles.tableRow}>
                                        <Text style={[localStyles.tableCellText, { flex: 2, fontFamily: Fonts.bold }]}>{scan.username}</Text>
                                        <Text style={[localStyles.tableCellText, { flex: 1.5 }]}>{scan.variety}</Text>
                                        <View style={{ flex: 1.5 }}>
                                            <View style={[localStyles.statusBadge, { backgroundColor: dynamic.bg }]}>
                                                <Text style={[localStyles.statusText, { color: dynamic.color }]}>{dynamic.label}</Text>
                                            </View>
                                        </View>
                                        {/* ✅ High Confidence = Green */}
                                        <Text
                                            style={[
                                                localStyles.tableCellText,
                                                {
                                                    flex: 1,
                                                    color: displayConf >= 80 ? '#166534' : Palette.deepObsidian,
                                                    fontFamily: Fonts.bold
                                                }
                                            ]}
                                        >
                                            {displayConf}%
                                        </Text>
                                        <Text style={[localStyles.tableCellText, { flex: 2, textAlign: 'right', fontSize: 11 }]}>{formatDate(scan.time)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const localStyles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.linenWhite },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 26, fontFamily: Fonts.bold, color: Palette.charcoalEspresso },
    subtitle: { fontSize: 13, color: Palette.slate, fontFamily: Fonts.medium, marginTop: 4 },
    downloadBtn: { flexDirection: 'row', backgroundColor: Palette.warmCopper, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center', gap: 8 },
    downloadBtnText: { color: Palette.white, fontFamily: Fonts.bold, fontSize: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 25 },
    statCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, width: Platform.OS === 'web' ? '18.5%' : '47%', flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    statTitle: { fontSize: 10, fontFamily: Fonts.bold, color: Palette.slate, textTransform: 'uppercase' },
    statValue: { fontSize: 18, fontFamily: Fonts.bold, color: Palette.deepObsidian },
    chartsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' },
    chartCard: { backgroundColor: '#fff', padding: 24, borderRadius: 18, width: Platform.OS === 'web' ? '48.5%' : '100%', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 1, marginBottom: 10 },
    chartTitle: { fontSize: 16, fontFamily: Fonts.bold, color: Palette.charcoalEspresso, borderLeftWidth: 4, borderLeftColor: Palette.warmCopper, paddingLeft: 10 },
    leaderboardTitle: { fontSize: 16, fontFamily: Fonts.bold, color: Palette.charcoalEspresso, marginLeft: 8 },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
    barLabel: { width: 90, fontSize: 12, fontFamily: Fonts.medium, color: Palette.slate },
    barTrack: { flex: 1, height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 5 },
    barCount: { width: 35, textAlign: 'right', fontSize: 12, fontFamily: Fonts.bold, color: Palette.deepObsidian },
    leaderboardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f8f9fa' },
    leaderboardRank: { width: 30 },
    rankText: { fontSize: 12, fontFamily: Fonts.bold, color: Palette.warmCopper },
    leaderboardName: { flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: Palette.deepObsidian },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    ratingText: { fontSize: 10, color: Palette.slate, fontFamily: Fonts.bold },
    countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    countText: { fontSize: 11, fontFamily: Fonts.bold },
    recentTable: { marginTop: 15, width: '100%' },
    tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tableHeadText: { fontSize: 12, fontFamily: Fonts.bold, color: Palette.slate, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', alignItems: 'center' },
    tableCellText: { fontSize: 13, color: Palette.deepObsidian, fontFamily: Fonts.medium },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    statusText: { fontSize: 11, fontFamily: Fonts.bold }
});